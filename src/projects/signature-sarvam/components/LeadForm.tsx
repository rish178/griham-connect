import { useState } from 'react'
import { getUtm } from '../../../lib/utm'
import { getSubmissionId, clearSubmissionId } from '../../../lib/session'
import { CONSENT_TEXT, CONSENT_VERSION, leadPayloadSchema } from '../../../lib/leadSchema'
import TurnstileWidget from '../../../components/ui/Turnstile'

const CONFIGS = ['3BHK+2T', '3BHK+3T', '3BHK+3T+Utility', '4BHK+4T+Utility', 'Not sure yet']
const BUDGETS = ['₹2.5–3 Cr', '₹3–3.5 Cr', '₹3.5–4 Cr', 'Above ₹4 Cr']
const TIMES = ['Morning', 'Afternoon', 'Evening']

const fieldClass =
  'w-full rounded-sm border border-border bg-secondary/60 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold'
const labelClass =
  'mb-2 block font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground'

const SELECTS = [
  { name: 'configuration', label: 'Configuration Interest', options: CONFIGS },
  { name: 'budget_band', label: 'Budget Band', options: BUDGETS },
  { name: 'best_time_to_call', label: 'Best Time to Call', options: TIMES },
] as const

export default function LeadForm() {
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
      form_variant: 'full',
      full_name: String(data.get('full_name') ?? ''),
      phone: String(data.get('phone') ?? ''),
      configuration: String(data.get('configuration') ?? ''),
      budget_band: String(data.get('budget_band') ?? ''),
      best_time_to_call: String(data.get('best_time_to_call') ?? ''),
      consent: data.get('consent') === 'on',
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
        if (['full_name', 'phone', 'consent'].includes(key)) next[key] = issue.message
      }
      setErrors(next)
      if (!next.full_name && !next.phone && !next.consent) {
        setSubmitError(
          turnstileToken ? 'Something went wrong. Please try again.' : 'Please complete the verification below.',
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
      <div className="rounded-sm border border-gold/40 bg-card px-6 py-12 text-center">
        <p className="eyebrow">Request received</p>
        <h3 className="mt-4 text-2xl font-extrabold text-cream">Thank you.</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          A Griham Connect advisor will reach out at your preferred time to arrange your site
          visit. Possession timeline available on request.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="full_name">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          className={fieldClass}
          placeholder="Your name"
          autoComplete="name"
          maxLength={100}
        />
        {errors.full_name && <p className="mt-1.5 text-xs text-destructive">{errors.full_name}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          className={fieldClass}
          placeholder="10-digit mobile number"
          autoComplete="tel"
          maxLength={20}
        />
        {errors.phone && <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>}
      </div>

      {SELECTS.map((field) => (
        <div key={field.name}>
          <label className={labelClass} htmlFor={field.name}>
            {field.label}
          </label>
          <select id={field.name} name={field.name} defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Select an option
            </option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

      <label className="flex cursor-pointer items-start gap-3 pt-1">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-gold" />
        <span className="text-xs leading-relaxed text-muted-foreground">{CONSENT_TEXT}</span>
      </label>
      {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}

      {/* Honeypot: real visitors never see or fill this field. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

      {submitError && (
        <p role="alert" className="text-xs text-destructive">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-gold px-6 py-4 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Request a Call Back'}
      </button>
    </form>
  )
}
