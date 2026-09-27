import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseClient(url: string, key: string) {
  return createClient(url, key);
}

let cached: SupabaseClient | null = null;

/**
 * Server-only client using the service-role key. Every Griham Connect table
 * is locked to service_role (see supabase/migrations/20260927000000_*.sql),
 * so this must never be imported from client components — only from Route
 * Handlers / Server Components / Server Actions.
 */
export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. Copy apps/web/.env.example to apps/web/.env.local and fill them in."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cached;
}
