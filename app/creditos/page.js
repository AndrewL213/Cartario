import Link from "next/link";
import { STICKERS } from "../../lib/stickers";
import { FONTS } from "../../lib/fonts";
import styles from "./creditos.module.css";

export const metadata = {
  title: "Créditos — Cartario",
};

const premiumStickers = STICKERS.filter((s) => s.premium);
const freeStickersCount = STICKERS.filter((s) => !s.premium).length;

// Tipografías del editor + la de la interfaz (Inter).
const fontFamilies = [...FONTS.map((f) => f.label), "Inter"];
const specimenUrl = (name) =>
  `https://fonts.google.com/specimen/${name.trim().replace(/\s+/g, "+")}`;

export default function CreditosPage() {
  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Cartario
      </Link>

      <h1 className={styles.title}>Créditos</h1>
      <p className={styles.lead}>
        Cartario se apoya en trabajo abierto de otras personas. Aquí está cada
        pieza y su licencia.
      </p>

      <section className={styles.section} aria-labelledby="cred-openmoji">
        <h2 id="cred-openmoji" className={styles.h2}>
          Stickers premium · OpenMoji
        </h2>
        <p className={styles.body}>
          Los {premiumStickers.length} stickers premium son de{" "}
          <a href="https://openmoji.org" target="_blank" rel="noopener noreferrer">
            OpenMoji
          </a>
          , el proyecto de emojis abiertos de la HfG Schwäbisch Gmünd y sus
          colaboradores. Se usan bajo la licencia{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.es"
            target="_blank"
            rel="noopener noreferrer"
          >
            Creative Commons Atribución-CompartirIgual 4.0 (CC BY-SA 4.0)
          </a>
          . No hemos cambiado los dibujos: solo añadimos a cada archivo un
          atributo de tamaño para poder pintarlos en el lienzo.
        </p>
        <ul className={styles.stickerGrid}>
          {premiumStickers.map((s) => (
            <li key={s.id} className={styles.stickerItem}>
              <img src={s.src} alt="" className={styles.stickerImg} />
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="cred-propios">
        <h2 id="cred-propios" className={styles.h2}>
          Stickers gratuitos
        </h2>
        <p className={styles.body}>
          Los {freeStickersCount} stickers gratuitos los dibujó el equipo de
          Cartario para este proyecto.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="cred-fuentes">
        <h2 id="cred-fuentes" className={styles.h2}>
          Tipografías
        </h2>
        <p className={styles.body}>
          Todas las tipografías se sirven desde Google Fonts con licencias
          libres (SIL Open Font License 1.1 o Apache 2.0, según la familia). Cada
          nombre enlaza a su ficha.
        </p>
        <ul className={styles.fontList}>
          {fontFamilies.map((name) => (
            <li key={name}>
              <a href={specimenUrl(name)} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
