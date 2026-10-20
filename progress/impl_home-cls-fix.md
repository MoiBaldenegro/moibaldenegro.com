# Implementación — feature 104 home-cls-fix

Implementer, 2026-10-19/20. Spec: specs/104_home-cls-fix/requirements.md (REQ-104-01..19) y design.md.
Análisis: progress/research/home-cls-fix.md. Datos: progress/research/cls104/ (before/, prototype/, after/, scripts/).

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/styles/latest-horizontal-reserve.css` (nuevo, 43 líneas) | Una única `@media (min-width: 1201px) and (prefers-reduced-motion: no-preference) and (scripting: enabled)`. Todos los selectores con `.latest-articles:not(.latest-articles--horizontal):has(> .latest-articles__list > .latest-articles__card:nth-child(3))`. Copia el layout de latest-horizontal.css (las dos custom properties con texto idéntico; sección `width: 100%; min-height: 100vh; overflow: clip`; encabezado; track en flex con gap; card; margen de la primera). Sin sticky, will-change, opacity, transform ni colores. Recorrido: `:has(> ... :nth-child(3):last-child) { margin-bottom: calc((3 - 2) * (var(--latest-card-width) + var(--gap-card))) }` (una regla por n entre 3 y LATEST_POSTS_LIMIT = 3). |
| `src/components/latest-horizontal/latest-horizontal.astro` (13 líneas) | Un import más: `../../styles/latest-horizontal-reserve.css`. Sigue con un único `<script>`. |
| `tests/home-cls-fix.test.mjs` (nuevo, 99 líneas) | 10 tests estáticos: REQ-104-01..07, 15, 16 y 19. |
| `progress/research/cls104/scripts/checks.mjs` (nuevo) | Medición CDP de REQ-104-11/12/13/14 (`checks-<label>.json`). |
| `progress/research/cls104/scripts/rv96/` (copia) | lib, main, rest, r2 y r6 del reviewer de la 96 (scratchpad rv96/). Solo cambian BASE (env, por defecto :4360) y el dir de perfiles (env PROF). Más `r49-50.mjs` nuevo: REQ-96-49/50 con rueda hasta la y exacta. |

No se tocaron (REQ-104-15, `git diff --quiet HEAD` = 0): latest-articles.css, latest-horizontal.css,
latest-cards-motion.css, latest-articles.astro, src/domain/latest-horizontal.ts ni ningún .ts de
src/components/latest-horizontal/. Ajenos sin tocar: public/assets/svg/sprite.svg,
src/content/posts/systems-design/*.md, tests/hack-the-box-sprite.test.mjs. REQ-104-16 ya lo había hecho
el spec_author (línea REQ-96-51 y nota «Ajuste de texto feature 104» en la cabecera); el test lo cubre.
Sin JS nuevo ni dependencias.

## Ciclo rojo / verde

### Rojo (REQ-104-18): test escrito antes de crear la hoja y el import

`node --test --test-reporter=tap tests/home-cls-fix.test.mjs`:

```
not ok 1 - REQ-104-01: latest-horizontal.astro importa la hoja de reserva y conserva un único script
  error: 'latest-horizontal-reserve.css'
not ok 2 - REQ-104-02: todas las reglas dentro de una única @media de escritorio con scripting
  error: 'falta src/styles/latest-horizontal-reserve.css'
not ok 3 - REQ-104-03: ...                     error: 'falta src/styles/latest-horizontal-reserve.css'
not ok 4 - REQ-104-04: ...                     error: 'falta src/styles/latest-horizontal-reserve.css'
not ok 5 - REQ-104-05: ...                     error: 'falta src/styles/latest-horizontal-reserve.css'
not ok 6 - REQ-104-06: ...                     error: 'falta src/styles/latest-horizontal-reserve.css'
not ok 7 - REQ-104-07: ...                     error: 'falta src/styles/latest-horizontal-reserve.css'
ok 8 - REQ-104-15: congelados sin cambios frente a HEAD
ok 9 - REQ-104-16: REQ-96-51 decide con trigger.progress y la cabecera anota el ajuste de la 104
not ok 10 - REQ-104-19: archivos nuevos o tocados en 100 líneas o menos
  error: 'falta src/styles/latest-horizontal-reserve.css'
