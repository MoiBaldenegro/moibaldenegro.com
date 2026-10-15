# Análisis — feature 96 latest-cards-gsap-motion (vuelta a 3 cards + entrada/salida con GSAP)

## Decisión humana (2026-10-15, literal)

- «sabes que al final ni las 4 me gustaron reestablece a 3, pero mejora la animación de entrada y salida de las cards»
- «tenemos GSAP en las dependencias»

La feature 95 (4 cards + desliz lateral solo CSS) está done/APPROVED y no se reabre: la 96 es nueva y
deshace parte de la 95 con notas (precedente REQ-43-06).

## Problema en mis palabras

1. La portada vuelve a 3 «Últimos artículos» (LATEST_POSTS_LIMIT = 3). El footer sigue en 3.
2. La animación de las cards de la 95 (scroll-driven CSS, linear, 56 px, sin efecto en el modo
   horizontal de escritorio) no convence. Se sustituye por un único sistema GSAP + ScrollTrigger
   (gsap 3.15.0, aprobado en la feature 70) que anima la entrada y la salida de cada card en todos
   los anchos, incluido el modo horizontal (>=1201 px) de las features 73/75/76.

## Estado actual (árbol de trabajo; la 95 aún no está commiteada)

| Archivo | Líneas | Papel |
|---------|--------|-------|
| src/domain/latest-posts.ts | 25 | LATEST_POSTS_LIMIT = 4, FOOTER_LATEST_POSTS_LIMIT = 3 (95) |
| src/components/site-footer/site-footer.astro | 66 | pasa FOOTER_LATEST_POSTS_LIMIT explícito (95) |
| src/components/latest-horizontal/latest-horizontal.astro | 12 | importa latest-horizontal.css + latest-cards-slide.css; 1 script (init/destroy en astro:page-load / astro:before-swap) |
| src/components/latest-horizontal/latest-horizontal.ts | 95 | gsap.matchMedia DESKTOP; envoltorio sticky (73); timeline de x del track + x de las cards extremas (76); entrada del TRACK desde arriba (75: y/scale/opacity, scrub, 'top bottom'→'top top', toggleClass latest-articles--entering) |
| src/components/latest-horizontal/track-dom.ts | 25 | clearTrack (quita transform/opacity en línea del track y de las cards) y restoreScroll |
| src/domain/latest-entrance.ts | 35 | curvas puras de la entrada de la 75 (entranceEase/Distance/State/Progress) |
| src/styles/latest-cards-slide.css | 52 | desliz CSS de la 95 + `.home__landing { overflow-x: clip }` |

Marcado de la card (congelado, src/components/latest-articles.astro): `<article class="latest-articles__card">`
con `<a>`, metadatos, descripción y tags; no hay envoltorio interior, así que entrada y salida se
animan sobre el mismo elemento.

## Decisiones de diseño (valores por defecto revisables, no bloquean)

- D1 Límite 3 en la portada; se mantiene FOOTER_LATEST_POSTS_LIMIT = 3 (el footer queda desacoplado
  de la portada: si la portada vuelve a cambiar, el footer no). Coste: una constante.
- D2 Un solo sistema: GSAP. Se borran src/styles/latest-cards-slide.css (95) y la entrada del track
  de la 75 (y src/domain/latest-entrance.ts, que solo servía a esa entrada). El recorte
  `.home__landing { overflow-x: clip }` (necesario porque las cards entran desplazadas en X) pasa a
  una hoja nueva mínima src/styles/latest-cards-motion.css, sin estado oculto (sin JS, cards estáticas).
- D3 (revisión 2) Entrada por tiempo desde la derecha: 72 px → 0, scale 0,96 → 1, opacity 0 → 1;
  0,8 s, power3.out, stagger 0,12 s. Al volver hacia arriba (onEnterBack) entra desde la izquierda.
- D4 (revisión 2) Salida por tiempo, SIN scrub: hacia la izquierda 0 → −60 px, opacity → 0, 0,5 s,
  power2.in, stagger 0,08 s (onLeave); al subir, onLeaveBack sale por la derecha. Apilado (<=1200 px):
  ScrollTrigger.batch con 'top 85%' / 'bottom 20%'. Horizontal (>=1201 px): CONDICIONAL (ver abajo).
