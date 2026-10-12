# Informe de implementación — feature 86 geist-pixel-display

Variante: Geist Pixel **Circle** (`GeistPixel-Circle.woff2`), elección humana 2026-10-12.

## Tests escritos (antes del código)

- `tests/geist-pixel-display.test.mjs` (nuevo) — REQ-86-01..07 y REQ-86-16 (importa `astro.config.mjs`; Layout, tokens, typography, ausencia de `font-family` sobre h1/h2/sus clases en el resto de hojas, ≤100 líneas).
- `tests/geist-font-build.test.mjs` (ampliado) — REQ-86-08 (fusionado con REQ-85-17: ahora 2 preloads, uno de ellos el de Geist Pixel y `:root{--font-geist-pixel:`) y REQ-86-09 (los bytes de Circle se emiten en `_astro/fonts/`; los de Square, Grid, Triangle y Line no).

## Rojo (REQ-86-15) — anotado ANTES de tocar astro.config.mjs, Layout.astro, tokens.css y typography.css

`node --test tests/geist-pixel-display.test.mjs tests/geist-font-build.test.mjs`:

```
✔ REQ-85-16: dist/client/_astro/fonts contiene los woff2 de Geist y Geist Mono
✔ REQ-85-18: /, /about y un artículo sin URLs absolutas en @font-face ni en preloads de fuente
✔ REQ-86-07: ninguna otra hoja declara font-family sobre h1, h2 o sus clases
✔ REQ-86-16: archivos de la feature con 100 líneas o menos
✖ failing tests:
✖ REQ-85-17/REQ-86-08: / tiene 2 preloads woff2 crossorigin en /_astro/fonts/ (Geist y Geist Pixel)
✖ REQ-86-01: Geist Pixel con fontProviders.local(), --font-geist-pixel y solo GeistPixel-Circle.woff2 400 normal
✖ REQ-86-02: Geist Pixel con display swap y fallbacks terminados en monospace
✖ REQ-86-03: Layout.astro renderiza <Font> de --font-geist-pixel con preload en el head
✖ REQ-86-04: tokens.css define --font-display sobre --font-geist-pixel y mide <= 100 líneas
✖ REQ-86-05/06: typography.css pone h1 y h2 en --font-display con font-synthesis: none
✖ REQ-86-09: _astro/fonts contiene el woff2 de Pixel Circle y ninguna otra variante Pixel
ℹ fail 7
ℹ pass 4
ℹ tests 11
```

Los 4 en verde ya en rojo son guardas (REQ-85-16/18 sin cambios; REQ-86-07: hoy ninguna hoja declara `font-family` sobre un h1/h2; REQ-86-16: longitudes). Las 7 fallas cubren todos los REQ nuevos verificables de forma estática o en el build.

## Implementación

- `astro.config.mjs` (97 líneas): tercera familia `Geist Pixel` con `fontProviders.local()`, `cssVariable: '--font-geist-pixel'`, `display: 'swap'`, `fallbacks: ['ui-monospace', 'monospace']` y una sola variante `geist-pixel/GeistPixel-Circle.woff2` (`weight: '400'`, `style: 'normal'`) (REQ-86-01/02). Las otras 4 variantes no se registran.
- `src/layouts/Layout.astro` (76 líneas): `<Font cssVariable="--font-geist-pixel" preload />` en el head, tras Geist Mono (REQ-86-03).
- `src/styles/tokens.css` (sigue en **97 líneas**): `--font-display: var(--font-geist-pixel, ui-monospace, monospace);`. Para no cambiar las 97 líneas que fijan 10 tests existentes (REQ-17-09, 26-07, 39-09, 40-11, 42-09, 77-01, 79-08, 82-14, 83-13, 84-13), se quitó la línea en blanco entre «Transición» y «Tipografía». El 99 de design.md era una estimación; REQ-86-04 solo pide ≤ 100 y REQ-86-17 pide que esos tests no cambien.
- `src/styles/typography.css` (15 líneas): `h1, h2 { font-family: var(--font-display); font-synthesis: none; }` (REQ-86-05/06), sin colores.
- `src/styles/profile-card.css`: **sin cambios**. El h1 del hero no desborda a 375 px (ver abajo), así que REQ-86-14 no se activa.
- REQ-86-07: ninguna otra hoja declara `font-family` sobre h1/h2 ni sobre sus clases. El test saca la lista de clases de los `<h1>`/`<h2>` de `src/**/*.astro`, así que incluye también `about-projects__title`, `about-credentials__title`, `about-skills__title` y `about-timeline__title`, que no estaban en la lista del acceptance.