# tests 10
# pass 2
# fail 8
```

(8 y 9 pasan desde el principio: guardan que los congelados no cambien y el texto que ya corrigió el spec_author.)

### Verde

- `node --test tests/home-cls-fix.test.mjs`: 10/10 pass. La primera pasada en verde falló solo REQ-104-19
  porque el test tenía 103 líneas; lo compacté a 99 sin cambiar ninguna aserción.
- Suite completa `node --test "tests/**/*.test.mjs"`: `# tests 1085 / # pass 1085 / # fail 0`.
- `./init.sh`: exit 0, «El entorno está perfecto»: formato OK, tests al 100 %, build OK. Lo ejecuté dos
  veces, después de implementar y al cierre, tras restaurar el árbol del build de referencia.

## Verificación Chrome headless + CDP

Build de producción y `astro preview --port 4360` propio, ya parado. El `pnpm dev` de :4321 (pid 34400)
no se tocó. Perfiles de Chrome en el scratchpad. El CSS compilado
(dist/client/_astro/index.*.css) conserva `@media (width>=1201px) and (prefers-reduced-motion:no-preference) and (scripting:enabled)`
y el `:has()`.

### REQ-104-09/10: CLS (observer layout-shift buffered, suma de 3 s sin hadRecentInput)

| Viewport | Caso | Antes (before/, spec_author) | Antes (re-medido, before/rerun-104*) | Después (after/ + repeat-2 + repeat-3) |
|----------|------|-----:|-----:|-----:|
| 1280×800 | carga limpia | 0 | 0 / 0 | 0 / 0 / 0 |
| 1280×800 | recarga al fondo (y 2275) | **0,4837** | 0 / **0,4837** | 0 / 0 / 0 |
| 1280×800 | recarga a mitad del tramo (y 1510) | 0 | 0 / 0 | 0 / 0 / 0 |
| 1280×800 | history.back al fondo | **0,4837** | **0,4837** / **0,4837** | 0 / 0 / 0 |
| 1280×800 | history.back a mitad | 0 | 0 / 0 | 0 / 0 / 0 |
| 1600×900 | carga limpia | 0 | 0 | 0 / 0 / 0 |
| 1600×900 | recarga al fondo (y 2401) | **0,4074** | **0,4074** | 0 / 0 / 0 |
| 1600×900 | recarga a mitad del tramo (y 1584) | 0 | 0 | 0 / 0 / 0 |
| 1600×900 | history.back al fondo | **0,4074** | **0,4074** | 0 / 0 / 0 |
| 1600×900 | history.back a mitad | 0 | 0 | 0 / 0 / 0 |

