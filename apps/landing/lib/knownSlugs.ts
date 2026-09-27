/**
 * Slugs of registered projects, kept separate from `projectRegistry.ts` on
 * purpose: `proxy.ts` needs this list to decide whether to rewrite a
 * subdomain, and proxy code should stay dependency-light (it runs on every
 * request, on the Edge runtime by default). Importing the full registry
 * there would pull in each project's entire page component tree just to
 * check a slug — that also forces Next into its heavier, Windows-symlink-
 * sensitive "Node.js middleware" bundling mode.
 *
 * Keep this in sync with the keys of `projectRegistry` in
 * `lib/projectRegistry.ts`.
 */
export const KNOWN_PROJECT_SLUGS = new Set(['signature-sarvam'])
