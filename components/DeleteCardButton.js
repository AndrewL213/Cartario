"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "../lib/supabase/client";
import { deleteCard } from "../lib/cards";

export default function DeleteCardButton({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (!window.confirm("¿Borrar esta carta? No se puede deshacer.")) return;

    setBusy(true);
    try {
      await deleteCard(supabase, id);
      router.refresh();
    } catch (err) {
      window.alert("No se pudo borrar: " + err.message);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      style={{
        background: "none",
        border: "none",
        color: "#954c3d",
        font: "inherit",
        fontSize: 13,
        cursor: "pointer",
        padding: "4px 6px",
      }}
    >
      {busy ? "Borrando…" : "Borrar"}
    </button>
  );
}
