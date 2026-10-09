# Informe de implementación — feature 67 normalize-text-empty-guard-test

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). Regulariza con un test el cambio manual del humano en
`src/domain/search/normalize.ts` (`if (!text) return '';`). El humano confirmó que lo escribió y
quiere conservarlo.

## Test

`tests/normalize-text-empty-guard.test.mjs` (nuevo, 24 líneas):
- REQ-67-01: `normalizeText('')` → `''`.
- REQ-67-02/03: `normalizeText(undefined)` y `normalizeText(null)` → `''` sin lanzar.
- REQ-67-05: `normalizeText(' Diseño ÁGIL ')` → `'diseno agil'` (la normalización se conserva).

## Evidencia por mutación (REQ-67-04)

El código de producción ya existía, así que el «rojo» se demuestra quitando la guarda:
1. Con la guarda (estado actual): `ℹ pass 3 / ℹ fail 0`.
2. MUTANTE: se elimina temporalmente la línea `if (!text) return '';` →
   `ℹ pass 2 / ℹ fail 1`, `✖ REQ-67-02/03: undefined y null coaccionados devuelven "" sin lanzar`
   (TypeError en `.normalize`). REQ-67-01 pasa también sin la guarda porque `''.normalize()` es
   válido: es lo esperado, la guarda protege de valores ausentes.
3. RESTAURADO desde copia: `ℹ pass 3 / ℹ fail 0`. `git diff c19d375 -- src/domain/search/normalize.ts`
   muestra exactamente la línea añadida por el humano (+1), sin otros cambios.

## Cierre

Suite completa 795/795; `./init.sh` en verde. No se tocó código de producción.
