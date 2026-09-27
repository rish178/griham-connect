export interface MetaLeadEvent {
  submissionId: string
  phoneE164: string
  landingUrl: string
  ip: string | null
  userAgent: string | null
  fbp: string | null
  fbc: string | null
}

export interface MetaEnv {
  META_PIXEL_ID?: string
  META_CAPI_ACCESS_TOKEN?: string
  META_TEST_EVENT_CODE?: string
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Server-side Lead event so Meta optimises against actual leads, not clicks —
 * directly lowers CPL. event_id must match the browser Pixel's event_id so
 * Meta dedupes instead of double-counting.
 *
 * Confirm the Graph API version against Meta's changelog before assuming
 * v21.0 is still current by the time this runs.
 */
export async function sendMetaCapi(env: MetaEnv, event: MetaLeadEvent): Promise<void> {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) return

  // Meta's hashing spec: digits only, country code included, no leading "+".
  const phoneDigits = event.phoneE164.replace('+', '')
  const hashedPhone = await sha256Hex(phoneDigits)

  const body = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: event.landingUrl,
        event_id: event.submissionId,
        user_data: {
          ph: [hashedPhone],
          client_ip_address: event.ip ?? undefined,
          client_user_agent: event.userAgent ?? undefined,
          fbp: event.fbp ?? undefined,
          fbc: event.fbc ?? undefined,
        },
      },
    ],
    // Routes the event to Events Manager's Test Events tab instead of (or in
    // addition to) counting toward real campaign data. Set only while
    // testing.
    ...(env.META_TEST_EVENT_CODE ? { test_event_code: env.META_TEST_EVENT_CODE } : {}),
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events?access_token=${env.META_CAPI_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    console.error('Meta CAPI request failed', res.status, await res.text())
  }
}
