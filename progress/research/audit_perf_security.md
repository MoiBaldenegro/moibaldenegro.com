# Auditoría de rendimiento y seguridad — moibaldenegro.com

Fecha: 2026-10-08. Alcance: producción + código/build. Solo lectura (no se editó código).

## 0. Contexto verificado en el repo

- Versiones instaladas: `astro 7.2.0`, `@astrojs/cloudflare 14.2.1`, `wrangler 4.121.0` (node_modules/*/package.json).
- `astro.config.mjs`: `output: 'server'`, adapter Cloudflare con `imageService: 'cloudflare'`; las páginas
  `index`, `about`, `search`, `posts/[id]` son `prerender = true`; `[...term].astro` y la server island
  `HtbStadistics` (`server:defer`) se renderizan bajo demanda en el Worker.
- `wrangler.jsonc`: Worker `moibaldenegro-web`, assets desde `./dist`. Sin rutas/dominio declarados.
- `dist/` ya existía (build de 2026-10-08 12:39); se auditó ese build, no se re-ejecutó `pnpm build`.

## 1. Producción: NO auditable

`moibaldenegro.com` y `www.moibaldenegro.com` devuelven **NXDOMAIN** (DNS de Cloudflare 1.1.1.1 y DoH:
`Status: 3`, autoridad `a.gtld-servers.net`, es decir el dominio no está delegado en `.com`). Tampoco
resuelve `moibaldenegro-web.workers.dev` (el subdominio real de workers.dev incluye el nombre de la cuenta y
no está en el repo). Por tanto **no se pudieron medir** cabeceras reales, HSTS, redirecciones HTTP→HTTPS,
compresión ni TTFB. Todo lo de abajo sale del código y de `dist/`, más la documentación oficial de qué
añade (y qué no) Cloudflare por defecto.

Pendiente: repetir las comprobaciones con `curl -I` cuando el dominio esté registrado/apuntado (o
indicar la URL `*.workers.dev` real).

## 2. Hallazgos priorizados

### ALTA

**A1. Dependencias con vulnerabilidades conocidas (1 crítica, 13 altas).** `pnpm audit` (pnpm 10.8.0):
29 avisos — 1 critical, 13 high, 11 moderate, 4 low.
- CRITICAL `astro <7.2.8` — RCE vía optimización de AVIF (libheif en Sharp), GHSA-26w7-cxv4-gfx2,
  CVSS 9.8; parche 7.2.8 (https://github.com/advisories/GHSA-26w7-cxv4-gfx2). Exposición real baja aquí
  (servicio de imágenes `cloudflare`, sin `astro:assets`, sin AVIF), pero la versión está afectada.
- MODERATE `astro <=7.2.3` — bypass de autorización por límite de segmento de ruta, GHSA-376h-93r7-7g6f
  (no hay rutas protegidas, impacto práctico nulo hoy).
- HIGH vía `astro`: `devalue <=5.9.2` (3 avisos), `svgo <4.1.0`, `http-cache-semantics <=4.2.0`
  (sin versión parcheada).
- HIGH vía `@astrojs/cloudflare` (herramientas de build/dev: miniflare/vite): `undici <7.29.1` (incl.
  bypass de validación TLS GHSA-w293-vg96-wgc3), `sharp <0.35.5`, `js-yaml <4.3.2`, `source-map-js <1.2.2`.
  Afectan sobre todo a la máquina de build/dev, no al Worker desplegado.
- Recomendación: subir `astro` a `>=7.2.8` (resuelve la crítica y arrastra devalue/svgo) y actualizar
  `@astrojs/cloudflare`/`wrangler` a la última menor; volver a pasar `pnpm audit`. Por regla del proyecto,
  cambiar dependencias se discute primero (estado `blocked`/feature propia).

**A2. Sin cabeceras de seguridad.** No hay `src/middleware.*` (ls: no existe) y
`dist/client/_headers` (generado) solo contiene:
```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```
No se emite `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` ni `frame-ancestors`/`X-Frame-Options` (grep de `headers.set|Astro.response|Cache-Control`
en `src/`: sin resultados). Cloudflare solo añade por defecto Content-Type, Cache-Control, ETag y
CF-Cache-Status a los assets (https://developers.cloudflare.com/workers/static-assets/headers/).
- Recomendación (dos capas, porque `_headers` **no se aplica a respuestas generadas por el Worker**, misma
  fuente):
  1. `public/_headers` con `/*` → `X-Content-Type-Options: nosniff`, `Referrer-Policy:
     strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
     `Content-Security-Policy: frame-ancestors 'none'; ...` (cubre las páginas prerenderizadas, que se sirven
     como assets). Mantener la regla `/_astro/*` que ya genera el adapter.
  2. `src/middleware.ts` que ponga las mismas cabeceras en respuestas SSR (`[...term]`, `/_server-islands/*`, 404).
- CSP: el `security.csp` nativo de Astro (desde 6.0) **no es usable** aquí: no soporta `<ClientRouter />`
  ni Shiki, y solo se entrega como `<meta>` (https://docs.astro.build/en/reference/configuration-reference/).
  El sitio usa ambos (`src/layouts/Layout.astro:4,31`; bloques `pre.astro-code`). Proponer CSP por cabecera
  de forma gradual: empezar en `Content-Security-Policy-Report-Only` con
  `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';
  frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`
  (`unsafe-inline` necesario por scripts inline de server islands/code-copy y estilos inline de Shiki).

**A3. HSTS y redirección a HTTPS no verificables / no configurados en el repo.** Nada en el repo los fija;
dependen de la zona de Cloudflare. Recomendación: al conectar el dominio, activar "Always Use HTTPS" y
HSTS en Edge Certificates (max-age ≥ 6–12 meses; `includeSubDomains`/preload solo si todos los subdominios
sirven HTTPS) (https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/).
Alternativa en código: `Strict-Transport-Security` en `_headers` + middleware.

### MEDIA

**M1. Portada pesada por el índice de búsqueda embebido.** `dist/client/index.html` = 72 477 B
(18 804 B gzip), de los cuales **39 042 B son el JSON `#search-index`** con los cuerpos markdown completos
(`src/pages/index.astro:20-23,34`). Igual en `/search` (49 355 B) y en cada respuesta SSR de `[...term]`
(`src/pages/[...term].astro:15-22`, que además re-construye el índice en cada petición). Los artículos pesan
15–25 KB. Recomendación: mover el índice a un asset estático cacheable (p. ej. un endpoint prerenderizado
`/search-index.json` con hash o caché larga) y cargarlo bajo demanda al enfocar la búsqueda; o indexar solo
título/descripción/tags en la portada.

**M2. Logo sobredimensionado.** `public/assets/mxvi_logo.webp` es **2048×716 px / 55 758 B** y se muestra a
`width="72"` en cada página (`src/layouts/Layout.astro:37`). Sin `height` (CLS menor). Recomendación:
exportar una versión ~144×50 px (2x) (< 3 KB) y añadir `width`/`height`.

**M3. Imagen LCP del hero sin optimizar.** `public/assets/moises-hero.jpg` 952×960, **JPEG progresivo
152 KB**, sin `width`/`height`, sin `fetchpriority`, sin `srcset` (`src/components/new-hero/new-hero.astro:26-30`).
Las portadas de artículo (`/assets/content/*.webp`, 1376×768, 66–144 KB) se sirven igual en miniaturas de
112 px (`src/pages/posts/[id].astro:66`, `post-next.css:13`) y en la imagen del hero del post sin
dimensiones ni `fetchpriority` (`[id].astro:46`). Recomendación: convertir el hero a WebP/AVIF (~40–60 KB),
añadir `width`/`height` + `fetchpriority="high"` a la imagen LCP de cada página, y generar variantes de
miniatura (p. ej. 320 px). Con `imageService: 'cloudflare'` se podría usar `<Image>` de `astro:assets`
para obtener `srcset`/dimensiones automáticos (requiere Cloudflare Images/transformaciones activas en la
zona; no verificado).

**M4. Caché de imágenes y HTML.** Solo `/_astro/*` tiene caché inmutable. `/assets/*` (imágenes, sprite SVG
19 KB) quedan con el default de Cloudflare `public, max-age=0, must-revalidate`
(https://developers.cloudflare.com/workers/static-assets/headers/) → revalidación en cada vista.
Recomendación: en `public/_headers`, `/assets/*` → `Cache-Control: public, max-age=604800` (o renombrar con
hash y usar `immutable`). HTML puede quedarse con revalidación.

**M5. Server island HTB sin caché.** `src/components/htb-stadistics.astro:10` llama a la API de HTB
(`htb-profile-repository.ts:44`) en **cada** visita a la portada (el HTML precarga
`/_server-islands/HtbStadistics?...` con `rel=preload`). Más latencia, coste de Worker y riesgo de rate-limit.
Las islas se piden por GET y son cacheables con `Cache-Control` (https://docs.astro.build/en/guides/server-islands/).
Recomendación: `Astro.response.headers.set('Cache-Control', 'public, max-age=3600')` en la isla o caché
del `fetch` (opciones `cf` de Cloudflare); no verificado en esta sesión el API exacto de `cf.cacheTtl`.

**M6. Iframe de YouTube sin endurecer.** `src/content/posts/architecture/02-principios.md:40-45`:
`src="https://www.youtube.com/embed/..."`, sin `loading="lazy"`, sin `referrerpolicy`, `allow` incluye
`autoplay; clipboard-write; ...`. Recomendación: usar `https://www.youtube-nocookie.com/embed/...`
(modo de privacidad mejorada, https://support.google.com/youtube/answer/171780), `loading="lazy"`
(https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe),
`referrerpolicy="strict-origin-when-cross-origin"`, y quitar `autoplay` del `allow`. `sandbox` es opcional
(YouTube necesita `allow-scripts allow-same-origin allow-presentation`; al ser cross-origin la advertencia de
MDN sobre esa combinación no aplica, misma fuente). El contenedor ya fija `aspect-ratio: 16/9`
(`src/styles/article.css:8`) → sin CLS.

### BAJA

**B1. Recursos 404 / duplicados en `<head>`.** `src/layouts/Layout.astro:20,28` enlaza `/favicon.svg`
(dos veces) pero no existe en `public/`; además `favicon.ico` se declara dos veces (líneas 21 y 29). Como
`[...term].astro` es catch-all SSR, `/favicon.svg` probablemente cae en el Worker y devuelve HTML 200
(petición desperdiciada + invocación del Worker). Recomendación: añadir el SVG o quitar las líneas.

**B2. JS de runtime.** Total en `_astro/*.js`: ~23.7 KB (≈10.6 KB gzip); el grueso es ClientRouter
(`client.BssYJ-wI.js` 12.1 KB + 4.1 KB). Razonable; si se quiere cero JS, sustituir `<ClientRouter />` por
view transitions nativas CSS (`@view-transition`), lo que además habilitaría el CSP nativo de Astro
(ver A2). Artículos: 1 381 B de script inline (code-copy).

**B3. CSS.** 3 hojas por ruta (7.3 / 6.7 / 9.1 KB, ~2 KB gzip c/u), una por página — bloqueantes pero
pequeñas; no compensa extraer CSS crítico. `animation: float 10s infinite` en un elemento de 900×900 px
(`src/styles/hero-section.css:25-29`) y `backdrop-filter: blur(18px)` en el navbar sticky
(`src/styles/layout.css:22`) cuestan GPU; no hay `prefers-reduced-motion` en `src/styles/`. Recomendación:
envolver la animación en `@media (prefers-reduced-motion: no-preference)`.

**B4. Fuentes.** `--font-sans: Inter, ui-sans-serif, system-ui, sans-serif` (`src/styles/tokens.css:91`)
pero no se carga ninguna webfont (sin `@font-face`/Google Fonts). Cero coste de red; preload/`font-display`
no aplican. Solo se verá Inter si el usuario la tiene instalada (inconsistencia visual, no de rendimiento).

**B5. Enlaces externos.** Único enlace externo: `https://x.com/moibaldenegro` (`Layout.astro:39`), sin
`target="_blank"`, por lo que no hay riesgo de tabnabbing; además `target="_blank"` ya implica `noopener`
(https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noopener). OK.

**B6. Compresión.** No medible sin producción. Cloudflare comprime en el edge, no verificado aquí.
Tamaños gzip de referencia arriba.

**B7. Slugs con espacio y no-ASCII.** `dist/client/posts/03-principios solid/` y `01-diseño-detallado/`
generan URLs con `%20`/`%C3%B1`. No es seguridad; frágil para enlaces compartidos. Recomendación: slugs ASCII
con guiones.

## 3. Puntos verificados sin problema

- Secretos: `.env` y `.dev.vars` en `.gitignore` / `.assetsignore`; ningún `.env` versionado (`git ls-files`);
  `grep 'HTB_API_TOKEN|Bearer' dist/client` sin resultados. El token HTB solo vive en el servidor
  (`astro:env/server`).
- XSS en búsqueda: `item-html.ts:25-27` escapa `& < > "` y los atributos van entre comillas dobles; el JSON
  embebido escapa `</script` (`index.astro:20-23`). OK.
- `security.checkOrigin` por defecto `true` (CSRF en rutas SSR) según la referencia de configuración.

## 4. Pendientes (fuera de alcance de esta sesión)

- Re-auditar cabeceras/HSTS/redirecciones/compresión en producción cuando el dominio resuelva.
- Confirmar si la zona tiene Cloudflare Images/transformaciones activas para `imageService: 'cloudflare'`.
- Lighthouse/Core Web Vitals reales.

## Fuentes

- https://github.com/advisories/GHSA-26w7-cxv4-gfx2
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://docs.astro.build/en/reference/configuration-reference/ (security.csp, security.checkOrigin)
- https://docs.astro.build/en/guides/server-islands/
- https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/
- https://support.google.com/youtube/answer/171780
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noopener
