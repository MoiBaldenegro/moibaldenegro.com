# Análisis: iframe sin estilos en la página de detalle + regresión del enlace Home

> Sesión spec_author. Problema 1 (petición humana, prioridad alta): «el iframe
> no agarra los estilos, queremos que se vea bien presentable, por ejemplo del
> article 02 que ahí tenemos uno, arréglalo». Problema 2 (regresión
> preexistente): suite en rojo por falta del enlace Home en el navbar.

## 1. Causa raíz verificada — Problema 1 (iframe/video)

Verificado en disco (2026-08-20):

1. `src/content/architecture/02-principios.md` L37-44 embebe HTML crudo en
   markdown: `<div class="video-container"><iframe src="...youtube..."></iframe></div>`.
2. Los estilos `.video-container` / `.video-container iframe` viven en
   `src/styles/article.css` (25 líneas).
3. Grep del repo: `article.css` se importa SOLO desde `src/pages/index.astro`
   (L10). `src/pages/posts/[id].astro` (la página que renderiza el cuerpo
   markdown con el video) importa `post.css`, `post-header.css` y
   `post-readability.css`, pero NO `article.css` → el iframe queda con el
   tamaño por defecto del navegador (~300×150, sin ratio 16:9, sin radio).
4. El commit `573fcef` («feat: add article styles...») añadió `article.css` y
   el import en `index.astro`, pero `index.astro` (portada) no renderiza
   cuerpos de artículo: el índice de búsqueda serializa `entry.body` como JSON
   (REQ-05-04/REQ-03-07). El import en la portada es CSS muerto; el import que
   faltaba es el de la página de detalle.
5. `article.css` viola convenciones del arnés (docs/architecture.md §6 tokens,
   §7 estilos separados, §12 ≤100 líneas):
   - `border-radius: 12px` hardcodeado (los radios solo desde
     `var(--radius-*)` de `tokens.css`: `--radius-card 22px`,
     `--radius-pill 999px`, `--radius-thumb 10px`).
   - `min-height: 500px` en el iframe: rompe la proporción del contenedor
     (aspect-ratio 16/9) y, con `overflow: hidden`, recorta el video.
   - Clases `.article` (max-width 700px) y `.prose` (max-width 65ch) muertas:
     grep en `src/` = 0 usos; la página real usa el patrón BEM `.post` /
     `.post__content` / `.post__body` (features 26/39).
6. `post.css` está en 100 líneas exactas (REQ-26-06, ≤100) → fusionar ahí los
   estilos del video superaría el límite y mezclaría hojas con historial de
   features distintas. Se conserva `article.css` como hoja del contenido
   embebido.

## 2. Causa raíz verificada — Problema 2 (enlace Home)

1. `src/layouts/Layout.astro` navbar: ancla del logo (img → `/`), About,
   Arquitectura, @moibaldenegro y SearchBar. Falta el enlace de texto «Home».
2. `git show 72e5c52:src/layouts/Layout.astro` → existía `<a href="/">Home</a>`
   (plano, sin aria-current). Se perdió en reescrituras manuales posteriores
   (686a7cc «clean up Layout.astro», 319bdcd «Refactor code structure»).
3. Tests en rojo (2):
   - `tests/architecture-nav-link.test.mjs` REQ-08-04: espera
     `/<a\b[^>]*href="\/"[^>]*>\s*Home\s*<\/a>/` en el `<nav>`.
   - `tests/layout-refactor.test.mjs` REQ-08-05: espera `/href="\/"\s*>Home/`.
   - `tests/visual-polish-refactor.test.mjs` REQ-37-03: exige comparación de
     pathname con `/` y `/about` y ≥2 aria-current con degradado `'page' :
     undefined` (el ancla del logo ya cubre `/`; sin cambios).
4. Contrato vigente: `specs/08_architecture-nav-link/requirements.md`
   REQ-08-04 («conservar los enlaces Home, About y @moibaldenegro») y
   REQ-08-05 (heredar estilos del navbar).
5. La regresión bloquea declarar cualquier feature `done` (regla
   `require_tests_to_close`: suite 100% verde).

## 3. Decisiones

- **D1 (feature 11)**: conservar `article.css` como hoja del contenido embebido
  y limpiarla. NO fusionar en `post.css` (100 líneas exactas, REQ-26-06).
- **D2 (feature 11)**: migrar a tokens: `border-radius` → `var(--radius-card)`
  (consistente con `.post__image`, REQ-26-04) y margen → `var(--gap-card)`
  (precedente REQ-17-05). Eliminar `min-height: 500px` (el aspect-ratio del
  contenedor gobierna la altura) y `border-radius` del iframe (el contenedor
  con `overflow: hidden` recorta las esquinas).
- **D3 (feature 11)**: scoping bajo `.post__content .video-container`,
  consistente con la Decisión 2 de la feature 26 (tipografía del markdown
  scoping bajo `.post__content`).
- **D4 (feature 11)**: importar `article.css` en `src/pages/posts/[id].astro`
  y retirar el import de `src/pages/index.astro` (portada no renderiza
  cuerpos markdown; import muerto).
- **D5 (feature 11)**: eliminar las clases muertas `.article` y `.prose`.
- **D6 (feature 12)**: restaurar `<a href="/">Home</a>` plano, sin clase ni
  style (hereda `.site-navbar a`), SIN aria-current: el ancla del logo ya
  marca la portada y el estado pre-regresión (72e5c52) era un ancla plana.
  Orden: Home → About → Arquitectura → @moibaldenegro → SearchBar.
- **D7 (descomposición)**: dos features independientes (sin `depends_on`
  cruzado): 11 = presentación/estilos del video (UI → design.md); 12 =
  restauración de marcado con tests ya existentes en rojo (test-first
  cumplido por la regresión). La feature 10 (`in_progress`, sesión previa sin
  artefactos) no se toca.

## 4. Alcance y fuera de alcance

Alcance feature 11: wiring del CSS en la página de detalle, limpieza de
`article.css` (tokens, scoping, clases muertas, min-height), retirada del
import muerto de la portada, tests de inspección node:test (patrón de
`tests/post-page-styles.test.mjs`). Alcance feature 12: enlace Home en el
navbar + tests existentes en verde.

Fuera de alcance: el contenido/rendimiento del iframe de YouTube (preconnect,
lazy), rediseño del navbar más allá del enlace Home, cambios en
`post.css`/`post-header.css`/`post-readability.css`, la feature 10.

## 5. Riesgos

- `post.css` en 100 líneas: no tocarlo (tests REQ-26-06 lo fijan).
- `tests/post-page-styles.test.mjs` REQ-26-02 exige los imports actuales de
  `[id].astro` — el import de `article.css` es aditivo y no rompe aserciones.
- La suite solo queda 100% verde tras cerrar 11 Y 12 (los 2 rojos actuales son
  de la navbar, feature 12).

## 6. Trazabilidad de la descomposición

| Feature | id | REQ | Verificación |
|---------|----|-----|--------------|
| article-iframe-styles | 11 | REQ-11-01..09 | tests de inspección nuevos (patrón post-page-styles) |
| restore-navbar-home-link | 12 | REQ-12-01..06 | tests existentes en rojo (REQ-08-04/05) + inspección nueva |