- D5 Se usa xPercent (no x) para no pelear con la x en línea de la primera y última card (76) ni con
  la x del track (73): GSAP compone x, xPercent, scale y opacity en un único transform por elemento.
  Revisión 2: el porcentaje se calcula por card con offsetPercent(px, offsetWidth) para que el
  desplazamiento visible sea exactamente 72 / 60 px en cualquier ancho (concreción del orquestador).
- D6 Valores en src/domain/latest-cards-motion.ts (constantes puras, sin gsap/window/document) y
  runtime en src/components/latest-horizontal/cards-motion.ts (latest-horizontal.ts mide 95/100).
  Las consultas de media (DESKTOP y la nueva STACKED con prefers-reduced-motion: no-preference) siguen
  solo en latest-horizontal.ts (REQ-56-04 lo exige) y registran los dos modos en el mismo
  gsap.matchMedia, así que mm.revert() en destroy limpia todos los ScrollTrigger y tweens.
- D7 cardWidth() del horizontal divide hoy por la escala del TRACK (75); con la entrada en las cards
  debe dividir por la escala de la card medida (si no, un refresh durante la entrada mide 0,96 W).

## Revisión 2 (2026-10-15): «cómo entran y cómo salen de los laterales»

Tercera nota humana (literal): «que se vea más bonita nada más, busca opciones clásicas en la
librería, más que nada en la entrada y salida porque se ve muy rústico, eso queremos mejorar en
específico: cómo entran y cómo salen de los laterales».

Diagnóstico: lo rústico es el movimiento ligado 1:1 al scroll (scrub linear), que la versión 1 de esta
spec aún mantenía en la salida. Opción clásica elegida (concreción del orquestador): el patrón
ScrollTrigger.batch / callbacks de la documentación de GSAP con tweens por tiempo:

| Callback | Efecto |
|----------|--------|
| onEnter | entra desde la derecha (power3.out, 0,8 s, stagger 0,12) |
| onLeave | sale hacia la izquierda (power2.in, 0,5 s, stagger 0,08) |
| onEnterBack | entra desde la izquierda |
| onLeaveBack | sale hacia la derecha |

Antes de cada tween, gsap.killTweensOf(els, 'xPercent,scale,opacity') (un callback interrumpe al anterior: sin rebote ni tweens en conflicto).
Revisión 3 (CHANGES_REQUESTED, progress/review_latest-cards-gsap-motion.md): la versión anterior usaba
overwrite: true, que mata todos los tweens de las mismas cards sin mirar la propiedad, incluido el fromTo
de x de la 76 (latest-horizontal.ts:71); a 1280×800 la tercera card quedaba con 20 px de margen derecho
frente a 32 y, tras recargar al fondo o history.back, la primera en left 14. Se elige killTweensOf por
propiedades frente a overwrite: 'auto': lista explícita que excluye x, actúa también sobre tweens con
retardo de stagger aún no activos y es verificable con un test estático. Nuevas medidas REQ-96-49/50.
Sin back/elastic, sin alternar lados. El estado de partida lo pone gsap.set desde JS.

Desviaciones justificadas de la concreción:
- xPercent en lugar de x (D5), con el equivalente exacto en px por card.
- opacity en lugar de autoAlpha: autoAlpha pone visibility: hidden y saca los enlaces de las cards
  aún no entradas del orden de tabulación (regresión de teclado). Con opacity siguen enfocables y un
  focusin lleva la card al estado final. Revisable si el humano prefiere autoAlpha.

Modo horizontal (>=1201 px), requisito condicional:
- H-integrado: ScrollTrigger sobre el envoltorio 'top 75%' (par inicial: onEnter / onLeaveBack) y
  'bottom 40%' (par final: onLeave / onEnterBack) + containerAnimation sobre la timeline existente
  del track para las cards que cruzan el borde ('left 85%' → 'right 15%'). Sale la entrada de la 75.
