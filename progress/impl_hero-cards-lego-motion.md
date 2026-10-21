# Implementación — Feature 115: hero-cards-lego-motion

Fecha: 2026-10-21. Spec: `specs/115_hero-cards-lego-motion/requirements.md` (22 REQ) y `design.md`.
La sesión se retomó tras un corte por límite de API. El código y el test ya estaban en disco (y entraron
en el commit 94b435b del humano). Esta sesión solo ha corrido la suite completa, la CDP y `./init.sh`, y
ha escrito este informe.

## Archivos

| Archivo | Líneas | Qué hace |
|---------|--------|----------|
| `src/domain/hero-cards-motion.ts` | 93 | Constantes congeladas LEGO_ENTER/EXIT/RANGE/VARS/MEDIA; createRng (mulberry32), legoOrder (Fisher-Yates), legoDelays, legoTilt, legoPhase, legoPhaseAt, legoFrom/Rest/Lifted. Sin gsap ni DOM |
| `src/components/new-hero/hero-cards-motion.ts` | 42 | init/destroy: un gsap.matchMedia con dos consultas (móvil con data-show-on-mobile / ancho), semilla desde Math.random, limpieza de estilos en línea |
| `src/components/new-hero/hero-cards-lego.ts` | 90 | Un ScrollTrigger por card, lotes de 100 ms en el orden de la permutación, salida, sync de fase en creación y refresh (scroll restaurado), focusin |
| `src/styles/hero-cards-motion.css` | 12 | translate/rotate/scale desde --hero-lego-* (respaldo 0px/0deg/1) y transition-property: transform, box-shadow, filter |
| `src/components/new-hero/new-hero.astro` | 67 | Importa la hoja y añade el `<script>` (astro:page-load / astro:before-swap) |
| `tests/hero-cards-lego-motion.test.mjs` | 99 | 12 tests de los 22 REQ |

No se ha tocado `hero-card.astro`, `htb-card.astro`, `hero-card-art.astro` ni `hero-card.css`: sus sha256 están fijados en el test de REQ-115-20.
Tampoco se han tocado `package.json`, `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md` ni `tests/hack-the-box-sprite.test.mjs`.

## Ciclo rojo/verde

Rojo 1 (test escrito antes de `src`, scratchpad `red115.txt`):

```
✖ REQ-115-01 ... AssertionError: falta src/domain/hero-cards-motion.ts
✖ REQ-115-02 ... ERR_MODULE_NOT_FOUND src/domain/hero-cards-motion.ts
... (REQ-115-03/04/05/06/07/16/11/20/19 en rojo)
✔ REQ-115-06/13/21 (build)   <- ya cierto antes del cambio (portada < 42 000 B, cards sin style)
ℹ tests 12  ℹ pass 1  ℹ fail 11
```

Rojo 2 (REQ-115-16 reescrito para el margen del 8 % antes de añadir `legoPhaseAt`/`LEGO_RANGE.edge`, `red115-r2.txt`):

```
✖ REQ-115-16: fase por progress y reposo de toda card que intersecta el viewport (margen 8 % ...)
  AssertionError: Expected values to be strictly equal: + undefined - 0.08
ℹ tests 1  ℹ pass 0  ℹ fail 1
```

Suite completa al retomar (antes de la CDP): 1190 tests, 1189 pass y 1 fail. El único fallo era REQ-115-19, que no encontraba `progress/research/hero115/measurements.json`.
**Ningún test heredado rompe**, así que no ha hecho falta ningún «Ajuste feature 115 (precedente REQ-43-06)».

Verde:

```
node --test tests/hero-cards-lego-motion.test.mjs  ->  ℹ tests 12  ℹ pass 12  ℹ fail 0
pnpm test                                          ->  ℹ tests 1190  ℹ pass 1190  ℹ fail 0
./init.sh -> ✔ formato ✔ tests al 100% ✔ build  "El entorno está perfecto."  (exit 0)
```

## Peso

`dist/client/index.html` pesa 40 661 B, por debajo del umbral de 42 000 B (REQ-115-21 / REQ-47-06), con 1 339 B de margen.
No ha hecho falta subir el umbral. Antes de la feature pesaba 40 562 B (+99 B: la etiqueta del `<script>` externo y la hoja).

## Verificación Chrome headless + CDP

Se usó `astro preview --port 4715` sobre el build actual, con viewport de 800 px de alto y `Math.random` sustituido (Park-Miller, seed 1) vía `Page.addScriptToEvaluateOnNewDocument`.
Hay otro script inyectado que solo sirve para medir: la interceptación del chunk de ScrollTrigger para contar triggers. El runtime no tiene ganchos de depuración.
Las evidencias están en `progress/research/hero115/`: `measurements.json` (resumen), `cdp115-raw.json` (todo), `order-*.json` y los PNG.

