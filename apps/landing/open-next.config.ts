import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults only — no R2 incremental cache wired up. This app doesn't rely on
// ISR/`revalidate`, so the default (in-memory, non-persistent) cache is
// sufficient. Add an `incrementalCache` override here if that changes.
export default defineCloudflareConfig();
