# Informe de implementación — feature 96 latest-cards-gsap-motion

Estado: implementada, pendiente de revisión (2026-10-15, implementer). `./init.sh` en verde.
La sesión se cortó una vez por el límite de la API y se retomó desde el árbol que estaba en disco.

## Rama horizontal (REQ-96-30, anotada antes de escribir el test)

**H-integrado.** Motivo: ScrollTrigger con containerAnimation mide el desplazamiento real de cada
elemento buscando la timeline en 0 y en su final (`_parsePosition` hace `seek(0)` / `seek(duration)` y
lee `getBoundingClientRect`), así que también cuenta la x propia de las cards extremas de la 76. La x
del track y la x de las cards extremas son lineales en la misma timeline (`ease: 'none'`), así que el
mapeo es exacto. Criterio de vuelta atrás: si la medida CDP rompe el sticky, el recorrido, la x de la
76 o REQ-96-45, se vuelve a H-intacto y se anota.

Resultado: la rama H-integrado se queda. Las medidas CDP (abajo) conservan el sticky, el recorrido
(trackX −610,25 = (n−2)(W+G) = 596 + 14), la x de la 76 y REQ-96-45. No hace falta H-intacto.

## Archivos

- Nuevos: `src/domain/latest-cards-motion.ts` (21 líneas: CARDS_ENTER / CARDS_EXIT / CARDS_STACKED /
  CARDS_HORIZONTAL congelados y `offsetPercent`), `src/components/latest-horizontal/cards-motion.ts`
  (97: batch apilado, triggers horizontales, focusin), `src/styles/latest-cards-motion.css` (7: solo
  `.home__landing { overflow-x: clip; }`), `tests/latest-cards-gsap-motion.test.mjs` (100).
- Modificados: `latest-horizontal.ts` (92: DESKTOP y STACKED en el mismo gsap.matchMedia, sin la
  entrada de la 75, cardWidth dividido por la escala de la card), `track-dom.ts` (36: limpieza de
  transform/opacity de las cards), `latest-horizontal.astro` (importa latest-cards-motion.css),
  `src/domain/latest-posts.ts` (LATEST_POSTS_LIMIT = 3), `site-footer.astro` (pasa
  FOOTER_LATEST_POSTS_LIMIT de forma explícita).
- Borrados: `src/domain/latest-entrance.ts` y `src/styles/latest-cards-slide.css`.
- Tests ajustados con la nota «Ajuste feature 96 (precedente REQ-43-06)»: home-latest-articles-five,
  home-latest-articles-limit, latest-horizontal-compact-sticky, search-index-lazy-load,
  gsap-dependency-approval, latest-cards-entrance y latest-cards-full-bleed.
- Congelados sin cambios frente a HEAD (REQ-96-39): latest-articles.css, latest-horizontal.css,
  latest-articles.astro, src/domain/latest-horizontal.ts, tokens.css.
- Ajenos a la 96 y sin tocar: `public/assets/svg/sprite.svg` y `tests/hack-the-box-sprite.test.mjs`.
  No rompen `./init.sh`.

## Dos defectos encontrados al verificar en navegador y corregidos (con su test primero)

1. **Las cards extremas perdían xPercent y scale al cargar a 1280** (tx 0 y 17,75 = solo la x de la 76).
   Causa (gsap 3.15.0, ScrollTrigger.js): el trigger de la timeline lleva `invalidateOnRefresh`, y en
   cada refresh hace `animation.revert({ kill: false }).invalidate()`. Eso devuelve el transform de las
   cards extremas al que tenían antes de su tween de x (76) y GSAP lo vuelve a leer con `uncache`, así
   que xPercent queda en 0 y scale en 1. Pasa en dos momentos: (a) al crear los triggers nuevos,
   ScrollTrigger fuerza `curTrigger.refresh(0, 1)` sobre la timeline, que aún no tiene `end` porque
   espera un tick; (b) en cada `ScrollTrigger.refresh()` global (carga, resize, refreshWhenShown).
   Corrección en `horizontalCardsMotion`: el estado oculto (`hide`) se aplica después de crear los
   triggers, y los listeners `refreshInit` (keep) y `refresh` (restore) guardan y reponen xPercent y
   scale de las dos cards extremas. Se quitan en la limpieza.
