/**
 * Browser-side Meta Pixel. Complements the server-side CAPI Lead event
 * (worker/meta.ts) rather than replacing it — CAPI is the reliable signal
 * (survives ad blockers, ITP, etc.), this adds PageView-level funnel data in
 * Events Manager. trackLead() must be called with the same event id the
 * server-side CAPI call used, or Meta double-counts the same lead as two.
 */
declare global {
  interface Window {
    fbq?: {
      (...args: unknown[]): void
      callMethod?: (...args: unknown[]) => void
      queue: unknown[]
      loaded?: boolean
      version?: string
    }
    _fbq?: unknown
  }
}

let initialised = false

export function initMetaPixel(): void {
  if (typeof window === 'undefined' || initialised) return

  const pixelId = import.meta.env.VITE_META_PIXEL_ID
  if (!pixelId) return

  if (!window.fbq) {
    const fbq: Window['fbq'] = function (...args: unknown[]) {
      if (fbq!.callMethod) fbq!.callMethod(...args)
      else fbq!.queue.push(args)
    } as Window['fbq']
    fbq!.queue = []
    fbq!.loaded = true
    fbq!.version = '2.0'
    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  const fbq = window.fbq
  if (!fbq) return
  fbq('init', pixelId)
  fbq('track', 'PageView')
  initialised = true
}

export function trackLead(eventId: string): void {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'Lead', {}, { eventID: eventId })
}
