"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import styles from "./editor.module.css";

const CardCanvas = dynamic(() => import("../../components/CardCanvas"), {
  ssr: false,
  loading: () => <p>Cargando editor…</p>,
});

export default function EditorPage() {
  const [isPremiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  const handleRequestUnlock = () => setShowAdModal(true);

  const handleWatchAd = () => {
    // MVP: aquí se integraría el SDK real de Google AdSense / recompensado.
    // Se simula un anuncio de 2 segundos antes de desbloquear.
    setTimeout(() => {
      setPremiumUnlocked(true);
      setShowAdModal(false);
    }, 1200);
  };

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.back}>
          ← Papelera
        </Link>
        {isPremiumUnlocked && (
          <span className={styles.unlockedBadge}>Extras desbloqueados</span>
        )}
      </div>

      <h1 className={styles.title}>Tu tarjeta</h1>

      <CardCanvas
        isPremiumUnlocked={isPremiumUnlocked}
        onRequestUnlock={handleRequestUnlock}
      />

      {showAdModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Desbloquea stickers premium</h2>
            <p className={styles.modalBody}>
              Mira un anuncio corto para desbloquear esta y el resto de las
              opciones premium en esta tarjeta. También puedes suscribirte
              para no ver anuncios.
            </p>
            <div className={styles.modalActions}>
              <button onClick={handleWatchAd} className={styles.modalPrimary}>
                Ver anuncio
              </button>
              <button
                onClick={() => setShowAdModal(false)}
                className={styles.modalSecondary}
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