2. **La salida del par final no se alcanzaba**: con 1280×800, `bottom 40%` del envoltorio coincide con
   el scroll máximo (2295), y el antiguo `end: '+=1'` quedaba fuera de alcance. Con viewports más altos
   el punto pasa el máximo. Corrección: `const leave = \`clamp(${CARDS_HORIZONTAL.leave})\``, que se usa
   como start y como end. Si el punto se puede alcanzar, sigue siendo `bottom 40%` (rango de 0 px:
   onLeave al bajar y onEnterBack al subir). Si no, ScrollTrigger lo limita al scroll máximo.
   **Interpretación de REQ-96-26** para el reviewer: el start sigue siendo CARDS_HORIZONTAL.leave, solo
   que limitado con `clamp()`, y sigue siendo posterior al final del tramo (1815 < 2295).

## Evidencia rojo / verde

- Rojo inicial (test nuevo antes de tocar src/, REQ-96-41): `node --test
  tests/latest-cards-gsap-motion.test.mjs`, tests 9 / pass 0 / fail 9. Por ejemplo:
  `✖ REQ-96-01/02/03 … AssertionError: latest-posts.ts sin export const LATEST_POSTS_LIMIT = 3;`
- Rojo de los tests ajustados (antes de src/): tests 45 / pass 34 / fail 11. Fallaban REQ-30-01/02/03/13,
  REQ-47-01/06 (`index.html pesa 43638 bytes`), REQ-73-33/34, REQ-76-10/12/13 y REQ-95-01/02/03,
  04/05, 06/07/12 y 21/31.
- Verde tras implementar: tests 65 / pass 65 / fail 0 (test nuevo y los ajustados).
- Rojo de las dos correcciones (asserts nuevos en el test REQ-96-25..28/30, antes del cambio en src/):
  `✖ … AssertionError: falta la salida`, y después
  `✖ … AssertionError: hide tras crear los triggers (su refresh forzado revierte la timeline)`.
- Verde final: `pnpm test`, tests 1003 / pass 1003 / fail 0. `./init.sh` sale con código 0
  («El entorno está perfecto»).

## REQ-47-06 / REQ-96-06/07 (peso medido con el árbol final)

`dist/client/index.html` = **38 063 B** (build de `./init.sh` con el árbol final), por debajo de
40 000. Según REQ-96-07 el umbral se queda en 40 000 B (ajuste anotado en search-index-lazy-load).

## Verificación Chrome headless + CDP (pnpm build + pnpm preview :4329, frames en progress/research/home96/)

Los ScrollTrigger se cuentan con `ScrollTrigger.getAll().length`. La clase no es global: se captura
del scope del bundle pausando el depurador en el listener de scroll. CLS medido con PerformanceObserver
(layout-shift) mientras se recorre la página de arriba abajo en 15 posiciones.

| Viewport | cards / footer | scroll horizontal (15 posiciones) | CLS | ScrollTrigger |
|---|---|---|---|---|
| 375×800 | 3 / 3 | no (sw <= cw) | 0 | 3 |
| 768×800 | 3 / 3 | no | 0 | 3 |
| 1024×800 | 3 / 3 | no | 0 | 3 |
| 1280×800 | 3 / 3, `.latest-articles--horizontal-pin` presente | no | 0 | 5 |

- Estado al cargar (solo desde JS): todas las cards en opacity 0, scale 0,96 y +72 px. En la tercera
  de 1280 es 89,78 = 72 + 17,75 (x de la 76), así que la corrección 1 queda verificada.
- Secuencia apilada (REQ-96-44; card 2, lectura a ~150 ms y a 1 s):
  - 375: entra desde la derecha (46,7 px y op 0,35 → 0 y op 1); sale hacia la izquierda (→ −60,0 y op 0);
    vuelve desde la izquierda (−45,8 y op 0,35 → 0 y op 1); sale por la derecha (→ +60,0 y op 0).
  - 768: igual (50,4 → 0; → −60,0; −52,5 → 0; → +60,0).
  - Frames: stacked-{375,768}-{1-entra-derecha,2-sale-izquierda,3-vuelve-izquierda,4-sale-derecha}.png.