| Ancho | Cards visibles / animadas | Visibles en carga | Orden de inicio (seed 1) | CLS carga | CLS recarga a mitad / al fondo / history.back | Reposo antes de 1,45 s (recarga mitad, fondo, back) | ScrollTriggers (total/hero) |
|-------|------|------|------|------|------|------|------|
| 375 | 1 / 1 (solo HTB, data-show-on-mobile) | 1 | [0] | 0 | 0 / 0 / 0 | sí / sí / sí | 4 / 1 |
| 800 | 15 / 15 | 6 | [3,5,1,4,0,2] | 0 | 0 / 0 / 0 | sí / sí / sí | 18 / 15 |
| 1024 | 15 / 15 | 0 (la profile-card llena el primer viewport) | — | 0 | 0 / 0 / 0 | sí / sí / sí | 18 / 15 |
| 1280 | 15 / 15 | 10 | [1,6,9,7,2,5,3,8,0,4] | 0 | 0 / 0 / 0 | sí / sí / sí | 20 / 15 |
| 1600 | 15 / 15 | 10 | [1,6,9,7,2,5,3,8,0,4] | 0 | 0 / 0 / 0 | sí / sí / sí | 20 / 15 |

- **Entrada/salida con frames.** Los frames son `enter-{375,1280}-0..3.png`, `exit-…-0..2.png` y `reenter-…-0..2.png`. En `exit-1280-1.png` se ven las piezas levantándose: BUN girada, con opacity parcial y desplazada.
- **Orden aleatorio y determinista.** Seed 1 da [1,6,9,7,2,5,3,8,0,4] en las dos ejecuciones. Seed 2 da [5,4,6,3,2,9,1,0,7,8] también en las dos. Con el `Math.random` real (seed0) salen órdenes distintos en cada carga: [0,9,3,4,2,7,6,1,5,8] y [1,5,9,6,4,7,2,3,8,0]. En ningún caso coincide con el orden del DOM.
- **Hover intacto (1280).** Se comprobó en RUST y en HACK THE BOX. En hover, transform pasa a matrix(1,0,0,1,0,-4), filter a contrast(1.4), cambia la sombra y gira el icono. translate/rotate/scale se quedan en 0px/0deg/1 y transition-property es `transform, box-shadow, filter`. Al salir del hover todo vuelve al estado de antes.
- **Enlaces 107/110.** YOUTUBE y GITHUB tienen `target=_blank` y `rel="noopener noreferrer"`, opacity 1, y `elementFromPoint` cae sobre el enlace.
- **Foco (REQ-115-17).** La card enlazada estaba fuera del viewport con opacity 0. Tras `focus()` queda con opacity 1 y --hero-lego-y 0px.
- **Reduced-motion (375 y 1280).** 0 ScrollTriggers, 0 estilos en línea, todas las cards con opacity 1 y 0 inicios de animación.
- **Sin JS (375 y 1280).** Todas las cards visibles con opacity 1, translate 0px, rotate 0deg, scale 1 y sin atributo style. Captura: `nojs-1280.png`.
- **ClientRouter.** Hice 3 idas y vueltas `/` → `/about` → `/`. En `/about` hay 0 triggers. Al volver a `/` siempre hay 20 / 15 (no se acumulan) y las cards en reposo.
- **Móvil.** A 375 solo se registra y anima la card con data-show-on-mobile (HTB). Las ocultas no tienen ni trigger ni estilo en línea.
- **Errores.** 0 excepciones, 0 errores de consola y 0 errores de log en toda la ejecución.

## Observación para el reviewer (no bloquea; dentro de la spec)

A 1280/1600 la fila NESTJS…CLAUDE CODE asoma unos 50 px en el 8 % inferior del primer viewport.
- En la carga queda en reposo, porque `legoPhaseAt` trata el margen como visible (REQ-115-16).
- Si se baja hasta que esa fila sale por arriba y luego se vuelve a scroll 0, `onLeaveBack` del rango `top 92%` la levanta: queda con opacity 0 mientras asoma (`afterReenter1280` en `measurements.json`, `reenter-1280-2.png`). Encaja de nuevo en cuanto se baja un poco.

Esto sale del rango `top 92%` de design.md. Si el humano quiere que se vea también al volver arriba, habría que cambiar el start de la salida o ignorar `onLeaveBack` mientras la card intersecta el viewport. Eso queda para una decisión aparte.

## Servidores

Al retomar había un `astro preview --port 4715` vivo de la sesión cortada (PIDs 48572/49992), y lo he parado. También he parado el preview que arranqué para la CDP. Los Chrome headless se cerraron. Solo queda el `pnpm dev` en :4321.

## Ronda de revisión 1 (CHANGES_REQUESTED → Cambio requerido 1)

**Defecto.** El ScrollTrigger de entrada (`top 92%` / `bottom 8%`) también lanzaba la salida. Por eso `onLeaveBack` levantaba la fila NESTJS…CLAUDE CODE (top 751 de 800 a 1280/1600) al volver a scroll 0, aunque siguiera asomando. En cambio, `sync()` con `legoPhaseAt` la dejaba en reposo. Con `onLeave` pasaba lo mismo por arriba: la card se levantaba con su borde inferior aún en el 8 % superior.

