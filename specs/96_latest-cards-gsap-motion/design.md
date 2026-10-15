# Diseño — 3 «Últimos artículos» con entrada y salida laterales clásicas de GSAP (feature 96 latest-cards-gsap-motion)

## Contexto visual

- Sección «Últimos artículos» de la portada (/): src/components/latest-articles.astro + latest-articles.css
  (apilado, <=1200 px o con reduced motion) y modo horizontal de latest-horizontal.css (features 72-76,
  >=1201 px sin reduced motion: envoltorio sticky, par de cards visible, recorrido del track en X).
- Estado actual (árbol, feature 95): 4 cards; desliz CSS scroll-driven (linear, 56 px, ligado 1:1 al
  scroll) solo en apilado; en horizontal, entrada del TRACK desde arriba (75).
- Nota humana (2026-10-15, literal): «que se vea más bonita nada más, busca opciones clásicas en la
  librería, más que nada en la entrada y salida porque se ve muy rústico, eso queremos mejorar en
  específico: cómo entran y cómo salen de los laterales». Lo «rústico» es el scrub linear: la card va
  pegada al dedo/rueda sin curva. Revisión 2: patrón clásico de GSAP, tweens por tiempo con frenada.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--gap-card` | 14px (sin cambios) | Gap del track; lo lee el horizontal (sin cambios) |
| `--container-max` | 1500px (sin cambios) | Ancho máximo de la sección (sin cambios) |

La animación no usa longitudes en CSS: los valores (px de desplazamiento, escala, opacidad, tiempos,
eases y rangos) viven en src/domain/latest-cards-motion.ts. tokens.css no se toca.

## Movimiento (valores por defecto revisables por el humano)

Patrón clásico: `ScrollTrigger.batch` (apilado) / ScrollTrigger con callbacks (horizontal) que lanzan
tweens POR TIEMPO (sin `scrub`). Antes de cada tween, `gsap.killTweensOf(els, 'xPercent,scale,opacity')` (sin `overwrite: true`).

Control de solapamiento (revisión 3, REQ-96-22): `overwrite: true` mata TODOS los tweens de los mismos
targets sea cual sea la propiedad, incluido el `fromTo` de x de las cards extremas de la 76
(latest-horizontal.ts:71), y congelaba su x a 1280 (tercera card con 20 px de margen derecho frente a 32;
primera card en left 14 tras recargar al fondo o history.back). Se elige `killTweensOf` por propiedades
frente a `overwrite: 'auto'` porque: (a) la lista de propiedades es explícita y excluye x por
construcción; (b) actúa en el instante del callback y también sobre tweens con retardo de stagger aún
no arrancados, mientras que `'auto'` solo resuelve conflictos con tweens activos en el primer render
del nuevo; (c) es verificable con un test estático. La x de la 76 y la del track nunca se tocan. Si
`keep`/`restore` (refreshInit/refresh) siguen siendo necesarios, no reponen x (solo xPercent, scale y
opacity). Medidas obligatorias: REQ-96-49 (margen derecho de la tercera = left del título, 32 ±1 a
1280×800) y REQ-96-50 (primera card en left 32 ±1 tras recargar al fondo o history.back).

| Callback | Sentido del scroll | De | A | Tiempo |
|----------|--------------------|----|---|--------|
| onEnter | baja, la card aparece | +72 px (derecha), scale 0.96, opacity 0 | 0, scale 1, opacity 1 | 0.8 s, power3.out, stagger 0.12 |
| onLeave | baja, la card se va por arriba | estado actual | −60 px (izquierda), opacity 0 | 0.5 s, power2.in, stagger 0.08 |
| onEnterBack | sube, la card vuelve | −72 px (izquierda), scale 0.96, opacity 0 | 0, scale 1, opacity 1 | 0.8 s, power3.out, stagger 0.12 |
| onLeaveBack | sube, la card se va por abajo | estado actual | +60 px (derecha), opacity 0 | 0.5 s, power2.in, stagger 0.08 |

Lectura: al bajar, las cards entran desde la derecha y se asientan con frenada; al salir aceleran
hacia la izquierda (el mismo sentido que el recorrido horizontal). Al subir, el movimiento se invierte
de forma coherente: vuelven desde la izquierda y se van por la derecha. Sin rebote (sin back/elastic)
y sin alternar lados entre cards.

Rangos: apilado por card `start 'top 85%'`, `end 'bottom 20%'`. Horizontal: envoltorio `'top 75%'`
(llegada del par inicial) y `'bottom 40%'` (salida del par final, siempre después del tramo fijado);
cards que cruzan el borde de la sección durante el recorrido: `containerAnimation` con
`'left 85%'` → `'right 15%'`.

### Por qué xPercent y no x (desviación justificada de la concreción «x de 72 px»)

La timeline de la feature 76 escribe `x` en línea en la primera y la última card del horizontal, y la
73 escribe `x` en el track. Un segundo tween sobre `x` de la misma card la sobrescribiría. GSAP compone
`x`, `xPercent`, `scale` y `opacity` en un único transform, así que se anima `xPercent`; para que el
efecto visible sea el pedido (72 / 60 px) en todos los anchos, el porcentaje se calcula por card con la
función pura `offsetPercent(px, card.offsetWidth)` (offsetWidth no incluye la escala). Ejemplo: card de
343 px a 375 → 72 px ≈ xPercent 21; card de 600 px → 12.

### Por qué opacity y no autoAlpha (desviación justificada)

`autoAlpha: 0` pone `visibility: hidden`, que saca los enlaces de las cards del orden de tabulación:
con teclado se saltarían las cards aún no entradas. Se anima `opacity`; además, un `focusin` en una
card con opacity < 1 la lleva al estado final (REQ-96-36). Alternativa revisable: autoAlpha si el
humano acepta esa pérdida.

## Arquitectura (un solo sistema por card)

```
latest-horizontal.astro  -> import latest-horizontal.css + latest-cards-motion.css; 1 <script> (init/destroy)
latest-horizontal.ts     -> gsap.matchMedia: DESKTOP (setup horizontal [+ cardsMotion horizontal si H-integrado])
                                            STACKED (cardsMotion apilado, cualquier n >= 1)
