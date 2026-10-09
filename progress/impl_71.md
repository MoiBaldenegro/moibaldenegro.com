# Informe de implementación — feature 71 latest-horizontal-geometry

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible).

## Ciclo rojo/verde (REQ-71-12)

- Test nuevo `tests/latest-horizontal-geometry.test.mjs` (92 líneas) escrito primero.
- ROJO: `ℹ pass 0 / ℹ fail 7` (no existía el módulo).
- VERDE: 7/7. Suite completa 812/812; `./init.sh` en verde.

## Cambios

`src/domain/latest-horizontal.ts` (nuevo, 41 líneas). Funciones puras, sin gsap, window ni document:
- `trackTravel(viewportWidth, count)`: (count − 1) × ancho.
- `pinScrollLength(viewportHeight, count)`: (count − 1) × alto, una altura de viewport por card
  que pasa.
- `trackOffset(progress, viewportWidth, count)`: −clamp01(progress) × trackTravel. Un progreso
  NaN cuenta como 0. Se escribe `0 - …` para devolver 0 y no −0, porque
  `assert.strict.equal` usa Object.is.
- `cardCenterX(index, viewportWidth, offset)`: index × ancho + ancho / 2 + offset.
- `focusScrollTarget(index, count, start, end)`: start + i / (count − 1) × (end − start), con el
  índice acotado; con count < 2 devuelve start.
- Validación (REQ-71-10): count entero ≥ 2 y tamaños finitos > 0; en otro caso devuelven 0 sin
  lanzar.
