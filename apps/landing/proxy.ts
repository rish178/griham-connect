import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSubdomainSlug } from '@/lib/subdomain'
import { KNOWN_PROJECT_SLUGS } from '@/lib/knownSlugs'

/**
 * Server-side replacement for the old SPA's client-side subdomain redirect
 * (a `useEffect` in HomePage that rendered nothing, then navigated — a
 * visible blank flash). Rewrites signature-sarvam.grihamconnect.com/ to
 * /projects/signature-sarvam before any HTML is sent.
 *
 * Only rewrites the bare "/" request, matching the original behavior where
 * subdomain resolution only ever ran on the home route (see the matcher
 * below — it never runs on /api, /projects, or static assets).
 */
export function proxy(request: NextRequest) {
  const slug = getSubdomainSlug(request.nextUrl.hostname)
  if (!slug || !KNOWN_PROJECT_SLUGS.has(slug)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/projects/${slug}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: '/',
}