**Corrección (dos rutas coherentes).**
- `src/domain/hero-cards-motion.ts`: `LEGO_RANGE` añade `exitStart: 'top bottom'` y `exitEnd: 'bottom top'`. Son el rango de entrada ampliado en `edge`, es decir, los mismos límites de reposo que usa `legoPhaseAt`.
- `src/components/new-hero/hero-cards-lego.ts`: el trigger de entrada (`LEGO_RANGE.start` / `end`) solo tiene `onEnter` y `onEnterBack`. Un segundo `ScrollTrigger.create` por card, con `LEGO_RANGE.exitStart` / `exitEnd`, lleva `onLeave` → `exit(card, 'gone')` y `onLeaveBack` → `exit(card, 'before')`.
- La salida sigue siendo el tween de `legoLifted()` (0.35 s, power2.in), pero ahora solo se dispara cuando la card deja de intersectar el viewport (REQ-115-08).
- Ambos triggers se crean dentro del contexto de `gsap.matchMedia`, así que `mm.revert()` los mata igual que antes. Por eso pasa de 15 a 30 triggers en el hero, sin acumulación tras las idas y vueltas.
- Archivos: lego 95 líneas, dominio 94 y test 100.

**Test primero (`tests/hero-cards-lego-motion.test.mjs`, 100 líneas).**
- REQ-115-01 fija `exitStart` y `exitEnd`.
- REQ-115-07/08 separa los dos `ScrollTrigger.create`: el de `LEGO_RANGE.start` debe tener `onEnter`/`onEnterBack` y no `onLeave`/`onLeaveBack`, y el de `LEGO_RANGE.exitStart` al revés.
- REQ-115-16 añade el borde: con scroll -48 la card de top 751 sigue en `'rest'`.
- REQ-115-19 exige `hiddenVisibleBack === 0` a 1280 y 1600 en `measurements.json`.

**Rojo** (`scratchpad/red115-r3.txt`), 9 pass / 3 fail:
```
✖ REQ-115-01 ... actual: undefined, expected: 'top bottom'
✖ REQ-115-07/08/09/10/17 ... AssertionError: onLeave:
✖ REQ-115-19 ... AssertionError: cards visibles levantadas al volver a scroll 0 (1280)
ℹ pass 9
ℹ fail 3
```
**Verde.**
- `green115-r3.txt`: 12/12.
- `suite115-r3.txt`: 1190/1190.
- `./init.sh` (`init115r1.txt`): exit 0, con formato, tests al 100 % y build.
- `dist/client/index.html`: 40 661 B (< 42 000).

**CDP** (`astro preview :4715`, ya parado; el `pnpm dev` de :4321 no se tocó; `Math.random` con seed 1). Scripts en el scratchpad: `cdp115/back.mjs`, `cdp115/run.mjs` y `cdp115/merge-r1.mjs`. Salidas en `out3/` y `out4/`.
- **Carga → fondo → scroll 0 (1280×800 y 1600×800).** La fila NESTJS, CSS, REACT, HTML, CLAUDE CODE (top 751) queda en opacity 1 en la carga y al volver: `hidden: []` en los dos anchos. Al fondo, todas las cards fuera del viewport quedan en opacity 0, así que la salida sigue funcionando.
- **/about → history.back() hasta scroll 0 (3 veces por ancho).** Tras la restauración del scroll (2275 / 2283) y después de `scrollTo(0, 0)` hay 0 cards visibles con opacity < 1 (`routerBackTopHidden [0,0,0]`). En /about hay 0 cards con style. Al volver hay 35/30 triggers estables.
- `hiddenVisibleBack = 0` a 1280 y a 1600.
- **Sin regresiones** (run.mjs completo a 375/800/1024/1280/1600):
  - CLS 0 en la carga, en la recarga a mitad, en la recarga al fondo y en history.back.
  - Reposo antes de 1,45 s en los tres casos.
  - Entrada con lote: 10 inicios a 1280/1600, 6 a 800 y 1 a 375 (solo HTB).
  - Salida a scroll 700 con opacity 0 fuera del viewport.
  - `afterReenter` a 1280: 10 visibles, 0 sin reposo (antes eran 5).
  - Reduced-motion (375/1280): 0 triggers, 0 estilos en línea y 0 inicios.
  - Sin JS, todo en reposo y sin style.
  - El hover y los enlaces YOUTUBE/GITHUB siguen igual, y el foco lleva la card a opacity 1.
  - 0 errores.
- **Evidencias actualizadas en `progress/research/hero115/`.**
  - `measurements.json`: campos por ancho regenerados, más `hiddenVisibleBack`, `edgeRowAtLoad`, `edgeRowBackTop`, `routerBackTopHidden`, `round1` y `afterReenter1280`.
  - `cdp115-raw.json`: `run` + `back`.
  - `reenter-1280-0..2.png` y `reenter-1280-final.png` (la fila inferior visible al volver).
  - El resto de PNG, regenerados con el build de la ronda.
  - `order-*.json` no cambia: la lógica de orden no se ha tocado.
