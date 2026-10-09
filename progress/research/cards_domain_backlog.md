# Análisis — Imágenes de cards deformadas, dominio real y guarda de normalizeText (features 65-67)

Fecha: 2026-10-09. Autor: spec_author. Origen: petición del líder (regresión de la feature 48,
dominio confirmado por el humano y cambio manual en normalize.ts).

Orden: bugs primero. 65 (visible en todas las páginas con cards) → 66 (SEO apunta a un dominio
inexistente) → 67 (cobertura de test). Sin `depends_on`: archivos disjuntos.

| id | name | tipo | archivos previstos | design.md |
|----|------|------|--------------------|-----------|
| 65 | card-image-height-auto | bug (regresión 48) | post.css o post-header.css, latest-articles.css, post-next.css, search-results.css, tests/image-loading-hints.test.mjs, tests/home-latest-articles-limit.test.mjs (conteo) | sí |
| 66 | site-domain-moisesbaldenegro | bug | astro.config.mjs, head.ts, about.astro, Layout.astro, site.webmanifest, htb-profile-repository.ts, README.md + tests que fijan el dominio | sí (solo texto visible) |
| 67 | normalize-text-empty-guard-test | cobertura | tests/ (test nuevo) | no |

## 65 — Imágenes de cards con 768 px de alto

Qué es: la feature 48 añadió `width="1376" height="768"` a las portadas y miniaturas para el CLS.
El CSS fija `width` y `aspect-ratio` pero no `height`, así que el atributo de presentación
`height: 768px` gana y `aspect-ratio` se ignora (aspect-ratio solo actúa si una dimensión es auto).

Imágenes afectadas (medidas del líder en Chrome headless, 1280 px):

| Archivo `<img>` | Regla CSS | Medida | Esperado |
|---|---|---|---|
| src/components/latest-articles.astro:18-23 | .latest-articles__image (latest-articles.css:60-68) | 1149×768 | 16/9 |
| src/pages/posts/[id].astro:50 | .post__image (post.css:33-41) + .post__hero .post__image (post-header.css:48, :96) | 554×768 | 4/3 (>768 px), 16/9 (≤768 px) |
| src/pages/posts/[id].astro:75 | .post__related-thumb (post-next.css:13) | 112×768 | 16/9 (oculta ≤768 px) |
| src/components/search-results/item-html.ts:12 | .search-results__thumb (search-results.css:33) | 112×768 | 16/9 |

No afectadas: hero `.profile-image img` (profile-card.css:21 declara `height: 100%` en un
contenedor dimensionado; 952×960 correcto) y el logo de Layout.astro (sin regla CSS: se pinta a
72×25 de sus atributos, que es lo pretendido). Las imágenes markdown de src/content no llevan
atributos width/height. No hay más `<img` con atributos en src/.

Por qué escapó: el test REQ-48-05 (tests/image-loading-hints.test.mjs:61-74) acepta
`height:auto | aspect-ratio | object-fit: cover` como alternativas; `aspect-ratio` sin
`height: auto` no basta cuando el `<img>` tiene atributo height. REQ-48-05 se ajusta dentro de
la 65 (precedente REQ-43-06).

Arreglo: `height: auto` en las cuatro reglas, conservando los atributos (el navegador sigue
reservando el hueco con la proporción de los atributos antes de cargar). Alternativa descartada:
quitar los atributos (reintroduce CLS, contradice REQ-48-01).

Trabas de líneas: post.css 100/100 (no admite una línea más: declarar `height: auto` en
`.post__hero .post__image` de post-header.css, 99/100, o en la misma línea que `width: 100%`
de post.css); latest-articles.css 98 con conteo fijado a 98 en
tests/home-latest-articles-limit.test.mjs:255 (si cambia, actualizar con nota REQ-43-06);
post-next.css y search-results.css son reglas de una línea (se añade en la misma línea).

Test anti-regresión: para cada `<img` con atributo height en los cinco archivos de la 48 y con
clase propia, la regla CSS de esa clase (o de su selector descendiente) declara `height: auto`
o un `height` explícito. Verificación real: Chrome headless + CDP, alto = ancho / ratio
(±1 px) en portada, un post y /search?q=solid a 1280 y 375 px.

