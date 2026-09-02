// Catálogo de stickers. `src` apunta a /public/stickers/**.
// Gratis: ilustraciones originales de Papelera.
// Premium: OpenMoji (CC BY-SA 4.0) — ver public/stickers/premium/CREDITS.md

export const STICKERS = [
  // --- gratis ---
  { id: "corazon", label: "Corazón", src: "/stickers/free/corazon.svg", premium: false },
  { id: "estrella", label: "Estrella", src: "/stickers/free/estrella.svg", premium: false },
  { id: "flor", label: "Flor", src: "/stickers/free/flor.svg", premium: false },
  { id: "hoja", label: "Hoja", src: "/stickers/free/hoja.svg", premium: false },
  { id: "sol", label: "Sol", src: "/stickers/free/sol.svg", premium: false },
  { id: "chispa", label: "Chispa", src: "/stickers/free/chispa.svg", premium: false },
  // --- premium (desbloqueo por anuncio o suscripción) ---
  { id: "globo", label: "Globo", src: "/stickers/premium/globo.svg", premium: true },
  { id: "regalo", label: "Regalo", src: "/stickers/premium/regalo.svg", premium: true },
  { id: "pastel", label: "Pastel", src: "/stickers/premium/pastel.svg", premium: true },
  { id: "confeti", label: "Confeti", src: "/stickers/premium/confeti.svg", premium: true },
  { id: "arcoiris", label: "Arcoíris", src: "/stickers/premium/arcoiris.svg", premium: true },
  { id: "ramo", label: "Ramo", src: "/stickers/premium/ramo.svg", premium: true },
];

export const STICKER_BY_ID = Object.fromEntries(STICKERS.map((s) => [s.id, s]));
