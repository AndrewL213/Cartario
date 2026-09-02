"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { getSupabaseBrowser } from "../lib/supabase/client";
import { isSupabaseConfigured } from "../lib/supabase/config";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  setPendingSave,
  takePendingSave,
} from "../lib/localCard";
import {
  createCard,
  updateCard,
  getCard,
  elementsFromRow,
} from "../lib/cards";
import styles from "../app/editor/editor.module.css";

const CardCanvas = dynamic(() => import("./CardCanvas"), {
  ssr: false,
  loading: () => <p>Cargando editor…</p>,
});

const DEFAULT_TITLE = "Tarjeta sin título";

export default function Editor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const configured = isSupabaseConfigured();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cardId, setCardId] = useState(idParam || null);
  const [title, setTitle] = useState("");
  const [elements, setElements] = useState([]);
  const [seedElements, setSeedElements] = useState(null); // lo que recibe CardCanvas
  const [notice, setNotice] = useState("");

  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  // premium / anuncio (se conecta de verdad en la Fase 3)
  const [isPremiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  const didInit = useRef(false);

  // --- Carga inicial -------------------------------------------------------
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      const supabase = getSupabaseBrowser();
      let currentUser = null;

      if (supabase) {
        const { data } = await supabase.auth.getUser();
        currentUser = data?.user || null;
        setUser(currentUser);
      }

      // 1) Guardado pendiente tras magic link (invitado -> cuenta).
      if (supabase && currentUser && !idParam) {
        const pending = takePendingSave();
        if (pending) {
          try {
            const row = await createCard(supabase, currentUser.id, {
              title: pending.title,
              elements: pending.elements,
            });
            clearDraft();
            setCardId(row.id);
            setTitle(row.title);
            setSeedElements(elementsFromRow(row));
            setElements(elementsFromRow(row));
            setSaveState("saved");
            router.replace(`/editor?id=${row.id}`);
            setLoading(false);
            return;
          } catch (err) {
            setNotice("No se pudo guardar la tarjeta pendiente: " + err.message);
          }
        }
      }

      // 2) Editar una tarjeta existente.
      if (idParam) {
        if (!supabase || !currentUser) {
          setNotice(
            "Entra con tu correo para abrir esta tarjeta guardada."
          );
          setSeedElements([]);
          setLoading(false);
          return;
        }
        try {
          const row = await getCard(supabase, idParam);
          if (row) {
            setCardId(row.id);
            setTitle(row.title || "");
            setSeedElements(elementsFromRow(row));
            setElements(elementsFromRow(row));
            setLoading(false);
            return;
          }
          setNotice("Esa tarjeta no existe o no es tuya. Empieza una nueva.");
          setCardId(null);
        } catch (err) {
          setNotice("No se pudo cargar la tarjeta: " + err.message);
        }
      }

      // 3) Borrador de invitado (localStorage).
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title || "");
        setSeedElements(draft.elements);
        setElements(draft.elements);
      } else {
        setSeedElements([]);
      }
      setLoading(false);
    })();
  }, [idParam, router]);

  // --- Autoguardado del borrador local -----------------------------------
  // Solo cuando es un borrador de invitado sin fila propia todavía.
  useEffect(() => {
    if (loading) return;
    if (user && cardId) return; // ya vive en la cuenta
    const t = setTimeout(() => saveDraft({ title, elements }), 600);
    return () => clearTimeout(t);
  }, [title, elements, loading, user, cardId]);

  const handleElementsChange = useCallback((els) => {
    setElements(els);
    setSaveState((s) => (s === "saved" ? "idle" : s));
  }, []);

  // --- Guardar ----------------------------------------------------------
  const handleSave = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    if (!user) {
      // Guarda intención y manda al login; al volver se completa solo.
      setPendingSave({ title, elements });
      router.push(
        `/entrar?next=${encodeURIComponent("/editor?restore=1")}`
      );
      return;
    }

    setSaveState("saving");
    try {
      if (cardId) {
        const row = await updateCard(supabase, cardId, { title, elements });
        setTitle(row.title);
      } else {
        const row = await createCard(supabase, user.id, { title, elements });
        setCardId(row.id);
        setTitle(row.title);
        clearDraft();
        router.replace(`/editor?id=${row.id}`);
      }
      setSaveState("saved");
    } catch (err) {
      setSaveState("error");
      setNotice("No se pudo guardar: " + err.message);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  // --- Anuncio (simulado hasta la Fase 3) ------------------------------
  const handleRequestUnlock = () => setShowAdModal(true);
  const handleWatchAd = () => {
    setTimeout(() => {
      setPremiumUnlocked(true);
      setShowAdModal(false);
    }, 1200);
  };

  const saveLabel = !user
    ? "Guardar en tu cuenta"
    : cardId
    ? "Guardar cambios"
    : "Guardar en tu cuenta";

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.back}>
          ← Papelera
        </Link>

        <div className={styles.account}>
          {isPremiumUnlocked && (
            <span className={styles.unlockedBadge}>Extras desbloqueados</span>
          )}
          {configured && user && (
            <>
              <span>{user.email}</span>
              <Link href="/mis-tarjetas" className={styles.accountLink}>
                Mis tarjetas
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className={styles.linkBtn}
              >
                Salir
              </button>
            </>
          )}
          {configured && !user && (
            <Link
              href="/entrar?next=/editor"
              className={styles.accountLink}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      <div className={styles.titleField}>
        <label className={styles.titleLabel} htmlFor="card-title">
          Título de la tarjeta
        </label>
        <input
          id="card-title"
          className={styles.titleInput}
          type="text"
          value={title}
          placeholder={DEFAULT_TITLE}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveState((s) => (s === "saved" ? "idle" : s));
          }}
        />
      </div>

      {notice && (
        <p className={`${styles.saveHint} ${styles.saveStateErr}`}>{notice}</p>
      )}

      {loading || seedElements === null ? (
        <p>Cargando editor…</p>
      ) : (
        <CardCanvas
          isPremiumUnlocked={isPremiumUnlocked}
          onRequestUnlock={handleRequestUnlock}
          initialElements={seedElements}
          onElementsChange={handleElementsChange}
        />
      )}

      <div className={styles.saveRow}>
        {configured ? (
          <>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saveState === "saving"}
            >
              {saveState === "saving" ? "Guardando…" : saveLabel}
            </button>
            {saveState === "saved" && (
              <span className={`${styles.saveState} ${styles.saveStateOk}`}>
                Guardado en tu cuenta
              </span>
            )}
            {saveState === "error" && (
              <span className={`${styles.saveState} ${styles.saveStateErr}`}>
                No se pudo guardar
              </span>
            )}
            {!user && saveState !== "saved" && (
              <span className={styles.saveHint}>
                Tu tarjeta se guarda en este navegador mientras tanto. Al
                entrar con tu correo, la subimos a tu cuenta automáticamente.
              </span>
            )}
          </>
        ) : (
          <span className={styles.saveHint}>
            Modo invitado: la tarjeta se guarda en este navegador. Para
            guardarla en una cuenta, configura Supabase en <code>.env.local</code>.
          </span>
        )}
      </div>

      {showAdModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ad-modal-title"
        >
          <div className={styles.modal}>
            <h2 id="ad-modal-title" className={styles.modalTitle}>
              Desbloquea stickers premium
            </h2>
            <p className={styles.modalBody}>
              Mira un anuncio corto para desbloquear esta y el resto de las
              opciones premium en esta tarjeta. También puedes suscribirte para
              no ver anuncios.
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
