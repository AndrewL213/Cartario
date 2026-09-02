import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabase/server";

// Recibe el enlace del magic link, canjea el código por una sesión y
// redirige a `next` (por defecto, /mis-tarjetas).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/mis-tarjetas";

  if (code) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=auth`);
}
