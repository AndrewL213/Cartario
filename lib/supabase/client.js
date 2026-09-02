"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "./config";

let cached = null;

// Cliente de navegador. Devuelve null si Supabase no está configurado,
// para que la UI pueda degradar a modo invitado sin romperse.
export function getSupabaseBrowser() {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}