- Modo horizontal 1280×800 (REQ-96-45). Envoltorio en top 1205, tramo de 610 px (1205 → 1815) y scroll
  máximo 2295.
  - Llegada (y 645): el par inicial entra desde la derecha con stagger (31,4 y 61,8 px → 0, op 1). La
    tercera sigue oculta.
  - Cruce (y 1342 → 1412, ~1382 calculado con el containerAnimation): la tercera entra desde la derecha
    (43,1 / op 0,56 → 11,73, op 1). **Retirado en la ronda 1:** 11,73 no era la x de la 76 (en p = 1
    vale 0), sino la x congelada por `overwrite: true`; cifras corregidas en «Ronda de revisión 1».
  - Final del tramo (y 1815): sección en top 0 (sticky), trackX −610,25. La segunda y la tercera están
    completas dentro de la sección (tolerancia 2 px) con opacity 1. La primera sale hacia la izquierda
    al cruzar el borde (→ −60, op 0).
  - Salida (y 2295, fondo): el par final sale hacia la izquierda (→ −60 y −48,3 = −60 + 11,73, op 0).
    Regreso (y 2255): vuelve desde la izquierda (→ 0 y 11,73, op 1). (11,73 = x congelada, ver ronda 1.)
  - Subiendo hasta el inicio del tramo (y 1207): la primera vuelve desde la izquierda (→ 0) y la tercera
    sale por la derecha (→ 71,75 = 60 + 11,75). Por encima de la llegada (y 525): el par inicial sale
    por la derecha (→ +60, op 0).
  - Resize 1280 → 1360 con el par a la vista: el par sigue en 0 y op 1, y la tercera sigue oculta con
    su desplazamiento (72 + nueva x de la 76). Los listeners de refresh funcionan.
  - Frames: horizontal-1280-{1-llegada-derecha,2-cruce-entra-derecha,3-final-tramo,4-salida-izquierda,
    5-vuelve-izquierda,6-tramo-inicio-subiendo,7-sale-derecha}.png.
- Teclado (REQ-96-36/47): a 375 hacen falta 4 Tab para llegar a la primera card (opacity 0 antes). Al
  enfocarla queda con opacity 1, transform identidad y sin saltar de scroll. Con `focus({ preventScroll:
  true })` y emulación de foco, la tercera pasa de opacity 0 a 1.
- Reduced motion (REQ-96-34/46), 375 y 1280: 33 muestras por viewport y todas iguales (sin atributo
  style, transform none, opacity 1). 0 ScrollTrigger y sin envoltorio. Frames reduce-375.png y
  reduce-1280.png.
- ClientRouter (REQ-96-32/33/47), dos vueltas de portada → artículo (clic con un tween en curso) →
  history.back:
  - 1280: ScrollTrigger 5 → 0 en el artículo → 5 → 0 → 5. Tras astro:before-swap las cards antiguas
    quedan sin atributo style. **0 errores de consola.**
  - 375 (emulación de escritorio): 3 → 0 → 3 → 0 → 3. Cards antiguas sin style. **0 errores.**
  - Nota: con la emulación móvil de CDP (`mobile: true`) Chrome lanza
    `InvalidStateError: Transition was aborted … Viewport size changed` (View Transitions del
    ClientRouter). También sale con reduced motion, donde la 96 no crea nada, así que viene de la
    emulación móvil + View Transitions y no de esta feature. Con `mobile: false` a 375 hay 0 errores.

## Pendientes humanos (no bloquean)

- Los valores por defecto de la revisión 2 se pueden cambiar (72/60 px, 0,8 s power3.out, 0,5 s
  power2.in, stagger 0,12/0,08, rangos `top 85%`/`bottom 20%` y `top 75%`/`bottom 40%`/`left 85%`/
  `right 15%`).
- `clamp()` en el punto de salida del modo horizontal (corrección 2).

## Ronda de revisión 1 (CHANGES_REQUESTED → REQ-96-22 reescrito, REQ-96-49/50)

Cambio único: `overwrite: true` mataba todos los tweens de las mismas cards, incluido el `fromTo` de x
de las cards extremas de la 76 (latest-horizontal.ts:71). Ahora cada callback (enter, exit y el focusin)
hace `ctx.add(() => (gsap.killTweensOf(els, 'xPercent,scale,opacity'), gsap.to|fromTo(...)))` y ningún
tween declara `overwrite`. `keep`/`restore` (refreshInit/refresh) siguen y solo guardan/reponen
`xPercent` y `scale`: nunca x (el test lo comprueba). Archivos: `src/components/latest-horizontal/cards-motion.ts`
(98 líneas) y `tests/latest-cards-gsap-motion.test.mjs` (100 líneas; líneas 53-54).

### Rojo (test primero, antes de tocar cards-motion.ts)

