"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../lib/supabase/client";
import { migrateGuestDraft } from "../lib/cards";

// Se monta en las páginas a las que se llega tras iniciar sesión (Mis cartas).
// Si el invitado dejó una carta en este navegador, la guarda en su cuenta y
// refresca la lista.
export default function GuestDraftMigrator({ userId }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const supabase = getSupabaseBrowser();
    if (!supabase || !userId) return;
    migrateGuestDraft(supabase, userId)
      .then((row) => {
        if (row) router.refresh();
      })
      .catch(() => {
        // el borrador sigue en el navegador; se reintentará en la próxima visita
      });
  }, [userId, router]);

  return null;
}
