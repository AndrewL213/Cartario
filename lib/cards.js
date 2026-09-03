// CRUD de tarjetas contra Supabase.
// content_json guarda { elements: [...], background: "<id>" }.

function toContentJson(elements, background, backgroundColor) {
  return {
    elements: Array.isArray(elements) ? elements : [],
    background: background || "plain",
    backgroundColor: backgroundColor || null,
  };
}

export function elementsFromRow(row) {
  const c = row?.content_json;
  if (c && Array.isArray(c.elements)) return c.elements;
  return [];
}

export function backgroundFromRow(row) {
  const c = row?.content_json;
  return (c && typeof c.background === "string" && c.background) || "plain";
}

export function backgroundColorFromRow(row) {
  const c = row?.content_json;
  return (c && typeof c.backgroundColor === "string" && c.backgroundColor) || null;
}

export async function createCard(
  supabase,
  userId,
  { title, elements, background, backgroundColor, isPublic }
) {
  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: userId,
      title: title?.trim() || "Tarjeta sin título",
      content_json: toContentJson(elements, background, backgroundColor),
      is_public: !!isPublic,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCard(
  supabase,
  id,
  { title, elements, background, backgroundColor, isPublic }
) {
  const patch = {};
  if (title !== undefined) patch.title = title?.trim() || "Tarjeta sin título";
  if (elements !== undefined || background !== undefined) {
    patch.content_json = toContentJson(elements, background, backgroundColor);
  }
  if (isPublic !== undefined) patch.is_public = !!isPublic;

  const { data, error } = await supabase
    .from("cards")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCard(supabase, id) {
  const { data, error } = await supabase
    .from("cards")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteCard(supabase, id) {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw error;
}
