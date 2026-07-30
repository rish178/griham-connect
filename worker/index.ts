import type { Env } from './env'
import { handleLead } from './handleLead'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/leads' && request.method === 'POST') {
      return handleLead(request, env, ctx)
    }

    // Everything else — including every page route — is the SPA. Cloudflare
    // serves it from the built assets, with not_found_handling in
    // wrangler.toml making client-side routes (e.g. /projects/:slug) resolve
    // to index.html instead of 404ing on a hard refresh.
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
