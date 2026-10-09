# Diseño — Par de cards a todo el ancho y fijado sin saltos (feature 73 latest-horizontal-compact-sticky)

> ENMIENDA 2026-10-09 (instrucción humana, antes de implementar). Sustituye el modelo anterior,
> en el que la card 1 estaba centrada y la card 2 asomaba por la derecha. Ahora se ven DOS cards
> a la vez que llenan el ancho del contenedor. Al final del scroll quedan las dos últimas (la 2 y
> la 3 con 3 posts). Análisis: progress/research/horizontal_feedback.md §5.

## Contexto visual

- Pantalla: portada, sección `.latest-articles` en modo horizontal (≥1201 px, sin reduced
  motion), creada en la feature 72.
- Estado actual (72): una card por slot del ancho del viewport, con unos 645 px vacíos entre cards
  a 1280 px. Además, con rueda o trackpad reales, el encabezado «Últimos artículos» da un pequeño
  salto al fijarse. El pin de ScrollTrigger pasa a `position: fixed` desde JS un frame después del
  scroll del compositor, y `anticipatePin: 1` lo agrava.
- Estado deseado:
  1. Al llegar a la sección se ven las cards 1 y 2 completas y contiguas, separadas por
     `var(--gap-card)`. Juntas ocupan el ancho del contenedor `min(var(--container-max), 95%)`,
     alineadas con el encabezado.
  2. El scroll vertical (1:1) desplaza el track a la izquierda. Al final se ven las cards n−1 y n
     (la 2 y la 3), en las mismas posiciones que la 1 y la 2 al inicio. Después la página sigue.
  3. Ninguna card asoma por los márgenes laterales: el track se recorta en los bordes del par.
  4. El encabezado no salta ni al entrar ni al salir del tramo fijado, a ninguna velocidad.
- ≤1200 px, reduced motion, sin JS o con menos de 3 cards: idéntico al actual (apiladas), sin
  envoltorio.
