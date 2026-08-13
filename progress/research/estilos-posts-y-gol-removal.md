# Research — Estilos de /posts/[id] y eliminación del fondo Game of Life

> Análisis del spec_author (2026-08-13). Dos peticiones del usuario canalizadas
> como features 25 y 26 (status `pending`). Todo verificado en disco; el arnés
> estaba en verde (suite 190/190, features 1-24 done).

## 1. Petición 1 — Hoja de estilos para `/posts/[id]` (feature 26)

### 1.1 Estado real en disco (verificado)

- `src/pages/posts/[id].astro` (38 líneas) — adaptado a `PostsRepository` en la
  feature 24 (resolución del build roto por `markdownPostRepository`):
  - Frontmatter: import de `Layout`, `PostsRepository`, `getCollection`/`render`.
  - `getStaticPaths` con `params: { id: entry.id }`, `prerender = true`.
  - Marcado: `<main class="post">` → `<article class="post__content">` →
    `<h1 class="post__title">` (con `transition:name`), `<p class="post__meta">`
    (Por {author} • {readtime} min), `<img class="post__image">` (con
    `transition:name`), `<section><Content /></section>`.
  - **NO importa ninguna hoja CSS**: las clases `post__*` no tienen estilos
    (hallazgo del reviewer de la feature 24: "posible feature futura").
- La ruta es real: el build genera `dist/client/posts/<id>/index.html`
  (verificado en impl_24: `/posts/00-agilismo`, `/posts/01-diseño-detallado`).

### 1.2 Patrón de hojas del sitio (leído)

- `src/styles/about.css` (43 líneas): BEM ligero (`about__*`), solo
  `var()` en colores/radios/bordes/transiciones, literales en
  tipografía/layout (font-size 2rem, padding 48px…), `@media (max-width: 768px)`.
- `src/styles/latest-articles.css` (75 líneas): mismo patrón; regla
  `.latest-articles__image` (feature 17) con width 100%, aspect-ratio 16/9,
  object-fit cover, `var(--radius-card)`, `var(--color-border)`.
- `scripts/audit-design-tokens.mjs` solo prohíbe hex/rgb()/rgba() fuera de
  tokens.css → literales tipográficos/layout permitidos (precedente).
- Test estructural de referencia: `tests/about-page.test.mjs` (existencia,
  import desde la página, ≤100 líneas, sin hex/rgba, props de color con var()).

### 1.3 Tokens disponibles (tokens.css, 96/100 líneas — SIN margen)

Colores (`--color-background`, `--color-surface`, `--color-text`,
`--color-text-secondary`, `--color-border`, `--color-border-strong`,
`--color-accent`, `--color-accent-hover`), radios (`--radius-card`,
`--radius-pill`), espaciado (`--gap-card`), contenedor (`--container-max`),
sombra, transición (`--transition-default`), tipografía (**solo**
`--font-sans`; NO hay `--font-size-*` ni `--line-height-*`).

**Decisión:** los tamaños tipográficos, interlineados y el ancho de lectura
son literales del componente (precedente absoluto: latest-articles.css usa
font-size 0.9rem/1.35rem; about.css 2rem). Colores/radios/bordes/transiciones
solo `var()`. Sin tokens nuevos (precedentes features 17 y 24: 96/100).

### 1.4 Tipografía del `<Content />` (contenido markdown)

- Sin reglas hoy: hereda `body` de layout.css (background/font-family/color
  via tokens) y los defaults del navegador → los encabezados, listas, enlaces
  y bloques de código del markdown quedan sin jerarquía ni estilo propio.
- Decisión: incluir tipografía del contenido en la feature, con **scoping
  bajo `.post__content`** (el `<Content />` vive en `<section>` dentro de
  `.post__content`) → NO se toca el marcado del contenido ni la página.
  Alcance: h2/h3, p, ul/ol/li, a, code/pre (y márgenes entre bloques).

### 1.5 Imagen `post__image`

