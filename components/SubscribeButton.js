"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../lib/supabase/client";

export default function SubscribeButton({ className }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    const supabase = getSupabaseBrowser();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/entrar?next=/precios");
        return;
      }
    }

    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === "not-configured" || res.status === 503) {
        setError(
          "La suscripción todavía no está conectada (falta configurar Stripe)."
        );
      } else {
        setError(data.error || "No se pudo iniciar el pago. Inténtalo otra vez.");
      }
    } catch {
      setError("No se pudo conectar con el pago.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? "Abriendo pago…" : "Suscribirme"}
      </button>
      {error && (
        <p style={{ fontSize: 13, color: "#954c3d", lineHeight: 1.5, margin: 0 }}>
          {error}
        </p>
      )}
    </>
  );
}
