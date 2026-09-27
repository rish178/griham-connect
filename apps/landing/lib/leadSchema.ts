import { z } from 'zod'

/**
 * Single source of truth for what a lead submission looks like, imported by
 * both the browser forms and the API route. Client-side zod is trivially
 * bypassed by posting straight to the API, so the route re-runs this exact
 * schema — there must be only one definition of "valid", not two that can
 * drift apart.
 */
export const CONSENT_TEXT =
  'I agree to be contacted by Griham Connect regarding this project.'
export const CONSENT_VERSION = 'v1'

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''))

export const leadPayloadSchema = z.object({
  submission_id: z.string().uuid(),
  project_slug: z.literal('signature-sarvam'),
  form_variant: z.enum(['hero_quick', 'full']),
  full_name: z.string().trim().min(2, 'Please enter your full name').max(100, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  configuration: optionalText(60),
  budget_band: optionalText(60),
  best_time_to_call: optionalText(60),
  consent: z.boolean().refine((value) => value, { message: 'Consent is required' }),
  consent_text: z.string().max(500),
  consent_version: z.string().max(20),
  utm_source: z.string().max(200).nullable().optional(),
  utm_medium: z.string().max(200).nullable().optional(),
  utm_campaign: z.string().max(200).nullable().optional(),
  utm_content: z.string().max(200).nullable().optional(),
  fbclid: z.string().max(500).nullable().optional(),
  gclid: z.string().max(500).nullable().optional(),
  referrer: z.string().max(500).nullable().optional(),
  landing_path: z.string().max(300).nullable().optional(),
  // Must arrive empty — a filled honeypot means a bot filled every field it could see.
  honeypot: z.literal(''),
  turnstile_token: z.string().min(1, 'Verification failed, please retry'),
})

export type LeadPayload = z.infer<typeof leadPayloadSchema>
