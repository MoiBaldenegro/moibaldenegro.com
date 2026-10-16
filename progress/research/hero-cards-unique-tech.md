# Análisis — Cards del hero sin tecnologías repetidas (feature 97 hero-cards-unique-tech)

Petición humana 2026-10-15 (literal): «Metimos en el sprite svg nuevos logos, ahora mismo tenemos cards que están repetidas porque no teníamos los demás SVG, actualiza cards con los nuevos svg que metimos para que no haya cards con tecnologías repetidas y no me molestaría que quitaras algunos de redes sociales ahí la verdad y darle prioridad a tecnologías y herramientas, en temas de estas cards en el hero».

## Qué es

Cambio de contenido del bento del hero: 12 cards de icono + 1 htb. Hoy se repiten NODE JS (node / node-bottom), GITHUB ACTIONS (github / github-bottom), YOUTUBE (youtube / youtube-bottom) y TWITCH (twitch / twitch-bottom). El sprite ya trae nestjs, aws, cloudflare, rust, claude, bun y claude-code, que hoy no tienen card.

## Estado verificado en disco

- `src/data/hero-cards.json`: 13 entradas (12 icono + htb), en el orden del grid.
- `src/styles/hero-card.css` (85 líneas): una regla `[data-color-token="<token>"]` por card con `--card-bg`, celda (`--card-column` / `--card-row`), `--icon-width` y `--icon-rotation`. La geometría vive en el CSS, no solo en el JSON.
- `src/styles/tokens.css`: **99 líneas** (REQ-02-01 exige ≤ 100). Hay 12 tokens `--color-marca-*` de icono + 2 de htb.
- Sprite: los iconos con relleno fijo son nestjs (`#E0234E`), claude-code (`#D97757`) y el cloud de cloudflare (`#f6821f` / `#fbad41`). aws, rust y el wordmark de cloudflare usan `currentColor` (blanco, heredado de `--color-text`). El patrón actual es: fondo = tono oscuro de la marca e icono con el color de marca (p. ej. TS `#3178C6` sobre `#215BC7`).
- CV (`src/data/about.json`): Node.js, TypeScript, Rust, NestJS, AWS, Cloudflare Workers/Pages, React, GitHub y CI/CD. Bun, Claude Code, HTML y CSS no figuran como skill. YouTube aloja el «Curso de Rust desde Cero» (proyectos).

## Selección (12 celdas de icono)

Candidatas únicas: react, html, node, github, youtube, typescript, css, nestjs, aws, cloudflare, rust, claude-code, bun = 13 para 12 celdas.

- Twitch sale del todo (las 2 celdas).
- Quedan las 7 celdas sin duplicado: react, html, node, github (GITHUB ACTIONS), youtube, typescript, css.
- Las 5 celdas libres (twitch, node-bottom, github-bottom, youtube-bottom, twitch-bottom) pasan a rust, aws, claude-code, nestjs y cloudflare.
- **Bun se queda fuera** (no está en el CV y es la candidata nº 13). HTML y CSS se conservan porque, con YouTube dentro, no sobra ninguna tecnología del CV sin celda.
- **Valor por defecto revisable: YouTube se queda** (única red social, por el curso de Rust). Si el humano lo prefiere, su celda (6 / span 5 x 5 / span 2) pasaría a Bun o a otra; es un cambio de una entrada del JSON, una regla CSS y un token.

## Asignación de celdas (criterio)

- Títulos largos en celdas anchas: CLOUDFLARE en 1 / span 8 (además el logo es un wordmark de 512x76), CLAUDE CODE en 7 / span 4.
- Títulos cortos en celdas de 2 columnas: RUST, AWS, NESTJS.
- Vecindad de color: AWS (navy) en 5 / span 2 fila 7 para no tocarse con github (navy, filas 3-4) ni con htb (navy, filas 9-10); NESTJS (carmesí) en 11 / span 2 fila 7, encima de htb; RUST en 11 / span 2 fila 5.

