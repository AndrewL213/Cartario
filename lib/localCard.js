// Borrador de invitado: se guarda en localStorage para que el editor
// funcione sin cuenta. También gestiona el "guardado pendiente" que se
// completa después de iniciar sesión por magic link.

const DRAFT_KEY = "papelera:draft";
const PENDING_KEY = "papelera:pending-save";

const canUseStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

export function loadDraft() {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.elements)) return null;
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      elements: parsed.elements,
      background:
        typeof parsed.background === "string" ? parsed.background : "plain",
      backgroundColor:
        typeof parsed.backgroundColor === "string"
          ? parsed.backgroundColor
          : null,
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return null;
  }
}

export function saveDraft({ title, elements, background, backgroundColor }) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        title: title || "",
        elements: elements || [],
        background: background || "plain",
        backgroundColor: backgroundColor || null,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // cuota llena o modo privado: se ignora
  }
}

export function clearDraft() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

// --- Guardado pendiente (invitado -> cuenta vía magic link) ------------------

export function setPendingSave({ title, elements, background, backgroundColor }) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({
        title: title || "",
        elements: elements || [],
        background: background || "plain",
        backgroundColor: backgroundColor || null,
      })
    );
  } catch {}
}

export function takePendingSave() {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(PENDING_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.elements)) return null;
    return {
      title: parsed.title || "",
      elements: parsed.elements,
      background:
        typeof parsed.background === "string" ? parsed.background : "plain",
      backgroundColor:
        typeof parsed.backgroundColor === "string"
          ? parsed.backgroundColor
          : null,
    };
  } catch {
    return null;
  }
}
