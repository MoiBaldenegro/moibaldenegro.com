# Review — feature 115 (hero-cards-lego-motion)

**Veredicto:** APPROVED

> Veredicto vigente: el de la Revisión 2 (abajo). La Revisión 1 (CHANGES_REQUESTED) se conserva debajo como historial.

## Revisión 2

Fecha: 2026-10-21. Revisión de nivel 1 tras la «Ronda de revisión 1» de `progress/impl_hero-cards-lego-motion.md`.

### Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] Sin cambios en CSS ni en `.astro`.
- C2 Sin lógica en UI: [x] `exitStart`/`exitEnd` están en `LEGO_RANGE` (`src/domain/hero-cards-motion.ts:15`). El runtime solo los consume.
- C3 Datos vía repositorio: [x] No aplica, no hay datos nuevos.
- C4 Tokens: [x] Sin valores visuales nuevos.
- C5 ≤ 100 líneas: [x] Lego 95, dominio 94 y test 100 (justo en el límite).
- C6 Sin dependencias nuevas: [x]
- C7 `./init.sh` verde: [x] Exit 0 con formato, tests al 100 % y build (`scratchpad/rev115/init-r2.txt`). `dist/client/index.html` = 40 669 B (< 42 000).
- C8 Test-first: [x] `scratchpad/red115-r3.txt` da 9 pass / 3 fail. Los tres fallos son los nuevos asertos de REQ-115-01 (`exitStart` undefined), REQ-115-07/08 (`onLeave` en el trigger de entrada) y REQ-115-19 (`hiddenVisibleBack` undefined). Después, verde 12/12 y la suite completa en verde.
- C9 Dependencias: [x] La 115 no tiene `depends_on`.
- C10 Página correcta en desktop y móvil sin errores: [x] El defecto de la Revisión 1 está resuelto (ver abajo). 0 errores de consola.

### Cambio requerido 1: resuelto
- **Código.** `src/components/new-hero/hero-cards-lego.ts:53-60`. El trigger de entrada (`LEGO_RANGE.start`/`end`) solo tiene `onEnter`/`onEnterBack`. Un segundo trigger por card (`LEGO_RANGE.exitStart`/`exitEnd` = `top bottom`/`bottom top`) tiene `onLeave`/`onLeaveBack` → `exit()`.
  - La salida sigue siendo el tween de `legoLifted()` con `LEGO_EXIT`, y ahora solo se dispara al dejar de intersectar (REQ-115-08).
  - Es coherente con `sync()`/`legoPhaseAt`, que usa los mismos límites ampliados en `edge`.
  - Los dos triggers se crean dentro del contexto de `gsap.matchMedia`, así que `mm.revert()` los mata.
- **Test.** `tests/hero-cards-lego-motion.test.mjs:59-61` separa los callbacks por trigger con aserción cruzada. La línea 72 cubre el borde con scroll -48 → `'rest'` y la línea 98 exige `hiddenVisibleBack === 0` a 1280 y 1600. `progress/research/hero115/measurements.json` tiene `hiddenVisibleBack = 0` en los dos anchos.
- **CDP propia.** `astro preview :4790`, ya parado; el `pnpm dev` de :4321 no se ha tocado. Se repitió `rev115/r.mjs` con seed 1 → `rev115/out-1.json`. La salida de la ronda anterior está en `rev115/r1old/`.
  - 1280×800 y 1600×800, carga → fondo → scroll 0: `backTop.badVisible = []`. Antes eran las cards 5..9 con opacity 0.
  - Tras 3 idas y vueltas `/` → `/about/` → `history.back()`, y luego fondo → scroll 0: `afterRouterTop = []`.
  - En /about hay 0 cards con style.
  - `reenter-1280-final.png` muestra la fila inferior visible al volver.

