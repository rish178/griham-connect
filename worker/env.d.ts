export interface Env {
  ASSETS: Fetcher

  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  TURNSTILE_SECRET_KEY: string

  // Optional: each integration no-ops (rather than throwing) when its secret
  // is unset, so the Worker is fully functional before Phase 2/3 are wired up.
  SLACK_WEBHOOK_URL?: string
  SHEET_WEBHOOK_URL?: string
  META_PIXEL_ID?: string
  META_CAPI_ACCESS_TOKEN?: string
  // Set only while testing — routes CAPI events into Events Manager's Test
  // Events tab instead of live campaign data. Unset in real production.
  META_TEST_EVENT_CODE?: string
}
