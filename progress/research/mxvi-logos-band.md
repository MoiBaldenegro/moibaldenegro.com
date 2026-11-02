# Análisis — cinta azul y logos MXVI clicables (features 5 y 6)

## Petición humana (vía líder, 2026-11-02)

Mejorar la sección de los 4 SVG MXVI (M, X, V, I) entre el hero y los artículos de la home:

1. Cinta (banda) full-bleed, de borde a borde de la ventana, inspirada en la banda azul con
   degradado de Apple Events (apple.com): degradado azul suave con leve resplandor radial al
   centro. Los 4 logos van sobre ella. SIN TEXTO: ni títulos ni botones.
2. Hover por logo (sube opacidad/brillo, ligera elevación/escala, transición suave; respeta
   prefers-reduced-motion) y :focus-visible equivalente.
3. Cada logo es un enlace `<a>` a una URL por logo; hoy las 4 van a
   https://github.com/MoiBaldenegro (en el futuro cada una a un proyecto). La URL sale de
   `src/data/*.json` vía `src/domain/repositories`. `target="_blank"` +
   `rel="noopener noreferrer"`, nombre accesible por enlace (`aria-label`, p. ej.
   "MXVI M — GitHub"); se quita `aria-hidden` de la sección y los `<svg>` quedan decorativos
   (`aria-hidden="true"`) dentro del enlace.
4. CSS solo en src/styles, tokens nuevos en tokens.css para el degradado, <=100 líneas por
   archivo, sin dependencias, sin JS de runtime, TDD, responsive (2 columnas en móvil).

## Estado actual (revisado)

- `src/components/mxvi-logos-banner.astro` (20 líneas): array `logos` hardcodeado en el
  frontmatter (`id`, `viewBox`), `<section class="mxvi-logos" aria-hidden="true">`, un `<svg>`
  por logo con `<use href="/assets/svg/sprite.svg#mxvi-*">`. En cuanto los logos lleven URL,
  los datos deben pasar a JSON + repositorio (convención "datos vía repositorio").
- `src/styles/mxvi-logos-banner.css` (29 líneas): sección `min(var(--container-max), 95%)`
  con `overflow: hidden`, grid 4 columnas (2 en <=768 px), logos en blanco con
  `filter: grayscale(1) brightness(0) invert(1)` y `opacity: var(--opacity-logo-muted)` (.18).
- `tests/mxvi-logos-banner.test.mjs`: exige `id: "mxvi-*"` en el componente,
  `aria-hidden="true"`, el import del CSS, el filtro blanco, `var(--opacity-logo-muted)` y el
  media 768 px. Hay que reescribirlo (test-first): los ids pasan al JSON y la opacidad cambia.
- `tests/mxvi-sprite.test.mjs`: valida los symbols del sprite; no se toca, el sprite no cambia.
- `src/pages/home.astro`: `<MxviLogosBanner/>` entre `<NewHero/>` y `<LatestArticles/>`
  dentro de `.home__landing`, que tiene `overflow-x: clip` (latest-cards-motion.css): la
  técnica full-bleed `width: 100vw; margin-inline: calc(50% - 50vw)` no crea scroll horizontal.
- `--opacity-logo-muted` solo se usa en mxvi-logos-banner.css.
- Patrón de referencia para datos: feature 4 (`promo-tiles.json` + `PromoTile` +
  `promo-tiles-parse.ts` + `PromoTilesRepository` con loader inyectable y error nombrado).

## Qué toca

| Capa | Archivos |
|------|----------|
| Datos | `src/data/mxvi-logos.json` (nuevo) |
| Dominio | `src/domain/entities/mxvi-logo.ts`, `src/domain/repositories/mxvi-logos-parse.ts`, `src/domain/repositories/mxvi-logos-repository.ts` (nuevos) |
| UI | `src/components/mxvi-logos-banner.astro`, `src/styles/mxvi-logos-banner.css`, `src/styles/tokens.css` |
| Tests | `tests/mxvi-logos-data.test.mjs` (nuevo, f5), `tests/mxvi-logos-banner.test.mjs` (reescrito, f6) |

## Descomposición (complejidad media: datos + UI)

- **Feature 5 `mxvi-logos-links-data`**: base de datos/dominio. JSON con los 4 logos
  (`id`, `letter`, `viewBox`, `href`, `label`), entidad `MxviLogo`, parseo con
  `MxviLogosDataError` y `MxviLogosRepository` con loader inyectable. Sin UI.
- **Feature 6 `mxvi-logos-band`** (depends_on [5]): componente y estilos. Cinta full-bleed
  con degradado + resplandor, enlaces con hover/focus, reduced-motion, tokens nuevos,
  accesibilidad. Con design.md.

## Decisiones

- `href` solo admite `https://` (las 4 son externas y abren con `target="_blank"`); un href
  relativo o `http://` se rechaza con error nombrado. El componente pone `target`/`rel` fijos
  sin lógica condicional en el frontmatter.
- `label` viene en el JSON ("MXVI M — GitHub", etc.) para que al cambiar el destino de un
  logo se cambie también su nombre accesible sin tocar código.
- `viewBox` pasa al JSON (hoy hardcodeado) y se valida con la forma `0 0 <w> <h>`.
- Logos en blanco sobre azul: se mantiene el filtro blanco; la opacidad de reposo sube a un
  token nuevo (`--opacity-logo-band`, .62) porque .18 sería casi invisible sobre azul; hover
  y focus a `--opacity-logo-band-hover` (1). `--opacity-logo-muted` queda sin uso y se
  retira de tokens.css (libera una línea).
- Valores de color concretos en specs/06_mxvi-logos-band/design.md.

## Riesgos y trabas

- **tokens.css está en 100 líneas exactas.** Los 6 tokens nuevos obligan a compactar (p. ej.
  el bloque de la tarjeta de perfil a dos tokens por línea y retirar `--opacity-logo-muted`).
  Requisito explícito: tokens.css queda en <=100 líneas.
- Full-bleed con `100vw` incluye la barra de scroll en Windows: `.home__landing` ya recorta
  con `overflow-x: clip`; la regresión visual debe confirmar que no hay scroll horizontal.
- El `transform` de hover no debe recortarse: la cinta necesita padding vertical suficiente y
  pierde el `overflow: hidden` actual.
- Contraste del anillo de foco: outline blanco (`--color-text`) sobre azul.
- Sin JS de runtime: hover/focus son puro CSS.
