// Desbloqueos por anuncio, guardados POR CARTA en la tabla `ad_unlocks`.
// El editor usa los ids "contenido" / "estilo"; la base usa "content" / "style".
// El tope de 2 por carta lo hace cumplir la base (clave única + trigger), no
// este archivo: aquí solo se traducen nombres y se leen/escriben filas.

export const BLOCKS = ["contenido", "estilo"];

const TO_DB = { contenido: "content", estilo: "style" };
const FROM_DB = { content: "contenido", style: "estilo" };

export const NO_UNLOCKS = { contenido: false, estilo: false };

export async function fetchUnlocks(supabase, cardId) {
  const { data, error } = await supabase
    .from("ad_unlocks")
    .select("block")
    .eq("card_id", cardId);
  if (error) throw error;
  const out = { ...NO_UNLOCKS };
  for (const row of data || []) {
    const block = FROM_DB[row.block];
    if (block) out[block] = true;
  }
  return out;
}

// Un desbloqueo repetido (23505) no es un error: ya estaba abierto.
export async function saveUnlock(supabase, cardId, userId, block) {
  const dbBlock = TO_DB[block];
  if (!dbBlock) throw new Error("Bloque desconocido: " + block);
  const { error } = await supabase
    .from("ad_unlocks")
    .insert({ card_id: cardId, user_id: userId, block: dbBlock });
  if (error && error.code !== "23505") throw error;
}

// Guarda los bloques abiertos durante la sesión en una carta recién creada.
export async function saveUnlocks(supabase, cardId, userId, unlocked) {
  for (const block of BLOCKS) {
    if (unlocked?.[block]) await saveUnlock(supabase, cardId, userId, block);
  }
}
