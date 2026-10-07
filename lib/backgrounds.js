// Fondos de la carta. Cada uno = color base + un "tile" que se dibuja en un
// canvas pequeño y se repite como patrón sobre el lienzo de Konva.
// `draw(ctx, size)` pinta un mosaico de `size` x `size` px.

const INK_SOFT = "rgba(42, 38, 32, 0.12)";
const INK_FAINT = "rgba(42, 38, 32, 0.07)";
const INK_DOT = "rgba(42, 38, 32, 0.22)";
const CLAY = "rgba(180, 97, 79, 0.35)";
const SAGE = "rgba(110, 127, 92, 0.28)";

function gridTile(ctx, s) {
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0.5, 0);
  ctx.lineTo(0.5, s);
  ctx.moveTo(0, 0.5);
  ctx.lineTo(s, 0.5);
  ctx.stroke();
}

function dotsTile(ctx, s) {
  ctx.fillStyle = INK_DOT;
  ctx.beginPath();
  ctx.arc(1.4, 1.4, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

function linesTile(ctx, s) {
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, s - 0.5);
  ctx.lineTo(s, s - 0.5);
  ctx.stroke();
}

function graphTile(ctx, s) {
  // milimetrado: líneas finas cada 8, gruesa en el borde del bloque
  ctx.strokeStyle = INK_FAINT;
  ctx.lineWidth = 1;
  for (let i = 8; i < s; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i + 0.5, 0);
    ctx.lineTo(i + 0.5, s);
    ctx.moveTo(0, i + 0.5);
    ctx.lineTo(s, i + 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = SAGE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0.5, 0);
  ctx.lineTo(0.5, s);
  ctx.moveTo(0, 0.5);
  ctx.lineTo(s, 0.5);
  ctx.stroke();
}

function isoTile(ctx, s) {
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.lineTo(s, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(s, s);
  ctx.moveTo(0, s / 2);
  ctx.lineTo(s, s / 2);
  ctx.stroke();
}

function ledgerTile(ctx, s) {
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, s - 0.5);
  ctx.lineTo(s, s - 0.5);
  ctx.stroke();
  ctx.strokeStyle = CLAY;
  ctx.beginPath();
  ctx.moveTo(0.5, 0);
  ctx.lineTo(0.5, s);
  ctx.stroke();
}

function crossTile(ctx, s) {
  // crucecitas (tipo cuaderno francés)
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  const m = s / 2;
  ctx.beginPath();
  ctx.moveTo(m - 3, m + 0.5);
  ctx.lineTo(m + 3, m + 0.5);
  ctx.moveTo(m + 0.5, m - 3);
  ctx.lineTo(m + 0.5, m + 3);
  ctx.stroke();
}

function hatchTile(ctx, s) {
  // trama diagonal fina
  ctx.strokeStyle = INK_FAINT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-1, s + 1);
  ctx.lineTo(s + 1, -1);
  ctx.stroke();
}

function checksTile(ctx, s) {
  // tablero de ajedrez muy suave
  ctx.fillStyle = "rgba(42, 38, 32, 0.05)";
  const h = s / 2;
  ctx.fillRect(0, 0, h, h);
  ctx.fillRect(h, h, h, h);
}

function confettiTile(ctx, s) {
  // puntitos de colores de la marca
  const cols = [CLAY, SAGE, "rgba(201, 154, 61, 0.45)"];
  const pts = [
    [s * 0.2, s * 0.3],
    [s * 0.7, s * 0.55],
    [s * 0.45, s * 0.85],
  ];
  pts.forEach(([x, y], i) => {
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

export const BACKGROUNDS = [
  { id: "plain", label: "Liso", premium: false, base: "#f6f1e4", tileSize: 0, draw: null },
  { id: "grid", label: "Cuadriculado", premium: false, base: "#f6f1e4", tileSize: 26, draw: gridTile },
  { id: "dots", label: "Puntos", premium: false, base: "#f6f1e4", tileSize: 24, draw: dotsTile },
  { id: "lines", label: "Renglones", premium: false, base: "#fdfaf2", tileSize: 34, draw: linesTile },
  { id: "cross", label: "Crucecitas", premium: false, base: "#f6f1e4", tileSize: 26, draw: crossTile },
  { id: "hatch", label: "Trama", premium: false, base: "#f6f1e4", tileSize: 12, draw: hatchTile },
  { id: "graph", label: "Milimetrado", premium: true, base: "#f3f6f1", tileSize: 40, draw: graphTile },
  { id: "iso", label: "Isométrico", premium: true, base: "#f6f1e4", tileSize: 28, draw: isoTile },
  { id: "kraft", label: "Kraft", premium: true, base: "#d8c4a1", tileSize: 26, draw: gridTile },
  { id: "ledger", label: "Columna", premium: true, base: "#fdfaf2", tileSize: 34, draw: ledgerTile },
  { id: "checks", label: "Damero", premium: true, base: "#f6f1e4", tileSize: 24, draw: checksTile },
  { id: "confeti", label: "Confeti", premium: true, base: "#f6f1e4", tileSize: 34, draw: confettiTile },
];

export const BG_BY_ID = Object.fromEntries(BACKGROUNDS.map((b) => [b.id, b]));
export const DEFAULT_BG = "plain";

// Construye un data-URL con el mosaico del fondo (o null si es liso).
export function backgroundTileDataUrl(bg) {
  if (!bg || !bg.draw || typeof document === "undefined") return null;
  const dpr = 2;
  const s = bg.tileSize;
  const canvas = document.createElement("canvas");
  canvas.width = s * dpr;
  canvas.height = s * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  bg.draw(ctx, s);
  return canvas.toDataURL("image/png");
}
