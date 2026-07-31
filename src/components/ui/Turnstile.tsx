import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void
  onExpire: () => void
}

/**
 * Renders Cloudflare's invisible/managed Turnstile widget and reports the
 * verification token up. This is the real bot defence for the lead forms —
 * the Worker rejects any submission without a valid token. See
 * docs/cloudflare-setup.md §2.1 for creating the widget and site key.
 */
export default function TurnstileWidget({ onToken, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !containerRef.current) return
    let cancelled = false

    loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onToken,
        'expired-callback': onExpire,
        // Stay invisible unless Cloudflare actually needs the visitor to
        // interact — zero friction on a paid-traffic conversion page for the
        // common case, without needing a separate Invisible-mode widget/key.
        appearance: 'interaction-only',
      })
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  if (!siteKey) {
    return (
      <p className="text-xs text-destructive">
        Turnstile is not configured (VITE_TURNSTILE_SITE_KEY missing) — submissions will be
        rejected until it is. See docs/cloudflare-setup.md §2.1.
      </p>
    )
  }

  return <div ref={containerRef} />
}
