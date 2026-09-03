"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  backgroundFromRow,
} from "../lib/cards";
import { uploadCardImage } from "../lib/storage";
import { useEditorHistory } from "../lib/useEditorHistory";
import { STICKERS } from "../lib/stickers";
import { FONTS, FONT_BY_VALUE, DEFAULT_FONT } from "../lib/fonts";
import { BACKGROUNDS, DEFAULT_BG } from "../lib/backgrounds";
import styles from "../app/editor/editor.module.css";

const CardCanvas = dynamic(() => import("./CardCanvas"), {
  ssr: false,
  loading: () => <p>Cargando lienzo…</p>,
});

const CARD_W = 480;
const FREE_IMAGE_LIMIT = 3; // imágenes propias por tarjeta antes del muro
const CARD_H = 620;
const DEFAULT_TITLE = "Tarjeta sin título";
const INK = "#2a2620";
const TEXT_COLORS = ["#2a2620", "#b4614f", "#6e7f5c", "#c99a3d", "#5b6ea3", "#ffffff"];

const genId = () =>
  `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export default function Editor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const configured = isSupabaseConfigured();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cardId, setCardId] = useState(idParam || null);
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const [selectedId, setSelectedId] = useState(null);
  const [background, setBackground] = useState(DEFAULT_BG);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [isPremiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  const history = useEditorHistory([]);
  const { elements, commit, replace, checkpoint, undo, redo, reset, canUndo, canRedo } =
    history;

  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);
  const editBaseRef = useRef(null);
  const didInit = useRef(false);

  const selectedEl = useMemo(
    () => elements.find((e) => e.id === selectedId) || null,
    [elements, selectedId]
  );

  const markDirty = () => setSaveState((s) => (s === "saved" ? "idle" : s));

  // --- carga inicial -----------------------------------------------------
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

      // guardado pendiente tras magic link
      if (supabase && currentUser && !idParam) {
        const pending = takePendingSave();
        if (pending) {
          try {
            const row = await createCard(supabase, currentUser.id, {
              title: pending.title,
              elements: pending.elements,
              background: pending.background,
            });
            clearDraft();
            setCardId(row.id);
            setTitle(row.title);
            reset(elementsFromRow(row));
            setBackground(backgroundFromRow(row));
            setSaveState("saved");
            router.replace(`/editor?id=${row.id}`);
            setLoading(false);
            return;
          } catch (err) {
            setNotice("No se pudo guardar la tarjeta pendiente: " + err.message);
          }
        }
      }

      // editar tarjeta existente
      if (idParam) {
        if (!supabase || !currentUser) {
          setNotice("Entra con tu correo para abrir esta tarjeta guardada.");
          reset([]);
          setLoading(false);
          return;
        }
        try {
          const row = await getCard(supabase, idParam);
          if (row) {
            setCardId(row.id);
            setTitle(row.title || "");
            reset(elementsFromRow(row));
            setBackground(backgroundFromRow(row));
            setLoading(false);
            return;
          }
          setNotice("Esa tarjeta no existe o no es tuya. Empieza una nueva.");
          setCardId(null);
        } catch (err) {
          setNotice("No se pudo cargar la tarjeta: " + err.message);
        }
      }

      // borrador de invitado
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title || "");
        reset(draft.elements);
        setBackground(draft.background || DEFAULT_BG);
      } else {
        reset([]);
      }
      setLoading(false);
    })();
  }, [idParam, router, reset]);

  // --- autoguardado del borrador local ---------------------------------
  useEffect(() => {
    if (loading) return;
    if (user && cardId) return;
    const t = setTimeout(
      () => saveDraft({ title, elements, background }),
      600
    );
    return () => clearTimeout(t);
  }, [title, elements, background, loading, user, cardId]);

  // Repinta el lienzo cuando terminan de cargar las webfonts (Konva mide el
  // texto al pintar; si la fuente aún no está, sale con la de reserva).
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    document.fonts.ready.then(() => stageRef.current?.batchDraw());
  }, []);

  // --- atajos de teclado ----------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (k === "y" || (k === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (!typing && (e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        commit((els) => els.filter((el) => el.id !== selectedId));
        setSelectedId(null);
        markDirty();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, commit, selectedId]);

  // --- edición de elementos -----------------------------------------
  const patchElement = useCallback(
    (id, attrs, { commit: doCommit } = {}) => {
      const updater = (els) => els.map((el) => (el.id === id ? { ...el, ...attrs } : el));
      if (doCommit) commit(updater);
      else replace(updater);
      markDirty();
    },
    [commit, replace]
  );

  // Añade un elemento. `base` no lleva x/y: la posición se calcula DENTRO del
  // updater con la longitud real, para que varios "añadir" seguidos no se
  // apilen exactamente encima (si no, solo el de arriba se puede seleccionar).
  const addElement = (base) => {
    const id = genId();
    commit((els) => {
      const n = els.length;
      let x;
      let y;
      if (base.type === "text") {
        const k = n % 8;
        x = 56 + k * 16;
        y = 74 + k * 20;
      } else {
        const k = (n % 6) - 2.5;
        x = CARD_W / 2 + k * 22;
        y = CARD_H / 2 + k * 22;
      }
      return [...els, { ...base, id, x, y }];
    });
    setSelectedId(id);
    markDirty();
  };

  const addText = () =>
    addElement({
      type: "text",
      text: "Escribe aquí",
      width: 260,
      rotation: 0,
      fontSize: 30,
      fontFamily: DEFAULT_FONT,
      align: "left",
      fill: INK,
    });

  const requirePremium = () => {
    if (isPremiumUnlocked) return true;
    setShowAdModal(true);
    return false;
  };

  const addSticker = (sticker) => {
    if (sticker.premium && !requirePremium()) return;
    addElement({
      type: "sticker",
      src: sticker.src,
      stickerId: sticker.id,
      width: 96,
      height: 96,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };

  const imageCount = useMemo(
    () => elements.filter((e) => e.type === "image").length,
    [elements]
  );
  const imagesLocked = !isPremiumUnlocked && imageCount >= FREE_IMAGE_LIMIT;

  const handlePickImage = () => {
    if (!user) {
      setUploadError("Entra con tu correo para subir tus propias imágenes.");
      return;
    }
    if (imagesLocked) {
      setShowAdModal(true);
      return;
    }
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const supabase = getSupabaseBrowser();
    if (!supabase || !user) return;
    if (imagesLocked) {
      setShowAdModal(true);
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const dims = await readImageSize(file);
      const { url } = await uploadCardImage(supabase, user.id, file);
      const w = Math.min(220, dims.width || 200);
      const h = Math.round(w * ((dims.height || 200) / (dims.width || 200)));
      addElement({
        type: "image",
        src: url,
        width: w,
        height: h,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      });
    } catch (err) {
      setUploadError(err.message || "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    commit((els) => els.filter((el) => el.id !== selectedId));
    setSelectedId(null);
    markDirty();
  };

  const duplicateSelected = () => {
    if (!selectedEl) return;
    const copy = { ...selectedEl, id: genId(), x: selectedEl.x + 18, y: selectedEl.y + 18 };
    commit((els) => [...els, copy]);
    setSelectedId(copy.id);
    markDirty();
  };

  const reorder = (dir) => {
    if (!selectedId) return;
    commit((els) => {
      const i = els.findIndex((el) => el.id === selectedId);
      if (i < 0) return els;
      const copy = [...els];
      const [item] = copy.splice(i, 1);
      if (dir === "front") copy.push(item);
      else copy.unshift(item);
      return copy;
    });
    markDirty();
  };

  const changeFont = (value) => {
    const font = FONT_BY_VALUE[value];
    if (font?.premium && !requirePremium()) return;
    patchElement(selectedId, { fontFamily: value }, { commit: true });
    // asegura que la fuente esté descargada y repinta el lienzo
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts
        .load(`24px "${value}"`)
        .then(() => stageRef.current?.batchDraw())
        .catch(() => {});
    }
  };

  const changeBackground = (id) => {
    const bg = BACKGROUNDS.find((b) => b.id === id);
    if (bg?.premium && !requirePremium()) return;
    setBackground(id);
    markDirty();
  };

  const changeSize = (delta) => {
    if (!selectedEl) return;
    const next = Math.min(200, Math.max(8, (selectedEl.fontSize || 24) + delta));
    patchElement(selectedId, { fontSize: next }, { commit: true });
  };

  // edición de texto en el panel: agrupa la tanda en un solo "deshacer"
  const onTextFocus = () => {
    editBaseRef.current = elements;
  };
  const onTextChange = (value) => patchElement(selectedId, { text: value });
  const onTextBlur = () => {
    if (editBaseRef.current && editBaseRef.current !== elements) {
      checkpoint(editBaseRef.current);
    }
    editBaseRef.current = null;
  };
  const requestEditText = useCallback((id) => {
    setSelectedId(id);
    requestAnimationFrame(() => textAreaRef.current?.focus());
  }, []);

  // --- guardar --------------------------------------------------------
  const handleSave = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (!user) {
      setPendingSave({ title, elements, background });
      router.push(`/entrar?next=${encodeURIComponent("/editor?restore=1")}`);
      return;
    }
    setSaveState("saving");
    try {
      if (cardId) {
        const row = await updateCard(supabase, cardId, {
          title,
          elements,
          background,
        });
        setTitle(row.title);
      } else {
        const row = await createCard(supabase, user.id, {
          title,
          elements,
          background,
        });
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

  const handleExport = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const prevSelected = selectedId;
    setSelectedId(null);
    requestAnimationFrame(() => {
      const uri = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${(title || "tarjeta").replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = uri;
      link.click();
      setSelectedId(prevSelected);
    });
  };

  // --- anuncio (simulado hasta la Fase 3) ---------------------------
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
              <button type="button" onClick={handleSignOut} className={styles.linkBtn}>
                Salir
              </button>
            </>
          )}
          {configured && !user && (
            <Link href="/entrar?next=/editor" className={styles.accountLink}>
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
            markDirty();
          }}
        />
      </div>

      {notice && <p className={`${styles.saveHint} ${styles.saveStateErr}`}>{notice}</p>}

      {loading ? (
        <p>Cargando editor…</p>
      ) : (
        <div className={styles.workspace}>
          <div className={styles.canvasWrap}>
            <CardCanvas
              elements={elements}
              background={background}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={patchElement}
              onEditText={requestEditText}
              stageRef={stageRef}
            />
            <p className={styles.canvasHint}>
              Toca un elemento para seleccionarlo · doble clic en un texto para
              editarlo · esquinas para redimensionar y girar.
            </p>
          </div>

          <div className={styles.panel}>
            {/* añadir */}
            <div className={styles.group}>
              <p className={styles.groupTitle}>Añadir</p>
              <div className={styles.row}>
                <button type="button" className={styles.btn} onClick={addText}>
                  + Texto
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${imagesLocked ? styles.btnPremium : ""}`}
                  onClick={handlePickImage}
                  disabled={uploading}
                >
                  {uploading
                    ? "Subiendo…"
                    : imagesLocked
                    ? "+ Imagen 🔒"
                    : "+ Imagen"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  hidden
                  onChange={handleImageFile}
                />
              </div>
              {!user && (
                <p className={styles.uploadNote}>
                  Las imágenes propias necesitan cuenta. El texto y los stickers
                  gratis funcionan sin registrarse.
                </p>
              )}
              {user && !isPremiumUnlocked && (
                <p className={styles.uploadNote}>
                  {Math.min(imageCount, FREE_IMAGE_LIMIT)}/{FREE_IMAGE_LIMIT}{" "}
                  imágenes gratis en esta tarjeta.
                  {imagesLocked && " Mira un anuncio o suscríbete para añadir más."}
                </p>
              )}
              {uploadError && <p className={styles.errorNote}>{uploadError}</p>}
            </div>

            {/* fondo */}
            <div className={styles.group}>
              <p className={styles.groupTitle}>
                Fondo {!isPremiumUnlocked && "· 🔒 = premium"}
              </p>
              <div className={styles.bgGrid}>
                {BACKGROUNDS.map((b) => {
                  const locked = b.premium && !isPremiumUnlocked;
                  const active = background === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`${styles.bgBtn} ${active ? styles.bgBtnActive : ""}`}
                      onClick={() => changeBackground(b.id)}
                      title={locked ? `${b.label} (premium)` : b.label}
                    >
                      <span
                        className={styles.bgSwatch}
                        style={{ background: b.base }}
                        data-bg={b.id}
                      />
                      <span className={styles.bgLabel}>
                        {b.label}
                        {locked && " 🔒"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* stickers */}
            <div className={styles.group}>
              <p className={styles.groupTitle}>
                Stickers {!isPremiumUnlocked && "· 🔒 = premium"}
              </p>
              <div className={styles.stickerGrid}>
                {STICKERS.map((s) => {
                  const locked = s.premium && !isPremiumUnlocked;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={styles.stickerBtn}
                      onClick={() => addSticker(s)}
                      title={locked ? `${s.label} (premium)` : s.label}
                      aria-label={locked ? `${s.label}, premium` : s.label}
                    >
                      <img
                        src={s.src}
                        alt=""
                        className={locked ? styles.lockedThumb : undefined}
                      />
                      {locked && <span className={styles.stickerLock}>🔒</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* historial */}
            <div className={styles.group}>
              <p className={styles.groupTitle}>Historial</p>
              <div className={styles.iconRow}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={undo}
                  disabled={!canUndo}
                >
                  ↶ Deshacer
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={redo}
                  disabled={!canRedo}
                >
                  Rehacer ↻
                </button>
              </div>
            </div>

            {/* capas: lista para seleccionar cualquier elemento aunque esté tapado */}
            {elements.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupTitle}>Capas</p>
                <ul className={styles.layerList}>
                  {elements
                    .map((el, i) => ({ el, i }))
                    .reverse()
                    .map(({ el }) => (
                      <li key={el.id}>
                        <button
                          type="button"
                          className={`${styles.layerRow} ${
                            selectedId === el.id ? styles.layerRowActive : ""
                          }`}
                          onClick={() => setSelectedId(el.id)}
                        >
                          <span className={styles.layerName}>
                            {el.type === "text"
                              ? el.text || "Texto"
                              : el.type === "image"
                              ? "Imagen"
                              : STICKERS.find((s) => s.id === el.stickerId)?.label ||
                                "Sticker"}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* propiedades del elemento seleccionado */}
            <div className={styles.group}>
              <p className={styles.groupTitle}>Elemento seleccionado</p>
              {!selectedEl ? (
                <p className={styles.emptyPanelNote}>
                  Ningún elemento seleccionado. Toca algo del lienzo para
                  moverlo, redimensionarlo, cambiar su color o borrarlo.
                </p>
              ) : (
                <>
                  {selectedEl.type === "text" && (
                    <>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} htmlFor="txt">
                          Texto
                        </label>
                        <textarea
                          id="txt"
                          ref={textAreaRef}
                          className={styles.textArea}
                          value={selectedEl.text}
                          onFocus={onTextFocus}
                          onChange={(e) => onTextChange(e.target.value)}
                          onBlur={onTextBlur}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.fieldLabel} htmlFor="font">
                          Tipografía
                        </label>
                        <select
                          id="font"
                          className={styles.select}
                          value={selectedEl.fontFamily}
                          onChange={(e) => changeFont(e.target.value)}
                        >
                          {FONTS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label} — {f.note}
                              {f.premium && !isPremiumUnlocked ? " 🔒" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.field}>
                        <span className={styles.fieldLabel}>Tamaño</span>
                        <div className={styles.iconRow}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => changeSize(-2)}
                          >
                            A−
                          </button>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => changeSize(2)}
                          >
                            A+
                          </button>
                        </div>
                      </div>

                      <div className={styles.field}>
                        <span className={styles.fieldLabel}>Color</span>
                        <div className={styles.swatches}>
                          {TEXT_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              aria-label={`Color ${c}`}
                              className={`${styles.swatch} ${
                                selectedEl.fill === c ? styles.swatchActive : ""
                              }`}
                              style={{ background: c }}
                              onClick={() =>
                                patchElement(selectedId, { fill: c }, { commit: true })
                              }
                            />
                          ))}
                          <input
                            type="color"
                            className={styles.colorInput}
                            value={
                              /^#[0-9a-fA-F]{6}$/.test(selectedEl.fill || "")
                                ? selectedEl.fill
                                : "#2a2620"
                            }
                            onChange={(e) =>
                              patchElement(
                                selectedId,
                                { fill: e.target.value },
                                { commit: true }
                              )
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Capa</span>
                    <div className={styles.iconRow}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => reorder("front")}
                      >
                        Al frente
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => reorder("back")}
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={duplicateSelected}
                      >
                        Duplicar
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={deleteSelected}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.saveRow}>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={handleExport}
          disabled={loading}
        >
          Descargar PNG
        </button>

        {configured ? (
          <>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saveState === "saving" || loading}
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
                Tu tarjeta se guarda en este navegador mientras tanto. Al entrar
                con tu correo, la subimos a tu cuenta.
              </span>
            )}
          </>
        ) : (
          <span className={styles.saveHint}>
            Modo invitado: la tarjeta se guarda en este navegador. Para tener
            cuenta, configura Supabase en <code>.env.local</code>.
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
              Desbloquea los extras premium
            </h2>
            <p className={styles.modalBody}>
              Mira un anuncio corto para desbloquear, en esta tarjeta, los
              stickers y tipografías premium y las imágenes propias sin límite.
              También puedes suscribirte para no ver anuncios.
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

// Lee ancho/alto natural de un File de imagen sin subirlo.
function readImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 200, height: 200 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
