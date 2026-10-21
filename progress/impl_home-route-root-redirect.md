# Implementación feature 116 — home-route-root-redirect

Petición humana (2026-10-20): «queremos que la pagina principal se renderice en "/home" y que la raiz "/" haga siempre una redireccion a "/about"».
Spec: `specs/116_home-route-root-redirect/requirements.md` (REQ-116-01..22). Análisis: `progress/research/home-route-root-redirect.md`.

## Cambios en src/ (todos <= 100 líneas, sin dependencias nuevas)

| Archivo | Cambio | Líneas |
|---|---|---|
| `src/domain/http/root-redirect.ts` (nuevo) | `rootRedirect(pathname)`: '/' → '/about', cualquier otro → null (REQ-116-04) | 10 |
| `src/middleware.ts` | `legacyRedirect(p) ?? rootRedirect(p)`; la misma rama 301 conserva `url.search` y pasa por `withSecurityHeaders` (REQ-116-05/06) | 19 |
| `src/pages/index.astro` → `src/pages/home.astro` | mismo contenido, `prerender = true` (REQ-116-01/03) | 24 |
| `src/layouts/Layout.astro` | logo `href="/home"`, aria-current si pathname es '/home' o '/home/' (REQ-116-08) | 79 |
| `src/domain/site-footer.ts` | Inicio → '/home' (REQ-116-09) | 41 |
| `src/components/site-footer/site-footer.astro` | logo → '/home' (REQ-116-10) | 66 |
| `src/components/not-found/not-found.astro` | «Volver al inicio» → '/home' (REQ-116-11) | 14 |
| `src/data/about.json` | proyecto «Blog de arquitectura…» (array `content`) → '/home' (REQ-116-12; lo autoriza la petición) | — |
| `src/components/search-results/term-route.ts` | `clearDestination` → '/home' en /<término> (REQ-116-13) | 43 |
| `src/domain/seo/sitemap.ts` | loc `<site>/home/` en lugar de `<site>/` (REQ-116-15); `robotsTxt` igual (REQ-116-16) | 42 |

No hay `redirects` en `astro.config.mjs` ni `public/_redirects` (REQ-116-07). Ya no queda ningún `href="/"`, `href: '/'` ni `"href": "/"` en src/ (REQ-116-14).
No se ha tocado nada de lo AJENO (`public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`). `package.json` está igual.
Nota: el rename queda como ` D src/pages/index.astro` + `?? src/pages/home.astro` sin stage (no hay commit).

## Ciclo rojo / verde

Test nuevo: `tests/home-route-root-redirect.test.mjs` (10 tests, 100 líneas). En rojo, antes de escribir código:

```
✖ REQ-116-01/03: home.astro prerender con la portada completa y sin index.astro
✖ REQ-116-04: rootRedirect solo redirige la raíz a /about
✖ REQ-116-05: el middleware responde 301 de / a /about con query y cabeceras sin llamar a next
✔ REQ-116-06/18: slugs antiguos siguen con su 301 y /home delega en next
✔ REQ-116-07: sin redirects en astro.config.mjs ni public/_redirects
✖ REQ-116-08..12: logo del header y del footer, Inicio, «Volver al inicio» y blog apuntan a /home
✖ REQ-116-14/22: src/ sin href a / exacto y archivos tocados <= 100 líneas
✖ REQ-116-13: clearDestination en /<término> navega a /home
✖ REQ-116-15/16: sitemap con /home/ y sin la raíz; robots sin cambios
✖ REQ-116-02/07/17 (build): dist/client/home/index.html con portada y canonical, sin dist/client/index.html
ℹ pass 2
ℹ fail 8
```
(Los dos que ya pasaban protegen lo que no debe cambiar: la 301 de la 68 y la ausencia de `redirects`/`_redirects`.)

Tests reapuntados, también en rojo antes de implementar (subconjunto rápido sin build):
```
✖ REQ-11-08 · ✖ REQ-31-04 (clearDestination) · ✖ REQ-37-03 · ✖ REQ-42-02 · ✖ REQ-46-03 · ✖ REQ-46-06 · ✖ REQ-80-15/16/17 · ✖ REQ-89-01
ℹ tests 60 · ℹ pass 52 · ℹ fail 8
```

Verde:
- `pnpm test`: **ℹ tests 1200 · ℹ pass 1200 · ℹ fail 0** (había 1190, más los 10 nuevos).
- `./init.sh`: todo ✔ (formato, tests al 100 %, build) → «El entorno está perfecto».

En la primera vuelta a verde fallaron 19 tests que esperaban '/' o tenían límites de líneas o listas de congelados. Están en los grupos C y D de abajo; se ajustaron sin relajarlos.

