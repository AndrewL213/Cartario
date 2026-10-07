import Link from "next/link";
import { getSupabaseServer } from "../../lib/supabase/server";
import { loadIsPremium, AI_DAILY_LIMIT } from "../../lib/access";
import SubscribeButton from "../../components/SubscribeButton";
import ManageSubscriptionButton from "../../components/ManageSubscriptionButton";
import styles from "./precios.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Precios — Cartario",
};

export default async function PreciosPage({ searchParams }) {
  const checkout = searchParams?.checkout;
  let isPremium = false;
  const supabase = getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) isPremium = await loadIsPremium(supabase, user.id);
  }

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Cartario
      </Link>

      <h1 className={styles.title}>Un plan sencillo</h1>
      <p className={styles.lead}>
        Crear y enviar cartas es gratis. Premium es una sola suscripción, “Sin
        anuncios”, que además abre todo el catálogo y la decoración avanzada de
        tus cartas.
      </p>

      {checkout === "success" && (
        <p className={`${styles.banner} ${styles.bannerOk}`}>
          ¡Listo! Si el pago se confirmó, tu cuenta pasará a Premium en unos
          segundos. Recarga si no lo ves al instante.
        </p>
      )}
      {checkout === "cancel" && (
        <p className={`${styles.banner} ${styles.bannerNeutral}`}>
          Pago cancelado. Sin cambios en tu cuenta.
        </p>
      )}

      <div className={styles.plans}>
        <div className={styles.plan}>
          <p className={styles.planName}>Gratis</p>
          <p className={styles.price}>
            <strong>0 €</strong> / siempre
          </p>
          <ul className={styles.features}>
            <li>Editor manual completo, sin anuncios</li>
            <li>Stickers, tipografías y fondos gratuitos</li>
            <li>Guardar en tu cuenta y compartir por enlace</li>
            <li>
              Cartas con IA: hasta {AI_DAILY_LIMIT} al día, con anuncios
              laterales <span className={styles.muted}>(próximamente)</span>
            </li>
            <li>Marca de agua pequeña al descargar la carta como imagen</li>
          </ul>
          <span className={styles.currentBtn}>
            {isPremium ? "Plan gratuito" : "Tu plan actual"}
          </span>
        </div>

        <div className={`${styles.plan} ${styles.planFeatured}`}>
          <p className={styles.planName}>Premium · Sin anuncios</p>
          <p className={styles.price}>
            <strong>1,99 €</strong> <span className={styles.muted}>/ mes</span>
          </p>
          <ul className={styles.features}>
            <li>
              Sin anuncios, en <strong>todas tus cartas</strong>
            </li>
            <li>Todo el catálogo Premium: stickers, tipografías y fondos</li>
            <li>Sin marca de agua al descargar</li>
            <li>
              Decoración avanzada del sobre: diseño, textura y texto{" "}
              <span className={styles.muted}>(próximamente)</span>
            </li>
            <li>
              Sube tus propios stickers{" "}
              <span className={styles.muted}>(próximamente)</span>
            </li>
          </ul>
          {isPremium ? (
            <>
              <span className={styles.currentBtn}>Ya eres Premium ✓</span>
              <ManageSubscriptionButton className={styles.subscribeBtn} />
            </>
          ) : (
            <SubscribeButton className={styles.subscribeBtn} />
          )}
        </div>
      </div>

      <p className={styles.note}>
        Pago gestionado por Stripe. Puedes cancelar cuando quieras; sigues con
        acceso hasta el fin del periodo pagado. Precio de referencia, ajustable.
      </p>
    </main>
  );
}
