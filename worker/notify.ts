import type { Env } from './env'

interface NotifyPayload {
  full_name: string
  phone_e164: string
  form_variant: string
  configuration?: string | null
  budget_band?: string | null
  best_time_to_call?: string | null
  utm_source?: string | null
  utm_campaign?: string | null
  project_slug: string
}

/**
 * Instant lead notification — the brief commits to a 5-minute response SLA,
 * which is unmeetable without this. Runs inside ctx.waitUntil(), so a Slack
 * outage must never fail the form submission itself.
 */
export async function notifySlack(
  env: Env,
  payload: NotifyPayload,
  errorContext?: string,
): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) return

  const waLink = `https://wa.me/91${payload.phone_e164.replace('+91', '')}`
  const lines = [
    errorContext
      ? '*Lead capture failed to save — needs manual follow-up*'
      : '*New Signature Sarvam lead*',
    `Name: ${payload.full_name}`,
    `Phone: ${payload.phone_e164} (${waLink})`,
    payload.configuration ? `Configuration: ${payload.configuration}` : null,
    payload.budget_band ? `Budget: ${payload.budget_band}` : null,
    payload.best_time_to_call ? `Best time to call: ${payload.best_time_to_call}` : null,
    payload.utm_campaign ? `Campaign: ${payload.utm_source ?? '?'}/${payload.utm_campaign}` : null,
    errorContext ? `Error: ${errorContext}` : null,
  ].filter((line): line is string => line !== null)

  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: lines.join('\n') }),
  })
}

/**
 * Appends to the Griham-wide Sheet via a Make/Zapier catch hook. Doing it
 * this way (rather than the Google Sheets API directly) avoids service
 * account JWT signing inside the Worker.
 */
export async function notifySheet(env: Env, payload: Record<string, unknown>): Promise<void> {
  if (!env.SHEET_WEBHOOK_URL) return

  await fetch(env.SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
