# Review — feature 17

Feature: `term-search-oldest-first` — Los más antiguos primero en la búsqueda por término /<término>.
Revisor: reviewer (nivel 1). Fecha: 2026-08-20.

**Veredicto:** APPROVED

## Verificación en disco

- `src/domain/search/search.ts` (72 líneas): `export type SearchOrder = 'desc' | 'asc'`
  (línea 15); `searchPosts` (línea 29) y `searchIndex` (línea 38) aceptan
  `order: SearchOrder = 'desc'` como 4º parámetro opcional; sort con
  `order === 'asc' ? byDateAsc : byDateDesc` (línea 43); `byDateAsc` nuevo
  (líneas 68-71, inverso de `byDateDesc`). Default `'desc'` preserva
  REQ-02-04/05 y a todos los consumidores que no pasan el parámetro.
- `src/components/search-results/search-results-controller.ts` (92 líneas):
  `initSearchResults` pasa `renderSearch(term, index, 1, q !== '' ? 'desc' : 'asc')`
  (línea 33); `renderSearch` recibe `order: SearchOrder` (línea 47), lo propaga a
  `searchIndex(index, term, page, order)` (línea 49) y a las llamadas recursivas
  de paginación `data.page - 1` / `data.page + 1` (líneas 70 y 74) → REQ-17-05.
- `tests/term-search-oldest-first.test.mjs` (nuevo, 11 tests): ejecutado por mí →
  `# tests 11 | # pass 11 | # fail 0`. Cubre unitarios del dominio (asc/desc/default,
  empates estables, searchIndex y searchPosts), wiring con DOM fake de
  `initSearchResults` (primer item más antiguo en /<término>, paginación asc,
  ?q= desc), e inspección del controlador, de search-live.ts y del límite ≤100 líneas.
- `src/components/search-live/search-live.ts`: **intacto** (100/100 líneas,
  `searchIndex(index, term, 1)` línea 32 sin parámetro de orden). Git confirma que
  no está en el diff.
- `./init.sh` ejecutado por mí: verde (entorno, formato, tests, build).
  `pnpm test`: **# tests 459 | # pass 459 | # fail 0**.

## Justificación por REQ-17-01..07

- **REQ-17-01** ✓ — `SearchOrder` + parámetro opcional con default `'desc'` en
  `searchIndex`/`searchPosts` (search.ts líneas 29/38). Tests 1, 3 y 4 (asc, default, desc).
- **REQ-17-02** ✓ — Controlador: `q === ''` (pathname /<término>) → `'asc'`
  (controller línea 33); test wiring: primer item pintado es `06-git` (el más antiguo).
- **REQ-17-03** ✓ — `q !== ''` → `'desc'`; test wiring `/search?q=arquitectura`:
  primer item `00-agilismo` (el más reciente).
- **REQ-17-04** ✓ — `byDateAsc` con fechas YYYY-MM-DD; test de empates: 3 artículos
  con `2024-01-03` conservan el orden del índice (sort estable de JS), también en desc.
- **REQ-17-05** ✓ — `order` propagado a las llamadas recursivas de paginación
  (controller líneas 70/74); test wiring: `fireNext()` en /<término> re-renderiza
  página 2 con `00-agilismo` (asc conservado); test de inspección de ambas regex.
- **REQ-17-06** ✓ — `search-live.ts` conserva `searchIndex(index, term, 1)` sin
  orden (panel en vivo descendente); test de inspección verifica la llamada sin
  parámetro y la ausencia de `'asc'`.
- **REQ-17-07** ✓ — `search.ts` 72 líneas, `search-results-controller.ts` 92 líneas
  (≤100); test de inspección verificado.

## Cumplimiento de convenciones (docs/architecture.md, docs/conventions.md)

- Lógica separada de la UI: los dos cambios son módulos `.ts` puros; no se tocó
  ningún `.astro` (`search.astro`, `[...term].astro`, `search-live.astro` intactos)
  ni CSS ni tokens.
- ≤100 líneas por archivo: cumplido (72 y 92; `search-live.ts` se dejó en 100/100).
- Sin dependencias externas nuevas; sin scripts nuevos; sin design.md (sin UI, D5).
- Nombres conforme a convenciones: `SearchOrder` (PascalCase), `byDateAsc`
  (camelCase, verbo primero), `order` (parámetro camelCase).
- Cambio retrocompatible: default `'desc'` preserva REQ-02-04/05; las regex que
  asercionan REQ-07-03/10/11 se conservan textualmente (D2 del research).
- **REQ-43-06 NO invocado**: `git diff HEAD --name-only` confirma que ningún test
  existente cambió de aserción; solo se añadió `tests/term-search-oldest-first.test.mjs`.

## Test-first (rojo → verde)

Evidencia en `progress/impl_17_term-search-oldest-first.md`: el test nuevo se
escribió primero y se observó en **rojo** (7 fallos: asc del dominio, empates,
wiring /<término>, paginación asc, inspección del controlador; 4 verdes =
comportamiento preexistente conservado: default desc, ?q= desc, live intacto,
≤100 líneas) y en **verde** tras implementar (11/11). Consistente con el estado
real en disco: los 7 tests que fallaban en rojo son exactamente los que cubren la
funcionalidad nueva.

## Dependencias

Feature 17 `depends_on: [2, 7]` → verificadas en `feature_list.json`:
`search-domain` (2) = **done**, `root-term-search` (7) = **done**. Ninguna
dependencia pendiente saltada.

## Checkpoints

- C1: [x] — Estilos separados de la UI / sin `<style>` en `.astro` (no se tocó UI).
- C2: [x] — Lógica separada de la UI: cambios solo en `src/domain/search/search.ts`
  y `src/components/search-results/search-results-controller.ts`.
- C3: [x] — ≤100 líneas por archivo: 72 y 92; `search-live.ts` intacto en 100.
- C4: [x] — Sin dependencias externas nuevas, sin CSS/tokens nuevos.
- C5: [x] — `./init.sh` verde verificado por el revisor (459/459, build OK);
  `progress/current.md` documenta la sesión; sin archivos temporales ni debug.

## Cambios requeridos

Ninguno.

Nota menor (no bloqueante): el informe declara 71/91 líneas y en disco hay 72/92
según `wc -l` (diferencia por la ausencia de newline final en `search.ts`); el
límite REQ-17-07 se cumple en ambos conteos y el test lo verifica.