import { createClient } from '@supabase/supabase-js'
import { leadPayloadSchema } from '../src/lib/leadSchema'
import { normalisePhoneE164 } from '../src/lib/phone'
import type { Env } from './env'
import { verifyTurnstile } from './turnstile'
import { notifySlack, notifySheet } from './notify'
import { sendMetaCapi } from './meta'

const MAX_BODY_BYTES = 4096

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=') || null
  }
  return null
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleLead(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // 1. Reject non-JSON / oversized bodies up front — cheap to check, and
  // caps how much work a malicious payload can force before validation.
  const contentLength = Number(request.headers.get('Content-Length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Payload too large' }, 413)
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  // 2. Re-validate with the exact schema the client used. Client zod is
  // trivially bypassed by posting straight to this endpoint, so this is the
  // check that actually can't be skipped. The honeypot ("must be empty") and
  // consent ("must be true") requirements live inside this same schema.
  const parsed = leadPayloadSchema.safeParse(raw)
  if (!parsed.success) {
    return json({ ok: false, error: 'Validation failed', issues: parsed.error.issues }, 400)
  }
  const lead = parsed.data

  // 3. Turnstile — the actual bot defence (the WAF rate limit and honeypot
  // are a seatbelt, not the lock; see docs/cloudflare-setup.md §3.1).
  const clientIp = request.headers.get('CF-Connecting-IP')
  const turnstileOk = await verifyTurnstile(lead.turnstile_token, env.TURNSTILE_SECRET_KEY, clientIp)
  if (!turnstileOk) {
    return json({ ok: false, error: 'Verification failed, please retry' }, 400)
  }

  // 4. Normalise phone server-side too — this is what makes
  // "9876543210" / "+919876543210" / "+91 98765 43210" collapse to one
  // person instead of three (see supabase/migrations/*_lead_capture_v2.sql).
  const phoneE164 = normalisePhoneE164(lead.phone)
  if (!phoneE164) {
    return json({ ok: false, error: 'Invalid phone number' }, 400)
  }

  // 5. Enrich with request context the client can't fake or doesn't have:
  // real IP, country (from Cloudflare's own geo-lookup), and Meta match
  // parameters read from cookies rather than trusted from the payload.
  const cookieHeader = request.headers.get('Cookie')
  const fbp = parseCookie(cookieHeader, '_fbp')
  const existingFbc = parseCookie(cookieHeader, '_fbc')
  const fbc = existingFbc ?? (lead.fbclid ? `fb.1.${Date.now()}.${lead.fbclid}` : null)

  const submissionRow = {
    id: lead.submission_id,
    project_slug: lead.project_slug,
    form_variant: lead.form_variant,
    full_name: lead.full_name,
    phone_raw: lead.phone,
    phone_e164: phoneE164,
    configuration: lead.configuration || null,
    budget_band: lead.budget_band || null,
    best_time_to_call: lead.best_time_to_call || null,
    consent: lead.consent,
    consent_text: lead.consent_text,
    consent_version: lead.consent_version,
    utm_source: lead.utm_source ?? null,
    utm_medium: lead.utm_medium ?? null,
    utm_campaign: lead.utm_campaign ?? null,
    utm_content: lead.utm_content ?? null,
    fbclid: lead.fbclid ?? null,
    gclid: lead.gclid ?? null,
    fbp,
    fbc,
    referrer: lead.referrer ?? null,
    landing_path: lead.landing_path ?? null,
    ip: clientIp,
    user_agent: request.headers.get('User-Agent'),
    country: (request as Request & { cf?: { country?: string } }).cf?.country ?? null,
  }

  // 6. The Supabase write is the only awaited side effect — if this fails,
  // the lead genuinely wasn't recorded and the visitor needs to know.
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const { error } = await supabase.rpc('record_lead_submission', { payload: submissionRow })

  if (error) {
    // 7. Failure path: log it (shows up in `wrangler tail` / the dashboard's
    // Worker Logs even with no Slack configured) and still notify with the
    // raw payload so a human can recover the lead by hand — silent loss is
    // worse than a noisy failure.
    console.error('record_lead_submission failed', error)
    ctx.waitUntil(
      notifySlack(
        env,
        { ...submissionRow, phone_e164: phoneE164 },
        `Supabase insert failed: ${error.message}`,
      ),
    )
    return json({ ok: false, error: 'Could not save your details, please WhatsApp us instead' }, 500)
  }

  // 8. Fan-out side effects. None of these may block or fail the response —
  // a Slack/Sheet/Meta outage is not the visitor's problem.
  ctx.waitUntil(
    Promise.allSettled([
      notifySlack(env, submissionRow),
      notifySheet(env, submissionRow),
      sendMetaCapi(env, {
        submissionId: lead.submission_id,
        phoneE164,
        landingUrl: request.headers.get('Referer') ?? '',
        ip: clientIp,
        userAgent: request.headers.get('User-Agent'),
        fbp,
        fbc,
      }),
    ]),
  )

  return json({ ok: true }, 200)
}
