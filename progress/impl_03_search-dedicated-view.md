# Informe de implementación — feature 3 search-dedicated-view

Fecha: 2026-08-18. Rol: implementer. Feature: 3 — search-dedicated-view
("Vista dedicada /search con deep linking, resultados, empty state y
paginación"). Spec: specs/03_search-dedicated-view/ (REQ-03-01..10,
design.md Decisiones 1-5). Estado al iniciar: pending → in_progress
(feature_list.json). NO marcada done (el APPROVED del reviewer la cierra).

## Estado inicial

- Suite 275/275 en verde; feature 2 (search-domain) done: el dominio
  `src/domain/search/` (buildSearchIndex, searchIndex, searchPosts,
  PAGE_SIZE=6, SearchIndexEntry, SearchPage) existe y se REUTILIZA intacto.
- No existían: src/pages/search.astro, src/components/search-results/,
  src/styles/search-results.css ni tests/search-dedicated-view.test.mjs.

## Ciclo rojo/verde (test-first)

1. Tests escritos PRIMERO: tests/search-dedicated-view.test.mjs (25 tests,
   patrón mixto del arnés: inspección por regex sobre la página, el
   componente, el controlador y la hoja + unitarios por import directo del
   controlador .ts — queryTerm, removeQueryParam, pageLabel, cardHtml).
2. ROJO capturado (archivos inexistentes):

   ```
   Error [ERR_MODULE_NOT_FOUND]: Cannot find module
   '...src\components\search-results\search-results-controller.ts'
   # tests 1
   # pass 0
   # fail 1
   ```

   (exit 1; 0 pass / 1 fail). Además, durante el ciclo se capturaron dos
   fallos intermedios de los tests recién escritos contra la primera
   implementación: regex de import del dominio (esperaba `search` pegado a
   la comilla, el archivo es `search.ts'`) y controller en 101 líneas —
   corregidos hasta 25/25.
3. VERDE (feature): `node --test tests/search-dedicated-view.test.mjs` →
   `# tests 25 / # pass 25 / # fail 0`.

## Archivos creados

| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/pages/search.astro | 28 | Página /search prerendered, índice embebido |
| src/components/search-results/search-results.astro | 28 | Componente canónico de resultados (guía, empty, grid, paginación) |
| src/components/search-results/search-results-controller.ts | 98 | Controlador client-side (.ts puro, lógica fuera de la UI) |
| src/styles/search-results.css | 54 | Hoja del componente (solo tokens existentes) |
| tests/search-dedicated-view.test.mjs | 352 | 25 tests REQ-03-01..10 (inspección + unitarios) |

Modificados: feature_list.json (feature 3 → in_progress),
progress/current.md (bitácora). Ningún archivo de src/domain/search/ ni de
features previas tocado.

## Cómo se serializa el índice y se hace el deep linking

- Frontmatter de search.astro (solo build, precedente posts/[id].astro):
  `PostsRepository().getPosts()` + `getCollection('architecture')`; los
  cuerpos salen de `entry.body` por `entry.id` y se pasan como `bodies` a
  `buildSearchIndex(posts, bodies)` (node:fs prohibido en runtime; no se
  llama a `searchIndex` en build: el filtrado es 100% client-side).
- Serialización: `<script type="application/json" id="search-index"
  is:inline set:html={indexJson}>` con
  `indexJson = JSON.stringify(buildSearchIndex(posts, bodies)).replace(/<\/script/gi, '<\\/script')`.
  El escape convierte `</script` → `<\/script` (JSON válido, roundtrip
  verificado: JSON.parse devuelve el texto original; sin `</script` crudo
  dentro del bloque script).
- Deep linking (REQ-03-02): el controlador arranca con `initSearchResults()`
  (importado desde el `<script>` del componente), lee
  `queryTerm(window.location.search)` (URLSearchParams, trim) y, si `q` no
  está vacío, filtra con `searchIndex(index, term, 1)` del dominio, pinta la
  cuadrícula vía `cardHtml` (enlace `/posts/${id}`, REQ-03-09), actualiza
  `document.title = `Búsqueda: ${term}`` (REQ-03-10; la página pasa
  `title="Búsqueda"` a Layout.astro) y muestra la paginación sin recargar
  (botones prev/next → `searchIndex(index, term, page±1)`, REQ-03-06).
- Estado inicial (REQ-03-03, Decisión 5): sin `q` o vacío → guía visible
  (data-search-guide), grid/paginación ocultas; el catálogo no se lista.
- Empty state (REQ-03-05/08): mensaje exacto
  `No se encontraron resultados para '<span data-search-term></span>'` +
  botón `data-search-clear` que elimina `q` de la URL
  (`removeQueryParam` + `history.replaceState`), restaura el título base y
  vuelve a la guía.
- Reutilización por la feature 5 (REQ-05-04): el componente expone el
  estado vía atributos data-* y el controlador exporta funciones puras
  (queryTerm, removeQueryParam, pageLabel, cardHtml) sin tocar document/window
  en el ámbito de módulo.

## Evidencia del VERDE

- Feature: `node --test tests/search-dedicated-view.test.mjs` → 25/25.
- Suite completa: `pnpm test` → `# tests 300 / # pass 300 / # fail 0`
  (275 previos + 25 nuevos, nada roto).
- `node scripts/check-format.mjs` → `FORMATO ✔`.
- `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
  tokens.css en src/styles`.
- `bash ./init.sh` → todas las comprobaciones ✔ → `✔ El entorno está
  perfecto. Podemos empezar a trabajar.` (incluye `pnpm build`).
- Build verificado en dist/: `dist/client/search/index.html` (ruta /search)
  existe; `<title>Búsqueda</title>`; `<script type="application/json"
  id="search-index">` con el índice de los 2 artículos del catálogo
  (JSON.parse OK, sin `</script` crudo — el escape `<\/script` se aplica y
  no hay ocurrencias en el catálogo actual); controlador embebido inline
  (`<script type="module">` minificado con searchIndex/cardHtml/initSearchResults)
  y CSS inlined (reglas .search-results-* presentes); guía visible por
  defecto, grid/empty/pagination con hidden, botón Limpiar búsqueda presente.

## Confirmación ≤100 líneas

src/pages/search.astro 28 · search-results.astro 28 ·
search-results-controller.ts 98 · search-results.css 54. El test (352
líneas) sigue el precedente de tests del arnés (search-domain.test.mjs 248,
view-transitions.test.mjs 186): la regla de 100 líneas aplica a código de
src/, no a tests de inspección.

## Notas

- Tokens: la hoja usa solo tokens existentes (los 10 de design.md +
  --container-max y --radius-pill, precedente layout.css/latest-articles.css,
  sin tokens nuevos; el guardián audit-design-tokens.mjs pasa).
- JS de runtime justificado: design.md Decisión 4 (deep linking y
  paginación client-side; precedentes 24/43/44); sin frameworks ni
  dependencias; lógica en .ts separado (regla 8).