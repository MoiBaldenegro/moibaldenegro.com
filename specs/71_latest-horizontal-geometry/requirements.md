# Requisitos — Geometría pura del scroll horizontal de «Últimos artículos» (feature 71 latest-horizontal-geometry)
# Petición humana 2026-10-09 (scroll en X de las 3 cards de la portada con GSAP). Análisis: progress/research/gsap_backlog.md; geometría propuesta en progress/research/gsap_horizontal_scroll.md §3 y §5.
# No toca UI: sin design.md. Módulo puro src/domain/latest-horizontal.ts sin gsap, sin window ni document: lo consume la feature 72.
# Modelo: cada card ocupa un slot del ancho visible V de la sección fijada; con desplazamiento x = 0 la card 0 queda centrada y las demás fuera de la vista a la derecha; x final = -(n - 1)·V centra la última. El recorrido de scroll vertical es (n - 1)·H (unos 100vh por card que pasa, propuesta aceptada por el humano).
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-71-01→1, REQ-71-02 y REQ-71-03→2, REQ-71-04 y REQ-71-05→3, REQ-71-06 y REQ-71-07 y REQ-71-08→4, REQ-71-09 y REQ-71-11→5, REQ-71-10→6, REQ-71-12→7, REQ-71-13→8.

## Requisitos

REQ-71-01 El módulo src/domain/latest-horizontal.ts SHALL exportar las funciones puras trackTravel, pinScrollLength, trackOffset, cardCenterX y focusScrollTarget sin importar gsap y sin acceder a window ni a document.
REQ-71-02 La función trackTravel SHALL recibir viewportWidth y count y devolver (count - 1) × viewportWidth cuando count es un entero mayor o igual que 2.
REQ-71-03 La función pinScrollLength SHALL recibir viewportHeight y count y devolver (count - 1) × viewportHeight cuando count es un entero mayor o igual que 2, WHERE cada card que pasa consume una altura de viewport de scroll vertical.
REQ-71-04 La función trackOffset SHALL recibir progress y viewportWidth y count y devolver 0 con progress 0 y el negativo de trackTravel(viewportWidth, count) con progress 1 con interpolación lineal entre ambos extremos.
REQ-71-05 IF progress queda fuera del intervalo de 0 a 1, THEN la función trackOffset SHALL acotarlo a ese intervalo antes de calcular el desplazamiento.
REQ-71-06 La función cardCenterX SHALL recibir index y viewportWidth y offset y devolver index × viewportWidth + viewportWidth / 2 + offset como centro horizontal de la card index relativo al borde izquierdo de la sección.
REQ-71-07 WHEN el desplazamiento vale 0 con tres cards, la función cardCenterX SHALL situar el centro de la card 0 en viewportWidth / 2 y el de las cards 1 y 2 a viewportWidth × 1.5 o más.
REQ-71-08 WHEN el desplazamiento es el final del recorrido con tres cards, la función cardCenterX SHALL situar el centro de la card 2 en viewportWidth / 2.
REQ-71-09 La función focusScrollTarget SHALL recibir index y count y start y end y devolver start + index / (count - 1) × (end - start) con index acotado al intervalo de 0 a count - 1.
REQ-71-10 IF count es menor que 2 o no es entero o algún argumento numérico no es finito o el ancho o el alto del viewport no es positivo, THEN las funciones trackTravel y pinScrollLength y trackOffset SHALL devolver 0 sin lanzar ninguna excepción.
REQ-71-11 IF count es menor que 2, THEN la función focusScrollTarget SHALL devolver start sin lanzar ninguna excepción.
REQ-71-12 WHEN se implemente la feature, el test tests/latest-horizontal-geometry.test.mjs SHALL observarse en rojo antes de crear src/domain/latest-horizontal.ts, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-71-13 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature con el módulo y el test dentro del límite de 100 líneas cada uno.
