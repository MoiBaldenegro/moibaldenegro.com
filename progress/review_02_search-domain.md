# Review — feature 2 `search-domain`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/02_search-domain/requirements.md`
(REQ-02-01..09). Backlog: entrada id 2 de `feature_list.json`. Análisis de
diseño: `progress/research/global-search-landing.md` (secciones 3-5, D4/D5/D6).

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_02_search-domain.md` y
`progress/current.md` (sección "Evolución feature 2"):

- **Rojo capturado antes de implementar**: `node --test
  tests/search-domain.test.mjs` → exit 1, `ERR_MODULE_NOT_FOUND` hacia
  `src/domain/search/normalize.ts` (los 4 módulos no existían; el test se
  escribió primero contra la spec), 0 pass / 1 fail. El informe reproduce el
  error completo de Node.
- **Verde después de implementar**: test de la feature 17/17 pass, suite
  completa 275/275 pass (258 previos + 17 nuevos), `check-format` ✔ y
  `./init.sh` "El entorno está perfecto" — los cuatro re-ejecutados por mí
  abajo.

La feature no salta dependencias: `depends_on: []` en `feature_list.json`
(entrada id 2) — sin dependencias pendientes, trivially satisfecho.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/search-domain.test.mjs` → exit 0, **# tests 17 /
   # pass 17 / # fail 0** (TAP). Los 17 subtests cubren REQ-02-01..09: los
   acceptance de normalización (ok 1-2), coincidencia por campo (ok 3-7),
   orden+parseo de fecha (ok 8-10), paginación (ok 11), índice (ok 12-13),
   campos ausentes (ok 14), consulta vacía (ok 15), `searchIndex` cliente
   (ok 16) y ≤100 líneas (ok 17).
2. `bash -c "pnpm test"` → **# tests 275 / # pass 275 / # fail 0**
   (suite completa; los 17 de esta feature aparecen como subtests 232-248).
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
4. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests al 100% ✔, build de
   producción ✔ → **"✔ El entorno está perfecto. Podemos empezar a trabajar."**
5. Inspección directa de los 4 módulos (`src/domain/search/`):
   - `normalize.ts` (12 líneas): NFD + strip `[\u0300-\u036f]` + `toLowerCase`
     + `trim` (REQ-02-01).
   - `parse-date.ts` (36): regex `^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{4})$`
     sobre texto recortado; mes normalizado (`normalizeText`) contra tabla
     Enero..Diciembre; día/mes/año con `padStart` → YYYY-MM-DD; fecha ausente
     o inválida → `''` (REQ-02-05, REQ-02-08). '10 Agosto 2026' → '2026-08-10'
     (re-ejecutado mentalmente contra el test ok 9-10).
   - `index.ts` (44): `SearchIndexEntry` plano con id, title, description,
     tags, body, date, img, readtime, author; `buildSearchIndex(posts,
     bodies)` con `textOrEmpty`/`Array.isArray`/`bodies[id] ?? ''` defensivos
     (REQ-02-07/08). Los cuerpos entran por parámetro (no `node:fs`).
   - `search.ts` (61): `PAGE_SIZE = 6` exportado; `searchIndex(index, query,
     page)` filtra por subcadena del término normalizado sobre
     title+description+tags+cuerpo (REQ-02-02/03), ordena desc por date con
     orden estable (REQ-02-04, D5), pagina 1-based con `totalPages =
     ceil(total/PAGE_SIZE)` y `page` recortada a ≥1 (REQ-02-06);
     `searchPosts` = comodidad server (`buildSearchIndex` + `searchIndex`).
6. Grep sobre `src/domain/search/`: los únicos imports son relativos dentro de
   `src/domain/` (`./normalize.ts`, `./parse-date.ts`, `./index.ts`) y
   `import type { Post } from '../entities/post.ts'` (TS puro, erasable por
   Node). Sin imports `node:*`, sin `console.`, sin TODOs ni `print()` de
   debug (el único match de `node:` es un comentario explicativo en
   `index.ts:4`). `git diff --name-only -- package.json pnpm-lock.yaml
   docs/dependencies.md` → vacío: **sin dependencias externas nuevas**.
