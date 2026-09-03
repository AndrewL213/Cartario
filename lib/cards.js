// CRUD de tarjetas contra Supabase.
// content_json guarda { elements: [...], background: "<id>" }.

function toContentJson(elements, background) {
  return {
    elements: Array.isArray(elements) ? elements : [],
    background: background || "plain",
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

export async function createCard(
  supabase,
  userId,
  { title, elements, background, isPublic }
) {
  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: userId,
      title: title?.trim() || "Tarjeta sin título",
      content_json: toContentJson(elements, background),
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
  { title, elements, background, isPublic }
) {
  const patch = {};
  if (title !== undefined) patch.title = title?.trim() || "Tarjeta sin título";
  if (elements !== undefined || background !== undefined) {
    patch.content_json = toContentJson(elements, background);
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
