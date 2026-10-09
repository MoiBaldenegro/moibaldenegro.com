# Análisis — Cards que cruzan la página (feature 76 latest-cards-full-bleed)

Fecha: 2026-10-09 · Autor: spec_author · Spec: specs/76_latest-cards-full-bleed/

## 1. Problema

Feedback humano tras probar 73-75 («todo funciona perfecto»): «la idea de las cartas es que se
sienta que salen y entran a través de la página, no que se vean encerradas en su contenedor».

Reformulado: en el modo horizontal de «Últimos artículos» el par de cards está bien colocado,
pero las cards aparecen y desaparecen en los bordes del par (a 31,75 px del borde de la ventana
a 1280 y 35,75 px a 1440) porque un `clip-path` lateral las corta ahí. Se quiere que el track se
vea hasta los bordes de la ventana: la card siguiente asoma por la derecha y la que sale cruza
hasta la izquierda.

Alcance: solo el recorte lateral. Posiciones del par, recorrido 1:1, sticky, entrada, teclado,
ClientRouter, búsqueda, CSP y apilado quedan igual.

## 2. Qué toca

- `src/styles/latest-horizontal.css` (52 líneas):
  - regla `.latest-articles--horizontal`: `clip-path: inset(0 var(--latest-pair-inset))`
    (REQ-73-15) → se elimina; se conservan `width: 100%` y `overflow: clip`.
  - regla `.latest-articles--horizontal.latest-articles--entering`: `clip-path: inset(-100vh
    var(--latest-pair-inset) 0)` (parte lateral de REQ-75-15) → se elimina; queda
    `overflow-y: visible`.
  - comentarios de cabecera y del bloque de la 75.
- Tests (precedente REQ-43-06, ajuste con nota):
  - `tests/latest-horizontal-compact-sticky.test.mjs` línea 69: aserción
    `clip-path: inset(0 var(--latest-pair-inset))` → ausencia de clip-path. Además, la
    verificación CDP de la 73 «márgenes sin card» (tabla de progress/impl_73.md) queda
    sustituida por REQ-76-06/07/08 (no es un test automático; no se reescribe el impl_73).
  - `tests/latest-cards-entrance.test.mjs` línea 64: aserción del clip-path de entering →
    ausencia de clip-path.
  - Test nuevo `tests/latest-cards-full-bleed.test.mjs` (rojo primero): ningún `clip-path` en la
    hoja; la sección conserva `overflow: clip` y `width: 100%`; entering declara
    `overflow-y: visible` y no `overflow-x`/`overflow: visible`; heading de entering intacto;
    todos los selectores con `.latest-articles--horizontal`; ≤100 líneas.
- No toca: `src/domain/*`, `src/components/latest-horizontal/*.ts`, `latest-articles.*`,
  `index.astro`, `package.json`.

## 3. Por qué basta con quitar el clip-path

- La sección en modo horizontal tiene `width: 100%` dentro de `main` y su borde coincide con el
  del viewport sin scrollbar (V = 1270 a 1280×800, 1430 a 1440×900 según impl_73), así que
  `overflow: clip` recorta el track justo en los bordes de la ventana.
- `overflow: clip` no crea contenedor de scroll: el track (n × W + … > V) no añade scroll
  horizontal al documento. Requisito explícito: `scrollWidth === clientWidth` en todo el
  recorrido (REQ-76-05).
- Verticalmente, `overflow: clip` ya recorta en top 0/bottom 0, igual que hacía el clip-path.
- Durante la entrada: `overflow: clip` + `overflow-y: visible` computa `overflow-x: clip;
  overflow-y: visible` (combinación válida en CSS Overflow 3 y en Chrome ≥90). El borde superior
  queda libre (las cards bajan desde arriba) y el lateral se recorta en la ventana. Es la forma
  más simple; `clip-path: inset(-100vh 0 0)` queda como plan B documentado en design.md si la
  verificación mostrara scroll horizontal.

