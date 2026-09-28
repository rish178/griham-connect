// Augments @opennextjs/cloudflare's global `CloudflareEnv` interface with
// this app's own bindings/secrets. Regenerate the Cloudflare-provided parts
// with `pnpm --filter web cf-typegen` once real resources exist; the
// app-specific fields below are hand-written since they're plain secrets,
// not bindings.
export {};

declare global {
  interface CloudflareEnv {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    ADMIN_PASSWORD: string;
    ADMIN_SESSION_SECRET: string;
  }
}
