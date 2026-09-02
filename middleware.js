import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request) {
  return updateSession(request);
}

export const config = {
  // Todo salvo estáticos de Next e imágenes comunes.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
