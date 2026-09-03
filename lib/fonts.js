// Tipografías disponibles para el texto de la tarjeta.
// Cargadas vía <link> de Google Fonts en app/layout.js.
// value = nombre de familia CSS que entiende Konva.

export const FONTS = [
  // --- gratis ---
  { value: "Caveat", label: "Caveat", note: "manuscrita", premium: false },
  { value: "Patrick Hand", label: "Patrick Hand", note: "trazo suelto", premium: false },
  { value: "Kalam", label: "Kalam", note: "rotulador", premium: false },
  { value: "Special Elite", label: "Special Elite", note: "máquina de escribir", premium: false },
  { value: "Courier Prime", label: "Courier Prime", note: "monoespaciada", premium: false },
  { value: "Fraunces", label: "Fraunces", note: "serif con carácter", premium: false },
  // --- premium ---
  { value: "Shadows Into Light", label: "Shadows Into Light", note: "trazo fino", premium: true },
  { value: "Gaegu", label: "Gaegu", note: "redondeada", premium: true },
  { value: "Amatic SC", label: "Amatic SC", note: "alta y estrecha", premium: true },
  { value: "Parisienne", label: "Parisienne", note: "cursiva elegante", premium: true },
  { value: "Playfair Display", label: "Playfair Display", note: "serif de gala", premium: true },
];

export const FONT_BY_VALUE = Object.fromEntries(FONTS.map((f) => [f.value, f]));

export const DEFAULT_FONT = "Caveat";