### Ajuste de un test existente (consecuencia directa de REQ-86-08)

- `tests/geist-font-build.test.mjs`: REQ-85-17 («exactamente 1 preload») pasa a ser REQ-85-17/REQ-86-08. Ahora exige 2 preloads `font/woff2 crossorigin` en `/_astro/fonts/`, y uno de ellos tiene que coincidir con el `src` del `@font-face` de `"Geist Pixel-<hash>"`. Esos 2 preloads son los que fija el acceptance. Se añade REQ-86-09, que compara bytes: el woff2 de Circle se emite y Square, Grid, Triangle y Line no. El archivo queda en 73 líneas. No se tocó ninguna lista cerrada de tokens ni `tests/single-h1-headings.test.mjs`.

## Verificación real: Chrome headless + CDP sobre astro preview (REQ-86-10..14, 18)

Pasos: `pnpm build` → `astro preview --port 4386` → Chrome 154 headless con perfil nuevo, `Network.setCacheDisabled` y `Emulation.setDeviceMetricsOverride` (DSF 1). El script es ad hoc y vive en el scratchpad de la sesión, fuera del repo. Las páginas son `/`, `/about/`, `/search/`, `/posts/00-agilismo/` y una 404 real (`/posts/no-existe-86`, HTTP 404, «Página no encontrada»; `/no-existe-86` lo captura `[...term]` y da 200).

| página@ancho | scrollWidth / clientWidth | h1/h2 visibles en "Geist Pixel-7d2c…" | body/p/h3 en "Geist-bbea…" | CLS |
|---|---|---|---|---|
| /@1280 | 1270 / 1270 | sí (h1 51.2px, h2 28px) | sí | 0 |
| /about@1280 | 1270 / 1270 | sí (h1 52px, 6 h2 a 32px) | sí | 0 |
| /search@1280 | 1270 / 1280 | sí (h1 28px, h2 21.6px) | sí | 0 |
| artículo@1280 | 1270 / 1270 | sí (h1 57.6px, h2 28px, «Recomendados» 21.6px) | sí | 0 |
| 404@1280 | 1270 / 1280 | sí (h1 28px) | sí | 0 |
| /@375 | 375 / 375 | sí (h1 32px, h2 28px) | sí | 0 |
| /about@375 | 375 / 375 | sí (h1 32px, h2 24px) | sí | 0 |
| /search@375 | 375 / 375 | sí | sí | 0 |
| artículo@375 | 375 / 375 | sí (h1 35.2px, h2 22.4px, «Recomendados» 21.6px) | sí | 0 |
| 404@375 | 375 / 375 | sí | sí | 0 |