### Sin regresiones (verificado)
- **CLS.** 0 en la carga, en la recarga al fondo, en la recarga a mitad y en los 3 `history.back`, a 375, 800, 1024, 1280 y 1600.
- **Reposo.** Las cards visibles están en reposo a 1,45 s en todos los casos (`badVisible` vacío).
- **Entrada.** Lote con orden aleatorio, no el del DOM: a 1280/1600 da [5,4,7,0,1,8,9,6,2,3] (empate 4/5 por resolución de rAF) y a 800 da [0,3,4,5,1,2].
- **Salida.** Al fondo, todas las cards fuera del viewport quedan en opacity 0 en todos los anchos. Lo mismo tras las idas y vueltas.
- **ScrollTrigger y listeners.** Se mantienen estables: 1 listener de scroll tras cada ida y vuelta.
- **Reduced-motion (375/1280).** 0 estilos en línea y todas las cards en reposo.
- **Sin JS.** Todas las cards en opacity 1, en reposo y sin style.
- **Móvil (375).** Solo se anima HTB.
- **Hover a 1280 (`rev115/r3.mjs`, cards 0/1/3).** Transform pasa a `matrix(1,0,0,1,0,-4)`, filter a `contrast(1.4)` y la sombra sube. El icono gira. translate/rotate/scale se quedan en 0px/0deg/1 y todo vuelve al estado inicial al salir.
- **Enlaces.** YouTube y GitHub tienen `target=_blank` y `rel="noopener noreferrer"`.
- **Foco.** La card de GitHub pasa de opacity 0 a 1 y a translate 0px.
- **Errores.** 0 excepciones y 0 errores de consola.
- **Aclaración sobre `out2.json`.** Su `hover0`/`hover2` mide con la página aún lifted, porque `r2.mjs` lee antes del encaje. Es un artefacto del script, igual que en la Revisión 1. El hover válido es el de `r3.mjs`.

### Observaciones (no bloquean)
- **Parpadeo con CPU x6.** Persiste: FCP 220 / style 250 a 800 y FCP 392 / style 471 a 1280. Ya estaba anotado en la Revisión 1; lo valora el humano.
- **Borde superior al subir.** Al subir, una card que asoma solo en el 8 % superior sigue en opacity 0 hasta cruzar `bottom 8%`. Es simétrico al estado de carga en el 8 % inferior. No afecta a scroll 0 ni contradice REQ-115-08, porque la salida ya ocurrió cuando la card salió del todo.

## Cambios requeridos
Ninguno.

---

# Revisión 1 (historial)


**Veredicto (Revisión 1):** CHANGES_REQUESTED

Fecha: 2026-10-21. Revisión de nivel 1. Spec: `specs/115_hero-cards-lego-motion/requirements.md` (22 REQ) y `design.md`.
Informe: `progress/impl_hero-cards-lego-motion.md`. He verificado todo por mi cuenta: `./init.sh`, la lectura del código y una CDP propia
(`astro preview --port 4790`, ya parado; el `pnpm dev` de :4321 no se ha tocado). Los scripts y la salida están en el scratchpad, en `rev115/` (`r.mjs`, `r2.mjs`, `r3.mjs`, `out-1.json`, `out-1b.json`, `out-2.json`, `out2.json` y los PNG).

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (`src/styles/hero-cards-motion.css`, 12 líneas)
- C2 Sin lógica en UI: [x] Valores y funciones puras en `src/domain/hero-cards-motion.ts`. Sin gsap ni DOM (lo comprueba REQ-115-01). El `<script>` de `new-hero.astro:62-67` solo conecta init/destroy.
- C3 Datos vía repositorio: [x] No hay datos nuevos.
- C4 Tokens: [x] No hay colores, espaciados ni sombras nuevos. Los valores de animación están en el dominio.
- C5 ≤ 100 líneas: [x] Dominio 93, runtime 42, lego 90, css 12, astro 67, test 99.
- C6 Sin dependencias nuevas: [x] `package.json` no cambia. GSAP ya estaba aprobado.
- C7 `./init.sh` verde: [x] Exit 0: formato, tests al 100 % y build. `dist/client/index.html` = 40 665 B (< 42 000).
- C8 Test-first: [x] El informe documenta dos rojos (`red115.txt` 11/12 en rojo y `red115-r2.txt`) y después el verde 12/12 y 1190/1190.
- C9 Dependencias: [x] La 115 no tiene `depends_on`.
- C10 Página correcta en desktop y móvil sin errores: [ ]  ← Razón: a 1280 y 1600 px, al volver a scroll 0 queda un hueco de 5 cards visibles (ver Cambio 1). 0 errores de consola.

## Verificación independiente (CDP)

