"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "../../lib/supabase/client";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import styles from "./entrar.module.css";

function EntrarInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/mis-cartas";
  const hadError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    setStatus("sending");
    setMessage("");

    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "No se pudo enviar el enlace. Inténtalo otra vez.");
    } else {
      setStatus("sent");
      setMessage(
        `Te enviamos un enlace a ${email.trim()}. Ábrelo en este mismo dispositivo para entrar.`
      );
    }
  };

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Cartario
      </Link>

      <h1 className={styles.title}>Entra con tu correo</h1>
      <p className={styles.sub}>
        Sin contraseña. Te mandamos un enlace de un solo uso; al abrirlo,
        quedas dentro. Tus cartas de invitado se pueden guardar en la cuenta
        después.
      </p>

      {!configured ? (
        <div className={styles.disabledBox}>
          El inicio de sesión aún no está conectado (falta configurar Supabase
          en <code>.env.local</code>). Mientras tanto, el editor funciona en
          modo invitado y guarda tu carta en este navegador.
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending" || status === "sent"}
          />
          <button
            type="submit"
            className={styles.submit}
            disabled={status === "sending" || status === "sent" || !email.trim()}
          >
            {status === "sending" ? "Enviando…" : "Enviarme el enlace"}
          </button>
        </form>
      )}

      {hadError && status === "idle" && (
        <div className={`${styles.notice} ${styles.noticeErr}`}>
          El enlace no era válido o ya se usó. Pide uno nuevo.
        </div>
      )}
      {message && (
        <div
          className={`${styles.notice} ${
            status === "error" ? styles.noticeErr : styles.noticeOk
          }`}
        >
          {message}
        </div>
      )}
    </main>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<main className={styles.main} />}>
      <EntrarInner />
    </Suspense>
  );
}
