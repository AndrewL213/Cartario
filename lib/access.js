// Niveles de acceso y reglas de negocio de Cartario.
// "Premium" es UN solo sistema: la suscripción "Sin anuncios". Cada fase
// enchufa aquí sus comprobaciones (cliente y servidor usan el mismo módulo,
// por eso no importa nada de React ni de Next).

export const TIERS = { GUEST: "guest", FREE: "free", PREMIUM: "premium" };

// Dónde puede haber anuncios. Regla crítica: la página de recepción nunca.
export const AD_SURFACES = {
  manualEditor: "none",
  reception: "none",
  aiFlow: "sides", // anuncios laterales; solo para quien no es Premium
};

export const AI_DAILY_LIMIT = 3; // cartas generadas con IA por usuario y día

// Decoración del embed (sobre/sello/miniatura). Se aplica en cliente Y servidor.
export const EMBED_DECORATION = {
  freePersonalization: ["senderName", "title", "envelopeColor", "sealColor"],
  free: ["stickers", "images", "seals"],
  premiumOnly: ["envelope", "design", "texture", "text"],
};

export function tierFor({ user, isPremium }) {
  if (!user) return TIERS.GUEST;
  return isPremium ? TIERS.PREMIUM : TIERS.FREE;
}

export function getAccess({ user = null, isPremium = false } = {}) {
  const premium = !!user && !!isPremium;
  return {
    tier: tierFor({ user, isPremium: premium }),
    isPremium: premium,
    // Elementos del catálogo marcados `premium: true` (stickers, fuentes, fondos).
    canUseItem: (item) => !item?.premium || premium,
    showsAds: (surface) => AD_SURFACES[surface] !== "none" && !premium,
    aiDailyLimit: AI_DAILY_LIMIT,
    canDecorateEmbed: (kind) =>
      EMBED_DECORATION.free.includes(kind) || premium,
  };
}

// Lee el estado Premium del perfil. Aceptamos cualquier cliente de Supabase
// (navegador o servidor). La columna actual es `is_subscriber`; en la Fase 1
// pasa a `is_premium` y solo hay que cambiarla aquí.
export async function loadIsPremium(supabase, userId) {
  if (!supabase || !userId) return false;
  const { data } = await supabase
    .from("profiles")
    .select("is_subscriber")
    .eq("id", userId)
    .maybeSingle();
  return !!data?.is_subscriber;
}
