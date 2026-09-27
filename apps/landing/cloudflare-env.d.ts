// Augments @opennextjs/cloudflare's global `CloudflareEnv` interface with
// this app's own bindings/secrets. Regenerate the Cloudflare-provided parts
// with `pnpm --filter landing cf-typegen` once real resources exist; the
// app-specific fields below are hand-written since they're plain secrets,
// not bindings.
export {};

declare global {
  interface CloudflareEnv {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    TURNSTILE_SECRET_KEY: string;
    SLACK_WEBHOOK_URL?: string;
    SHEET_WEBHOOK_URL?: string;
    META_PIXEL_ID?: string;
    META_CAPI_ACCESS_TOKEN?: string;
    META_TEST_EVENT_CODE?: string;
  }
}
