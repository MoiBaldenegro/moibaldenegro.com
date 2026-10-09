# Diseño — Entrada de las cards desde arriba antes del scroll horizontal (feature 75 latest-cards-entrance)

> Petición humana confirmada (2026-10-09): las cards «salen de encima y se clavan» donde empieza
> el scroll horizontal, ligadas al scroll. Análisis: progress/research/cards_entrance_animation.md.

## Contexto visual

- Pantalla: portada, sección `.latest-articles` en el modo horizontal de la 73 (≥1201 px, sin
  reduced motion, ≥3 cards).
- Estado actual (73): las cards suben con la página como cualquier bloque. Al llegar el borde
  superior de la sección a `top: 0` la sección se fija (sticky) y el scroll vertical desplaza el
  par 1-2 → 2-3.
- Estado deseado:
  1. Cuando la sección empieza a asomar por abajo (el hero se va), el track de cards está 0,4·vh
     por encima de su sitio, a escala 0,9 y transparente.
  2. Según el usuario baja, el track desciende, crece y se hace opaco, con una curva que frena al
     final (aterrizaje suave). Todo ligado al scroll: si el usuario se para, la animación se para;
     si sube, retrocede.
  3. Justo cuando la sección se fija (`'top top'` del envoltorio), el track está exactamente en su
     sitio (y 0, scale 1, opacity 1) y empieza el horizontal de la 73 sin salto.
  4. El encabezado «Últimos artículos» no se anima y queda por encima de las cards mientras pasan.