## Tests reapuntados (43 archivos, todos con la nota «Ajuste feature 116 (precedente REQ-43-06)»)

**A. Leen la portada construida: `dist/client/index.html` → `dist/client/home/index.html`** (o `'index.html'` → `'home/index.html'` en outDir temporal):
geist-font-build, hero-backdrop-size, hero-card-registry, hero-cards-extra-logos, hero-cards-lego-motion, hero-cards-links-new-tab, hero-cards-links-xlink, hero-cards-links, hero-cards-mobile-visibility, hero-rich-card-logos, home-heading-hierarchy, home-latest-articles-five, home-latest-articles-limit, htb-hero-card, latest-articles-horizontal-scroll, latest-cards-gsap-motion, link-image-accessible-names, not-found-page, search-index-lazy-load, seo-head-base, site-domain-moisesbaldenegro, social-meta-tags, theme-color-dark. Hay dos que el análisis no listaba y que también leían la portada: **layout-main-skip-link** y **manifest-generator-cleanup**.
REQ-47-06 conserva `size < 42000` sobre `dist/client/home/index.html`. En los tests de 100 líneas justas (lego-motion, links, rich-card-logos, gsap-motion) la nota va al final de la línea cambiada para no pasar de 100.

**B. Leen el fuente: `src/pages/index.astro` → `src/pages/home.astro`**:
article-iframe-styles, htb-hero-card, latest-articles-horizontal-scroll (además, el filtro «otras páginas sin latest-horizontal» excluye `home.astro` en lugar de `index.astro`), posts-unified-collection, root-term-search, search-index-endpoint, search-index-lazy-load, search-landing-live-transition, seo-head-base.

**C. Esperaban '/' → '/home'**:
- clearDestination: root-term-search (REQ-07-10 y REQ-31-04) y search-clear-button-fix.
- Inicio del footer: site-footer (REQ-89-01).
- Proyecto del blog: about-data-repository (REQ-80-15..17) y about-projects-credentials (REQ-84-07..09; no estaba en el análisis).
- aria-current: visual-polish-refactor (REQ-37-03).
- Sitemap: sitemap-robots-endpoints (REQ-42-02).
- «Volver al inicio»: not-found-page (REQ-34-01; no estaba en el análisis).
- Ancla del logo en el navbar (no estaban en el análisis): architecture-nav-link (REQ-08-04), layout-refactor (REQ-08-05), navbar-logo-home (REQ-15-01/02), remove-navbar-logo (REQ-13-01/02), restore-navbar-home-link (REQ-12-01/02/04) y system-design-nav-link (REQ-93-01/05). Su regex de aria-current pasa a exigir `=== '/home' || === '/home/' ? 'page' : undefined`, y el conteo «un único marcador de portada» compara con '/home'. Son igual de estrictas que antes. Las negativas «sin enlace de texto Home» comparan ahora con `href="/home"`.
- legacy-redirects (`fn('/')` → null) se queda como estaba, porque legacyRedirect no cambia.

**D. Listas de congelados o de exclusión** (precedente de las features 112/113):
- hero-cards-links-xlink (REQ-107-26/27/36) y hero-cards-links-new-tab (REQ-110-10/12): `site-footer.astro` sale de la lista de `git diff` congelados, porque REQ-116-10 obliga a cambiar su logo. about-hero y about-projects siguen congelados.
- ascii-post-slugs (REQ-45-05): el test nuevo se añade a la exclusión junto a legacy-redirects, porque cita `/posts/03-principios solid` (acceptance REQ-116-04/06).

## Mediciones

- **Peso de la portada**: base HEAD `dist/client/index.html` 40 665 B → ahora `dist/client/home/index.html` **40 682 B** (+17 B por los href y las URL /home/). El umbral es 42 000 B y quedan 1 318 B de margen.
- **HTML base vs nuevo** (normalizando hashes de chunks e ids de scope de Astro): las únicas diferencias son canonical y og:url (`/` → `/home/`), el nombre del chunk CSS (`index.C6tRP1mo.css` → `home.C6tRP1mo.css`, mismo hash y mismo contenido), el token cifrado de la server island HTB (cambia en cada build), el href del logo, el logo del footer e Inicio. Ningún cambio de estructura.
- `dist/client/index.html` no existe tras el build y `dist/client/_redirects` tampoco se genera.

## Verificación build + preview + Chrome headless (CDP)

Mecanismo: `astro preview` del adapter de Cloudflare levanta workerd/wrangler («Using secrets defined in dist\server\.dev.vars», «Parsed 3 valid header rules»), así que ejecuta el Worker y su middleware como en producción y no hizo falta un `wrangler dev` aparte.

