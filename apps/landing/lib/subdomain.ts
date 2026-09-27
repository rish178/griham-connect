/**
 * Resolves the project slug from a hostname, supporting Griham Connect's
 * wildcard subdomain setup:
 *
 *   signature-sarvam.grihamconnect.com  -> "signature-sarvam"
 *   www.grihamconnect.com               -> null (marketing home)
 *   grihamconnect.com                   -> null
 *   localhost / *.pages.dev previews    -> null (use /projects/:slug instead)
 *
 * Used from `proxy.ts` (server-side rewrite) rather than a client effect —
 * see docs/lead-capture-plan.md history for why the old SPA did this in a
 * `useEffect` and why that was a flash-then-redirect.
 */
const RESERVED = new Set(['www', 'app', 'staging'])

export function getSubdomainSlug(hostname: string): string | null {
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return null

  const parts = hostname.split('.')
  if (parts.length < 3) return null // apex domain, e.g. "grihamconnect.com"

  const sub = parts[0]
  if (RESERVED.has(sub)) return null
  return sub
}