## Contraste (WCAG AA, texto blanco 0,95rem bold → 4,5:1)

| Token | Hex | Blanco | Icono |
|-------|-----|--------|-------|
| `--color-marca-rust` | `#A33A16` | 6,62 | blanco (currentColor) |
| `--color-marca-nestjs` | `#A3132F` | 7,80 | `#E0234E` 1,68 (decorativo, como TS 1,37) |
| `--color-marca-claude-code` | `#5C2A1C` | 11,65 | `#D97757` 3,73 |
| `--color-marca-aws` | `#232F3E` | 13,57 | blanco + sonrisa `#FF9900` 6,34 |
| `--color-marca-cloudflare` | `#A8470C` | 5,88 | blanco + nube `#F6821F` 2,28 |

## Qué toca

- Datos: `src/data/hero-cards.json` (5 entradas cambian id, title, colorToken, icon, rotate, iconWidth; gridColumn/gridRow intactos).
- Estilos: `src/styles/hero-card.css` (5 reglas renombradas con la misma celda; ajuste del título en ≤ 1200 px), `src/styles/tokens.css` (5 tokens fuera, 5 dentro: el recuento de líneas no cambia, 99).
- Tests con nota (precedente REQ-43-06): `tests/hero-cards-repository.test.mjs` (lista esperada), `tests/hero-cards-styles.test.mjs` (CARD_TOKENS), `tests/design-tokens.test.mjs` (hex de twitch, *-bottom), `tests/htb-hero-card.test.mjs` (REQ-92-01 «tras twitch-bottom» → tras cloudflare). Los recuentos 13 / 12 no cambian.
- No toca: componentes `.astro`, el registro de kinds, la celda htb, el sprite.

## Riesgos y trabas

- **Desborde del título en 769-1200 px**: el grid pasa a 6 columnas y cada card ocupa 1 (`grid-column: auto !important`), ~110 px de ancho a 800 px; TYPESCRIPT ya se salía y CLOUDFLARE (10 letras) se saldría igual. Propuesta: en `@media (max-width: 1200px)` acercar el header (left/right 14 px) y bajar el título a ~0,8rem con letter-spacing 0,04em, sin partir palabras. No cambia la geometría.
- Escala 5 del icono: el wordmark de cloudflare escalado se recorta mucho; el implementer ajusta iconWidth/rotate según la captura.
- tokens.css a 99 líneas: el intercambio 5 por 5 mantiene el recuento; prohibido añadir líneas de comentario.
- Verificación visual: Chrome headless + CDP con los scripts base de la 96 (scratchpad de la sesión), capturas en `progress/research/hero97/`.

## Revisión 2026-10-15 (desbloqueo tras el implementer)

