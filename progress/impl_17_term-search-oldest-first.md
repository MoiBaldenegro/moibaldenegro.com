# Implementación — feature 17 `term-search-oldest-first`

Fecha: 2026-08-20. Implementer.

## Resumen

Los más antiguos primero en la ruta /<término>. Cambio mínimo según el
research (`progress/research/term-search-oldest-first.md`, D1/D2):

1. `src/domain/search/search.ts` (61 → 71 líneas): nuevo tipo
   `export type SearchOrder = 'desc' | 'asc'`; `searchIndex()` y
   `searchPosts()` aceptan el 4º parámetro opcional `order: SearchOrder = 'desc'`
   (default preserva REQ-02-04/05 y a todos los consumidores) y el sort usa
   `order === 'asc' ? byDateAsc : byDateDesc`. `byDateAsc` nuevo (inverso de
   `byDateDesc`); empates resueltos por el sort estable de JS (orden del índice).
2. `src/components/search-results/search-results-controller.ts` (84 → 91
   líneas): `initSearchResults` pasa el orden por origen del término —
   `renderSearch(term, index, 1, q !== '' ? 'desc' : 'asc')` — y
   `renderSearch` recibe `order: SearchOrder`, lo propaga a `searchIndex` y a
   las llamadas recursivas de paginación (`data.page - 1` / `data.page + 1`),
   de modo que el orden ascendente se conserva en todas las páginas (REQ-17-05).

Fuera de alcance respetado: `search-live.ts` intacto (100/100 líneas, panel en
vivo conserva desc, REQ-17-06), `/search?q=` conserva desc (REQ-17-03), sin
UI (sin design.md), sin tocar `.astro` ni CSS. No se invoca el precedente
REQ-43-06: ningún test existente cambió de aserción.

## Test-first (TDD)

Test nuevo `tests/term-search-oldest-first.test.mjs` (11 tests, patrón mixto
search-domain + root-term-search): unitarios del dominio (asc/desc/default,
empates estables, searchIndex y searchPosts), wiring con DOM fake de
`initSearchResults` (primer item más antiguo en /<término>, paginación asc,
?q= desc) e inspección del controlador, de search-live.ts y de ≤100 líneas.

### Ciclo en ROJO (antes de implementar)

```
$ node --test --test-reporter=spec tests/term-search-oldest-first.test.mjs
✖ REQ-17-01/04: searchIndex con orden asc coloca los más antiguos primero (YYYY-MM-DD)
✖ REQ-17-04: los empates de fecha conservan el orden estable del índice
✖ REQ-17-01/03: searchPosts sin orden (default) y con orden desc conservan el descendente
✖ REQ-17-02 (wiring): al cargar /<término> el primer item pintado es el más antiguo
✖ REQ-17-05 (wiring): la paginación de /<término> conserva el orden ascendente
✖ REQ-17-02/03: el controlador deriva el orden por el origen del término
✖ REQ-17-05: la paginación re-renderiza con el mismo orden
# tests 11 | # pass 4 | # fail 7
```

(4 tests en verde ya en rojo: default desc, ?q= desc, search-live intacto y
límite de líneas — comportamiento vigente que la feature conserva.)

### Ciclo en VERDE (tras implementar)

```
$ node --test --test-reporter=spec tests/term-search-oldest-first.test.mjs
✔ REQ-17-01/04: searchIndex con orden asc coloca los más antiguos primero (YYYY-MM-DD)
✔ REQ-17-04: los empates de fecha conservan el orden estable del índice
✔ REQ-17-01/03: searchIndex sin orden (default) y con orden desc conservan el descendente
✔ REQ-17-01/03: searchPosts sin orden (default) y con orden desc conservan el descendente
✔ REQ-17-02 (wiring): al cargar /<término> el primer item pintado es el más antiguo
✔ REQ-17-05 (wiring): la paginación de /<término> conserva el orden ascendente
✔ REQ-17-03 (wiring): /search?q= conserva el orden descendente (el más reciente primero)
✔ REQ-17-02/03: el controlador deriva el orden por el origen del término
✔ REQ-17-05: la paginación re-renderiza con el mismo orden
✔ REQ-17-06: search-live.ts llama a searchIndex sin el parámetro de orden
✔ REQ-17-07: search.ts y search-results-controller.ts no superan 100 líneas
# tests 11 | # pass 11 | # fail 0
```

## Verificación final

```
$ ./init.sh
✔ node instalado  ✔ pnpm instalado  ✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe  ✔ feature_list.json existe  ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)        ← 459/459 (suite completa, incluidos los
                                      tests existentes REQ-02/03/07 SIN cambios)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

`pnpm test`: `# tests 459 | # pass 459 | # fail 0`.

## Archivos tocados

| Archivo | Cambio | Líneas |
|---|---|---|
| `src/domain/search/search.ts` | `SearchOrder`, `order` opcional en searchIndex/searchPosts, `byDateAsc` | 71 (≤100) |
| `src/components/search-results/search-results-controller.ts` | orden por origen del término + propagación a paginación | 91 (≤100) |
| `tests/term-search-oldest-first.test.mjs` | nuevo, REQ-17-01..07 | 11 tests |

Sin cambios: `search-live.ts` (REQ-17-06 verificado), `.astro`, CSS, tokens,
tests existentes (REQ-02-04/05, REQ-03, REQ-07 pasan sin modificaciones).

## Trazabilidad acceptance ↔ REQ

- Acceptance 1 (asc + empates estables) → REQ-17-01/04: unitarios del dominio.
- Acceptance 2 (default/desc conservados) → REQ-17-01/03: unitarios searchIndex
  y searchPosts.
- Acceptance 3 (inspección controlador: asc con pathname, desc con q) →
  REQ-17-02/03: inspección `renderSearch(term, index, 1, q !== '' ? 'desc' : 'asc')`.
- Acceptance 4 (DOM fake: primer item más antiguo + paginación asc) →
  REQ-17-02/05: wiring con 7 artículos (página 2 = el más reciente).
- Acceptance 5 (search-live.ts sin parámetro de orden) → REQ-17-06: inspección.
- Acceptance 6 (≤100 líneas) → REQ-17-07: `wc -l` 71 y 91.
- Acceptance 7 (suite completa en verde, REQ-02/03/07 sin cambios) →
  `./init.sh` verde, 459/459.

## Estado

feature 17 marcada `in_progress` en `feature_list.json` (el cierre a `done` lo
hará el líder tras el APPROVED del reviewer). Sin dependencias nuevas, sin
bloqueos.