# Diseño — Cards del hero sin tecnologías repetidas (feature 97)

## Contexto visual

- Sección: bento del hero de la portada (`src/components/new-hero/`, `hero-grid-card.astro`), 12 cards de icono + card htb.
- Estado actual: NODE JS, GITHUB ACTIONS, YOUTUBE y TWITCH aparecen dos veces; Twitch y YouTube (redes) ocupan 4 celdas.
- Estado deseado: 12 tecnologías o herramientas distintas, una sola red (YouTube), sin cambiar la geometría del grid.

## Tabla final celda → tecnología

Orden = orden del array de `hero-cards.json` (no cambia). Celdas 1-5, 7 y 8 sin cambios.

| # | id actual | gridColumn | gridRow | id nuevo (= sprite) | Título visible | Token | Hex | iconWidth | rotate |
|---|-----------|------------|---------|---------------------|----------------|-------|-----|-----------|--------|
| 1 | react | 6 / span 5 | 1 / span 2 | react | REACT | `--color-marca-react` | #0E6C82 | 165px | -8 |
| 2 | html | 11 / span 2 | 1 / span 2 | html | HTML | `--color-marca-html` | #B74D05 | 115px | -7 |
| 3 | node | 6 / span 2 | 3 / span 2 | node | NODE JS | `--color-marca-node` | #08783A | 120px | -10 |
| 4 | github | 8 / span 5 | 3 / span 2 | github | GITHUB ACTIONS | `--color-marca-github` | #091223 | 190px | -12 |
| 5 | youtube | 6 / span 5 | 5 / span 2 | youtube | YOUTUBE | `--color-marca-youtube` | #B61111 | 170px | -8 |
| 6 | twitch | 11 / span 2 | 5 / span 2 | **rust** | RUST | `--color-marca-rust` | #A33A16 | 115px | -8 |
| 7 | typescript | 1 / span 2 | 7 / span 2 | typescript | TYPESCRIPT | `--color-marca-typescript` | #215BC7 | 110px | -10 |
| 8 | css | 3 / span 2 | 7 / span 2 | css | CSS | `--color-marca-css` | #6E29C8 | 105px | -8 |
| 9 | node-bottom | 5 / span 2 | 7 / span 2 | **aws** | AWS | `--color-marca-aws` | #232F3E | 120px | -6 |
| 10 | github-bottom | 7 / span 4 | 7 / span 2 | **claude-code** | CLAUDE CODE | `--color-marca-claude-code` | #5C2A1C | 165px | 0 |
| 11 | youtube-bottom | 11 / span 2 | 7 / span 2 | **nestjs** | NESTJS | `--color-marca-nestjs` | #A3132F | 120px | -5 |
| 12 | twitch-bottom | 1 / span 8 | 9 / span 2 | **cloudflare** | CLOUDFLARE | `--color-marca-cloudflare` | #A8470C | 140px | 0 |
| 13 | htb | 9 / span 4 | 9 / span 2 | htb (sin tocar) | HACK THE BOX | `--color-marca-htb` | #1A2332 | — | — |

Cada nueva entrada: `"id"` y `"colorToken"` = id nuevo, `"icon": "/assets/svg/sprite.svg#<id>"`, `"scale": 5`. Fuera: twitch, bun, claude (solo claude-code).

## Tokens usados

| Token | Valor | Contraste con #fff | Uso |
|-------|-------|--------------------|-----|
| `--color-marca-rust` | #A33A16 | 6,62 | fondo card RUST (icono blanco por currentColor) |
| `--color-marca-aws` | #232F3E | 13,57 | fondo card AWS (squid ink; sonrisa #FF9900 visible) |
| `--color-marca-claude-code` | #5C2A1C | 11,65 | fondo card CLAUDE CODE (icono #D97757, 3,12; corregido en la ronda 2, antes decía 3,73) |
| `--color-marca-nestjs` | #A3132F | 7,80 | fondo card NESTJS (icono #E0234E, tono sobre tono como TS) |
| `--color-marca-cloudflare` | #A8470C | 5,88 | fondo card CLOUDFLARE (wordmark blanco, nube naranja) |

Se eliminan `--color-marca-twitch`, `-twitch-bottom`, `-node-bottom`, `-github-bottom`, `-youtube-bottom`: 5 por 5, tokens.css se queda en 99 líneas (sin líneas nuevas de comentario).

## Decisiones y constraints

