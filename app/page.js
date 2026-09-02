import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>Papelera</p>
          <h1 className={styles.headline}>
            Escribe algo que se sienta
            <br />
            escrito a mano.
          </h1>
          <p className={styles.sub}>
            Tarjetas digitales con textura de papel, letras que parecen
            trazadas y stickers que no encontrarás en ningún otro editor.
            Empieza gratis; desbloquea más detalles a tu ritmo.
          </p>
          <div className={styles.actions}>
            <Link href="/editor" className={styles.primaryBtn}>
              Crear una tarjeta
            </Link>
            <span className={styles.hint}>No necesitas cuenta para probar</span>
          </div>
        </div>

        <div className={styles.heroCard}>
          <div className={`${styles.cardMock} paper-texture`}>
            <span className={styles.cardMockNote}>
              Feliz cumpleaños,
              <br />
              Ana
            </span>
            <div className={styles.stickerA} aria-hidden="true" />
            <div className={styles.stickerB} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className={styles.details}>
        <div className={styles.detailCol}>
          <h2 className={styles.detailTitle}>Fuentes con textura</h2>
          <p className={styles.detailBody}>
            Cada letra imita el trazo real de un pincel o una pluma, no una
            tipografía de sistema forzada a verse "manuscrita".
          </p>
        </div>
        <div className={styles.detailCol}>
          <h2 className={styles.detailTitle}>Stickers e imágenes propias</h2>
          <p className={styles.detailBody}>
            Arrastra elementos ilustrados o sube tus propias fotos. La
            composición queda en tus manos, sin plantillas rígidas.
          </p>
        </div>
        <div className={styles.detailCol}>
          <h2 className={styles.detailTitle}>Gratis para empezar</h2>
          <p className={styles.detailBody}>
            Las herramientas básicas no cuestan nada. Los extras se
            desbloquean viendo un anuncio corto o con una suscripción baja,
            tú eliges.
          </p>
        </div>
      </section>
    </main>
  );
}
