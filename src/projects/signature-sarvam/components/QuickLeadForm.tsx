import { useState } from 'react'
import { getUtm } from '../../../lib/utm'
import { getSubmissionId, clearSubmissionId } from '../../../lib/session'
import { CONSENT_TEXT, CONSENT_VERSION, leadPayloadSchema } from '../../../lib/leadSchema'
import TurnstileWidget from '../../../components/ui/Turnstile'

/**
 * Two-field above-the-fold capture form. Deliberately minimal — paid-social
 * visitors convert best when they can act without scrolling, and the sales
 * team can qualify further on the call.
 *
 * Submits to the Worker's /api/leads endpoint rather than Supabase directly —
 * see docs/lead-capture-plan.md §3. The Worker re-validates with the exact
 * same leadPayloadSchema, so this is a UX convenience, not the real guard.
 */

const fieldClass =
  'w-full rounded-sm border border-border bg-ink/70 px-4 py-3 text-base text-cream placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold'

export default function QuickLeadForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const utm = getUtm()

    const parsed = leadPayloadSchema.safeParse({
      submission_id: getSubmissionId(),
      project_slug: 'signature-sarvam',
      form_variant: 'hero_quick',
      full_name: String(data.get('full_name') ?? ''),
      phone: String(data.get('phone') ?? ''),
      consent: true,
      consent_text: CONSENT_TEXT,
      consent_version: CONSENT_VERSION,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      fbclid: utm.fbclid,
      gclid: utm.gclid,
      referrer: utm.referrer,
      landing_path: utm.landing_path,
      honeypot: String(data.get('company') ?? ''),
      turnstile_token: turnstileToken,
    })

    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0])
        // Only the fields the visitor can see get an inline message —
        // anything else failing is a bug, not a typo, so it falls through
        // to the generic submitError below.
        if (key === 'full_name' || key === 'phone') next[key] = issue.message
      }
      setErrors(next)
      if (!next.full_name && !next.phone) {
        setSubmitError(
          turnstileToken ? 'Something went wrong. Please try again.' : 'Please complete the verification above.',
        )
      }
      return
    }

    setErrors({})
    setSubmitError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const result = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !result.ok) throw new Error(result.error ?? 'Request failed')

      clearSubmissionId()
      setDone(true)
    } catch {
      setSubmitError('Something went wrong. Please try again, or WhatsApp us instead.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-sm border border-gold/40 bg-ink/80 px-5 py-6 text-center backdrop-blur-sm">
        <p className="eyebrow">Request received</p>
        <p className="mt-2 text-sm leading-relaxed text-cream/90">
          Thank you. A Griham Connect advisor will call you shortly.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-sm border border-gold/30 bg-ink/70 p-4 backdrop-blur-sm sm:p-5"
    >
      <p className="eyebrow">Speak to our team</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <input
            name="full_name"
            aria-label="Full name"
            className={fieldClass}
            placeholder="Full name"
            autoComplete="name"
            maxLength={100}
          />
          {errors.full_name && (
            <p className="mt-1.5 text-xs text-destructive">{errors.full_name}</p>
          )}
        </div>
        <div>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            aria-label="Phone number"
            className={fieldClass}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            maxLength={20}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      {/* Honeypot: real visitors never see or fill this field. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="mt-3">
        <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />
      </div>

      {submitError && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 w-full rounded-sm bg-gold px-6 py-3.5 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Get a Call Back'}
      </button>
      <p className="mt-2.5 text-[0.65rem] leading-relaxed text-muted-foreground">
        By submitting you agree to be contacted by Griham Connect regarding this project.
      </p>
    </form>
  )
}
