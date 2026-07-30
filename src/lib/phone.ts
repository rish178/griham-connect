/**
 * Normalises an Indian mobile number to E.164 (+91XXXXXXXXXX) so the same
 * person typed as "9876543210", "+919876543210" or "+91 98765 43210" collapses
 * to one identity for dedupe (see supabase/migrations/*_lead_capture_v2.sql).
 * Returns null if the input isn't a plausible Indian mobile number.
 */
export function normalisePhoneE164(input: string): string | null {
  let digits = input.replace(/[\s\-()]/g, '')

  if (digits.startsWith('+91')) digits = digits.slice(3)
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = digits.slice(1)

  if (!/^[6-9]\d{9}$/.test(digits)) return null

  return `+91${digits}`
}