cards-motion.ts (nuevo)  -> estado de partida + ScrollTrigger con 4 callbacks + focusin; importa gsap
latest-cards-motion.ts   -> CARDS_ENTER, CARDS_EXIT, CARDS_STACKED, CARDS_HORIZONTAL (congeladas), offsetPercent
latest-cards-motion.css  -> .home__landing { overflow-x: clip; }  (sin estado oculto)
```

Esqueleto de referencia del apilado (el implementer lo ajusta sin salirse de la spec):

```ts
const pct = (px: number) => (_i: number, el: HTMLElement) => offsetPercent(px, el.offsetWidth);
const enter = (els: Element[], side: 1 | -1) => ctx.add(() => (gsap.killTweensOf(els, 'xPercent,scale,opacity'), gsap.fromTo(els,
  { xPercent: pct(side * CARDS_ENTER.offsetPx), scale: CARDS_ENTER.scale, opacity: CARDS_ENTER.opacity },
  { xPercent: 0, scale: 1, opacity: 1, duration, ease, stagger })));
const exit = (els: Element[], side: 1 | -1) => ctx.add(() => (gsap.killTweensOf(els, 'xPercent,scale,opacity'), gsap.to(els,
  { xPercent: pct(side * CARDS_EXIT.offsetPx), opacity: 0, duration, ease, stagger })));
gsap.set(cards, { xPercent: pct(CARDS_ENTER.offsetPx), scale: CARDS_ENTER.scale, opacity: 0 });
ScrollTrigger.batch(cards, { start, end,
  onEnter: (b) => enter(b, 1), onLeave: (b) => exit(b, -1),
  onEnterBack: (b) => enter(b, -1), onLeaveBack: (b) => exit(b, 1) });
