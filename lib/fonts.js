// Tipografías disponibles para el texto de la tarjeta.
// Cargadas vía <link> de Google Fonts en app/layout.js.
// value = nombre de familia CSS que entiende Konva.

export const FONTS = [
  { value: "Caveat", label: "Caveat", note: "manuscrita", premium: false },
  { value: "Special Elite", label: "Special Elite", note: "máquina de escribir", premium: false },
  { value: "Fraunces", label: "Fraunces", note: "serif con carácter", premium: false },
  { value: "Shadows Into Light", label: "Shadows Into Light", note: "trazo fino", premium: true },
  { value: "Gaegu", label: "Gaegu", note: "redondeada", premium: true },
];

export const FONT_BY_VALUE = Object.fromEntries(FONTS.map((f) => [f.value, f]));

export const DEFAULT_FONT = "Caveat";
