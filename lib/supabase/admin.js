import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// Cliente con service_role: SOLO servidor (webhook de Stripe). Salta la RLS,
// así que nunca debe importarse en código de cliente.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