## 4. Geometría esperada (n = 3, de impl_73)

| viewport | V | inset | xL | xR | p 0 | p 0,5 | p 1 |
|---|---|---|---|---|---|---|---|
| 1280×800 | 1270 | 31,75 | 15,9 | 1254,1 | card 3 desde 1252,3 → xR en card; xL sin card | card 1 −273,4…322,9 y card 3 947…1543 → ambos en card | card 1 −578,5…17,8 → xL en card; xR sin card |
| 1440×900 | 1430 | 35,75 | 17,9 | 1412,1 | card 3 desde 1408,25 → xR en card | ambos en card | xL en card (card 1 hasta ~21,75) |

Holguras pequeñas: a 1280, xR cae 1,8 px dentro de la card 3 y xL a p 1 cae 1,9 px dentro de la
card 1. Son deterministas (geometría ya medida ±0,1 px), pero el implementer debe medir con
getBoundingClientRect y registrar los valores; si alguna sonda falla por subpíxel se documenta,
no se mueve el par. Con p 1 a la derecha no hay card (n = 3): de ahí «cuando corresponda».

## 5. Riesgos y trabas

- **Scroll horizontal del documento:** cubierto por overflow-x clip; se verifica con scrollWidth
  en antes / entrada 0,25-0,5 / tramo fijado p 0-0,5-1 / después.
- **Hit-testing:** antes el clip-path impedía clicar la franja de la card asomada; ahora es
  clicable y navega a su post. Aceptable (es un enlace real).
- **Sombra de hover:** deja de recortarse en los laterales del par (mejora).
- **Header sticky y encabezado (REQ-75-30, REQ-75-15):** sin cambios; el z-index del h2 se
  conserva.
- **Rueda real:** el cambio es solo de pintado; aun así se repite la serie por frame (REQ-76-11).
- Sin dependencias, sin JS, sin tokens nuevos; la hoja baja de 52 líneas.

## 6. Descomposición

Complejidad simple (una hoja + ajuste de dos tests + un test nuevo) → 1 feature: 76
latest-cards-full-bleed, `pending`, `depends_on: [75]`.

## 7. Enmienda B (2026-10-09, antes de implementar)

### 7.1 Decisión humana

- Aclaración: «inicialmente sí empiezan y terminan centradas, ojo». El par 1-2 queda centrado al
  inicio y el par 2-3 al final, en las posiciones de la 73.
- El líder avisó de que, solo quitando el recorte lateral (§1-§6), en reposo asoma la card vecina
  en el margen: Δ = inset − G = 17,75 px a 1280×800, 21,75 px a 1440×900 y 326,89 px a 1600×700
  (W limitada por alto). Opciones: (A) dejar que asome; (B) márgenes limpios en reposo, con la
  vecina fuera de la ventana hasta que empieza el desplazamiento.
- Humano: «la idea principal era como la A, pero hazlo como la B primero, se escucha
  interesante, y luego vemos». Se implementa B; A queda en design.md como alternativa revisable.

### 7.2 Modelo B (validado)

- No cambia el track ni el recorrido: travel = (n − 2)(W + G), scroll 1:1, inset = pairInset.
- Δ = restMargin(inset, G) = max(0, inset − G). x propia (edgeOffsets(p, n, inset, G)):
  card 1 → −Δ·p; card n → +Δ·(1 − p); intermedias → 0.
- n = 3, p = 0: card 3 left = inset + 2(W + G) + Δ = V − inset + G + inset − G = V (exacto, toca
  el borde sin entrar). Par 1-2 intacto (card 1 y 2 sin x propia en p 0).
- n = 3, p = 1: track −(W + G); card 2 en inset, card 3 en inset + W + G (sin x propia en p 1);
  card 1 right = inset − (W + G) + W − Δ = inset − G − Δ = 0 (exacto).