Línea base: build de HEAD (23f264d) en un `git worktree` temporal con `pnpm install --offline`, servido con `astro preview --port 4801`.
- Aviso: la primera vez construí ese worktree dentro del scratchpad (`%TEMP%\claude\…`) y el HTML salió sin los `<link rel="stylesheet">` (36 439 B), así que esa base no valía.
- Movido a `C:\Users\Moises\b116`, el build salió normal (40 665 B). Ya está borrado y el `git worktree prune` hecho.

Build nuevo: `astro preview --port 4802`. Los dos preview y los Chrome headless están parados. El `pnpm dev` de :4321 no se ha tocado.

Evidencias en `progress/research/routes116/`: `http116.txt`, `cdp-base.json`, `cdp-new.json`, `pixel-diff.txt`, `base-1280.png`, `new-1280.png`, `base-375.png`, `new-375.png`, `new-search-live.png`. Script CDP (en el scratchpad, sin dependencias): Node 24 con WebSocket nativo, `Math.random` sembrado y `prefers-reduced-motion: reduce` para quitar la variación de las animaciones.

**HTTP sin seguir redirecciones** (curl, `http116.txt`):
- `GET /` → **301**, `location: /about`, con CSP, X-Frame-Options DENY, nosniff, Referrer-Policy y Permissions-Policy.
- `GET /?x=1` → 301 `location: /about?x=1`; `GET /?x=1&y=%C3%B1` → 301 `location: /about?x=1&y=%C3%B1`; `HEAD /` → 301 `location: /about`.
- `GET /home` → 307 a `/home/`, la normalización de barra final de Cloudflare assets, igual que `/about` → `/about/`. `GET /home/` → 200 con 40 682 B, la portada estática y no `[...term]`.
- `GET /posts/03-principios%20solid` → 301 a `/posts/03-principios-solid` (la 68 sigue igual).
- `/sitemap.xml` → 200 con `<loc>https://moisesbaldenegro.com/home/</loc>` y `/about/`, sin la raíz. `/robots.txt` → `User-agent: * / Allow: / / Sitemap: https://moisesbaldenegro.com/sitemap.xml`.

**Portada en /home** (`cdp-new.json`, `dom`): 15 cards del hero, 3 últimos artículos, footer presente, sin vista de búsqueda (`[data-search-guide]` no existe). Canonical `https://moisesbaldenegro.com/home/`, sin meta robots, logo `href=/home` con `aria-current="page"`.

**Capturas antes/después** (página completa, `pixel-diff.txt`):
- 1280 px: 1280x4532 en las dos, **0 píxeles distintos**.
- 375 px: 375x3813, 2 píxeles distintos (0,0001 %, filas 331-373, ruido de antialiasing).
- Conclusión: la portada se ve igual que antes.

**Navegación con ClientRouter** (marcador `window.__m116` y conteo de `Page.loadEventFired`):

| Paso | URL final | Marcador | Recarga completa | aria-current del logo |
|---|---|---|---|---|
| /home → About (navbar) | /about/ | sí | no | — |
| /about → logo | /home/ | sí | no | page |
| /home → post (últimos artículos) | /posts/00-systems-design-template/ | sí | no | — |
| post → logo | /home/ | sí | no | page |
| enlace inyectado a `/?x=1` (sigue la 301) | /about/?x=1 | sí | no | — |
| /about → Inicio del footer | /home/ | sí | no | page |

En el navegador, `/` termina en `/about/` y `/?x=1` en `/about/?x=1`.

**Búsqueda**:
- En /home, escribir «solid» abre el panel en vivo con 2 resultados y oculta la landing (`new-search-live.png`).
- La × lo cierra, vuelve la landing y el input queda vacío.
- En `/zzqx116` (término sin resultados) sale el estado vacío, y «Limpiar búsqueda» navega a **/home/** (clearDestination).
- En la 404, los enlaces son `/home` y `/search`.

**Consola**: 0 errores. La única entrada de error en todo el recorrido es el 404 de red de `/posts/no-existe-116`, que se pidió adrede para comprobar la página 404.

## Valores por defecto revisables (de la spec, no bloquean)

- Código 301 (alternativa 302 si el humano quiere reutilizar la raíz; los navegadores cachean la 301).
- Query conservada.
- Logo, Inicio, «Volver al inicio», blog y limpiar búsqueda → /home.
- Sitemap con /home/ y robots sin cambios.

## Observaciones

- `docs/architecture.md:20` pone como ejemplo genérico «`index.astro` → `/`». Es una convención de Astro y sigue siendo cierta, así que no la he tocado (fuera de scope).
- El análisis no listaba algunos tests que también había que reapuntar: layout-main-skip-link, manifest-generator-cleanup, about-projects-credentials, not-found-page REQ-34-01, los seis del ancla del logo y los tres de congelados/exclusión. Todos llevan la nota.
