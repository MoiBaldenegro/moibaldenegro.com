# Análisis feature 116 — home-route-root-redirect

Petición humana (2026-10-20): «la página principal se renderice en "/home" y que la raíz "/" haga siempre una redirección a "/about"».

## Estado actual
- `src/pages/index.astro` (prerender true) es la portada; build → `dist/client/index.html`.
- `output: 'server'` + `@astrojs/cloudflare`; `wrangler.jsonc` con binding ASSETS; sin `public/_redirects`.
- `src/middleware.ts` ya emite 301 de slugs antiguos (`legacyRedirect`, feature 68) con `withSecurityHeaders`.
- `[...term].astro` (prerender false) captura cualquier ruta no estática, incluida `/` si no hay index.
- Enlaces a "/": `Layout.astro:61` (logo + aria-current), `site-footer.astro:20` (logo), `domain/site-footer.ts:21` (Inicio), `not-found.astro:10` («Volver al inicio»), `data/about.json:78` (proyecto blog), `term-route.ts:21` (`clearDestination` → '/', usado en `search-results-controller.ts:90`). No hay breadcrumbs ni «Volver» en posts.
- SEO: `sitemap.ts` emite `${origin}/` y `/about/`; robots `Allow: /`; canonical = `new URL(pathname, site)` (formato directorio → `/home/`).

## Mecanismo elegido: middleware, 301
- Función pura `rootRedirect(pathname)` en `src/domain/http/root-redirect.ts` ('/' → '/about'), invocada en `src/middleware.ts` junto a `legacyRedirect`; conserva `url.search`; cabeceras de seguridad.
- Al borrar `index.astro` deja de existir `dist/client/index.html`: Cloudflare no tiene asset para `/` y la petición llega al Worker → middleware (igual en dev y preview).
- Descartados: `redirects` de astro.config (feature 68: generaba `_redirects` inválido; en rutas prerender produce HTML meta-refresh con 200); `public/_redirects` (fuera del Worker, no testeable por import, segunda fuente de verdad); `Astro.redirect` en index.astro (lógica en frontmatter, prohibida por arquitectura, y obliga a prerender false).
- Código **301** (revisable): «siempre» = permanente, consolida SEO, coherente con las 301 de la 68. Alternativa 302 si el humano prevé reutilizar la raíz (los navegadores cachean la 301).

## Valores por defecto (revisables, no bloquean)
- Logo del header y del footer, «Inicio», «Volver al inicio», proyecto del blog y «limpiar búsqueda» → `/home` (es la portada; /about ya tiene su enlace en la nav). aria-current del logo en `/home` y `/home/`.
- Sitemap: `/home/` sustituye a `/`; robots sin cambios; la raíz no se indexa (solo responde 301).
- Query preservada en la 301 (`/?x=1` → `/about?x=1`).
- Archivo de página: `src/pages/home.astro`.

## ClientRouter, 104 y 102
- Los enlaces internos directos a /home evitan el salto; si el router sigue una 301 a /about (fetch con `redirected`) actualiza la URL; verificar por CDP.
- 104 (CLS/scroll restoration): `latest-horizontal-reserve.css` y `.home__landing` no dependen de la ruta; la página se mueve intacta. 102/30 (latest posts): `home-latest-articles-*` leen el HTML de la portada → repuntar.
- `/home` era antes un término de búsqueda; ahora la ruta estática gana sobre `[...term]`.

## Tests a ajustar (nota «Ajuste feature 116 (precedente REQ-43-06)»)
- Leen `dist/client/index.html`: geist-font-build (PAGES '/'), hero-backdrop-size, hero-card-registry, hero-cards-extra-logos, hero-cards-lego-motion, hero-cards-links-new-tab, hero-cards-links-xlink, hero-cards-links, hero-cards-mobile-visibility, hero-rich-card-logos, home-heading-hierarchy, home-latest-articles-five, home-latest-articles-limit, htb-hero-card, latest-articles-horizontal-scroll, latest-cards-gsap-motion, link-image-accessible-names, not-found-page (l.83), search-index-lazy-load (REQ-47-06, umbral 42 000 B intacto), seo-head-base, site-domain-moisesbaldenegro, social-meta-tags, theme-color-dark.
- Leen `src/pages/index.astro`: article-iframe-styles, htb-hero-card, latest-articles-horizontal-scroll, posts-unified-collection, root-term-search, search-index-endpoint, search-index-lazy-load, search-landing-live-transition, seo-head-base.
- Esperan '/': root-term-search y search-clear-button-fix (clearDestination), site-footer (hrefs nav), about-data-repository (href blog), visual-polish-refactor (REQ-37-03), sitemap-robots-endpoints (REQ-42-02). legacy-redirects (fn('/') null) se mantiene.

## Riesgos
- Volumen (~35 tests, cambios mecánicos); un test que siga leyendo un `dist/client/index.html` obsoleto pasaría en falso → REQ-116-02 exige que no exista tras el build.
- Caché de la 301 en navegadores si luego se revierte.
- Sin cambio visual: no se crea design.md.

Verificación: build + preview, `curl -sI /` (301, Location /about), /home completa, CDP de navegación con ClientRouter, capturas en `progress/research/routes116/`.