- **Bloqueo resuelto (opción 1 del líder)**: `tests/home-latest-articles-five.test.mjs:59-61` (REQ-95-08) y `tests/latest-cards-gsap-motion.test.mjs:96` (REQ-96-39/40/42) congelan `src/styles/tokens.css` frente a HEAD. REQ-97-13 se amplía: quitar `'src/styles/tokens.css'` de las dos listas con la nota «Ajuste feature 97 (precedente REQ-43-06)». `latest-cards-gsap-motion.test.mjs` está a 100 líneas: la nota va en la misma línea. Hasta que el implementer haga ese ajuste, `./init.sh` sigue en rojo solo por esos 2 tests.
- **Calidad visual (geometría medida en hero-card.css / hero-section.css)**: el `svg` mide `--icon-width` x 32 px, anclado a `right: 4px; bottom: 32px`, con `rotate(..) scale(5)` desde el centro. En 769-1200 px el grid tiene 6 columnas y filas de 140 px, y cada card ocupa una celda (108-149 px de ancho). Consecuencias:
  - Un logo cuadrado se ve a 160 px y su borde superior queda a ~12 px, encima del título (18-34 px, o 18-49 px si envuelve como GITHUB ACTIONS). `--icon-width` solo lo mueve en horizontal, así que no basta: hace falta `--icon-scale` por tramo (rust 3 y github 2,5 a 0deg por defecto).
  - Cloudflare (viewBox 512x76): la nube ocupa la región 0 0 165 76 (paths `#F6821F` / `#FBAD41`), es decir, el 32 % izquierdo. Entra entera si `3 x --icon-width <= ancho de la card - 4`, y eso da 34 px por defecto en ≤ 1200 px. Esto confirma el «~36 px» del implementer. El valor va por tramo en CSS, no en el JSON: el JSON (90-200) sigue describiendo ≥ 1201 px.
  - Exención de solape por contraste: solo nestjs (`#E0234E`, 4,6:1 frente a #fff). rust y aws (`currentColor`), github (`#fff`) y claude-code (`#D97757`, 3,73) no están exentos.
  - `tests/htb-hero-card.test.mjs:119` exige que la primera regla de `@media (max-width: 1200px)` siga siendo `.hero-card { grid-column: auto !important; ...`. Por eso los ajustes van detrás.
  - En ≤ 768 px, `.card-icon svg { width: 110px !important; }` anula `--icon-width`. A 375 px ya cumple, según la medida del implementer, así que se conserva.
- **GITHUB ACTIONS** es preexistente, pero se incluye porque el arreglo es el mismo. Las otras cards preexistentes (react, html, node, youtube, typescript, css) quedan como observación.
- **Fuera de alcance**: el scroll horizontal a 800 px (838/790) lo provoca `search.search-bar` del header, feature 93 (blocked). El grid aporta 0 desbordes (REQ-97-22).
- Valores por defecto revisables (humano): cloudflare `--icon-width: 34px`; rust `--icon-scale: 3`; github `--icon-scale: 2.5; --icon-rotation: 0deg` (todos en ≤ 1200 px).
- Spec: REQ-97-13 ampliado, REQ-97-16 a REQ-97-23 nuevos y Decisiones 4, 7 y 8 de design.md. Test estático nuevo `tests/hero-cards-icon-fit.test.mjs`.

## Revisión ronda 2 2026-10-15 (desbloqueo de REQ-97-16 a 1280/1600)

- **Bloqueo** (progress/impl_hero-cards-unique-tech.md, «Ronda 2»): a ≥ 1201 px no hay `@media` y manda la regla base de cloudflare (170px / -6deg, scale 5, card de 204 px de alto). La nube queda al 62,3 % dentro (< 90).
- **Decisión del líder (opción 1 del implementer)**: la fila cloudflare de la tabla de design.md pasa a **iconWidth 140px y rotate 0**, que da ~96 % según el cálculo del implementer. Es un valor por defecto técnico, revisable, dentro del rango de partida 90-200px / -12..0. El implementer cambia en `src/data/hero-cards.json` (iconWidth/rotate), la regla base `[data-color-token="cloudflare"]` de `hero-card.css` y la fila cloudflare de `tests/hero-cards-repository.test.mjs`, con la nota «Ajuste feature 97 ronda 2». REQ-97-20 no da cifras y no cambia. `tests/hero-cards-icon-fit.test.mjs` compara el JSON con la base de forma dinámica, y `tests/hero-cards-unique-tech.test.mjs` no fija iconWidth/rotate.
- **Valores por defecto revisables en ≤ 1200 px** (los fijó la medida): github 110px / scale 2 / 0deg; aws scale 3; claude-code scale 2; cloudflare 34px / 0deg; rust scale 3.
- **Corrección**: #D97757 (icono de claude-code) da 3,12:1 frente a #fff, no 3,73. Sigue sin estar exento de REQ-97-18.
- **Observación fuera de alcance**: a 800/1024 siguen tapando su título REACT, HTML, NODE JS, YOUTUBE, TYPESCRIPT, CSS y NESTJS (esta última exenta por contraste).
