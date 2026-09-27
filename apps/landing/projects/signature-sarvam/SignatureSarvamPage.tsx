'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, Building2, IndianRupee, MapPin } from 'lucide-react'

import { captureUtm } from '@/lib/utm'
import { initMetaPixel } from '@/lib/metaPixel'
import LeadForm from './components/LeadForm'
import QuickLeadForm from './components/QuickLeadForm'
import StickyCtas from './components/StickyCtas'
import {
  EVERYDAY_AMENITIES,
  PAYMENT_PLAN,
  RERA_ID,
  SIGNATURE_WELLNESS,
  TAGLINES,
  TRAVEL,
  UNIT_ROWS,
  WHATSAPP_URL,
  signatureSarvam,
} from './data'

const HERO_IMAGE = signatureSarvam.heroImage

/**
 * Optional amenities photo. Drop a file at the path below and set this to it
 * to enable the image; left null so the section never renders a broken image.
 */
const WELLNESS_IMAGE: string | null = null

const TRUST_ITEMS = [
  { icon: BadgeCheck, label: `HARERA Reg. No. ${RERA_ID}` },
  { icon: Building2, label: signatureSarvam.builder },
  { icon: IndianRupee, label: 'Starting ₹2.89 Cr*' },
  { icon: MapPin, label: 'Sector 37D, Dwarka Expressway' },
]

function SectionLabel({ children }: { children: string }) {
  return <p className="eyebrow">{children}</p>
}

function ReraLine() {
  return (
    <p className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground/80">
      HARERA Reg. No. {RERA_ID}
    </p>
  )
}