Mismo bloque uniforme que la feature 17 (REQ-17-02..05): width 100%,
aspect-ratio 16/9, object-fit cover, `var(--radius-card)` + `var(--color-border)`
+ margen. El `alt={title}` ya existe en la página (no se toca).

### 1.6 ¿La ruta `/` enlaza a `/posts/[id]`? (verificado)

- `src/components/latest-articles.astro` **NO** tiene enlace a `/posts`:
  REQ-20-06 de la feature 20 eliminó el `<a href={`/posts/${post.id}`}>`
  (enlace muerto en su momento, ruta 404) y la feature 24 solo reincorporó
  `transition:name` (verificado: `tests/latest-articles-restore.test.mjs`
  línea 133-138 exige ausencia de `href` a `/posts`).
- **Decisión:** la reincorporación del enlace queda **FUERA** de la feature
  de estilos (feature 26). Motivos: (1) es una decisión de navegación sobre
  un componente distinto (`latest-articles.astro`) cuyo contrato se restauró
  en la feature 20; (2) mezclaría navegación con estilos; (3) REQ-20-06
  la prohíbe hoy y cambiaría el contrato del componente → requeriría feature
  propia con decisión explícita del usuario. Documentado en descripción,
  design.md y aquí.

### 1.7 Alcance de la feature 26

- `src/styles/post.css` nueva (≤100 líneas, BEM `.post__*`, tokens,
  tipografía de contenido bajo `.post__content`).
- Único cambio de markup: `import "../styles/post.css";` en el frontmatter de
  `[id].astro` (38 → 39 líneas; `tests/view-transitions.test.mjs` exige ≤100
  líneas, sin `<style>` — no se rompe; sus aserciones no prohíben imports).
- `tests/post-page-styles.test.mjs` nuevo (patrón about-page: estructura +
  contrato + tokens + límites).
- NO toca: tokens.css, latest-articles, enlace `/posts`, `transition:name`.

## 2. Petición 2 — Eliminación del fondo Game of Life (feature 25)

### 2.1 Estado real en disco (verificado con grep)

Código a eliminar (ninguno es importado por otra cosa que no sea GOL):

| Archivo | Origen | Estado |
|---|---|---|
| `src/components/GameOfLifeBackground.astro` | feature 15 | import en Layout.astro línea 4 + uso comentado línea 27 |
| `src/utils/game-of-life.ts` | feature 14 (motor) | solo lo importa game-of-life-canvas.ts |
| `src/utils/game-of-life-canvas.ts` | feature 15 (driver) | solo lo importa el componente |
| `src/utils/gol-render.ts` | feature 16 (dibujo) | solo lo importa el driver |
| `src/styles/game-of-life.css` | feature 15 | solo la importa el componente |
| `tests/game-of-life-engine.test.mjs` | feature 14 | standalone |
| `tests/game-of-life-background.test.mjs` | feature 15 | standalone |
| `tests/gol-performance.test.mjs` | feature 16 | standalone |

Tokens en `tokens.css` (96 líneas): `--opacity-gol` (0.15, línea 88),
`--size-gol-cell` (6px, línea 94), `--opacity-hero` (0.80, línea 91).

### 2.2 ¿Quién más referencia GOL/`--opacity-hero`? (grep completo)

- `src/layouts/Layout.astro`:4 import + :27 comentario `<!-- <GameOfLifeBackground /> -->`.
- `src/styles/hero-section.css`: comentarios líneas 14-22 (mención a
  Decisión 6/REQ-16-05/06, GOL) y líneas 28-29 **comentadas y muertas**:
  `/* opacity: var(--opacity-hero); will-change: opacity; */`.
- `docs/architecture.md`:15 y :56 (ejemplo de componentes — tocar con
  cuidado: el kit prohíbe el token 'hero', REQ-01-05; "NewHero"/"HeroCard"
  NO valen como reemplazo por contener 'hero'; se usan `LatestArticles`,
  `HtbStadistics`).