- REQ-86-10/11: en las 10 combinaciones, el `font-family` computado de cada h1/h2 visible empieza por `"Geist Pixel-7d2ccea19c8c15a9"`. Astro añade un hash al nombre de cada familia, igual que en la 85. El de body, los p y los h3 empieza por `Geist-bbea48628ea22a68`, nunca por Pixel ni por Mono. `font-weight` computado: 700/800. Con `font-synthesis: none` no se sintetiza negrita. `document.fonts.check('16px "Geist Pixel"')` da true. Ese nombre genérico no coincide con ninguna cara, así que el true por sí solo no demuestra nada. La prueba que cuenta es `check('16px "Geist Pixel-7d2ccea19c8c15a9"')`, que también da true, y que la cara de Pixel está en `status: "loaded"` en todas las páginas.
- REQ-86-12: no hay desborde horizontal en ninguna combinación. A 1280, `/search` y la 404 dan scrollWidth 1270 < clientWidth 1280 (no ===). Son páginas cortas y la diferencia de 10 px es el `scrollbar-gutter: stable` de `layout.css` (preexistente, no depende de la fuente). No hay contenido más ancho que el viewport.
- REQ-86-13: CLS acumulado de `/` a 1280×800 con caché vacía (perfil nuevo + `Network.clearBrowserCache` + `setCacheDisabled`, PerformanceObserver `layout-shift` con buffered) = **0** (≤ 0,1).
- REQ-86-14, riesgo del h1 del hero a 375 px **medido**: font-size 32px (regla móvil de 2rem), letter-spacing -2px, 2 líneas («Moisés Baldenegro / Melendez»). `h1.scrollWidth` 306 = `clientWidth` 306; borde derecho a 341 px frente a 365 px del contenedor. Sobran 24 px y no hay desborde. A 1280: 51.2px, 2 líneas, 437 = 437. **No hace falta ningún ajuste** en `profile-card.css`.

## Capturas (REQ-86-15, REQ-86-18) — `progress/research/geist86/`

- Página completa: `geist86-home-1280.png`, `geist86-home-375.png`, `geist86-post-1280.png`, `geist86-post-375.png`.
- `.post__content h2` (el que nombra REQ-86-18) a 1x, más una ampliación 2x para comparar con pantallas retina: `geist86-h2-1280.png` (28px), `geist86-h2-375.png` (22.4px), `geist86-h2-1280-2x.png`, `geist86-h2-375-2x.png`.
- **Nota:** a 375 el `.post__content h2` no mide 1,35rem sino **1,4rem = 22.4px**, porque `post-readability.css` sobrescribe el 1.35rem de `post.css`. Los h2 más pequeños del sitio son en realidad «Recomendados» (`.post__related-title`) y «Buscar en el catálogo», a **1,35rem = 21.6px** en ambos anchos. Por eso también se capturan: `geist86-h2min-1280.png`, `geist86-h2min-375.png`, `geist86-h2min-1280-2x.png`, `geist86-h2min-375-2x.png`.
- Lo que se ve, para que lo juzgue el humano: a 1x, entre 21.6 y 28px, la textura de puntos de Circle no se distingue. El título se ve como un trazo fino y más claro que el cuerpo en Sans, con aire de monoespaciada. Se lee bien, pero no transmite peso de título. La previsión de design.md (Decisión 1) se cumple. En las capturas 2x el efecto de puntos ya asoma. En el h1 del hero (51px) y en el del artículo (57.6px) a 1280 la estética Circle sí se aprecia.

## Verde

`node --test tests/geist-pixel-display.test.mjs tests/geist-font-build.test.mjs tests/geist-font-base.test.mjs`: **19 pass, 0 fail**. Pasan todos los REQ-85-* y REQ-86-01/02/03/04/05/06/07/08/09/16.

`./init.sh`:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Incidencias

- Durante esta sesión (14:17:21) se creó el commit `19df78f` («feat: Implement feature 85 …»). Este agente no lo hizo. Incluye el trabajo en curso de la 86 de ese momento: tests nuevos, `progress/impl_86.md` en rojo y los cambios de astro.config.mjs, Layout, tokens y typography. Lo único sin commitear es `progress/research/geist86/` y los cambios posteriores a ese instante.
- Al cerrar la verificación se ejecutó `taskkill /F /IM chrome.exe` para terminar el Chrome headless. Ese comando cierra **todas** las instancias de Chrome del equipo, también un Chrome abierto del usuario si lo había. Error del implementador; para la próxima vez basta con `proc.kill()` del script, que ya lo cerraba.
