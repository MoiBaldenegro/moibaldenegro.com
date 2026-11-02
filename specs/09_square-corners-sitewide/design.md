# Diseño — square-corners-sitewide (feature 9)

## Contexto visual

- Afecta a toda la web: home (hero cards, profile card, artículos, promo tiles,
  search bar), /about (hero, stats, skills, timeline, credenciales, proyectos),
  /search (resultados, paginación, tags, miniaturas), posts (header, tags,
  imágenes, bloque de código, siguiente/relacionados), /404, header, menú, footer,
  skip-link y scrollbar.
- Estado actual: mezcla de estilos. Los componentes recientes (promo-tiles,
  cinta MXVI) son rectos, pero el resto usa `--radius-card` (22px),
  `--radius-pill` (999px), `--radius-thumb` (10px) y dos `50%` literales.
- Estado deseado: un único lenguaje visual de esquinas rectas en todo el sitio,
  sin excepciones, alineado con promo-tiles y la cinta MXVI.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-square` | 0 | Único token de radio; valor de toda declaración `*-radius` en src/styles |

Tokens eliminados: `--radius-card`, `--radius-pill`, `--radius-thumb` (y sus
comentarios en tokens.css, search-bar.css y search-results.css).

## Decisiones y constraints

- Decisión 1 — consolidar en un token: se sustituyen los tres tokens por
  `--radius-square: 0`. Dejar `--radius-pill: 0` o `--radius-card: 0` produciría
  nombres engañosos y facilitaría reintroducir redondeos. Un único token hace
  que el test "todo radio = var(--radius-square)" sea trivial y robusto.
- Decisión 2 — conservar las declaraciones: no se borran los `border-radius`;
  solo cambia su valor. Así se neutraliza el redondeo por defecto del navegador
  en controles nativos (p. ej. `input[type=search]` en Safari, botones) y los
  outlines de `:focus-visible` (que siguen el radio) quedan rectos.
- Decisión 3 — círculos (50%): el humano pidió "todos", así que también se
  convierten. El badge `.verified` (16×16 px) pasa a ser un cuadrado con el
  check centrado. El glow `.hero-card::after` pasa a caja recta: su
  `radial-gradient(..., transparent 70%)` se desvanece antes de las esquinas,
  así que el halo sigue viéndose suave y circular.
- Decisión 4 — scrollbar: el pulgar `::-webkit-scrollbar-thumb` también pasa a
  recto (forma parte del chrome visible).
- Decisión 5 — radios asimétricos: `0 var(--radius-card) var(--radius-card) 0`
  (.about-philosophy__quote) y `0 var(--radius-thumb) var(--radius-thumb) 0`
  (.about-timeline__result) pasan a `var(--radius-square)` (un único valor).
- Decisión 6 — fuera de alcance: el `rx="1.5"` del icono SVG de copiar
  (code-copy.ts) es dibujo del glifo, no una esquina de caja; se conserva.
  `stroke-linecap="round"` del icono de búsqueda tampoco es un radio.
- Restricciones: solo tokens, sin dependencias, sin JS, estilos fuera de los
  `.astro`, ≤100 líneas por archivo (los cambios son sustituciones de valor en
  línea; tokens.css pasa de 99 a ≤99 líneas).

## Alternativa descartada

- Alternativa: fijar a 0 los tres tokens existentes sin renombrarlos.
- Motivo del descarte: diff mínimo, pero deja `--radius-pill: 0` y
  `--radius-card: 0` como nombres que contradicen su valor, y no protege contra
  futuros redondeos literales. Se prefiere un único token explícito.
- Alternativa: eliminar todas las declaraciones `border-radius`.
- Motivo del descarte: reabre el redondeo por defecto del agente de usuario en
  controles nativos.