- Al humano le gustó el tamaño de la card de la 72 (625×629 a 1280×800). Con el par, la card
  mide 596,25 de ancho a 1280×800: algo menor, y el par llena el contenedor.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--gap-card` | 14px | gap entre las cards del track (el mismo que en el apilado) y término G del ancho de card |
| `--container-max` | 1500px | tope del contenedor C = min(var(--container-max), 95%) |

No se añaden tokens (el conteo de tokens.css está fijado). Literales no cromáticos permitidos,
como en la 72: `100%`, `95%`, `100vh`, `0`, `2`, `16 / 9`, `30rem`, `3.5rem` y `sticky`.

## Geometría (src/domain/latest-horizontal.ts)

V = ancho de la sección (clientWidth), C = min(1500, 0,95·V), G = 14,
L = (innerHeight − 480)·16/9 + 56 (límite por alto de la 72), W = min((C − G)/2, L).

| Magnitud | Fórmula | 1280×800 | 1440×900 | 1920×900 (ilustrativo, W limitada por alto) |
|----------|---------|----------|----------|------------------------|
| V / C | — | 1270 / 1206,5 | 1430 / 1358,5 | 1910 / 1500 |
| (C − G)/2 / L | — | 596,25 / 624,9 | 672,25 / 802,7 | 743 / 802,7 |
| W = pairCardWidth(C, G, L) | min((C−G)/2, L) | 596,25 | 672,25 | 743 |
| inset = pairInset(V, W, G) | (V − 2W − G)/2 | 31,75 | 35,75 | 205 |
| left de las cards 1/2/3 con x = 0 | inset + i·(W + G) | 31,75 / 642 / 1252,25 | 35,75 / 722 / 1408,25 | 205 / 962 / 1719 |
| recorrido = scroll del tramo (n = 3) | (n − 2)·(W + G) | 610,25 | 686,25 | 757 |
| x final | −recorrido | −610,25 | −686,25 | −757 |
| borde derecho del par (recorte) | V − inset | 1238,25 | 1394,25 | 1705 |

Nota: a 1920×900, C = 1500 (tope de `--container-max`) y (C − G)/2 = 743 < L, así que el par
también llena el contenedor. El caso de REQ-73-13 (par centrado y más estrecho que el contenedor)
aparece en viewports anchos y bajos, p. ej. 1600×700 (V 1590): L = 447,1 < (1500 − 14)/2 = 743, y el
par (908,2 px) queda centrado en la sección con inset 340,9. El encabezado toma el ancho del par (REQ-73-16) para que
el recorte no lo corte y siga alineado con la card 1.

Con 3 posts, el tramo fijado dura unos 610 px de rueda a 1280×800. Es corto, pero es lo que pide
el modelo 1:1. Si el humano lo quiere más largo, se revisa (decisión revisable).

Valores de test de las funciones puras (todos exactos en coma flotante):

- `pairCardWidth(1206.5, 14, 625) === 596.25`, `pairCardWidth(1500, 14, 433.75) === 433.75`
- `pairInset(1270, 596.25, 14) === 31.75`, `pairInset(1910, 743, 14) === 205`,
  `pairInset(1000, 600, 14) === 0`
- `trackTravel(596.25, 14, 3) === 610.25`, `trackTravel(596.25, 14, 4) === 1220.5`,
  `trackTravel(596.25, 14, 2) === 0`, `pinScrollLength(596.25, 14, 3) === 610.25`
- `trackOffset(0, 596.25, 14, 3) === 0`, `trackOffset(0.5, 596.25, 14, 3) === -305.125`,
  `trackOffset(1.7, 596.25, 14, 3) === -610.25`
- `cardLeftX(0, 1270, 596.25, 14, 0) === 31.75`, `cardLeftX(2, 1270, 596.25, 14, 0) === 1252.25`,
  `cardLeftX(1, 1270, 596.25, 14, -610.25) === 31.75`,
  `cardLeftX(2, 1270, 596.25, 14, -610.25) === 642`
- `focusScrollTarget(0, 3, 1000, 1610) === 1000`, `(1, 3, …) === 1000`, `(2, 3, …) === 1610`,
  `(5, 3, …) === 1610`, `(-1, 3, …) === 1000`, `(0, 2, …) === 1000`;
  con n = 4 y 1000..2220: `(1, 4) === 1000`, `(2, 4) === 1610`, `(3, 4) === 2220`

focusScrollTarget: con el track desplazado k·(W + G) se ven las cards k y k+1. Para la card i se
usa k = clamp(i − 1, 0, n − 2), o sea p = k/(n − 2). Las dos primeras dan el inicio y la última
da el final, así que la card enfocada siempre queda completa dentro del par.

Se eliminan `centeringInset` y `cardCenterX` del diseño anterior (no se llegaron a implementar)
y `cardCenterX` de la 71 pasa a `cardLeftX`.

## Estructura (archivos)

| Archivo | Cambio | Límite |
|---------|--------|--------|
| `src/domain/latest-horizontal.ts` | `pairCardWidth` y `pairInset` nuevas; `trackTravel`, `pinScrollLength` y `trackOffset` con (W, G, n) y paso n − 2; `cardLeftX` sustituye a `cardCenterX`; `focusScrollTarget` con k = clamp(i − 1) | ≤100 |
| `src/components/latest-horizontal/latest-horizontal.ts` | envoltorio sticky, sin pin ni anticipatePin, mínimo 3 cards, W y G medidos del DOM | ≤100 (si no cabe, módulo hermano, p. ej. `sticky-wrapper.ts`) |
| `src/styles/latest-horizontal.css` | ancho del par, gap, inset en la primera card, recorte, encabezado del ancho del par, sticky, regla del envoltorio | ≤100 |
| `tests/latest-horizontal-compact-sticky.test.mjs` | test nuevo (rojo primero) | ≤100 |
| `tests/latest-horizontal-geometry.test.mjs`, `tests/latest-articles-horizontal-scroll.test.mjs` | ajuste con el precedente REQ-43-06: firmas nuevas, sin `pin:` ni `anticipatePin`, mínimo 3 cards en lugar de 2 | ≤100 |

`latest-articles.astro`, `latest-articles.css` y `src/domain/latest-posts.ts` siguen sin tocarse
(REQ-30-08, REQ-30-15, REQ-73-33).

## Decisiones y constraints

- **Todas las magnitudes en % se resuelven contra V.** La sección no tiene padding horizontal y
  el track no lleva padding (su caja de contenido mide V). Así, el `95%` del ancho de card, el
  inset de la primera card y el `100%` del recorte se refieren al mismo V.
- **Ancho del par (CSS).** En `.latest-articles--horizontal` se declara
  `--latest-card-width: min(calc((min(var(--container-max), 95%) - var(--gap-card)) / 2),
  calc((100vh - 30rem) * 16 / 9 + 3.5rem))` y `--latest-pair-inset: calc((100% - 2 *
  var(--latest-card-width) - var(--gap-card)) / 2)`. Las custom properties no registradas
  heredan los tokens sin resolver, así que cada % se resuelve donde se usa (siempre contra V).
- **Track.** `display: flex; gap: var(--gap-card)`. La card lleva `flex: 0 0
  var(--latest-card-width)` y no tiene `margin-inline`. Solo la primera card lleva
  `margin-inline-start: var(--latest-pair-inset)`. El final del track no necesita relleno: x se
  fija con el recorrido calculado, no con scrollWidth.
- **Recorte.** La sección lleva `clip-path: inset(0 var(--latest-pair-inset))` además de
  `overflow: clip`: el track se recorta en los bordes del par. Coste aceptado: la sombra de hover
  de las cards se recorta en los laterales del par. Decisión revisable; la alternativa es dejar
  asomar unos 18 px de la card siguiente por los márgenes.
- **Encabezado.** `width: calc(2 * var(--latest-card-width) + var(--gap-card)); margin-inline:
  auto;`. Cuando el par llena el contenedor coincide con el ancho de la 72; si no, se alinea con
  la card 1 y el recorte no lo corta.
- **W y G en JS.** `W = cards[0].getBoundingClientRect().width` (no `offsetWidth`, que redondea
  596,25 a 596 y acumula error) y `G = parseFloat(getComputedStyle(track).columnGap)`. Se leen
  en funciones para que `invalidateOnRefresh` los recalcule.
- **Mínimo 3 cards.** Con n ≤ 2 el par ya lo muestra todo y no hay recorrido: el efecto no se
  activa y queda el apilado. El test de la 72 que comprobaba «al menos dos cards» se ajusta
  (REQ-43-06).
- **Fijado con sticky, no con el pin de ScrollTrigger.** Al activarse, el efecto inserta
  `<div class="latest-articles--horizontal-pin">` antes de la sección y mueve la sección dentro.
  CSS: `.latest-articles--horizontal { position: sticky; top: 0; min-height: 100vh;
  overflow: clip; }`. El alto del envoltorio (alto de la sección + pinScrollLength) se fija en
  línea en `refreshInit`, o con un mecanismo equivalente que actúe antes de medir. Nunca en
  `onRefresh`, para no provocar un bucle de refresh. Con la sección ≥ viewport, el tramo sticky
  dura exactamente pinScrollLength.
- **ScrollTrigger solo como scrub.** `gsap.to(track, { x: () => trackOffset(1, W, G, n),
  ease: 'none', scrollTrigger: { trigger: wrapper, start: 'top top',
  end: () => '+=' + pinScrollLength(W, G, n), scrub: true, invalidateOnRefresh: true } })`.
  Sin `pin`, sin `anticipatePin`, sin `.pin-spacer`.
- **Limpieza.** La función devuelta por `mm.add` devuelve la sección al lugar del envoltorio,
  elimina el envoltorio, quita la clase y desconecta los listeners. `mm.revert()` quita la x en
  línea del track. El DOM queda como sin JS.
- **Se conserva de la 72:** matchMedia `(min-width: 1201px) and (prefers-reduced-motion:
  no-preference)`; `init`/`destroy` idempotentes con `astro:page-load`/`astro:before-swap`;
  `focusin` → `focusScrollTarget`; MutationObserver de la búsqueda en vivo → refresh; y
  `restoreScroll` desde `history.state`.
- **3 posts.** LATEST_POSTS_LIMIT = 3 no cambia. Ampliar a 4 o más es una decisión futura del
  humano («igual después podemos ver si lo ampliamos») y no se implementa aquí. La geometría es
  genérica en n, así que bastaría con cambiar la constante y sus tests en una feature aparte.
- Restricciones del proyecto: lógica en `.ts`, CSS en `src/styles/`, sin `<style>` en `.astro`,
  solo tokens, ≤100 líneas por archivo y sin dependencias nuevas.

## Verificación visual (Chrome headless + CDP sobre `astro preview`)

| Viewport | Escenario | Esperado |
|----------|-----------|----------|
| 1280×800 y 1440×900 | p = 0 | W = pairCardWidth (±1 px); card 1 left = inset y card 2 right = V − inset (±2 px); card 3 left ≥ V − inset; `elementFromPoint` en el margen derecho (x = V − inset/2, a media altura de la card) no cae dentro de ninguna card; h2 con left = card 1 left (±2 px); un envoltorio y cero `.pin-spacer`; card + h2 caben bajo el header visible |
| 1280×800 y 1440×900 | p = 0,5 | x del track = trackOffset(0,5) (±2 px) |
| 1280×800 y 1440×900 | p = 1 | card n−1 left = inset y card n right = V − inset (±2 px); `elementFromPoint` en el margen izquierdo no cae en ninguna card |
| 1600×700 | p = 0 | par centrado: márgenes izquierdo y derecho iguales (±2 px) y h2 alineado con la card 1 |
| 1280×800 | rueda real (Input.dispatchMouseEvent mouseWheel, deltaY 40/100/240 y ráfagas, ida y vuelta) con registro por requestAnimationFrame del top del h2 | constante ±1 px en el tramo fijado; serie monótona sin retrocesos al entrar y al salir |
| 1024, 375 y 1280 con reduced motion | normal | apiladas como sin JS (±1 px), sin envoltorio |
| 1280×800 | ida a un post y atrás (dos ciclos) | un envoltorio; scrollY = history.state.scrollY (±2 px) |
| 1280×800 | Tab hasta cada card | card completa dentro del viewport y entre inset y V − inset |
| 1280×800 | búsqueda en vivo y vaciar | envoltorio, start y end iguales a una carga limpia (±2 px) |
| 1280×800 | clic en la card 3 con p = 1 | navega al post sin errores en consola |

Capturas PNG en `progress/research/gsap73/`, referenciadas en `progress/impl_73.md`. Como mínimo:
1280×800 y 1440×900 con p 0, 0,5 y 1, y 1600×700 con p 0.

## Alternativas descartadas

- Alternativa: conservar el pin de ScrollTrigger quitando `anticipatePin`, o usar `pinReparent` /
  `ScrollTrigger.normalizeScroll(true)`.
  Motivo: el pin pasa a `fixed` desde JS y sigue un frame por detrás del scroll asíncrono del
  compositor. normalizeScroll secuestra el scroll nativo (REQ-72-19 lo prohíbe). Sticky lo
  resuelve el compositor en el mismo frame.
- Alternativa: primera card centrada y la segunda asomando (versión anterior de esta spec).
  Motivo: el humano pidió el par a todo el ancho (enmienda 2026-10-09).
- Alternativa: dejar asomar la card siguiente por los márgenes laterales.
  Motivo: tiras de unos 18 px en el borde del viewport que parecen un fallo. Revisable.
- Alternativa: subir a 4 posts.
  Motivo: el humano lo deja para después; tocaría la feature 30 y el apilado de móvil.
