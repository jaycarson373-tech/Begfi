import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function supabaseAdmin() {
  if (client) return client;
  client = createClient(
    requiredEnv("SUPABASE_URL"),
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || requiredEnv("SUPABASE_SERVICE_ROLE"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return client;
}