Lo que cumple:
- **Orden aleatorio y determinista.** Con `Math.random` fijado por semilla, la seed 1 da [4,5,7,0,1,8,9,6,2,3] a 1280 en dos ejecuciones. La seed 2 da [5,8,9,6,3,1,0,4,7,2]. Ninguno es el orden del DOM. El empate 4/5 a 1600 se debe a la resolución de rAF.
- **Entrada.** El frame `reenter-1280-150.png` muestra RUST y CLOUDFLARE cayendo, giradas y semitransparentes. A 260 ms encajan. La sensación de «legos que se acomodan» se consigue.
- **Salida.** Al fondo, las 15 cards fuera del viewport quedan en opacity 0 (a 375 px, solo HTB).
- **Estilos en línea.** Solo hay `opacity` y `--hero-lego-scale`, `--hero-lego-rotate` y `--hero-lego-y`.
- **CLS.** Es 0 en la carga, en la recarga a mitad (y 700), en la recarga al fondo y en 3 idas y vueltas `/` → `/about/` → `history.back()`, a 375, 800, 1024, 1280 y 1600. Tras la recarga y tras el back, todas las cards visibles quedan en reposo antes de 1,45 s.
- **ClientRouter.** En `/about/` no queda ninguna card con style. Los listeners de scroll se mantienen estables (1) tras 3 idas y vueltas. Después, la salida y la entrada siguen funcionando.
- **Hover a 1280** (HTB, card 1 con icono, card 3). Transform pasa a `matrix(1,0,0,1,0,-4)`, filter a `contrast(1.4)` y la sombra sube. El icono gira. translate/rotate/scale se quedan en 0px/0deg/1 y todo vuelve al estado inicial al salir.
- **Enlaces 107/110.** YouTube y GitHub tienen `target=_blank` y `rel="noopener noreferrer"`.
- **Logos.** Los sha de los cuatro archivos de la card están fijados en el test (REQ-115-20) y el test pasa.
- **Foco.** La card de GitHub, fuera del viewport, pasa de opacity 0 a 1 y a translate 0px al recibir el foco.
- **Reduced-motion (375/1280).** 0 estilos en línea, 0 mutaciones de style y todas las cards en reposo.
- **Sin JS (375/1280).** Todas las cards con opacity 1, en reposo y sin style.
- **Móvil (375).** Solo se anima HTB (`data-show-on-mobile`). Las ocultas no tienen style.
- **Errores.** 0 excepciones y 0 errores de consola o log.

Lo que falla:
- **Defecto reproducido** (`out-1.json` → `[1280|1600].backTop` y `afterRouterTop`): a 1280×800 y 1600×800, tras bajar al fondo y volver a scroll 0, las cards 5..9 (fila NESTJS, CSS, REACT, HTML, CLAUDE CODE) se quedan con `opacity 0`, `translate 0px -24px` y `scale 1.04`. Su borde superior está en el píxel 747 de 800, así que asoman unos 53 px en el viewport.
- En la carga, en esa misma posición de scroll, esas cards están en reposo (`enter-1280-260.png`). Al volver, el mosaico de la portada aparece con un hueco a lo ancho del pliegue (`reenter-1280-final.png`). Pasa igual tras cada ida y vuelta con el ClientRouter.

## Cambios requeridos
1. **Una card que sigue intersectando el viewport no debe levantarse** (REQ-115-08: la salida es «WHEN una card sale del viewport»). El estado a scroll 0 tiene que ser el mismo en la carga y al volver.
   - Hoy `src/components/new-hero/hero-cards-lego.ts:54` (`onLeaveBack: () => exit(card, 'before')`) levanta la card en cuanto su top pasa por debajo de `top 92%`, aunque siga visible.
   - En cambio, `sync()` (líneas 59-68) con `legoPhaseAt` sí la trata como visible y la deja en reposo.
   - Hay que hacer coherentes las dos rutas. Por ejemplo: que `exit` consulte `legoPhaseAt(trigger, scrollY, innerHeight)` y no levante mientras la fase sea `'rest'`; o separar el rango de salida (`top bottom` / `bottom top`) del de entrada. La salida debe seguir siendo un tween de `legoLifted()` cuando la card salga del todo.
   - Añade un test en `tests/hero-cards-lego-motion.test.mjs` que lo cubra en rojo antes del cambio (lógica en el dominio si hace falta), manteniendo el archivo en ≤ 100 líneas.
   - Repite la CDP a 1280 y 1600 (alto 800): carga → fondo → scroll 0, y también tras `/about` → `history.back()` hasta scroll 0. Ninguna card que intersecte el viewport puede quedar con opacity < 1. Actualiza `progress/research/hero115/` (`measurements.json` y `reenter-1280-*.png`).

## Observaciones (no bloquean)
- **Parpadeo con CPU lenta.** Con CPU a 1x, el primer estilo en línea (60-290 ms) llega antes del FCP, así que no hay parpadeo. Con CPU x6, el FCP llega 30-55 ms antes que el estado oculto (800: FCP 196 / style 228; 1280: FCP 372 / style 428). En equipos lentos el mosaico puede verse un par de frames antes de ocultarse y encajar. Es un coste inherente a la mejora progresiva sin estado oculto en CSS (REQ-115-13). Lo dejo para que lo valore el humano.
- **Seguimiento en el informe.** `progress/impl_hero-cards-lego-motion.md` ya describe el defecto («Observación para el reviewer»). No es una decisión pendiente, porque contradice REQ-115-08 y deja la portada incoherente con su propio estado de carga.