Después: 0 entradas layout-shift en los 10 casos de las 3 pasadas, scrollY conservado en todos y 0 errores
de consola. Antes, una de las dos recargas al fondo a 1280 dio 0: el shift depende de que se pinte un
frame antes de init(). Datos: after/cls-*.json, after/repeat-{2,3}/, before/rerun-104{,b}/. Capturas: after/*.png.

### REQ-104-08: traza por frame (rAF inyectado antes del parseo, recarga al fondo; after/trace-*.json)

| Viewport | Frames sin envoltorio: docH / top del footer | Frames con envoltorio: docH / top del footer | Diferencia |
|----------|------|------|-----|
| 1280×800 | 2 frames: 3075 / 410 (antes: 4532 / 1867) | 111 frames: 3075 / 410 | 0 px |
| 1600×900 | 2 frames: 3301 / 531 (antes: 4957 / 2187) | 111 frames: 3301 / 531 | 0 px |

### REQ-104-11 a 14 (scripts/checks.mjs; after/checks-after.json y before/checks-before.json)

- REQ-104-11, carga limpia recorriendo la portada de arriba abajo en 21 pasos: CLS 0 y 0 entradas a 375,
  768, 1024, 1280 y 1600 px.
- REQ-104-12, sin JS (`Emulation.setScriptExecutionDisabled`): a 1280×800 el documento mide 4532 px, la
  sección queda en [32, 1205, 1207, 2867] con la lista en grid (apilado), sin clase horizontal ni envoltorio
  y con margin-bottom 0. A 1600×900 mide 4957. Coincide con el árbol de partida.
- REQ-104-13: coincide con el árbol de partida en docH y en la caja de la sección:
  375 → 6667 y [9, 3822, 347, 1791]; 1024 → 4255 y [25, 1318, 963, 2457]; 1280 con reduced motion →
  4532 y [32, 1205, 1207, 2867]. En los tres, la lista en grid y margin-bottom 0.
  El árbol de partida es el árbol de trabajo sin el import nuevo. Para medirlo quité el import a mano, hice
  el build, medí y restauré el archivo desde la copia. Después volví a hacer el build y a pasar ./init.sh.
- REQ-104-14: tras init a 1280×800, el margin-bottom computado de la sección es 0px y el envoltorio mide
  1410 = 800 (sección) + 610 ((3 − 2) × (596 + 14)).

### REQ-104-17: mediciones de la 96 repetidas con el cambio (after/rv96/)

| REQ | Resultado |
|-----|-----------|
| 96-43 | 3 cards y 3 posts en el footer a 375, 768, 1024 y 1280; 0 posiciones con scroll horizontal (15 muestras por ancho). |
| 96-45 | `.latest-articles--horizontal-pin` presente a 1280. Entrada lateral: antes de llegar las cards están en tx 72/60/78 con opacity 0; a 150 ms están a mitad del tween; al segundo, 0/1. Final del tramo (y 1815): las cards 2 y 3 en 32-628 y 642-1238 dentro de la sección 0-1270, con opacity 1. Salida: tx −60 y opacity 0 al llegar al fondo. Regreso: 0/1. |
| 96-46 | Con reduced motion a 375 y 1280: 33 de 33 muestras sin style, con transform none y opacity 1. 0 ScrollTrigger y sin envoltorio. |
| 96-47 | CLS 0 al recorrer la portada a 375, 768, 1024 y 1280. Ida y vuelta con el ClientRouter (2 rondas, más la de r6, 3 en total): ScrollTrigger 5→0→5→0→5 a 1280 y 3→0→3→0→3 a 375. Card enfocada con Tab: opacity 1. 0 errores de consola. |
| 96-49 | Rueda real desde carga limpia hasta y 1815: margen derecho de la card 3 = 31,75 = left del título (r49-50.json). |
| 96-50 | Recarga al fondo y history.back al fondo, ambas en y0 2275; luego rueda hasta 1205: left de la card 1 = 31,75 = left del título, opacity 1, en los dos casos. |
| 96-52 | r6: recarga y history.back coinciden con la rueda (±2 px, ±0,05) en y 1510, 1815, 2000, 2280 y 2295 a 1280 y en 3 posiciones a 375. El activeOk = false en 1510 es el mismo valor que dio el reviewer de la 96: tx ±8,88 es la x de borde de la 76, no un xPercent. Clic en la card 3 al final del tramo y vuelta: ok. |

Errores de consola: 0 en todos los scripts (main, rest, r2, r6, r49-50, run, trace y checks).
r2.mjs, que se conserva tal cual, para la rueda a 20 px del objetivo (1800 / 1215). Sus cifras son las
mismas que obtuvo el reviewer de la 96, y por eso REQ-96-49/50 se mide con la y exacta en r49-50.mjs.

## Notas

- Riesgo residual aceptado en el análisis (§5): si el JS está habilitado pero el módulo falla, la sección
  queda en fila con el hueco del recorrido en vez de apilada.
- Con más cards, si LATEST_POSTS_LIMIT crece, REQ-104-06 falla mientras falte la regla del nuevo n.
- No hay commits. Quedan servidores parados: solo sigue :4321 (ajeno).
