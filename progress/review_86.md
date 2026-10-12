# Review — feature 86

**Veredicto:** APPROVED

Alcance: working tree + HEAD (19df78f incluye parte de la 86 bajo el mensaje de la 85; se evalúa el estado, no el historial). La feature 87 no forma parte de esta revisión.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x] La regla `h1, h2` vive en `src/styles/typography.css:11-15`; `Layout.astro:42` solo añade `<Font cssVariable="--font-geist-pixel" preload />`.
- C2 (sin lógica en UI / frontmatter solo imports): [x] El frontmatter de Layout.astro no cambia.
- C3 (tokens, sin valores sueltos): [x] `--font-display: var(--font-geist-pixel, ui-monospace, monospace)` en `tokens.css:96`; typography.css solo usa `var(--font-display)`. No se toca `profile-card.css`.
- C4 (≤ 100 líneas): [x] astro.config.mjs 97, Layout.astro 76, tokens.css 97, typography.css 15, tests/geist-pixel-display.test.mjs 87, tests/geist-font-build.test.mjs 73.
- C5 (sin dependencias nuevas): [x] Usa el paquete `geist` que se aprobó en la 85.
- C6 (`./init.sh` en verde): [x] Ejecutado por el reviewer: formato, tests al 100 % y build OK.
- C7 (test-first): [x] `progress/impl_86.md` registra el rojo (7 fallos, 4 guardas en verde) antes de modificar astro.config.mjs, Layout, tokens y typography (REQ-86-15), y después el verde (19/19 + init.sh).
- C8 (depends_on en done): [x] La 85 está en `done`.
- C9 (coherencia acceptance ↔ REQ): [x] Los 6 bloques de acceptance cubren REQ-86-01..18 según el índice de requirements.md.
- C10 (página correcta en desktop y móvil): [x] Lo respaldan la medición CDP del implementer y las capturas revisadas (ver observaciones).

## Verificaciones específicas
- Solo Circle en el build (REQ-86-09): [x] `dist/client/_astro/fonts/` tiene 4 woff2. `2cb6375e204d294f.woff2` (28 044 B) coincide byte a byte con `GeistPixel-Circle.woff2`. Ninguno coincide con Square, Grid, Triangle ni Line (comparado con `cmp` contra `node_modules/geist/dist/fonts/geist-pixel/`). Los otros 3 son Geist Sans normal/italic y Geist Mono, de la 85.
- Preload (REQ-86-08): [x] `dist/client/index.html` tiene exactamente 2 `<link rel="preload" as="font" type="font/woff2" crossorigin>` en `/_astro/fonts/`: `3ef2e4…` (Geist) y `2cb6375e…` (Pixel Circle).
- Fallbacks/CLS (REQ-86-02/13): [x] `fallbacks: ['ui-monospace', 'monospace']` y `display: 'swap'` en `astro.config.mjs:36-37`. El CLS medido en / a 1280 con caché vacía es 0.
- h1 del hero a 375 px (REQ-86-14): [x] Medido: 32 px, 2 líneas, `scrollWidth 306 === clientWidth 306`, quedan 24 px de margen. No hace falta ajuste, así que REQ-86-14 no se activa.
- Capturas REQ-86-15/18: [x] Existen en `progress/research/geist86/`: home y post a 1280/375, `.post__content h2` a 1280/375 (1x y 2x) y el h2 más pequeño real («Recomendados», 21.6 px) a 1280/375 (1x y 2x).
- `tests/single-h1-headings.test.mjs` y las listas cerradas de tokens (REQ-86-17): [x] No aparecen en el diff de `19df78f~1` ni en el working tree. El único test existente que cambia es REQ-85-17 (1 a 2 preloads). Es consecuencia directa de REQ-86-08 y lo fija el acceptance.

## Duda del líder: «Últimos artículos» vacía en geist86-home-1280.png
No es una regresión, es el estado inicial de la animación de entrada de la feature 75:
- El HTML construido de / contiene la sección completa: `latest-articles__list`, 3 `latest-articles__card` con imagen, meta, tags y descripción.
- `src/components/latest-horizontal/latest-horizontal.ts:65-72` hace `gsap.fromTo(track, { opacity: entranceState(0, h).opacity … })` con scrub ligado al scroll (`start: 'top bottom'`, `end: 'top top'`). `src/domain/latest-entrance.ts:28` da `opacity = 1 - rest`, que vale 0 con progreso 0. La captura de página completa se toma con scrollY 0, así que el track está transparente.
- La 86 no toca ningún archivo de `src/components/latest-horizontal/`, `src/domain/latest-entrance.ts` ni las hojas de las cards: el diff de src/ desde `19df78f~1` solo incluye Layout.astro, tokens.css y typography.css. El último commit en esos archivos es el de la 76 (96339b2).

## Observaciones (no bloquean)
1. REQ-86-12 dice literalmente `scrollWidth === clientWidth`. En /search y la 404 a 1280 se mide 1270 / 1280: es menor y no hay desborde. La diferencia viene de `scrollbar-gutter: stable` de `layout.css`, que ya existía y no depende de la fuente. La intención del REQ (sin desborde horizontal) se cumple. Se recomienda que el spec_author redacte en adelante esta condición como `scrollWidth <= clientWidth`.
2. tokens.css se queda en 97 líneas (design.md estimaba 99) porque se quitó una línea en blanco para no alterar los 10 tests que fijan esa longitud. Cumple REQ-86-04 (≤ 100) y REQ-86-17.
3. Legibilidad de Circle en h2 de 21.6-28 px a 1x: se ve como un trazo fino y más claro, tal como preveía design.md (Decisión 1). Las capturas ya están para que decida el humano. Si quiere otro resultado, sería una feature posterior (subir el tamaño de los h2 o limitar Pixel a h1).
4. Incidencia de proceso: el implementer documenta que ejecutó `taskkill /F /IM chrome.exe`, que cierra todas las instancias de Chrome del usuario. No afecta al código. Para próximas verificaciones se debe cerrar solo el proceso lanzado (`proc.kill()`).

## Cambios requeridos (si aplica)
Ninguno.
