'use client'

import { useEffect, useState } from 'react'

/**
 * Persistent conversion rails that appear once the visitor scrolls past the
 * hero: a slim top bar on desktop, a two-button bottom bar on mobile. Keeps a
 * call-back and a WhatsApp path one tap away at any scroll depth.
 */
export default function StickyCtas({ whatsapp }: { whatsapp: string }) {
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.85)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Desktop: slim sticky top bar */}
      <div
        className={`fixed inset-x-0 top-0 z-50 hidden border-b border-gold/25 bg-ink/95 backdrop-blur-sm transition-transform duration-300 md:block ${
          pastHero ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-cream">
            Signature Global Sarvam · Sector 37D
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#book"
              className="rounded-sm bg-gold px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90"
            >
              Request Callback
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-gold px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Mobile: persistent bottom bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-gold/25 bg-ink/95 px-3 py-3 backdrop-blur-sm transition-transform duration-300 md:hidden ${
          pastHero ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <a
          href="#book"
          className="rounded-sm bg-gold px-4 py-3.5 text-center font-display text-xs font-extrabold uppercase tracking-[0.12em] text-ink"
        >
          Request Callback
        </a>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm border border-gold px-4 py-3.5 text-center font-display text-xs font-extrabold uppercase tracking-[0.12em] text-gold"
        >
          WhatsApp Us
        </a>
      </div>
    </>
  )
}