```

`ctx` es el contexto de `mm.add` (segundo argumento del callback): los tweens creados después por los
callbacks quedan registrados y `mm.revert()` (destroy, astro:before-swap) los mata aunque estén en
curso; clearTrack (track-dom.ts) ya quita transform/opacity en línea de las cards. Si `ctx.add` no
encaja, `gsap.killTweensOf(cards)` en la limpieza antes de clearTrack.

## Modo horizontal (>=1201 px): requisito condicional

- Rama H-integrado (preferida): ScrollTrigger sobre el envoltorio `'top 75%'` (onEnter: par inicial
  entra desde la derecha; onLeaveBack: sale por la derecha), ScrollTrigger `'bottom 40%'` (onLeave: par
  final sale por la izquierda; onEnterBack: vuelve desde la izquierda) y, para las cards que cruzan el
  borde durante el recorrido, `containerAnimation: tween` (la timeline existente, ya con ease none) con
  `'left 85%'` / `'right 15%'`. Se retira la entrada del track de la 75 y src/domain/latest-entrance.ts;
  cardWidth divide por `gsap.getProperty(card, 'scale')`. Riesgo: containerAnimation solo conoce la x
  del track, no la x propia de las cards extremas (76); si las posiciones no cuadran, H-intacto.
- Rama H-intacto (fallback, no bloquea): el horizontal queda como en el árbol de partida (entrada del
  track de la 75, latest-entrance.ts, cardWidth por la escala del track), sin animación nueva de cards
  ni regresiones; se anota en progress/current.md y en el impl. latest-horizontal.ts mide 95 líneas:
  en esta rama solo entran la consulta STACKED, el import y el mm.add (<=100).
- Criterio de decisión: la rama H-integrado se abandona si rompe el sticky, el recorrido (n−2)(W+G),
  la x de la 76 o las medidas CDP del punto 4.

### Restauración del scroll (revisión 4, REQ-96-51/52)

Defecto (segundo CHANGES_REQUESTED): a 1280×800, al recargar o volver con history.back con el scroll en
y 1510, 1815, 2000 o 2280, la card 3 queda en su hueco con opacity 0, xPercent +72 px y scale 0.96 (el
estado de `hide()`); solo se libra y 2295, donde dispara el onEnterBack del par final. Causa probable:
`hide(cards)` va después de crear los triggers y oculta a ciegas, y los triggers `cross`
(containerAnimation) no relanzan su onEnter al restaurar la posición. El apilado no lo sufre.

Enfoque esperado (sin imponer más código del necesario): sustituir el `hide()` incondicional por una
sincronización por trigger, tras crear los triggers y en el listener `refresh` (después de `restore`,
para que la sincronización gane). Para cada trigger: `isActive` → estado final (xPercent 0, scale 1,
opacity 1, con `gsap.set` o llamando al callback de entrada correspondiente); `progress === 0` → estado
de `hide()` del lado por el que entraría; `progress === 1` → estado de salida del lado por el que
salió. Se mantiene killTweensOf por propiedades (REQ-96-22) y x nunca se toca. Si cards-motion.ts
supera 100 líneas, el helper va a un módulo hermano (REQ-96-42). Aplica a los dos modos; en apilado
`ScrollTrigger.batch` ya lo cumple y basta con no romperlo.

Medida (REQ-96-52): sin rueda tras restaurar y con los tweens terminados, recarga y history.back
(incluido el caso clic en la card 3 a y 1815 y vuelta) en y = 1510, 1815, 2000, 2280 y 2295 a
1280×800, y a 375 en apilado con una card en vista. Toda card con trigger activo en op 1, xPercent 0 y
scale 1, y el estado coincide (±2 px, ±0.05 de opacity) con el alcanzado con rueda real desde carga
limpia hasta la misma y. Se repiten REQ-96-49/50 y la ida y vuelta del ClientRouter.

## Decisiones y constraints

- D1 `LATEST_POSTS_LIMIT = 3`; se mantiene `FOOTER_LATEST_POSTS_LIMIT = 3`. Se conserva transition:name.
  REQ-47-06 vuelve a 40 000 B (3 cards medían 38 067 B).
- D2 Un solo sistema por card: se borra latest-cards-slide.css (95) en ambas ramas. Nunca dos
  animaciones sobre la misma card.
- D3 Estado de partida SOLO desde JS (gsap.set al inicializar el modo): sin JS, cards estáticas y completas.
- D4 Consultas de media solo en latest-horizontal.ts (REQ-56-04); STACKED =
  '(max-width: 1200px) and (prefers-reduced-motion: no-preference)'. Con reduce no se crea nada.
- D5 El early return `length < 3` pasa a aplicar solo al modo horizontal; el apilado anima con n >= 1.
- D6 latest-cards-motion.css solo recorta X en .home__landing (clip no crea contenedor de scroll; el
  sticky de la 73 sigue funcionando; overflow-y visible).
- Restricciones: solo transform y opacity; <=100 líneas por archivo (cards-motion.ts puede partirse en
  un segundo módulo del mismo directorio); estilos en src/styles; sin dependencias nuevas;
  latest-articles.astro/.css, latest-horizontal.css, src/domain/latest-horizontal.ts y tokens.css congelados.

## Tests existentes que se ajustan (nota «Ajuste feature 96 (precedente REQ-43-06)»)

| Test | Ajuste |
|------|--------|
| home-latest-articles-five (95) | REQ-95-01/04/05/06 a 3; REQ-95-08 sin congelar latest-horizontal.ts (ni latest-entrance.ts en H-integrado); REQ-95-13..21 retirados (hoja borrada) |
| home-latest-articles-limit (30) | REQ-30-01/02/03/04/13 vuelven a 3 |
| latest-horizontal-compact-sticky (73) | REQ-73-33 vuelve a 3 |
| search-index-lazy-load (47) | REQ-47-06 vuelve a 40 000 B |
| gsap-dependency-approval (70) | REQ-70-08/09 admite que cards-motion.ts importe gsap |
| latest-cards-entrance (75), solo H-integrado | REQ-75-01..11 retirados; REQ-75-14/15 (CSS) se conservan; REQ-75-27 sin latest-entrance.ts |
| latest-cards-full-bleed (76), solo H-integrado | REQ-76-10 cambia el ancla `gsap.fromTo(track` por la llamada a cardsMotion |

## Verificación medida en navegador (obligatoria; cifras en progress/impl_latest-cards-gsap-motion.md)

Chrome headless (`"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new
--remote-debugging-port=<p> --user-data-dir=<tmp>`) sobre `pnpm build` + `pnpm preview`; script Node con
WebSocket nativo contra CDP, sin playwright, en el scratchpad (base: cdp95.mjs / cdp95b.mjs / rev95.mjs).
translateX se lee de la matriz de `getComputedStyle(card).transform`.

1. 375 / 768 / 1024 / 1280: 3 `.latest-articles__card`, 3 `.site-footer__post`; en >=10 posiciones de
   scroll `scrollWidth <= clientWidth`.
2. 375 / 768 con movimiento, secuencia por card (se espera >= 1 s tras cada scroll salvo en «a mitad»):
   a. bajo el pliegue: translateX > 0, opacity 0;
   b. al cruzar 'top 85%': a ~150 ms translateX > 0 y 0 < opacity < 1 (entra desde la derecha); a 1 s
      matriz identidad (±0.5 px) y opacity 1;
   c. pasado 'bottom 20%': a 1 s translateX < 0 y opacity 0 (salió por la izquierda);
   d. regreso hacia arriba dentro del rango: a ~150 ms translateX < 0 (entra desde la izquierda); a 1 s
      identidad y opacity 1;
   e. por encima de 'top 85%': a 1 s translateX > 0 y opacity 0 (salió por la derecha).
3. Teclado: Tab hasta el enlace de una card con opacity 0; a 1 s opacity 1 e identidad.
4. 1280×800 con movimiento: existe `.latest-articles--horizontal-pin`; al final del tramo cards 2 y 3
   completas en el rect de la sección (±2 px) con opacity 1. H-integrado: la secuencia a-e del punto 2
   sobre la llegada (envoltorio 'top 75%') y la salida (envoltorio 'bottom 40%'), y la card que cruza
   el borde durante el recorrido entra desde la derecha. H-intacto: mismas medidas que la 75/76 en HEAD
   y cards sin xPercent nuevo.
   Revisión 3 (H-integrado, rueda real, carga limpia): la x en línea de la card 1 va de 0 a −delta y la
   de la card 3 de +delta a 0 durante el tramo; al final, margen derecho de la tercera = left del título
   (32 px ±1, REQ-96-49); tras recargar al fondo y tras history.back, al subir y reposar el par de
   llegada, la primera card con left 32 px ±1 (REQ-96-50). Revisión 4: restauración del scroll
   (recarga y history.back) en y 1510/1815/2000/2280/2295 sin cards activas invisibles (REQ-96-51/52).
5. Reduced motion a 375 y 1280: cards sin atributo style, transform none, opacity 1.
6. CLS por PerformanceObserver de layout-shift (buffered, sin hadRecentInput) recorriendo de arriba
   abajo: <= 0.1 a 375, 768 y 1280 (el 0,508 al recargar con el scroll restaurado al fondo es previo).
7. ClientRouter: portada → artículo → portada (clic y history.back) sin errores de consola
   (Runtime.exceptionThrown / Log.entryAdded error) y `window.ScrollTrigger.getAll().length` igual a la
   primera carga (si GSAP no expone el global, medidas indirectas documentadas; sin globales de depuración).
8. Frames PNG en progress/research/home96/: entrada, salida y regreso (entra por la izquierda / sale por
   la derecha) a 375, 768 y 1280; reduce.

## Alternativas descartadas

- Scrub (también suavizado con scrub 0.6-1): sigue ligado al scroll; es lo que se percibe «rústico».
- Alternar el lado por card (impares derecha, pares izquierda): la nota pide entrada y salida por los
  laterales con un único sentido; se descarta por ruido visual.
- back.out o elastic: rebote; descartado («sin rebote»).
- Mantener el CSS scroll-driven de la 95 junto a GSAP: dos sistemas sobre la misma card.