- ≤1200 px, reduced motion, sin JS o con menos de 3 cards: idéntico al actual (apiladas).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--latest-pair-inset` (custom property local de la 73) | (V − 2W − G)/2 | recorte lateral que se conserva durante la entrada |

No se añaden tokens. Literales no cromáticos nuevos: `-100vh` (inset superior liberado),
`visible`, `relative` y `1` (z-index del encabezado). Los valores numéricos de la animación
(0,4·vh, 0,9, 0 → 1) viven en `src/domain/latest-entrance.ts`, no en CSS.

## Animación (src/domain/latest-entrance.ts)

vh = innerHeight, p = progreso de la entrada (0 cuando el top del envoltorio toca el borde
inferior del viewport, 1 cuando toca el superior), e = entranceEase(p) = 1 − (1 − p)³.

| Magnitud | Fórmula | p = 0 | p = 0,25 | p = 0,5 | p = 1 |
|----------|---------|-------|----------|---------|-------|
| e | 1 − (1 − p)³ | 0 | 0,578125 | 0,875 | 1 |
| y a 1280×800 (D = 320) | 0 − D·(1 − e) | −320 | −135 | −40 | 0 |
| y a 1440×900 (D = 360) | 0 − D·(1 − e) | −360 | −151,875 | −45 | 0 |
| scale | 1 − 0,1·(1 − e) | 0,9 | 0,9578125 | 0,9875 | 1 |
| opacity | e | 0 | 0,578125 | 0,875 | 1 |

Valores de test de las funciones puras:

- `entranceEase(0) === 0`, `entranceEase(0.5) === 0.875`, `entranceEase(1) === 1`,
  `entranceEase(-1) === 0`, `entranceEase(2) === 1`; monótona y dentro de [0, 1] en 0..1 con paso
  0,01 (sin rebote).
- `entranceDistance(800) === 320`, `entranceDistance(900) === 360`.
- `entranceState(0, 800)` → `{ y: -320, scale: 0.9, opacity: 0 }`;
  `entranceState(0.25, 800).y === -135`; `entranceState(0.5, 800)` → y −40, opacity 0,875,
  scale 0,9875 (±1e-9); `entranceState(0.5, 900).y === -45`;
  `entranceState(1, 800)` y `entranceState(3, 800)` → `{ y: 0, scale: 1, opacity: 1 }` con
  `Object.is(y, 0)` (no −0).
- `entranceProgress(415, 1215, 800) === 0`, `entranceProgress(815, 1215, 800) === 0.5`,
  `entranceProgress(1215, 1215, 800) === 1`, `entranceProgress(0, 1215, 800) === 0`,
  `entranceProgress(5000, 1215, 800) === 1`.
- Entradas inválidas (NaN, Infinity, vh 0 o −800): ease 1, distance 0, state
  `{ y: 0, scale: 1, opacity: 1 }`, progress 1; nunca lanzan.

## Estructura (archivos)

| Archivo | Cambio | Límite |
|---------|--------|--------|
| `src/domain/latest-entrance.ts` | nuevo: entranceEase, entranceDistance, entranceState, entranceProgress | ≤100 |
| `src/components/latest-horizontal/latest-horizontal.ts` | `gsap.fromTo` de entrada en `setup()` | ≤100 (si no cabe, módulo hermano `entrance.ts` llamado desde `setup()`) |
| `src/styles/latest-horizontal.css` | reglas `.latest-articles--horizontal.latest-articles--entering` | ≤100 |
| `tests/latest-cards-entrance.test.mjs` | test nuevo (rojo primero) | ≤100 |

No se tocan `src/domain/latest-horizontal.ts`, `latest-articles.astro`, `latest-articles.css`,
`latest-horizontal.astro`, `index.astro` ni los tests de 71, 72 y 73.

## Decisiones y constraints

- **Se anima el track, no las cards.** Las cards tienen `transition: var(--transition-default)`
  (todas las propiedades, 280 ms): un transform por card iría por detrás del scroll y no estaría
  en su sitio en la unión. El track no tiene transición y ya recibe la x de la 73; GSAP compone x,
  y y scale en el mismo transform.
- **Tween.** Dentro de `setup()`, tras el tween de x:
  `gsap.fromTo(track, { y: () => entranceState(0, innerHeight).y, scale: …, opacity: … },
  { y: 0, scale: 1, opacity: 1, ease: entranceEase, scrollTrigger: { trigger: wrapper,
  start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true,
  toggleClass: { targets: section, className: 'latest-articles--entering' } } })`.
  El estado final se escribe como `entranceState(1, innerHeight)` o sus literales (0, 1, 1).
- **scrub: true, sin suavizado numérico.** Un scrub numérico iría por detrás del scroll y la
  entrada no habría terminado en `'top top'`.
- **Ease cúbica de salida (equivale a power2.out) como función pura del dominio**, pasada a GSAP
  tal cual para que el runtime y los tests usen la misma curva. La velocidad relativa del track
  respecto a la sección llega a 0 en la unión: se «clava» sin tirón. Sin back ni elastic.
- **Recorte durante la entrada.** `.latest-articles--horizontal.latest-articles--entering`:
  `overflow-y: visible; clip-path: inset(-100vh var(--latest-pair-inset) 0);`. El borde superior
  queda libre para que las cards asomen por encima; el lateral del par se mantiene. No se usa
  `overflow: visible` completo: el track, más ancho que V, añadiría scroll horizontal al
  documento.
- **Encabezado encima.** `.latest-articles--horizontal.latest-articles--entering
  .latest-articles__heading { position: relative; z-index: 1; }`. Sin offsets: su caja y su top
  no cambian (REQ-73-23/24 se miden igual).
- **Clase solo durante la entrada** (`toggleClass`). Antes y en el tramo fijado rige la regla de
  la 73 sin cambios; en la unión el track está en y 0, así que quitar la clase no se ve.
- **Teclado.** Sin lógica nueva: el `focusin` de la 73 lleva a `focusScrollTarget`, que está en
  el tramo fijado, donde la entrada vale 1.
- **Limpieza.** `mm.revert()` revierte también el fromTo (y, scale, opacity) y el toggleClass. El
  track queda sin transform ni opacity en línea y la sección sin `--entering`.
- Restricciones: lógica en `.ts`, CSS en `src/styles/`, sin `<style>` en `.astro`, ≤100 líneas
  por archivo, sin dependencias nuevas (GSAP 3.15 ya aprobado en la 70), ≤51 200 B gzip.

## Verificación visual (Chrome headless + CDP sobre `astro preview`)

Medición del track: `getComputedStyle(track).transform` → `matrix(a, b, c, d, e, f)` con
a = scale, e = x y f = translateY; `getComputedStyle(track).opacity`. Posición de scroll de la
entrada: `wrapperTop − vh + p·vh`.

| Viewport | Escenario | Esperado |
|----------|-----------|----------|
| 1280×800 y 1440×900 | entrada p = 0, 0,5 y 1 | estado = entranceState(p, vh) (±1 px en y, ±0,01 en scale y opacity) |
| 1280×800 y 1440×900 | inicio del tramo fijado | y 0 (±1), x 0 (±1), scale 1 y opacity 1 (±0,001): igual al p = 0 horizontal de la 73 |
| 1280×800 y 1440×900 | horizontal p = 0 y 1 | par 1-2 y 2-3 en las posiciones de la 73 (±2 px) |
| 1280×800 | durante la entrada | `.latest-articles--entering` presente; `elementFromPoint` sobre el texto del h2 cae en el h2; en el header del sitio cae en el header |
| 1280×800 | rueda real (mouseWheel deltaY 40/100/240 y ráfagas, ida y vuelta) desde 1 vh antes del envoltorio | por frame: top del h2 constante ±1 px en el tramo fijado y monótono al entrar y salir; translateY monótona, ≤ 0, = entranceState del scroll del frame o del anterior (±1 px) y 0 ±1 px en el tramo fijado |
| 1024, 375, 1280 con reduced motion y sin JS | normal | apiladas, track sin transform ni opacity en línea, sin `--entering` |
| 1280×800 | astro:before-swap y resize a 1024 | track sin transform ni opacity en línea, sin `--entering` |
| 1280×800 | Tab real desde arriba hasta cada card | card completa en el viewport; track con y 0 y opacity 1 |
| 1280×800 | ida a un post y atrás (dos ciclos) | un envoltorio; scrollY = history.state (±2); estado del track = entranceState de esa posición |
| 1280×800 | búsqueda en vivo y vaciar | start y end de ambos ScrollTriggers iguales a carga limpia (±2) |

Capturas PNG en `progress/research/gsap75/`, referenciadas en `progress/impl_75.md`: 1280×800 y
1440×900 con entrada p 0, 0,25, 0,5 y 1, más el inicio del tramo fijado.

## Alternativas descartadas

- Animar cada card con stagger. Motivo: la transición CSS de las cards retrasa el transform y
  rompería el estado final exacto; además habría que tocar estilos de las features 36/37.
- Animar también el encabezado. Motivo: rompería las garantías de REQ-73-23/24 y su medición.
- `ease: 'none'` (lineal). Motivo: en la unión el track aún desciende a 0,4 px por px de scroll y
  el frenazo al fijarse se nota.
- Ease con rebote (back/elastic). Motivo: y no monótona y cards por debajo de su sitio.
- Cambiar de forma permanente el `overflow` y el `clip-path` de la 73. Motivo: obligaría a tocar
  sus tests (REQ-43-06) sin necesidad; la clase temporal lo resuelve solo durante la entrada.
- Distancia de 1·vh (las cards caen desde el borde superior del viewport). Motivo: cruzarían todo
  el hero; 0,4·vh se percibe «de encima» sin tapar el contenido anterior.