## 66 — Dominio real moisesbaldenegro.com

moibaldenegro.com da NXDOMAIN; https://moisesbaldenegro.com responde vía Cloudflare (403,
cf-mitigated: challenge a clientes sin navegador). Todo lo derivado de `site` (canonical,
og:url, og:image, sitemap, robots Sitemap:, JSON-LD) apunta hoy al dominio inexistente.

Clasificación de apariciones:

| Aparición | Tipo | Decisión |
|---|---|---|
| astro.config.mjs:6 `site: 'https://moibaldenegro.com'` | URL | → https://moisesbaldenegro.com |
| src/domain/seo/head.ts:3 `BRAND` (+ comentarios :16-17) | marca = nombre de dominio | → moisesbaldenegro.com (supuesto) |
| src/pages/about.astro:13 título «About — moibaldenegro.com» | marca | → «About — moisesbaldenegro.com» (supuesto) |
| src/layouts/Layout.astro:54 alt «Inicio — moibaldenegro.com» | marca | → «Inicio — moisesbaldenegro.com» (supuesto) |
| public/site.webmanifest name / short_name | marca | → moisesbaldenegro.com (supuesto) |
| htb-profile-repository.ts:48 User-Agent | identificador del cliente HTTP | → moisesbaldenegro.com |
| README.md:1 título | marca | → moisesbaldenegro.com (supuesto) |
| `@moibaldenegro` (hero.json:3, social.ts:26 TWITTER_SITE, Layout.astro:57 x.com/moibaldenegro) | handle de cuenta en X | SIN CAMBIO: no es un dominio |
| `moibaldenegro` en tests HTB (nombre de perfil) | dato de fake | SIN CAMBIO |
| wrangler.jsonc name / package.json name `moibaldenegro-web` | nombre del Worker/paquete | SIN CAMBIO: renombrar el Worker crea otro despliegue |

Decisión revisable por el humano: la marca visible (BRAND, títulos, alt, manifest, README) pasa a
moisesbaldenegro.com porque es literalmente un nombre de dominio. Si el humano prefiere conservar
la marca antigua o el handle cambia también, se abre otra feature. og:site_name sigue a BRAND.

Tests que fijan el dominio viejo y se ajustan dentro de la 66 con nota (precedente REQ-43-06):
article-json-ld, seo-head-base, sitemap-robots-endpoints, social-meta-tags, about-page,
layout-refactor (REQ-08-02), link-image-accessible-names (alt), manifest-generator-cleanup,
project-readme. security-headers.test.mjs:61 y search-keyboard-escape.test.mjs:187 usan el
dominio como dato arbitrario: se actualizan por coherencia. Las handles `@moibaldenegro` no se
tocan. El criterio de cierre: `moibaldenegro.com` no aparece en src/, public/, astro.config.mjs
ni README.md (la cadena no colisiona con `@moibaldenegro` ni `moisesbaldenegro.com`).

Fuera de alcance: www.moisesbaldenegro.com (redirección en Cloudflare, configuración del humano)
y la CSP (feature 64, sigue blocked: el desafío de Cloudflare impide inspeccionar el HTML con curl).

## 67 — Test de la guarda de normalizeText

El humano añadió `if (!text) return '';` en src/domain/search/normalize.ts:7 (diff sin commit) y
quiere conservarlo. Hallazgo para la mutación: con la línea eliminada `normalizeText('')` sigue
devolviendo '' (''.normalize() es válido), así que el caso '' no detecta la mutación; sí la
detectan `undefined` y `null` coaccionados (sin la guarda lanzan TypeError al llamar .normalize).
Regularización de un cambio humano: el test se observará en verde (el código ya existe) y la
evidencia test-first es la mutación (eliminar la línea → rojo en undefined/null → restaurar).
tests/search-domain.test.mjs tiene 248 líneas: el test va en un archivo nuevo.

## Feature 64

Se actualiza solo `blocked_reason`: dominio real moisesbaldenegro.com, responde 403 con
cf-mitigated: challenge, HTML de producción no inspeccionable con curl. Status sin cambios.
