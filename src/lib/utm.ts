/**
 * Captures ad attribution parameters from the landing URL so every lead can be
 * traced back to the campaign, ad set and creative that produced it.
 *
 * Values are stashed in sessionStorage on first load, because a visitor may
 * scroll, navigate, and only submit the form later — by which point the query
 * string may no longer be present.
 */
export type UtmParams = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  fbclid: string | null
  gclid: string | null
  referrer: string | null
  landing_path: string | null
}

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid', 'gclid'] as const

const STORAGE_KEY = 'sarvam_utm'
const CONTEXT_STORAGE_KEY = 'sarvam_landing_context'

export function captureUtm(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const found: Record<string, string> = {}

  for (const key of KEYS) {
    const value = params.get(key)
    if (value) found[key] = value.slice(0, 500)
  }

  if (Object.keys(found).length > 0) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    } catch {
      // Private browsing or a full quota — attribution is best-effort only.
    }
  }

  // Referrer and landing path only mean "first touch" if captured once, on
  // the visitor's actual entry page — not re-derived later from wherever the
  // form happens to be mounted.
  try {
    if (!sessionStorage.getItem(CONTEXT_STORAGE_KEY)) {
      sessionStorage.setItem(
        CONTEXT_STORAGE_KEY,
        JSON.stringify({
          referrer: document.referrer.slice(0, 500) || null,
          landing_path: window.location.pathname.slice(0, 300),
        }),
      )
    }
  } catch {
    // Best-effort only.
  }
}

export function getUtm(): UtmParams {
  const result: UtmParams = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    fbclid: null,
    gclid: null,
    referrer: null,
    landing_path: null,
  }

  if (typeof window === 'undefined') return result

  let stored: Record<string, string> = {}
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    stored = {}
  }

  const params = new URLSearchParams(window.location.search)
  for (const key of KEYS) {
    result[key] = params.get(key) ?? stored[key] ?? null
  }

  try {
    const context = JSON.parse(sessionStorage.getItem(CONTEXT_STORAGE_KEY) ?? '{}')
    result.referrer = context.referrer ?? null
    result.landing_path = context.landing_path ?? null
  } catch {
    // Leave as null.
  }

  return result
}
