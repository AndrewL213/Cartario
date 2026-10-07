# Cartario

Cartas digitales con estética física y manuscrita (textura de papel, tipografías
con carácter, stickers e imágenes propias), pensadas para enviarse a alguien
querido. Producto freemium para Latinoamérica hispanohablante (lanzamiento en
Colombia). Toda la interfaz va en español.

> Antes se llamaba "Papelera"; ese nombre se abandonó por completo.

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev
```

Abre http://localhost:3000. Sin variables de entorno el editor funciona en **modo
invitado** (la carta se guarda en el navegador).

> Si el servidor "no carga" (CSS/JS con 404): casi siempre hay más de un
> `npm run dev` abierto o la carpeta `.next` quedó corrupta. Cierra todo
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

`.env.example` trae la plantilla. Sin las claves de Stripe, `/api/stripe/*`
responde `503 not-configured` y el resto de la app sigue funcionando.

## Base de datos (Supabase)

Ejecuta, en orden, en Supabase → SQL Editor:

1. `supabase/migrations/0001_init.sql` — `profiles` y `cards` (con RLS).
2. `supabase/migrations/0002_storage.sql` — bucket `card-images` para imágenes propias.
3. `supabase/migrations/0003_stripe.sql` — columnas de Stripe en `profiles`.

Y en Authentication → URL Configuration añade `http://localhost:3000/**`.

## Modelo de acceso (resumen)

Un solo sistema: **Premium = la suscripción "Sin anuncios"**. Las reglas viven
en `lib/access.js` (cliente y servidor usan el mismo módulo):

- Editor manual: **sin anuncios**. Los elementos marcados 🔒 (stickers,
  tipografías y fondos Premium) solo se abren con Premium.
- Página de recepción de cartas: **nunca** lleva anuncios.
- Flujo con el agente de IA: anuncios laterales (no Premium) y máximo 3 cartas
  generadas al día por usuario.
- Decoración de embeds: gratis = stickers, imágenes y cambio de sellos/logos;
  solo Premium = sobre, diseño, textura y texto.

## Estado por fases

- **Fase 0 — Limpieza y renombre**: hecha (este commit).
- Fase 1 — Cuentas y persistencia (esquema `letters`, `deliveries`, `ai_usage`).
- Fase 2 — Editor manual completo.
- Fase 3 — Embeds y página de recepción `/c/[id]`.
- Fase 4 — Agente de Cartario (IA) y anuncios.
- Fase 5 — Biblioteca, envío y programación.
- Fase 6 — Premium e integraciones.
- Fase 7 — Pulido y medición.

Hoy el editor y la base siguen con el esquema anterior (`cards`, columna
`profiles.is_subscriber`); la Fase 1 los migra a `letters` / `is_premium`.

## Stack

Next.js 14 (App Router) · React 18 · CSS Modules (sin Tailwind) · react-konva ·
Supabase (Postgres, Auth por magic link, Storage) · Stripe (modo test).
Identidad: crema `#f6f1e4`, tinta `#2a2620`, arcilla `#b4614f`, salvia `#6e7f5c`;
Fraunces + Inter.

## Licencias de los stickers

- `public/stickers/free/`: ilustraciones originales de Cartario.
- `public/stickers/premium/`: OpenMoji, CC BY-SA 4.0 (requiere atribución; ver
  `public/stickers/premium/CREDITS.md`). Pendiente de revisión de licencias en
  la Fase 2 antes de lanzar.

## Despliegue

```bash
npx vercel
```

Define en Vercel las mismas variables de entorno.
