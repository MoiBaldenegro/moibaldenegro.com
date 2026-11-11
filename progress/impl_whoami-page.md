# Implementación — feature 14 `whoami-page`

Petición humana (2026-11-11): la página About pasa a llamarse `whoami`, como el comando.
Spec: `specs/14_whoami-page/requirements.md` (REQ-14-01..12) y `design.md`.

## 1. Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `tests/whoami-page.test.mjs` | Nuevo, escrito antes del código: 6 tests para REQ-14-01..12 |
| `src/pages/about.astro` → `src/pages/whoami.astro` | Movida; título «whoami — moisesbaldenegro.com» |
| `src/layouts/Layout.astro` | Enlace del header `whoami` → `/whoami` con aria-current |
| `src/domain/site-footer.ts` | Enlace del footer `whoami` → `/whoami` |
| `src/domain/http/legacy-redirects.ts`, `root-redirect.ts`, `src/middleware.ts` | `/about` y `/` responden 301 a `/whoami` |
| `src/domain/seo/sitemap.ts`, `json-ld.ts` | `/whoami/` en el sitemap y como URL del autor |
| `src/data/promo-tiles.json`, `tests/promo-tiles-section.test.mjs` | Enlaces internos a `/whoami` |
| `tests/mxvi-about.test.mjs` | Ruta de la página actualizada |
| Comentarios en `head.ts`, `cv.pdf.ts`, `term-route.ts`, `search-results-controller.ts` | Ruta nueva |

## 2. Rojo y verde

`node --test tests/whoami-page.test.mjs` antes del código: 6 fallos. Después: `./init.sh` en verde
(118/118, build OK).

## 3. Verificación en el preview de Cloudflare (`astro preview`)

`/`, `/about` y `/about/` → 301 a `/whoami` (conserva la query); `/whoami/` → 200 con el
título nuevo, el enlace `whoami` activo en el header y el enlace del footer.