```
✖ REQ-96-13..17/22/23: tweens por tiempo solo con xPercent, scale y opacity, en el contexto
  AssertionError [ERR_ASSERTION]: sin overwrite: true ni auto (REQ-96-22, revisión 3)
      at TestContext.<anonymous> (tests/latest-cards-gsap-motion.test.mjs:53:99)
ℹ tests 1  ℹ pass 0  ℹ fail 1
```

### Verde

- `node --test tests/latest-cards-gsap-motion.test.mjs`: 9/9 pass.
- `./init.sh`: EXIT 0, «El entorno está perfecto»: formato OK, tests al 100 % (`pnpm test`: 1003/1003) y build OK.

### Mediciones Chrome headless + CDP (build de ./init.sh, preview propio :4347, ya parado; :4321 sin tocar)

REQ-96-49 / x de la 76 (1280×800, carga limpia, rueda real; sección 0..1270, título en left 31,75):

| y | x en línea card 1 | x en línea card 3 | margen dcho. card 3 |
|---|---|---|---|
| 1205 (inicio tramo) | 0 | +17,75 | — |
| 1358 | −4,45 | +13,30 | — |
| 1510 | −8,88 | +8,88 | — |
| 1663 | −13,33 | +4,42 | — |
| 1815 (final tramo) | −17,75 | 0 | **31,75 = left del título** |

Al final del tramo la tercera card queda en 642..1238 (antes 653..1250, con el margen de 20 px).

REQ-96-50 (1280×800):
- Recarga con el scroll restaurado al fondo (scrollY 2295): al llegar al final del tramo, margen derecho
  de la card 3 = 31,75. Subiendo hasta el reposo del par de llegada (y 1205, tweens terminados):
  **card 1 en left 31,75** (antes 14) y la card 2 en 642.
- Portada (fondo) → artículo (clic) → history.back (scrollY 2295 restaurado): card 3 con margen 31,75 al final del
  tramo y **card 1 en left 31,75** en el reposo. 0 errores de consola.

Sin regresión en lo aprobado (mismos scripts del reviewer, `rv96/main.mjs` y `rv96/rest.mjs`):
- 3 cards y 3 `site-footer__post` a 375/768/1024/1280. Sin scroll horizontal en las 15 posiciones de
  cada ancho.
- Secuencia de la card 2 (375 / 768):
  - Bajo el pliegue: 72/op 0.
  - Entrada a 200 ms: 39/op 0,45. A 1 s: 0/op 1.
  - Salida: −60/op 0.
  - Regreso a 200 ms: −39/op 0,45. A 1 s: 0/op 1.
  - Por encima: +60/op 0.
- Horizontal 1280: la llegada termina en 32..628 / 642..1238 con op 1. En el fondo, el par final sale a
  −60/op 0 y al subir vuelve a 32 / 642 con op 1. Al inicio del tramo subiendo, la card 1 queda en 30
  (con x −0,06) y la 3 sale por la derecha. Por encima de la llegada, el par sale por la derecha (+60/op 0).
- Teclado: 4 Tab hasta la card 1 (op 1). `focus({preventScroll})` lleva la card 3 de op 0 a op 1.
- Reduced motion a 375/1280: 33/33 muestras sin style, con transform none y op 1. 0 ScrollTrigger.
- Sin JS: cards completas.
- ClientRouter, dos vueltas: 1280 da 5→0→5→0→5 y 375 da 3→0→3→0→3. 0 errores de consola.
- Viewports altos (1440×1000 y 1920×1080): el par final se funde en el fondo, igual que antes.
- CLS:
  - Carga limpia y recorrido: 375/768 → 0, 1024 → 0,0034, 1280 → 0 (3 de 3 ejecuciones).
  - En la secuencia de `main.mjs`, la carga a 1280 hereda el scroll del fondo de la de 1024 y da
    0,5125. Es un único shift de `site-footer` (0,0,0 → y 390, ancho 1270) a t ≈ 40 ms, antes del JS.
  - Ese 0,5125 sale idéntico con un build temporal de la versión anterior (`overwrite: true`), hecho
    solo para comparar y ya revertido. Lo que mide es la recarga con scroll restaurado que ya figura en
    current.md (pendiente humano (c), 0,508), no esta feature.
- Observación (no bloquea): tras recargar al fondo, la card 1 queda con op 1 al final del tramo. Está
  fuera de la sección (right ≈ 0), así que no se ve.
