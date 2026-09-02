import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "./config";

// Cliente para Server Components y Route Handlers. Devuelve null si Supabase
// no está configurado. Nota: en Server Components la escritura de cookies es
// no-op (se ignora en el try/catch); el refresco real de sesión lo hace el
// middleware.
export function getSupabaseServer() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component: sin acceso de escritura. El middleware refresca.
        }
      },
    },
  });
}