- Decisión 1 (selección): las 8 del CV (react, node, typescript, github, rust, nestjs, aws, cloudflare) + claude-code + html + css + youtube. Bun queda fuera (no está en el CV, es la 13.ª candidata). **Revisable**: YouTube se queda por el curso de Rust; si el humano lo retira, su celda pasa a bun (`--color-marca-bun`, p. ej. #3B2F2A).
- Decisión 2 (celdas): títulos largos en celdas anchas (CLOUDFLARE en 1 / span 8, que además encaja el wordmark 512x76; CLAUDE CODE en 7 / span 4); cortos en celdas de 2 columnas. AWS (navy) lejos de github y htb (navy); NESTJS sobre htb.
- Decisión 3 (geometría): `hero-card.css` renombra las 5 reglas `[data-color-token]` con la MISMA `--card-column` / `--card-row` de la celda; `gridColumn` / `gridRow` del JSON idénticos. La celda htb no se toca.
- Decisión 4 (icono, revisada 2026-10-15): la regla base de cada token (fuera de `@media`) mantiene el `--icon-width` / `--icon-rotation` de la tabla, iguales al `iconWidth` / `rotate` del JSON (rango JSON sin cambios: iconWidth 90-200px, rotate -12 a 0; son los valores de ≥ 1201 px). Los ajustes por tramo van SOLO en los bloques `@media (max-width: 1200px)` y `@media (max-width: 768px)` ya existentes de `hero-card.css`, como reglas `[data-color-token="<id>"] { ... }` que declaran únicamente `--icon-width` (30-200px), `--icon-rotation` (-12deg a 0deg) o `--icon-scale` (2 a 5), colocadas DESPUÉS de la primera regla `.hero-card { grid-column: auto !important; ... }` del bloque (la fija `tests/htb-hero-card.test.mjs`). Nada de `grid-column`, `grid-row`, `min-height` ni cambios en `hero-section.css`: la geometría del grid no cambia. Motivo: con `svg` de 32 px de alto, `bottom: 32px` y `scale(5)`, un logo cuadrado mide 160 px y en una card de 140 px de alto (6 columnas, 769-1200 px) su borde superior sube hasta ~12 px, encima del título (18-34 px; 18-49 px si envuelve a 2 líneas); `--icon-width` solo lo desplaza en horizontal, así que hace falta `--icon-scale`. Para el wordmark cloudflare (512x76) la nube ocupa el 32 % izquierdo: entra entera si `3 x --icon-width <= ancho de la card - 4 px`.
  - **Base de cloudflare (ronda 2, decisión del líder, opción 1 del implementer)**: la fila cloudflare de la tabla pasa de 170px / -6 a **140px / 0** (dentro del rango JSON 90-200px / -12..0; valor por defecto técnico revisable). Motivo: a ≥ 1201 px no hay `@media` y con 170px / -6deg la nube quedaba al 62,3 % dentro (< 90, REQ-97-16); con 140px / 0 el cálculo da ~96 %. El implementer cambia a la vez, con la misma cifra: `iconWidth: "140px"` y `rotate: 0` de cloudflare en `src/data/hero-cards.json`, la regla base `[data-color-token="cloudflare"]` de `hero-card.css` (`--icon-width: 140px; --icon-rotation: 0deg`) y la fila cloudflare de `tests/hero-cards-repository.test.mjs` (`rotate: 0, iconWidth: '140px'`) con la nota «Ajuste feature 97 ronda 2: base de cloudflare 140px / 0 (REQ-97-16 a 1280/1600)». Los overrides por tramo no cambian.
  - **Valores por defecto (revisables por el humano)** dentro de `@media (max-width: 1200px)`, fijados por la medida de la ronda 2 (también aplican en ≤ 768 px): `[data-color-token="github"] { --icon-width: 110px; --icon-scale: 2; --icon-rotation: 0deg; }` (con 2.5 a 800 px GITHUB ACTIONS envuelve a 2 líneas y solapaba 76,8 px²; 110px centra el logo), `[data-color-token="aws"] { --icon-scale: 3; }` (con 5 solapaba 489,3 px² a 800), `[data-color-token="claude-code"] { --icon-scale: 2; }` (con 5 solapaba 1501,3 px² y con 3, 361,1), `[data-color-token="cloudflare"] { --icon-width: 34px; --icon-rotation: 0deg; }` (con -6deg la nube quedaba al 79,6 % a 375) y `[data-color-token="rust"] { --icon-scale: 3; }`. NESTJS no se ajusta (exenta de REQ-97-18 por contraste). En ≤ 768 px se conserva `.card-icon svg { width: 110px !important; }` (a 375 px la nube y los logos ya cumplen); solo si la medida a 375 falla se sustituye por `--icon-width` por token en ese mismo bloque.
  - GITHUB ACTIONS es preexistente pero se incluye: el arreglo es el mismo (`--icon-scale` por tramo). Las cards preexistentes que no cambian (REACT, HTML, NODE JS, YOUTUBE, TYPESCRIPT, CSS) quedan fuera; si la medida muestra solape en ellas se anota como observación en el impl, sin arreglarlo. Observación fuera de alcance (medida de la ronda 2): a 800/1024 px siguen tapando su título REACT (729,9 px²), HTML (605,6), NODE JS (896), YOUTUBE (1028,5), TYPESCRIPT (1344,1), CSS (456,3) y NESTJS (871, exenta por contraste); queda para una feature futura si el humano lo pide.
- Decisión 7 (medida del icono, CDP sobre el build, en reposo sin hover y con `prefers-reduced-motion` indiferente): para cada card, caja de layout del `svg` (su `getBoundingClientRect()` con `transform: none` temporal, o `offsetLeft/Top` + 32 px de alto); el viewBox del símbolo se proyecta con `xMidYMid meet` en esa caja y luego se aplica `rotate(--icon-rotation) scale(--icon-scale)` con origen en el centro de la caja; se toma el rectángulo alineado a ejes que envuelve el cuadrilátero resultante (conservador). «Rectángulo proyectado del logo» = ese rectángulo para el viewBox completo; «nube» = lo mismo para la región 0 0 165 76 del símbolo cloudflare; «parte visible del icono» = rectángulo proyectado del logo recortado al `article`. Título = rectángulos de `Range.getClientRects()` de cada palabra de `p.card-title`. Exención de REQ-97-18: solo si TODOS los fill del símbolo (con `currentColor` = `--color-text` #fff) alcanzan 4,5:1 frente a #fff (p. ej. nestjs #E0234E 4,6); rust, github, aws y cloudflare (`currentColor`) y claude-code (#D97757, 3,12:1) no están exentos. Se registra por ancho y card: % de nube dentro, % de logo dentro, centro dentro (sí/no), área de solape con el título (px²) y `article.right <= innerWidth`. Rojo previo (REQ-97-23): a 800 px sobre el árbol actual, nube de CLOUDFLARE < 90 % dentro y solape > 0 en RUST y GITHUB ACTIONS. Capturas finales en `progress/research/hero97/` (sobrescriben las anteriores).
- Decisión 8 (test estático): un test nuevo `tests/hero-cards-icon-fit.test.mjs` (≤ 100 líneas; `tests/hero-cards-unique-tech.test.mjs` ya está a 100) comprueba REQ-97-19/20/21: reglas `[data-color-token]` dentro de `@media` solo con `--icon-width` / `--icon-rotation` / `--icon-scale`; `iconWidth` y `rotate` del JSON = regla base; `hero-section.css` sin cambios frente a HEAD; la primera regla del bloque 1200 intacta; `hero-card.css` ≤ 100 líneas. Se observa en rojo antes de editar la hoja (p. ej. con la aserción de los overrides esperados por defecto).
- Fuera de alcance: el scroll horizontal a 800 px (scrollWidth 838 / clientWidth 790) lo provoca `search.search-bar` del header (feature 93, blocked); el grid aporta 0 elementos fuera del viewport y así debe seguir (REQ-97-22).
- Decisión 5 (título ≤ 1200 px, sin tocar geometría): dentro de `@media (max-width: 1200px)` de `hero-card.css`: `.card-header { left: 14px; right: 14px; }` y `.card-title { font-size: 0.8rem; letter-spacing: 0.04em; }`. Arregla TYPESCRIPT y CLOUDFLARE a 800 px (columna ~110 px). Si la medida no cabe, bajar hasta 0,72rem; nunca `overflow-wrap: anywhere` ni partir palabras (CLAUDE CODE y GITHUB ACTIONS pueden envolver por el espacio). En ≤ 768 px se conserva `.card-title { font-size: 0.82rem }` (1 columna, cabe).
- Decisión 6 (verificación visual): Chrome headless + CDP con los scripts base de la 96; capturas del grid a 375, 800, 1024, 1280 y 1600 px en `progress/research/hero97/`, y medida por card de `getBoundingClientRect().right` de `p.card-title` ≤ el de su `article`.
- Restricciones: ≤ 100 líneas por archivo (tokens.css 99; hero-card.css hoy 88 y ≤ 100 con los ajustes por tramo), solo tokens en CSS, sin `<style>` en `.astro`, sin dependencias, cero JS de runtime.

## Alternativa descartada

- Dejar youtube-bottom/twitch-bottom como otras redes (LinkedIn, X): contradice la prioridad a tecnologías y herramientas.
- Quitar HTML/CSS para meter Bun y Claude a la vez: Claude y Claude Code repetirían marca; Bun no está en el CV.
- Partir títulos con `overflow-wrap: anywhere`: CLOUDFLA/RE es ilegible; se prefiere reducir tamaño y offsets.