- H-intacto (fallback, no bloquea): si rompe el sticky, el recorrido (n−2)(W+G), la x de la 76 o las
  medidas CDP, el horizontal queda como está (entrada de la 75 incluida) y se anota.
- Riesgo propio: containerAnimation solo conoce la x del track; la x propia de las cards extremas (76)
  desplaza su posición real respecto a la que calcula ScrollTrigger.

## Riesgos y trabas

- R1 (revisión 3) Conflicto entre callbacks sobre la misma card: cada callback llama antes a
  killTweensOf(cards, 'xPercent,scale,opacity') (overwrite: true mataba la x de la 76);
  con scroll rápido gana el último callback. Los tweens creados por callbacks (después del mm.add) se
  registran con context.add o se matan con gsap.killTweensOf en la limpieza: si no, un tween en curso
  reescribiría transform/opacity después de clearTrack (estilos residuales tras astro:before-swap).
- R1b Foco de teclado: con opacity 0 la card es enfocable pero invisible; el focusin la muestra.
- R2 gsap solo se importa hoy en latest-horizontal.ts (test REQ-70-08/09): cards-motion.ts también lo
  importa → ajuste con nota en tests/gsap-dependency-approval.test.mjs.
- R3 Tests que congelan o anclan en la entrada de la 75: latest-cards-entrance.test.mjs (REQ-75-01..11
  se retiran con nota; REQ-75-14/15 CSS se conservan), latest-cards-full-bleed.test.mjs (REQ-76-10
  ancla el bloque de la timeline en `gsap.fromTo(track`), home-latest-articles-five.test.mjs
  (REQ-95-08 congela latest-horizontal.ts y latest-entrance.ts; REQ-95-13..21 sobre la hoja de la 95).
- R4 REQ-47-06: con 3 cards y sin la hoja de la 95 se midieron 38 067 B; la hoja nueva es de 1 regla
  (inline ~100 B). Debería volver a < 40 000; si el árbol final no cumple, umbral = medido + 3000
  redondeado al millar superior con tope 42 000 (por encima, blocked).
- R5 Fugas: ScrollTrigger.getAll() se lee desde CDP con window.ScrollTrigger si GSAP lo instala como
  global (gsap-core instala sus globales en window cuando no existe window.gsap); sin añadir globales
  de depuración al código. Si no está expuesto, se documenta y se usan medidas indirectas.
- R6 CLS 0,508 preexistente al recargar a 1280 con el scroll restaurado al fondo (anotado en la 95):
  fuera de alcance; el CLS se mide recorriendo desde arriba.
- R7 La 93 (blocked) tiene cambios en el árbol; no se toca.
- R8 (revisión 4, segundo CHANGES_REQUESTED, «Revisión 2» de progress/review_latest-cards-gsap-motion.md):
  a 1280×800, con el scroll restaurado por recarga o history.back en y 1510, 1815, 2000 o 2280, la card 3
  queda invisible (opacity 0, xPercent +72 px, scale 0.96: el estado de hide()); solo se libra el máximo
  exacto (2295). Caso típico: pulsar la card 3 al final del tramo y volver con history.back. El apilado
  no lo tiene. Causa probable: hide(cards) después de crear los triggers oculta a ciegas y los triggers
  con containerAnimation no relanzan onEnter al restaurar. REQ-96-51 (sincronizar cada card con
  trigger.isActive / progress tras crear los triggers y en cada refresh) y REQ-96-52 (medida CDP en
  1510/1815/2000/2280/2295 tras recarga y history.back, y a 375 en apilado, comparada con la rueda
  real desde carga limpia); acceptance 21 de feature_list.json; enfoque en design.md.

## Descomposición

Complejidad media (dominio + runtime + CSS + tests ajustados) pero el cambio es un único entregable
verificable en navegador y las piezas no se pueden cerrar por separado sin dejar dos animaciones o
ninguna: una feature (96). Estimación (revisión 2): latest-cards-motion.ts ~30 líneas, cards-motion.ts ~70-90 (partible en un módulo hermano),
latest-horizontal.ts <=100 (sale el bloque de la 75, ~11 líneas, y entran ~6).

Spec: specs/96_latest-cards-gsap-motion/requirements.md y design.md.
