# Review — feature 76

**Veredicto:** APPROVED

Ronda 2. Se atienden los dos cambios requeridos de la ronda 1. Los atiende solo
`tests/latest-cards-full-bleed.test.mjs:57-79`; el código de producción no cambia.

Nota de la ronda 1 (CHANGES_REQUESTED): el código era correcto, pero el test de la acceptance 3
(REQ-76-10/13) era débil. Solo comprobaba que `track-dom.ts` contenía `.latest-articles__card` y la
presencia suelta de `edgeOffsets(0,`/`(1,` y de un único `start: 'top top'`. No ataba la x de las
cards al ScrollTrigger del horizontal ni exigía la limpieza real de las cards.

## Verificación de los cambios requeridos
1. REQ-76-13 (limpieza): el test quita los comentarios `//` de `track-dom.ts` y extrae el cuerpo de
   `clearTrack`. Dentro exige `querySelectorAll…latest-articles__card` (`track-dom.ts:8`). Después
   resuelve la utilidad aplicada a cada elemento (`clearInline`) y exige en su cuerpo
   `removeProperty('transform')`, `removeProperty('translate')` y `removeAttribute('style')`
   (`track-dom.ts:12,13,17`). Resuelto.
2. REQ-76-10 (mismo ScrollTrigger): el test extrae el bloque desde `gsap.timeline(` hasta
   `gsap.fromTo(track` (`latest-horizontal.ts:57-62`). Dentro exige `start: 'top top'`,
   `pinScrollLength`, `scrub: true`, `invalidateOnRefresh: true`, `ease: 'none'`, `edgeOffsets(0,`,
   `edgeOffsets(1,` y `cards[`. Fuera del bloque prohíbe `.to/.from/.fromTo/.set(cards`. Mantiene
   un único `start: 'top top'` y ningún listener de scroll. Resuelto.

Mutaciones que repitió el reviewer: hizo copia de los archivos y los restauró con `cmp` idéntico;
`git status` no muestra cambios en `src/`. Todas dejan el test en rojo (pass 3 / fail 1):
- M1: `clearTrack` itera solo `[track]` y la cadena de cards queda en un comentario. ROJO.
- M2: se quita `removeProperty('transform')`. ROJO.
- M3: se quita `removeAttribute('style')`. ROJO.
- M4: se quita el `fromTo` de cards de la timeline y se añade un `gsap.fromTo(cards[0], { … scrollTrigger:
  { start: 'top center' } })` independiente tras la entrada. ROJO.
- M5: `scrub: true` pasa a `scrub: 1` en la timeline. ROJO.

## Checkpoints
- Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x]
- Sin lógica en UI; lógica en `.ts`: [x] (`restMargin` y `edgeOffsets` son puras, en `src/domain/latest-horizontal.ts`)
- Ningún componente lee JSON directamente: [x] (no aplica)
- Tokens, sin valores hardcodeados: [x]
- Archivos <= 100 líneas: [x] (el test pasa a 85 líneas; domain 73, efecto 95, track-dom 25, css 51)
- Sin dependencias nuevas: [x]
- `src/data/*.json` válido / repositorios con `*Error`: [x] (no aplica)
- `./init.sh` en verde: [x] (ejecutado por el reviewer: entorno, formato, tests 835/835 y build OK; ningún dev server ni preview bloqueó `dist/`)
- Página correcta en desktop y móvil: [x] (sin cambios de producción desde la ronda 1; evidencia CDP y capturas en `progress/impl_76.md` y `progress/research/gsap76/`)
- `feature_list.json`: [x] (76 `in_progress`, depends_on [75] y la 75 en `done`; nada eliminado del array)
- `progress/current.md` documenta la sesión: [x]
- Sin temporales, debug ni TODOs: [x]
- Ciclo rojo/verde documentado: [x] (`progress/impl_76.md` §«Ciclo rojo/verde» y §«Ronda 2», con la mutación de `removeProperty('translate')`)
- Ajustes legacy con nota REQ-43-06: [x]
- Acceptance 3 cubierta por el test: [x]

## Cambios requeridos
Ninguno.

## Observaciones (no bloqueantes, se mantienen de la ronda 1)
- El commit debe separar de la 76 los restos de la ronda 2 de la 75 (`impl_75`, `review_75`, capturas `h75-header-*`), o el mensaje debe mencionarlos.
- `latest-horizontal.ts:59` duplica `pinScrollLength(...)` y `:61` repite `ease: 'none'`. Están justificados por las inspecciones de la 72/73.
