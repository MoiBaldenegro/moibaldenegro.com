# Análisis — square-corners-sitewide (feature 9)

## Problema

Petición humana: "con los ultimos componentes que hemos agregado, vamos a cambiar
todos los bordes radius que tenemos en la web a rectos para darle ese mismo estilo
a todo y no mezclar". Los componentes recientes (promo-tiles, cinta MXVI) son
rectos; el resto del sitio usa radios grandes. Objetivo: toda la web con esquinas
rectas, sin excepciones.

## Inventario verificado (grep en src/, 2026-11-02)

- Tokens (src/styles/tokens.css:71-73): `--radius-card: 22px`, `--radius-pill: 999px`,
  `--radius-thumb: 10px`.
- 61 declaraciones `*-radius:` en 25 hojas de src/styles (about-credentials 2,
  about-hero 5, about-projects 3, about-skills 2, about-stats 1, about-timeline 4,
  about 1, article 3, code-copy 1, hero-card-link 2, hero-card 2, hero-section 1,
  htb-stadistics 1, latest-articles 4, layout 3, not-found 1, post-header 4,
  post-next 2, post 2, profile-card 3, promo-tiles 4, search-bar 2,
  search-results 6, site-footer 1, site-menu 1).
- Literales: `50%` en hero-card.css:34 (.hero-card::after, glow) y
  profile-card.css:46 (.verified, badge); `0` en promo-tiles.css:26 (.promo-tile).
- Asimétricos: about-credentials.css:54 (.about-philosophy__quote,
  `0 var(--radius-card) var(--radius-card) 0`) y about-timeline.css:61
  (.about-timeline__result, `0 var(--radius-thumb) var(--radius-thumb) 0`).
- Scrollbar: layout.css:70 `::-webkit-scrollbar-thumb` con `--radius-pill`.
- Comentarios que nombran tokens: search-bar.css:3 (radius-pill),
  search-results.css:3 (--radius-thumb), tokens.css:72.
- .astro: sin `<style>` ni `style=` con radio. .ts: solo `rx="1.5"` del icono
  SVG en code-copy.ts (glifo, fuera de alcance). docs/: sin referencias.
- Tests que fijan valores antiguos: tests/article-images.test.mjs:23
  (`--radius-card`), tests/promo-tiles-section-ui.test.mjs:57 y :62
  (`--radius-pill`) y :66 (`border-radius:\s*0`, no casaría con un var()).

## Enfoque (validado)

Consolidar en un único token `--radius-square: 0` y eliminar los tres antiguos;
sustituir en línea cada valor de radio por `var(--radius-square)` (incluidos 50%,
el 0 literal, los asimétricos y la scrollbar). No se eliminan declaraciones: se
conservan para neutralizar el redondeo por defecto del navegador. Se descarta
dejar `--radius-pill: 0` por nombre engañoso (ver design.md).

## Capas tocadas

Solo estilos (src/styles/*.css, 25 hojas + tokens.css) y dos tests existentes;
test nuevo tests/square-corners-sitewide.test.mjs. Sin datos, repositorios,
rutas, componentes ni JS.

## Riesgos y trabas

- Volumen: ~26 archivos, pero cada cambio es una sustitución de valor en la
  misma línea; ningún archivo crece (layout.css está en 99, tokens.css en 99).
- Controles nativos sin declaración propia podrían mostrar redondeo del UA
  (REQ-09-15 cubre el caso con revisión visual).
- Glow circular del hero card: con caja recta sigue viéndose circular porque el
  radial-gradient se desvanece al 70%; verificar visualmente.
- Badge .verified pasa a cuadrado: decisión explícita (el humano pidió "todos").
- Specs de features previas citan los tokens antiguos: son históricas, no se
  tocan.
