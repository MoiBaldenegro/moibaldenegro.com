# Análisis — CLS de la portada al restaurar el scroll al fondo (feature 104 home-cls-fix)

Autor: spec_author, 2026-10-19. Origen: pendientes (c) y (d) de progress/current.md y encargo humano
2026-10-16 («Has todo lo que tengas pendiente de una vez»). Datos, capturas y scripts en
progress/research/cls104/.

## 1. Problema

Al recargar la portada en escritorio (>= 1201 px, sin reduced motion) con el scroll restaurado al fondo,
o al volver a ella con history.back desde un artículo, Chrome registra un layout shift de ~0,48 (por
encima del umbral «bueno» de 0,1). Lo detectó el implementer de la 95 (0,508) y el reviewer de la 96
lo confirmó preexistente (0,5125 en su secuencia encadenada). Alcance: solo el modo horizontal de
«Últimos artículos» (features 72/73/75/76/96). Fuera de alcance: el apilado (<= 1200 px), reduced
motion y el comportamiento de las cards de la 96.

## 2. Medición actual (HEAD + árbol de trabajo, build de ./init.sh, pnpm preview)

Chrome headless + CDP, PerformanceObserver layout-shift con buffered: true y desglose de sources
(cls104/scripts/lib.mjs y cls104/scripts/run.mjs; traza en cls104/scripts/trace.mjs). Valor = suma de entradas sin hadRecentInput tras 3 s.

| Viewport | carga limpia | recarga al fondo | recarga a mitad del tramo | back al fondo | back a mitad |
|----------|-------------:|-----------------:|--------------------------:|--------------:|-------------:|
| 1280×800 | 0 | **0,4837** | 0 | **0,4837** | 0 |
| 1600×900 | 0 | **0,4074** | 0 | **0,4074** | 0 |

Fondo = scroll máximo (2275 a 1280; 2401 a 1600). Mitad del tramo = start + len/2 del envoltorio
(1510 a 1280; 1584 a 1600). 0 errores de consola en todas las pasadas. Datos:
cls104/before/cls-1280x800.json y cls-1600x900.json.

Desglose: una única entrada por caso, con una sola source: footer.site-footer, previousRect vacío
[0,0,0,0] (fuera del viewport) y currentRect [0,410,1270,389] a 1280 ([0,531,1590,369] a 1600). Es
decir, el footer entra de golpe en el viewport.

## 3. Causa raíz (traza por frame, cls104/before/trace-*.json)

1. El ClientRouter de Astro pone history.scrollRestoration = 'manual' y en la carga hace
   window.scrollTo(history.state.scrollY) (t ≈ 2-6 ms, client.*.js) sobre el documento tal como llega
   del servidor: el layout APILADO, porque el modo horizontal solo existe cuando latest-horizontal.ts
   añade la clase .latest-articles--horizontal y el envoltorio (tras astro:page-load).
2. Se pintan uno o dos frames así (t ≈ 9-14 ms): documento de 4532 px (1280) / 4957 px (1600), footer
   en top 1867 / 2187, por debajo del viewport.
3. init() (t ≈ 21-28 ms) crea el envoltorio y la clase: el documento pasa a 3075 / 3301 px. El scrollY
   (2275 / 2401) no cambia (restoreScroll y los scrollTo de ScrollTrigger.refresh lo reponen), así que
   el footer sube a top 410 / 531 dentro del viewport: layout shift de ~0,48 / ~0,41.
4. history.back: el ClientRouter hace el swap, restaura scrollY sobre el DOM nuevo (apilado), pinta y
   luego dispara astro:page-load → init(): misma secuencia y mismo valor.

A mitad del tramo no hay shift contable (el contenido visible es la propia sección), pero sí hay un
frame del layout apilado: el arreglo también lo elimina. No es el pin-spacer de ScrollTrigger (la 73
quitó el pin; el envoltorio es propio), ni ScrollTrigger.refresh, ni la 96 (la 96 no cambia alturas).
Sin JS (scripting desactivado) el documento queda en 4532 px apilado y sin shift (comportamiento
correcto que se conserva).

