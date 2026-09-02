# Papelera — MVP

Tarjetas digitales con textura de papel, tipografías con carácter y stickers.
Modelo freemium: extras se desbloquean viendo un anuncio corto o con
suscripción (el anuncio real aún no está integrado, ver más abajo).

## Qué incluye este MVP

- `app/page.js` — landing page
- `app/editor/page.js` — editor de tarjetas (canvas con Konva)
- `components/CardCanvas.js` — lógica del editor: texto, stickers, arrastrar,
  exportar a PNG
- Flujo de "desbloqueo por anuncio" simulado (ver `handleWatchAd` en
  `app/editor/page.js`)

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Próximos pasos sugeridos (en orden de prioridad)

1. **Integrar Google AdSense (anuncios recompensados)**
   Reemplazar el `setTimeout` en `handleWatchAd` (`app/editor/page.js`) por
   la llamada real al SDK de anuncios recompensados una vez tengas cuenta
   aprobada de AdSense.

2. **Persistencia con Supabase**
   - Crear proyecto en supabase.com (tier gratuito)
   - Guardar el JSON de `elements` (en `CardCanvas.js`) asociado a un
     `card_id` en una tabla `cards`
   - Usar Supabase Storage para las imágenes que suban los usuarios

3. **Subida de imágenes propias**
   Añadir un `<input type="file">` en el toolbar y un nuevo tipo de elemento
   `image` en `CardCanvas.js` usando `use-image` (ya está en las
   dependencias).

4. **Más fuentes y stickers**
   Añadir más `fontFamily` al selector de texto y más variantes de sticker
   (actualmente son círculos de color como placeholder — reemplazar por SVGs
   reales, verificando licencia de cada uno).

5. **Compartir / enviar la tarjeta**
   Generar un link único por tarjeta (`/tarjeta/[id]`) en vez de solo
   exportar a PNG.

## Desplegar gratis

```bash
npx vercel
```

O conecta el repositorio de GitHub directamente desde vercel.com — cada
push a `main` se despliega automáticamente.

## Nota sobre licencias

Los stickers de este MVP son placeholders geométricos (círculos de color).
Antes de lanzar, sustitúyelos por ilustraciones con licencia clara (compradas,
creadas a medida, o de bancos con licencia comercial), ya que este fue uno de
los riesgos identificados en el análisis inicial del producto.