- n ≥ 4: card n left en p 0 = V + (n − 3)(W + G) ≥ V; igual de simétrico al final.
- Monotonía: left de card 1 = inset − p(W + G + Δ) y left de card n = … − p(W + G) + Δ(1 − p):
  ambos decrecientes en p; las intermedias, como el track. Sin retrocesos con rueda real.
- p = 0,5 (n = 3): separación card 1-2 y 2-3 = G + Δ/2 (8,9 px extra a 1280; 163 px a 1600×700).
  Es inherente a B: el par se «abre» en mitad del recorrido. A 1280×800 card 1 −282,25…314 y
  card 3 956…1552,25; a 1600×700 card 1 −53,11…394 y card 3 1196…1643,11. Sondas xL/xR en card.
- Comprobación numérica con el dominio actual: cardLeftX(2, 1270, 596.25, 14, 0) = 1252,25 →
  +17,75 = 1270; 1440: 1408,25 + 21,75 = 1430; 1600×700: 1263,11 + 326,89 = 1590.

### 7.3 Qué toca ahora (además de §2)

- `src/domain/latest-horizontal.ts` (51 líneas): restMargin y edgeOffsets, puras.
- Efecto `latest-horizontal.ts` (91 líneas): las x de la primera y la última card van en el
  MISMO ScrollTrigger/scrub del horizontal (línea de tiempo o equivalente), valores función con
  invalidateOnRefresh. Probablemente supere 100 líneas → módulo hermano llamado desde setup.
  Debe seguir pasando las inspecciones de 72/73/75; la de la 75 prohíbe `gsap.to(...latest-articles__card`
  por selector: usar las referencias cards[0] y cards[n − 1].
- `track-dom.ts`: clearTrack (o hermana) limpia también transform/translate de las cards.
- `latest-horizontal.css`: `.latest-articles--horizontal .latest-articles__card {
  transition-property: border-color, box-shadow; }`. latest-articles.css declara `transition:
  var(--transition-default)` (all .28s) y el hover solo cambia border-color y box-shadow, así
  que no se pierde nada y el transform deja de ir con retraso. latest-articles.css no se toca
  (su test fija 98 líneas). La regla nueva no choca con REQ-72-15 (sin px) ni con la aserción de
  la 73 de «ninguna regla de la card con margin-inline».

### 7.4 Riesgos y hallazgos

- **Entrada de la 75 (punto abierto):** el track se escala (0,9 → 1) con origen en su centro
  (V/2). La card n, en left = V, queda en V/2 + s·V/2 durante la entrada: puede asomar hasta
  (1 − s)·V/2 (≈ 63 px a 1280 con s 0,9 pero opacity 0; ≈ 8 px con la entrada en 0,5 y opacity
  0,875). En el reposo del tramo fijado (s = 1) el margen ya está limpio. Se mide y registra
  (REQ-76-26); si el humano lo quiere limpio también durante la entrada, feature aparte.
- **Retraso del transform:** cubierto por transition-property (REQ-76-11). Sin él, la card iría
  280 ms por detrás del scroll.
- **Subpíxel:** left de la card 3 en p 0 cae exactamente en V; se tolera 0,5 px y las sondas
  xL/xR quedan a inset/2 del borde, lejos del límite.
- **Teclado:** focusScrollTarget lleva a p 0 o 1 (n = 3), donde el par está intacto.
- **Una sola fuente de verdad:** prohibido segundo ScrollTrigger o listener de scroll.

### 7.5 Alternativa A (revisable)

Solo §1-§6 (sin x propia de cards): la vecina asoma Δ en reposo. Pasar de B a A = quitar las x de
las cards; el CSS sin clip-path es común a ambas.

### 7.6 Spec enmendada

specs/76_latest-cards-full-bleed/requirements.md (REQ-76-01..27, renumerados) y design.md;
acceptance de la 76 en feature_list.json (9 criterios). Sigue siendo 1 feature, pending,
depends_on [75].
