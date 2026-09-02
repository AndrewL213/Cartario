import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "../../lib/supabase/server";
import DeleteCardButton from "../../components/DeleteCardButton";
import styles from "./misTarjetas.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis tarjetas — Papelera",
};

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function MisTarjetasPage() {
  const supabase = getSupabaseServer();
  if (!supabase) redirect("/entrar?next=/mis-tarjetas");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/mis-tarjetas");

  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, title, updated_at, is_public")
    .order("updated_at", { ascending: false });

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.back}>
          ← Papelera
        </Link>
        <Link href="/editor" className={styles.newLink}>
          Nueva tarjeta
        </Link>
      </div>

      <h1 className={styles.title}>Mis tarjetas</h1>
      <p className={styles.meta}>{user.email}</p>

      {error && (
        <p className={styles.empty}>
          No se pudieron cargar tus tarjetas: {error.message}
        </p>
      )}

      {!error && (!cards || cards.length === 0) && (
        <div className={styles.empty}>
          Todavía no has guardado ninguna tarjeta.
          <br />
          <Link href="/editor" className={styles.back}>
            Crear la primera →
          </Link>
        </div>
      )}

      {!error && cards && cards.length > 0 && (
        <ul className={styles.list}>
          {cards.map((card) => (
            <li key={card.id} className={styles.item}>
              <Link href={`/editor?id=${card.id}`} className={styles.itemLink}>
                <span className={styles.itemTitle}>
                  {card.title || "Tarjeta sin título"}
                  {card.is_public && <span className={styles.badge}>pública</span>}
                </span>
                <span className={styles.itemMeta}>
                  Editada el {formatDate(card.updated_at)}
                </span>
              </Link>
              <DeleteCardButton id={card.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