export default function SignatureSarvamPage() {
  const [taglineIndex, setTaglineIndex] = useState(0)

  useEffect(() => {
    captureUtm()
    initMetaPixel()
    const id = setInterval(
      () => setTaglineIndex((index) => (index + 1) % TAGLINES.length),
      4000,
    )
    return () => clearInterval(id)
  }, [])

  return (
    <main className="bg-background pb-28 md:pb-24">
      {/* 1. Hero + above-the-fold quick capture */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Architectural render of Signature Global Sarvam residences at dusk"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative mx-auto w-full max-w-3xl px-6 pb-8 pt-24">
          <SectionLabel>Signature Global</SectionLabel>
          <h1 className="mt-2 font-display text-[3.25rem] font-black leading-[0.9] tracking-tight text-cream sm:text-8xl">
            SARVAM
          </h1>
          <div className="mt-4 h-px w-16 bg-gold" />
          <p
            key={taglineIndex}
            className="mt-4 min-h-[2.5rem] max-w-md text-lg font-light leading-snug text-cream/90 transition-opacity duration-700 sm:text-xl"
          >
            {TAGLINES[taglineIndex]}
          </p>
          <p className="mt-3 text-sm tracking-[0.08em] text-muted-foreground">
            {signatureSarvam.location}
          </p>

          <div className="mt-6 max-w-xl">
            <QuickLeadForm />
          </div>

          <a
            href="#book"
            className="mt-4 inline-block w-full rounded-sm border border-gold px-8 py-3.5 text-center font-display text-sm font-extrabold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-ink sm:w-auto"
          >
            Book Your Site Visit
          </a>

          <div className="mt-6 max-w-[60%] border-t border-border pt-3 sm:max-w-none">
            <ReraLine />
          </div>
        </div>
      </section>

      {/* 2. Trust strip */}
      <section className="border-y border-border bg-card">
        <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
              <span className="text-[0.68rem] uppercase tracking-[0.1em] text-cream/85">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Pricing — surfaced early to pre-qualify paid-social traffic */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <SectionLabel>Starting From</SectionLabel>
        <p className="mt-3 font-display text-5xl font-black leading-none text-cream sm:text-6xl">
          Rs. 2.89 Cr*
        </p>
        <p className="mt-4 text-sm text-muted-foreground">All-inclusive of inaugural discount.</p>

        <div className="gold-rule my-10" />

        <p className="eyebrow">Construction-Linked Plan</p>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {PAYMENT_PLAN.map((stage) => (
            <li
              key={stage.label}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-4 py-4"
            >
              <span className="font-display text-xl font-black tabular-nums text-gold">
                {stage.pct}
              </span>
              <span className="min-w-0 text-sm text-cream/90">{stage.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          *Price/sqft Rs. 15,950 net of inaugural discount. Excludes GST &amp; statutory charges.
          Rates indicative, subject to revision by the Promoter.
        </p>
        <a
          href="#book"
          className="mt-7 inline-block rounded-sm bg-gold px-7 py-3.5 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-90"
        >
          See if it fits your budget
        </a>
        <div className="mt-6">
          <ReraLine />
        </div>
      </section>

      {/* 4. Unit configurations */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionLabel>Unit Configurations</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold text-cream sm:text-4xl">
            Four considered layouts.
          </h2>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {UNIT_ROWS.map((unit) => (
              <div
                key={unit.type}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-5"
              >
                <span className="min-w-0 font-display text-lg font-bold text-cream">
                  {unit.type}
                </span>
                <span className="text-sm tabular-nums text-gold">{unit.area}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Areas are indicative and subject to revision by the Promoter.
          </p>
        </div>
      </section>

      {/* 5. Location */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <SectionLabel>Location Advantage</SectionLabel>
        <h2 className="mt-3 text-3xl font-extrabold text-cream sm:text-4xl">
          On the expressway,
          <br />
          minutes from everything.
        </h2>
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {TRAVEL.map((leg) => (
            <li
              key={leg.place}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-4 py-5"
            >
              <span className="font-display text-3xl font-black tabular-nums text-gold sm:text-4xl">
                {leg.time}
                <span className="ml-1 text-sm font-semibold uppercase tracking-widest">
                  {leg.unit}
                </span>
              </span>
              <span className="min-w-0 text-base text-cream/90">{leg.place}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Approx. travel time via Google Maps, on Dwarka Expressway.
        </p>
      </section>

      {/* 6. Wellness — emotional peak, immediately before the full form */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionLabel>Wellness, Curated</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold text-gold sm:text-4xl">WELLNESS, CURATED</h2>
          {WELLNESS_IMAGE && (
            <img
              src={WELLNESS_IMAGE}
              alt="Lap pool and spa deck at golden hour"
              loading="lazy"
              decoding="async"
              className="mt-8 aspect-[4/3] w-full rounded-sm object-cover sm:aspect-[16/9]"
            />
          )}
          <ul className="mt-10 space-y-4">
            {SIGNATURE_WELLNESS.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-relaxed text-cream/90">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
          <div className="gold-rule my-10" />
          <p className="eyebrow">Everyday Living</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {EVERYDAY_AMENITIES.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs text-cream/80"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-muted-foreground">
            Possession timeline available on request.
          </p>
        </div>
      </section>

      {/* 7. Full qualifying form */}
      <section id="book" className="mx-auto max-w-xl scroll-mt-20 px-6 py-20">
        <SectionLabel>Private Viewing</SectionLabel>
        <h2 className="mt-3 text-3xl font-extrabold text-cream sm:text-4xl">
          Book Your Site Visit
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Share your details and a Griham Connect advisor will call you back.
        </p>
        <div className="mt-8">
          <LeadForm />
        </div>
        <div className="mt-8">
          <ReraLine />
        </div>
      </section>

      {/* 8. Secondary CTA for form-averse visitors */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="rounded-sm border border-gold/30 px-6 py-10 text-center">
          <p className="eyebrow">Prefer to chat?</p>
          <p className="mt-3 text-lg text-cream/90">
            No forms needed — message an advisor and ask anything about pricing, layouts or the
            location.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-sm border border-gold px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            WhatsApp Us
          </a>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl space-y-4 px-6 py-14">
          <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-cream">
            Griham Connect — Channel Partner
          </p>
          <p className="text-xs uppercase tracking-[0.1em] text-gold">
            HARERA Reg. No. {RERA_ID}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Rates exclude GST and other statutory charges. Brochure and project content is
            indicative and subject to revision by the Promoter.
          </p>
          <p className="text-xs text-muted-foreground">
            Possession timeline available on request.
          </p>
          <p className="text-[0.65rem] text-muted-foreground/70">
            Developer: {signatureSarvam.builder}. Griham Connect is an authorised channel partner
            and not the developer of this project.
          </p>
        </div>
      </footer>

      <StickyCtas whatsapp={WHATSAPP_URL} />

      {/* Desktop floating WhatsApp */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Us"
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full bg-gold px-5 py-3.5 font-display text-xs font-extrabold uppercase tracking-[0.15em] text-ink shadow-lg md:flex"
      >
        WhatsApp Us
      </a>
    </main>
  )
}
