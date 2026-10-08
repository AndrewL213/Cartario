# Cartario

Cartas digitales con estética física y manuscrita (textura de papel, tipografías
con carácter, stickers e imágenes propias), pensadas para enviarse a alguien
querido. Producto freemium para Latinoamérica hispanohablante (lanzamiento en
Colombia). Toda la interfaz va en español.

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev
```

Abre http://localhost:3000. Sin variables de entorno el editor funciona en **modo
invitado** (la carta se guarda en el navegador).

> Si el servidor "no carga" (CSS/JS con 404 o errores 500): casi siempre hay más
> de un `npm run dev` abierto o la carpeta `.next` quedó corrupta. Cierra todo
> (`taskkill /F /IM node.exe`), borra `.next` y arranca **uno solo**.

## Variables de entorno (`.env.local`, nunca se sube al repo)

| Variable | Para qué | Dónde se obtiene |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cuentas y cartas | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem (clave pública) | idem |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook de Stripe (solo servidor, secreta) | idem |
| `STRIPE_SECRET_KEY` | Checkout y portal (modo test: `sk_test_…`) | Stripe → Developers → API keys |
| `STRIPE_PRICE_ID` | Precio recurrente de Premium (`price_…`) | Stripe → Products |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook (`whsec_…`) | `stripe listen --forward-to localhost:3000/api/stripe/webhook` |

Los secretos viven solo en variables de entorno del servidor. `.env.example` trae
la plantilla. Sin las claves de Stripe, `/api/stripe/*` responde
`503 not-configured` y el resto de la app sigue funcionando.

## Base de datos (Supabase)

Ejecuta, en orden, en Supabase → SQL Editor:

1. `supabase/migrations/0001_init.sql` — `profiles` y `cards` (con RLS).
2. `supabase/migrations/0002_storage.sql` — bucket `card-images` para imágenes propias.
3. `supabase/migrations/0003_stripe.sql` — columnas de Stripe en `profiles`.

En Authentication → URL Configuration añade `http://localhost:3000/**`.

## Reglas del producto

1. La **página de recepción** de cartas nunca lleva anuncios.
2. Los anuncios laterales existen solo en el flujo con el agente de IA. El editor
   manual no los tiene: solo los bloques desbloqueables.
3. **Premium = la suscripción "Sin anuncios"** (un solo sistema, un solo plan):
   abre todo, quita anuncios y quita la marca de agua.
4. Identidad: crema `#f6f1e4`, tinta `#2a2620`, arcilla `#b4614f`, salvia
   `#6e7f5c`; Fraunces + Inter; CSS Modules, sin Tailwind.
5. Claves y secretos solo en variables de entorno del servidor.

## Qué hay hoy: el editor manual

Lienzo de 480 × 620 px.

- **Tipografías (11)** — gratis: Caveat (por defecto), Patrick Hand, Kalam,
  Special Elite, Courier Prime, Fraunces. Premium: Shadows Into Light, Gaegu,
  Amatic SC, Parisienne, Playfair Display.
- **Fondos (12)** — gratis: Liso, Cuadriculado, Puntos, Renglones, Crucecitas,
  Trama. Premium: Milimetrado, Isométrico, Kraft, Columna, Damero, Confeti.
  Color de fondo (11 sugeridos + selector libre) sobre cualquier patrón.
- **Stickers (29)** — 15 gratis (dibujados por el equipo) y 14 premium (OpenMoji).
- **Controles** — texto, imágenes propias (requiere cuenta), marco con tiradores
  (mover, escalar, rotar), panel de texto (tipografía, tamaño 8–160, colores),
  al frente/atrás, duplicar, eliminar, lista de capas, deshacer/rehacer (~50
  pasos; `Ctrl+Z` / `Ctrl+Y`; `Supr` borra).
- **Guardado** — invitado en el navegador; "Guardar en tu cuenta" con acceso por
  correo sin contraseña → "Mis cartas"; "Descargar PNG" a doble resolución.

### Anuncios por bloque y marca de agua

Dos bloques, desbloqueables **por carta** con un anuncio corto (máx. 2 por carta):

| Bloque | Abre |
|---|---|
| **Contenido** | stickers premium e imágenes propias **sin límite** (gratis: 3 por carta) |
| **Estilo** | tipografías premium y fondos premium |

Con Premium todo queda abierto en todas las cartas. Quien no es Premium ve la
marca de agua "Hecho con Cartario" (abajo a la derecha), que queda en el PNG; antes
de descargar hay un aviso con "Descargar igual", "Ver planes" y "Cancelar".

El anuncio de hoy es un **simulacro** (`lib/ads.js`): el proveedor real se
conecta en un único punto (`showRewardedAd`) en la Fase 5.

## Estado por fases

- **Fase 0 — Renombrado y auditoría**: hecha.
- Fase 1 — Cuentas, datos y suscripción (`profiles`, `cards`, `ad_unlocks`,
  `sent_cards`, `ai_generations`; RLS; migración de invitado; `is_premium`).
- Fase 2 — Embeds y página de recepción `/c/[id]` (sin anuncios).
- Fase 3 — Agente de Cartario (IA, 3 generaciones al día).
- Fase 4 — Biblioteca (creadas, enviadas, recibidas) y envío programado.
- Fase 5 — Monetización real (anuncios recompensados validados en servidor,
  Stripe, anuncios laterales del agente).
- Fase 6 — Compartir en redes, medición y pulido móvil.

Hoy el editor y la base usan el esquema inicial (`cards`, y `profiles.is_subscriber`
en lugar de `is_premium`); la Fase 1 los migra.

## Stack

Next.js 14 (App Router) · React 18 · CSS Modules (sin Tailwind) · react-konva ·
Supabase (Postgres, Auth por magic link, Storage) · Stripe (modo test).

## Créditos y licencias

- `public/stickers/free/`: ilustraciones originales de Cartario.
- `public/stickers/premium/`: OpenMoji, CC BY-SA 4.0 (requiere atribución).
- La atribución visible para el usuario está en la ruta **`/creditos`**, que
  también lista las tipografías (Google Fonts, licencias libres).

## Despliegue

```bash
npx vercel
```

Define en Vercel las mismas variables de entorno.