- Tests: SOLO los 3 tests GOL mencionan las cadenas. `tests/hero-section-styles
  .test.mjs` exige el selector `.hero-background` (REQ-03-02) → el selector
  PERMANECE (solo se limpian comentarios). Ningún otro test (layout-refactor,
  harness-kit, cleanup-dead-code, view-transitions…) toca archivos GOL.
- `templates/`, README, AGENTS, KICKOFF, CHECKPOINTS, package.json,
  astro.config.mjs: sin referencias (verificado).

### 2.3 Decisión sobre `--opacity-hero` (analizada y tomada)

- Propósito original (Decisión 6, feature 15): hero translúcido a 0.80 para
  que el canvas GOL se viera tras él. Verificado: su **único** uso activo era
  el comentado en hero-section.css — hoy el hero renderiza a **opacidad plena**
  (estado actual visible, aprobado por el usuario).
- **Decisión:** se elimina `--opacity-hero` junto a los tokens GOL y la
  referencia comentada. El look NO cambia (la propiedad ya estaba inactiva;
  el gradiente queda a opacidad plena). Mantener un token sin uso sería deuda
  (espíritu de "Tokens, no valores sueltos").

### 2.4 Otros puntos

- `hero-section.css`: se reescribe la cabecera de comentarios del
  `.hero-background` quitando menciones GOL/REQ-16 sin tocar la regla
  (aprobado por `tests/hero-section-styles.test.mjs`).
- Layout.astro: se eliminan import línea 4 y comentario línea 27. El layout
  NO depende de GOL (REQ-15-09 murió con su test; `view-transitions.test.mjs`
  no lo exige).
- docs/architecture.md: ejemplos sin `GameOfLifeBackground` y sin introducir
  'hero' (kit). Precedente de alineación de docs: feature 23.
- **Features 14-16**: PERMANECEN `done` en `feature_list.json` (historial
  inamovible; el validador de specs las salta por done). Sus `specs/14..16`,
  `progress/impl/review/research` y `progress/history.md` son bitácora
  permanente. La feature 25 documenta que revoca su código por decisión del
  usuario (mismo patrón de las features 18-20 con restauraciones).
- El nuevo test `tests/game-of-life-removal.test.mjs` contiene las cadenas
  GOL (rutas de los archivos que verifica ausentes) → el acceptance del grep
  se acota a `src/` (0 resultados) y aclara que en `tests/` solo el test de
  la feature menciona las cadenas.
- Suite: 190 tests hoy; la 25 elimina subtests de los 3 archivos GOL (el
  acceptance no fija conteo: exige suite en verde + build + init.sh).

## 3. Descomposición y orden

**2 features independientes** (conjuntos de archivos disjuntos: una añade
`post.css` + test; la otra elimina GOL + tokens + tests + docs). `depends_on`
omitido (ninguna dependencia). Orden de ids:

- **25 `game-of-life-removal`** — primero: revoca las features 14-16 y fija
  el estado final de tokens (incluida la retirada de `--opacity-hero`) antes
  de que la 26 construya nueva UI sobre el token set definitivo.
- **26 `post-page-styles`** — después: hoja nueva sobre el estado final.

`one_feature_at_a_time`: la 25 se implementa y cierra antes de la 26 (id menor
primero, regla del arnés).

## 4. Riesgos y trabas

- `docs/architecture.md` es archivo del kit (REQ-01-05): al editar sus
  ejemplos NO introducir el token prohibido 'hero' (usar solo
  `LatestArticles`/`HtbStadistics`; verificar con harness-kit tras la 25).
- `tests/hero-section-styles.test.mjs` exige `.hero-background` → no borrar
  la regla, solo comentarios.
- `tests/view-transitions.test.mjs` exige [id].astro ≤100 líneas, sin
  `<style>`/`style=`, con `transition:name` intactos → el import de post.css
  es el único cambio permitido.
- El acceptance del grep de la 25 debe acotarse (src/ → 0; tests/ → solo el
  test nuevo) para no ser auto-contradictorio.
- `--opacity-gol`/`--size-gol-cell`/`--opacity-hero`: eliminar la llave
  "Opacidad" y "Tamaño" de tokens.css completa (96 → ~89 líneas).