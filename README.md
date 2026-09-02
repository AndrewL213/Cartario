# Papelera — MVP

Tarjetas digitales con textura de papel, tipografías con carácter y stickers.
Modelo freemium: extras se desbloquean viendo un anuncio corto o con
suscripción (el anuncio real aún no está integrado, ver más abajo).

## Qué incluye este MVP

- `app/page.js` — landing page
- `app/editor/page.js` + `components/Editor.js` — editor de tarjetas
  (canvas con Konva en `components/CardCanvas.js`), con modo invitado y
  "guardar en tu cuenta"
- `app/entrar` — inicio de sesión por magic link (sin contraseña)
- `app/mis-tarjetas` — listado de tarjetas guardadas del usuario
- `lib/supabase/*` — clientes de Supabase (navegador, servidor, middleware)
- `lib/localCard.js` — borrador de invitado en localStorage
- `supabase/migrations/0001_init.sql` — esquema (`profiles`, `cards`)
- Flujo de "desbloqueo por anuncio" simulado (ver `handleWatchAd` en
  `components/Editor.js`)

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

Sin configurar Supabase, el editor funciona en **modo invitado** (la
tarjeta se guarda en el navegador). Para activar cuentas y guardado en la
nube, configura Supabase (siguiente sección).

## Configurar Supabase

1. Crea un proyecto gratis en https://supabase.com.
2. En **Project Settings → API**, copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Pega esos valores en `.env.local` (usa `.env.local.example` de
   plantilla). Reinicia `npm run dev`.
4. En **SQL Editor → New query**, pega y ejecuta el contenido de
   `supabase/migrations/0001_init.sql`.
5. En **Authentication → URL Configuration**, añade
   `http://localhost:3000/**` a *Redirect URLs* (y la URL de producción
   cuando despliegues).

El envío de emails integrado de Supabase está limitado a unos pocos por
hora; suficiente para desarrollo. Para producción, configura SMTP propio
en **Authentication → Emails**.

## Próximos pasos (en orden de prioridad)

1. **Editor completo** — subir imágenes propias (Supabase Storage),
   selector de fuentes, capas, redimensionar/rotar (Konva Transformer),
   deshacer/rehacer, set de stickers SVG con licencia.
2. **Monetización real** — SDK de anuncios recompensados de Google en el
   modal (`components/Editor.js`), página `/precios` con Stripe Checkout
   (modo test), estado premium en `profiles.is_subscriber`.
3. **Compartir y recibir** — ruta pública `/tarjeta/[id]` en solo lectura
   con animación de apertura, botón "Enviar" (link + WhatsApp/email),
   exportar a PNG.
4. **Pulido y medición** — Google Analytics (eventos), usabilidad móvil,
   accesibilidad, plantillas de temporada.

## Desplegar gratis

```bash
npx vercel
```

Define las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) en el panel de Vercel.

## Nota sobre licencias

Los stickers de este MVP son placeholders geométricos (círculos de color).
Antes de lanzar, sustitúyelos por ilustraciones con licencia clara
(compradas, creadas a medida, o de bancos con licencia comercial).