## 4. Arreglo propuesto (sin dependencias, sin JS nuevo)

Reservar el layout horizontal desde el primer pintado con CSS, solo cuando el JS va a aplicarlo:
hoja nueva src/styles/latest-horizontal-reserve.css, importada por latest-horizontal.astro, con
`@media (min-width: 1201px) and (prefers-reduced-motion: no-preference) and (scripting: enabled)`
(misma consulta que DESKTOP de latest-horizontal.ts más scripting; precedente: el menú móvil de la 93
ya usa `(scripting: enabled)`) y selector `.latest-articles:not(.latest-articles--horizontal)` con 3 o
más cards (`:has()`), que replica las declaraciones de latest-horizontal.css (ancho de card, inset del
par, sección a 100 % con min-height 100vh y overflow clip, heading, track en flex, card y margen de la
primera) y añade `margin-bottom` = (n − 2) × (W + G), el recorrido de pinScrollLength. Así el alto del
documento antes del JS es el mismo que con el envoltorio. Al añadir la clase, la reserva deja de
aplicar (`:not`) y el envoltorio toma el relevo en el mismo frame; al revertir (resize, before-swap)
la sección vuelve al layout del frame inicial o al apilado según la consulta.

Prototipo (CSS inyectado por CDP antes del parseo, sin tocar src/; cls104/scripts/proto.mjs):

| Viewport | carga limpia | recarga al fondo | recarga a mitad | back al fondo | back a mitad |
|----------|-------------:|-----------------:|----------------:|--------------:|-------------:|
| 1280×800 | 0 | 0 | 0 | 0 | 0 |
| 1600×900 | 0 | 0 | 0 | 0 | 0 |

Traza con prototipo: el frame previo a init ya mide 3075 / 3301 px con el footer en 410 / 531 (igual que
después). 0 errores. Datos: cls104/prototype/.

## 5. Restricciones y trabas detectadas

- Congelados por test de la 96 (REQ-96-39, `git diff --quiet HEAD`): latest-articles.css,
  latest-horizontal.css, latest-articles.astro y src/domain/latest-horizontal.ts. El arreglo no los toca.
- REQ-96-35/37: latest-cards-motion.css debe ser exactamente `.home__landing { overflow-x: clip; }` y
  ninguna regla de card (salvo :hover/:focus) puede declarar `opacity: 0` ni `transform:`: la reserva
  va en hoja nueva y no usa ninguna de las dos.
- REQ-72-15/27: todos los selectores de latest-horizontal.css llevan .latest-articles--horizontal; por
  eso la reserva no puede vivir en esa hoja.
- latest-articles.astro está congelado: n no puede llegar por custom property desde el marcado; se
  calcula con `:has(> .latest-articles__card:nth-child(k):last-child)` para cada k entre 3 y
  LATEST_POSTS_LIMIT (hoy 3). Un test debe fallar si LATEST_POSTS_LIMIT crece sin regla para él.
- Duplicación de la fórmula de --latest-card-width y --latest-pair-inset: un test exige que el texto
  sea idéntico al de latest-horizontal.css para que no diverjan.
- latest-horizontal.astro (12 líneas) solo gana un import; sigue con un único `<script>` (REQ-72-01).
- Riesgo residual: si el JS está habilitado pero el módulo falla al cargar, la sección queda en fila sin
  recorrido (la 3.ª card recortada) en vez de apilada. Se acepta: es el mismo estado que pinta hoy el
  JS al iniciar y no hay forma de saber antes del primer pintado si el módulo cargará.
- Texto de REQ-96-51 (pendiente c): dice «con trigger.isActive y trigger.progress», pero cards-sync.ts
  decide solo con progress (cardPhase), justificado y medido por el reviewer de la 96 (tras un refresh
  isActive no es coherente con progress). Se corrige el texto con nota; el código no cambia.

## 6. Descomposición

Complejidad simple-media (una hoja CSS nueva + un import + tests + texto de spec): una sola feature
(104 home-cls-fix). design.md: sí (toca estilos y el layout visible del primer frame en escritorio).
