# Informe de implementación — feature 2 search-domain

Fecha: 2026-08-18. Rol: implementer. Spec: `specs/02_search-domain/requirements.md`
(REQ-02-01..09). Análisis de diseño: `progress/research/global-search-landing.md`
(secciones 3-5 y 7).

## Estado inicial

- Feature 2 `search-domain` estaba `pending` sin dependencias (la más antigua
  implementable tras cerrar la feature 1). Se marcó `in_progress` en
  `feature_list.json` antes de escribir nada.
- `src/domain/search/` no existía (confirmado con glob).
- Suite base en verde: 258/258 tests.

## Ciclo rojo/verde (test-first)

### ROJO (test escrito primero, módulos inexistentes)

`node --test tests/search-domain.test.mjs` → **exit 1**:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'C:\\Users\\Moises\\Desktop\\moibaldenegro.com\\src\\domain\\search\\normalize.ts'
imported from C:\\Users\\Moises\\Desktop\\moibaldenegro.com\\tests\\search-domain.test.mjs
...
# tests 1
# pass 0
# fail 1
```

### VERDE (tras implementar los 4 módulos)

`node --test tests/search-domain.test.mjs` → **17/17 pass, 0 fail**:

```
1..17
# tests 17
# pass 17
# fail 0
```

Cobertura de los 17 tests contra los acceptance de feature 2:

| Acceptance de feature_list.json | Test |
|---|---|
| 'Agilismo'=='agilismo' y 'diseño'=='diseno' (REQ-02-01) | normalizeText: 2 tests |
| Coincidencia en título/descripción/tag/cuerpo (REQ-02-02/03) | 5 tests (un campo por test, incl. diacríticos en ambos lados) |
| Orden desc parseando '10 Agosto 2026' → YYYY-MM-DD (REQ-02-04/05) | 3 tests de fecha + 1 de orden con 3 fechas distintas |
| Paginación con página solicitada y tamaño fijo (REQ-02-06) | 1 test con 7 artículos, páginas 1/2/3, PAGE_SIZE exportado |
| Índice con título/descripción/tags/cuerpo (REQ-02-07) | 2 tests (campos REQ + datos de tarjeta para la UI) |
| Artículo sin algún campo no rompe (REQ-02-08) | 1 test (post parcial, sin cuerpos) |
| REQ-02-09 (≤100 líneas por archivo) | 1 test que lee los 4 archivos |

Tests extra que fijan decisiones documentadas: consulta vacía devuelve todo
el catálogo ordenado; `searchIndex` filtra/pagina sobre un índice ya
construido (uso cliente de la feature 3).

## Archivos creados

| Archivo | Líneas | Rol |
|---|---|---|
| `tests/search-domain.test.mjs` | 245 | Tests REQ-02-01..09 (node:test, import directo de `.ts`) |
| `src/domain/search/normalize.ts` | 12 | `normalizeText(text: string): string` |
| `src/domain/search/parse-date.ts` | 36 | `parseSpanishDate(text: string): string` |
| `src/domain/search/index.ts` | 44 | `buildSearchIndex(...)`, tipo `SearchIndexEntry` |
| `src/domain/search/search.ts` | 61 | `PAGE_SIZE`, `searchIndex`, `searchPosts`, tipo `SearchPage` |

## API pública exportada (firmas)

```ts
// normalize.ts
export function normalizeText(text: string): string;

// parse-date.ts
export function parseSpanishDate(text: string): string; // '10 Agosto 2026' -> '2026-08-10'

// index.ts
export interface SearchIndexEntry {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly body: string;
  readonly date: string; // YYYY-MM-DD comparable
  readonly img: string;
  readonly readtime: number;
  readonly author: string;
}
export function buildSearchIndex(
  posts: readonly Post[],
  bodies: Readonly<Record<string, string>>,
): SearchIndexEntry[];

// search.ts
export const PAGE_SIZE: number; // 6
export interface SearchPage {
  readonly results: readonly SearchIndexEntry[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
}
export function searchPosts(
  posts: readonly Post[],
  bodies: Readonly<Record<string, string>>,
  query: string,
  page: number,
): SearchPage;
export function searchIndex(
  index: readonly SearchIndexEntry[],
  query: string,
  page: number,
): SearchPage;
```

Los cuerpos markdown entran por parámetro (`bodies[id] ?? ''`): el arnés no
permite node:fs en runtime y `getCollection` entrega `entry.body` solo en
build; el llamador (feature 3) los provee. `searchPosts` es la comodidad
server-side (`buildSearchIndex` + `searchIndex`); `searchIndex` es el motor
que la UI usa en el cliente sobre el índice serializado (features 3/5).

## Decisiones puntuales

- **PAGE_SIZE = 6** (constante exportada desde `search.ts`, usada por
  features 3 y 5). `totalPages = ceil(total / PAGE_SIZE)`; páginas 1-based;
  `page < 1` o NaN se recorta a 1; una página más allá del final devuelve
  `results: []` sin inventar resultados (el `total` se conserva).
- **Parseo de fecha**: regex `^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{4})$`
  sobre el texto recortado; el mes se normaliza con `normalizeText`
  (minúsculas + sin diacríticos) y se busca en la tabla Enero..Diciembre; día
  y mes se rellenan a 2 dígitos. Fecha ausente o inválida → `''` (REQ-02-08);
  en el orden descendente, `''` queda al final.
- **Coincidencia**: subcadena del término normalizado sobre el texto
  `title + description + tags.join(' ') + body` normalizado (D4: tags unidos
  sin `#`; los tags del catálogo no llevan `#`). Normalización en ambos
  lados: 'diseño' == 'diseno'.
- **Orden**: descendente por `date` (YYYY-MM-DD ordena léxicamente);
  empates con el orden estable de `Array.prototype.sort` (D5).
- **Consulta vacía**: `''` es subcadena de todo → devuelve el catálogo
  completo ordenado. La vista dedicada (feature 3) no lo invoca sin `q`
  (muestra la guía, REQ-03-03); comportamiento documentado y testeado.
- **Índice**: entrada plana con los campos de REQ-02-07 (title, description,
  tags, body) + id + date, y los datos de tarjeta (img, readtime, author)
  para que la UI (features 3/5) renderice tarjetas desde el índice
  serializado sin otra fuente. Campos ausentes → texto vacío (REQ-02-08),
  vía `textOrEmpty`/`Array.isArray` (defensivo ante Posts parciales).
- **Módulos TS puros** sin dependencias externas; `import type` de la
  entidad `Post` (erasable por Node, mismo patrón que
  `posts-repository.test.mjs`).

## Evidencia del VERDE completo

1. Test de la feature: `node --test tests/search-domain.test.mjs` → 17/17 ✔
2. Suite completa: `pnpm test` → **275/275** (258 previos + 17 nuevos), 0 fail
   (invocado vía `pnpm.cmd test` porque PowerShell bloquea `pnpm.ps1`).
3. Formato: `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
4. `bash ./init.sh` → todas las comprobaciones ✔ incluyendo `pnpm build`;
   salida final: **"✔ El entorno está perfecto. Podemos empezar a trabajar."**
5. REQ-02-09 confirmado (conteo real de líneas): normalize.ts 12,
   parse-date.ts 36, index.ts 44, search.ts 61 — todas ≤100; el test
   REQ-02-09 lo fija para el futuro.

## Estado del backlog

- Feature 2 permanece `in_progress` en `feature_list.json` (no la marco
  `done`: lo hará el líder al verificar el APPROVED del reviewer).
- No se tocó ninguna otra feature: los únicos cambios son los 5 archivos
  nuevos de esta feature y `progress/current.md`.