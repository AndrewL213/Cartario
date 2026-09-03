// Catálogo de stickers. `src` apunta a /public/stickers/**.
// Gratis: ilustraciones originales de Papelera.
// Premium: OpenMoji (CC BY-SA 4.0) — ver public/stickers/premium/CREDITS.md

export const STICKERS = [
  // --- gratis (12) ---
  { id: "corazon", label: "Corazón", src: "/stickers/free/corazon.svg", premium: false },
  { id: "estrella", label: "Estrella", src: "/stickers/free/estrella.svg", premium: false },
  { id: "flor", label: "Flor", src: "/stickers/free/flor.svg", premium: false },
  { id: "hoja", label: "Hoja", src: "/stickers/free/hoja.svg", premium: false },
  { id: "sol", label: "Sol", src: "/stickers/free/sol.svg", premium: false },
  { id: "chispa", label: "Chispa", src: "/stickers/free/chispa.svg", premium: false },
  { id: "luna", label: "Luna", src: "/stickers/free/luna.svg", premium: false },
  { id: "nube", label: "Nube", src: "/stickers/free/nube.svg", premium: false },
  { id: "taza", label: "Taza", src: "/stickers/free/taza.svg", premium: false },
  { id: "lazo", label: "Lazo", src: "/stickers/free/lazo.svg", premium: false },
  { id: "ola", label: "Ola", src: "/stickers/free/ola.svg", premium: false },
  { id: "montana", label: "Montaña", src: "/stickers/free/montana.svg", premium: false },
  // --- premium (12) — desbloqueo por anuncio o suscripción ---
  { id: "globo", label: "Globo", src: "/stickers/premium/globo.svg", premium: true },
  { id: "regalo", label: "Regalo", src: "/stickers/premium/regalo.svg", premium: true },
  { id: "pastel", label: "Pastel", src: "/stickers/premium/pastel.svg", premium: true },
  { id: "confeti", label: "Confeti", src: "/stickers/premium/confeti.svg", premium: true },
  { id: "confeti-bola", label: "Bola de confeti", src: "/stickers/premium/confeti-bola.svg", premium: true },
  { id: "arcoiris", label: "Arcoíris", src: "/stickers/premium/arcoiris.svg", premium: true },
  { id: "ramo", label: "Ramo", src: "/stickers/premium/ramo.svg", premium: true },
  { id: "flor-cerezo", label: "Flor de cerezo", src: "/stickers/premium/flor-cerezo.svg", premium: true },
  { id: "cupcake", label: "Cupcake", src: "/stickers/premium/cupcake.svg", premium: true },
  { id: "cinta", label: "Cinta", src: "/stickers/premium/cinta.svg", premium: true },
  { id: "brindis", label: "Brindis", src: "/stickers/premium/brindis.svg", premium: true },
  { id: "carta-amor", label: "Carta", src: "/stickers/premium/carta-amor.svg", premium: true },
];

export const STICKER_BY_ID = Object.fromEntries(STICKERS.map((s) => [s.id, s]));
