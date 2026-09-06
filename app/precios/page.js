import Link from "next/link";
import { getSupabaseServer } from "../../lib/supabase/server";
import SubscribeButton from "../../components/SubscribeButton";
import ManageSubscriptionButton from "../../components/ManageSubscriptionButton";
import styles from "./precios.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Precios — Papelera",
};

export default async function PreciosPage({ searchParams }) {
  const checkout = searchParams?.checkout;
  let isSubscriber = false;
  const supabase = getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_subscriber")
        .eq("id", user.id)
        .maybeSingle();
      isSubscriber = !!prof?.is_subscriber;
    }
  }

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Papelera
      </Link>

      <h1 className={styles.title}>Un plan sencillo</h1>
      <p className={styles.lead}>
        Lo básico es gratis para siempre. En el plan gratis, cada anuncio
        desbloquea sus extras solo en la tarjeta en la que estás. La
        suscripción quita los anuncios y la marca de agua en{" "}
        <strong>todas tus tarjetas y proyectos</strong>.
      </p>

      {checkout === "success" && (
        <p className={`${styles.banner} ${styles.bannerOk}`}>
          ¡Listo! Si el pago se confirmó, tu cuenta pasará a "sin anuncios" en
          unos segundos. Recarga si no lo ves al instante.
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
            <li>Editor completo: texto, stickers, fondos, capas, deshacer</li>
            <li>3 imágenes propias por tarjeta</li>
            <li>
              Extras premium viendo un anuncio corto por bloque, y solo en esa
              tarjeta (hay que repetirlo en cada tarjeta nueva)
            </li>
            <li>Marca de agua pequeña al exportar o compartir</li>
            <li>Guardar en tu cuenta y compartir por enlace</li>
          </ul>
          <span className={styles.currentBtn}>Tu plan actual</span>
        </div>

        <div className={`${styles.plan} ${styles.planFeatured}`}>
          <p className={styles.planName}>Sin anuncios</p>
          <p className={styles.price}>
            <strong>1,99 €</strong> <span className={styles.muted}>/ mes</span>
          </p>
          <ul className={styles.features}>
            <li>
              Cero anuncios en <strong>todas tus tarjetas y proyectos</strong>,
              siempre
            </li>
            <li>
              Toda la biblioteca premium desbloqueada en todas las tarjetas
            </li>
            <li>Imágenes propias sin límite</li>
            <li>Sin marca de agua al exportar ni al compartir</li>
            <li>
              Sube tus propios stickers <span className={styles.muted}>(próximamente)</span>
            </li>
            <li>
              Fuentes propias en tu dispositivo{" "}
              <span className={styles.muted}>(próximamente)</span>
            </li>
          </ul>
          {isSubscriber ? (
            <>
              <span className={styles.currentBtn}>Ya estás suscrito ✓</span>
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
