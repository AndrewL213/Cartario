// Subida de imágenes de usuario al bucket `card-images`.
// Ruta: <user_id>/<timestamp>-<slug>.<ext>  (coincide con las políticas RLS).

const MAX_BYTES = 5 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

function extFromType(type) {
  return (
    { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" }[
      type
    ] || "bin"
  );
}

export async function uploadCardImage(supabase, userId, file) {
  if (!file) throw new Error("No hay archivo.");
  if (!OK_TYPES.includes(file.type)) {
    throw new Error("Formato no admitido. Usa PNG, JPG, WEBP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen pesa más de 5 MB.");
  }

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFromType(
    file.type
  )}`;

  const { error } = await supabase.storage
    .from("card-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("card-images").getPublicUrl(path);
  return { url: data.publicUrl, path };
}
