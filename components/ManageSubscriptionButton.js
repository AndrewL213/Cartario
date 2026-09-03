"use client";

import { useState } from "react";

export default function ManageSubscriptionButton({ className }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(
        data.error === "not-configured"
          ? "El portal aún no está conectado."
          : "No se pudo abrir el portal."
      );
    } catch {
      setError("No se pudo conectar.");
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
        {busy ? "Abriendo…" : "Gestionar suscripción"}
      </button>
      {error && (
        <p style={{ fontSize: 13, color: "#954c3d", margin: 0 }}>{error}</p>
      )}
    </>
  );
}