7. REQ-02-09 confirmado con conteo real: normalize.ts 12, parse-date.ts 36,
   index.ts 44, search.ts 61 — todas ≤100; el test ok 17 lo fija para el
   futuro.
8. Alcance de la sesión: `git status` muestra como únicos archivos nuevos de
   esta feature `src/domain/search/` y `tests/search-domain.test.mjs`
   (resto: feature 1 cerrada, specs/features del ciclo, bitácora).

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 2) | REQ | Test | Estado |
|---|---|---|---|
| 'Agilismo'=='agilismo' y 'diseño'=='diseno' | REQ-02-01 | ok 1, ok 2 (`normalizeText`) | ✔ |
| Coincide cuando el término aparece en título, descripción, tag o cuerpo | REQ-02-02, REQ-02-03 | ok 3-7 (un campo por test + diacríticos en ambos lados) | ✔ |
| Orden descendente por fecha parseando '10 Agosto 2026' → YYYY-MM-DD | REQ-02-04, REQ-02-05 | ok 8-10 (fechas + orden con 3 fechas + inválidos) | ✔ |
| Paginación devuelve la página solicitada con tamaño fijo | REQ-02-06 | ok 11 (7 artículos, páginas 1/2/3, `PAGE_SIZE` exportado) | ✔ |
| Índice incorpora título, descripción, tags y cuerpo | REQ-02-07 | ok 12-13 (campos REQ + datos de tarjeta img/readtime/author) | ✔ |
| Artículo sin algún campo evaluable no rompe la coincidencia | REQ-02-08 | ok 14 (post parcial, sin cuerpos, `''`/`[]`) | ✔ |
| (Extra) ≤100 líneas por archivo del módulo | REQ-02-09 | ok 17 (lee los 4 archivos) | ✔ |

## Conformidad con architecture.md / conventions.md

- **Capas**: módulos en `src/domain/search/` (regla 8: lógica en módulos `.ts`
  de `src/domain/`), dependen solo de `src/domain/entities/post.ts` (`import
  type`) y entre sí; sin UI, sin estilos, sin lectura de JSON. ✔
- **Nombres**: archivos `.ts` de utilidad en camelCase (`normalize.ts`,
  `parse-date.ts`, `index.ts`, `search.ts`), funciones camelCase verbo-primero,
  interfaces PascalCase (`SearchIndexEntry`, `SearchPage`), constantes
  MAYÚSCULAS (`PAGE_SIZE`, `MONTHS`, `DATE_PATTERN`). ✔
- **Inmutabilidad**: interfaces `readonly`, `const` por defecto, sin mutación
  de props/estado compartido (regla 4). ✔
- **Sin dependencias externas**: sin cambios en package.json/lock ni
  `docs/dependencies.md` (regla 2). ✔
- **≤100 líneas**: regla 12 cumplida (12/36/44/61). ✔
- **Errores**: capa de consulta pura sin acceso a datos; el tratamiento de
  campos ausentes como texto vacío es decisión explícita de la spec
  (REQ-02-08, D4), no un fallo silencioso encubierto. ✔
- **API coherente con features 3/4/5**: `buildSearchIndex(posts, bodies)`
  (server, feature 3 serializa el índice), `searchIndex(index, query, page)`
  (motor cliente sobre índice serializado, features 3/5), `PAGE_SIZE`
  exportado (features 3/5 lo consumen), y `SearchIndexEntry` con datos de
  tarjeta (img/readtime/author) para renderizar sin otra fuente. ✔

## Checkpoints

- C1 (Arquitectura): [x] — módulos de dominio TS puros en `src/domain/`, sin
  UI/estilos/tokens involucrados.
- C2 (Datos): [x] — `src/data/*.json`, entidades y repositorios intactos
  (git diff sin cambios en esa zona).
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (275/275, build OK). La inspección visual
  desktop/móvil queda [ ] como en el histórico: no aplica a una feature de
  dominio puro sin cambio visual.
- C4 (Harness, tarea en `done`): [ ] — feature 2 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en la feature 1). Ninguna otra feature a medias
  (features 3-6 `pending`, feature 1 `done`).
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo/verde, decisiones, conteos); `progress/history.md` al día; sin
  archivos temporales, `print()` de debug ni TODOs sin contexto (grep ✔).

## Cambios requeridos

Ninguno.