# Review — feature 3 `search-dedicated-view`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/03_search-dedicated-view/`
(REQ-03-01..10, design.md Decisiones 1-5). Backlog: entrada id 3 de
`feature_list.json`. Análisis de diseño:
`progress/research/global-search-landing.md` (D1/D2/D6). Informe del
implementer: `progress/impl_03_search-dedicated-view.md`.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_03_search-dedicated-view.md` y
`progress/current.md` (sección "Evolución (implementer, 2026-08-18, feature 3)"):

- **Rojo capturado antes de implementar**: `node --test
  tests/search-dedicated-view.test.mjs` → exit 1,
  `ERR_MODULE_NOT_FOUND` hacia
  `src/components/search-results/search-results-controller.ts` (archivos
  inexistentes; el test se escribió primero contra la spec), 0 pass / 1 fail.
  El informe reproduce el error completo de Node y documenta además dos
  fallos intermedios corregidos (regex del import del dominio y controlador
  en 101 líneas) hasta 25/25.
- **Verde después de implementar**: test de la feature 25/25 pass, suite
  completa 300/300 pass (275 previos + 25 nuevos), `check-format` ✔,
  `audit-design-tokens` ✔ y `./init.sh` "El entorno está perfecto" — los
  cuatro re-ejecutados por mí abajo.

La feature no salta dependencias: `depends_on: [2]` en `feature_list.json`
(entrada id 3) y la feature 2 `search-domain` está `done` (verificado en el
mismo archivo) — dependencia satisfecha.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/search-dedicated-view.test.mjs` → exit 0, **# tests 25 /
   # pass 25 / # fail 0** (TAP). Los 25 subtests cubren REQ-03-01..10 y las
   restricciones del arnés: prerender (ok 1), índice embebido (ok 2-3),
   deep linking con URLSearchParams/searchIndex (ok 4-6), título (ok 7-8),
   guía sin q (ok 9-11), cuadrícula y tarjetas (ok 12-15), paginación sin
   recarga (ok 16-18), empty state y limpiar (ok 19-22), ≤100 líneas (ok 23),
   tokens (ok 24), sin `<style>`/estilos inline (ok 25).
2. `bash -c "pnpm test"` → **# tests 300 / # pass 300 / # fail 0** (suite
   completa; nada roto por la feature).
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
4. `node scripts/audit-design-tokens.mjs` → exit 0:
   `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
5. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests 100% ✔, build ✔ →
   **"✔ El entorno está perfecto. Podemos empezar a trabajar."**
6. Inspección directa de los 4 archivos de la feature:
   - `src/pages/search.astro` (28 líneas): `export const prerender = true`
     (REQ-03-01); frontmatter solo imports + datos (regla 8): `PostsRepository`
     + `getCollection('architecture')` + `buildSearchIndex(posts, bodies)`
     (dominio feature 2 reutilizado intacto; datos vía repositorio, jamás
     JSON directo); serialización
     `<script type="application/json" id="search-index" is:inline
     set:html={indexJson}>` con `JSON.stringify(...).replace(/<\/script/gi,
     '<\\/script')` (REQ-03-07); `Layout title="Búsqueda"` (REQ-03-10). No
     llama a `searchIndex` en build: el filtrado es 100% client-side
     (REQ-03-03, Decisión 5).
   - `src/components/search-results/search-results.astro` (28 líneas):
     guía `data-search-guide` visible por defecto, empty `data-search-empty`
     con mensaje exacto `No se encontraron resultados para '<span
     data-search-term></span>'` y botón `data-search-clear`, grid
     `data-search-grid` y paginación `data-search-prev/next/label` ocultas
     por defecto (REQ-03-03/04/05); `<script>` que importa y arranca
     `initSearchResults()` del controlador `.ts` (regla 8). Sin `<style>`,
     sin lógica (ok 25).
   - `search-results-controller.ts` (98 líneas): `queryTerm` (URLSearchParams
     + trim, REQ-03-02), `removeQueryParam`, `pageLabel`, `cardHtml`
     (enlace `/posts/${entry.id}`, imagen `/assets/content/…`, título, meta,
     descripción, tags — REQ-03-04/09) son **funciones puras** exportadas sin
     document/window en el ámbito de módulo; `initSearchResults()` lee el
     índice, filtra con `searchIndex(index, term, 1)` del dominio, fija
     `document.title = \`Búsqueda: ${term}\`` (REQ-03-10), y la paginación
     re-filtra con `searchIndex(index, term, page±1)` en click, sin
     `location.reload`/`.submit` (REQ-03-06); limpiar elimina `q` con
     `history.replaceState` y restaura la guía (REQ-03-08).
   - `src/styles/search-results.css` (54 líneas): solo custom properties
     existentes de tokens.css (`--container-max`, `--color-text`,
     `--color-surface`, `--color-border`, `--radius-card`, `--radius-pill`,
     `--gap-card`, `--transition-default`, `--color-accent`,
     `--color-text-secondary`, `--font-sans`); cero hex/rgba sueltos
     (audit ✔ y ok 24); `[hidden]` gana a los display propios (estado
     inicial); media query 768px móvil-primero (conventions.md).
7. Build verificado en `dist/client/search/index.html` (existe; ruta /search):
   `<title>Búsqueda</title>` (UTF-8 correcto), script `application/json` con
   el índice de los 2 artículos (`JSON.parse` OK: ids `00-agilismo`,
   `01-diseño-detallado`), **sin `</script` crudo dentro del JSON** (el
   escape `<\/script` está en el fuente; el catálogo actual no contiene
   `</script` y el roundtrip JSON es correcto), y controlador embebido
   inline minificado (presencia de `URLSearchParams`, `history.replaceState`,
   `Búsqueda: `, selectores `data-search-*`, `Limpiar búsqueda`). El nombre
   minificado de `initSearchResults` no aparece literal (renombrado por el
   bundler), pero el código está.
8. `git diff --name-only -- package.json pnpm-lock.yaml docs/dependencies.md`
   → vacío: **sin dependencias externas nuevas** (regla 2).
9. Grep sobre `src/`: sin `console.`, `print(`, `TODO` ni `FIXME`. El único
   cambio fuera de la feature en working tree es la línea en blanco
   preexistente de `src/styles/hero-card.css` (ciclo abortado, documentada en
   `progress/current.md` y en el análisis; no atribuible a esta feature).
10. Dependencias del backlog: feature 3 `depends_on: [2]`, feature 2 `done`
    (leído de `feature_list.json`) — sin dependencias pendientes saltadas.

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 3) | REQ | Test | Estado |
|---|---|---|---|
| Página declara prerender true y serializa el índice en el documento | REQ-03-01, REQ-03-07 | ok 1 (prerender), ok 2 (script application/json + set:html + JSON.stringify + buildSearchIndex), ok 3 (escape `<\\/script`) | ✔ |
| Lee q y lo aplica como filtro inicial (deep linking) y al título | REQ-03-02, REQ-03-10 | ok 4 (URLSearchParams + location.search), ok 5 (searchIndex del dominio), ok 6 (initSearchResults desde el componente), ok 7 (prop title de Layout), ok 8 (document.title con el término) | ✔ |
| Estado inicial sin q: no lista el catálogo, muestra la guía | REQ-03-03 | ok 9 (guía visible / grid oculta), ok 10 (página sin searchIndex en build), ok 11 (queryTerm: q ausente/vacío → '') | ✔ |
| Tarjetas enlazan a /posts/[id] y pagan sin recargar con el dominio | REQ-03-04, REQ-03-06, REQ-03-09 | ok 12 (grid), ok 13 (href /posts/00-agilismo), ok 14 (vista previa completa + escape), ok 15 (escape HTML), ok 16 (nav sin enlaces), ok 17 (searchIndex sin reload/submit), ok 18 (pageLabel) | ✔ |
| Empty state con mensaje exacto y acción que elimina q | REQ-03-05, REQ-03-08 | ok 19 (mensaje exacto con data-search-term), ok 20 (botón Limpiar búsqueda), ok 21 (controlador elimina q), ok 22 (removeQueryParam unitario) | ✔ |
| (Extra) ≤100 líneas, tokens, sin `<style>` | — | ok 23 (28/28/98/54), ok 24 (solo tokens existentes), ok 25 (sin <style>/style inline) | ✔ |

## Conformidad con architecture.md / conventions.md

- **Capas** (regla 1): página en `src/pages/`, componente en
  `src/components/search-results/`, hoja en `src/styles/`, lógica en módulo
  `.ts` del componente; datos solo vía `PostsRepository` (jamás JSON
  directo). ✔
- **Lógica separada de la UI** (regla 8): frontmatter de `search.astro` y del
  componente solo imports/paso de datos; todo el comportamiento en
  `search-results-controller.ts`. ✔
- **Estilos separados** (regla 7): sin `<style>` ni atributos style en los
  `.astro` (ok 25). ✔
- **Tokens** (regla 6): solo custom properties existentes; `gap: 8px` en
  `.search-results__tags` sigue el precedente de `latest-articles.css:74`
  (misma familia visual) y no es un valor de color (el guardián
  audit-design-tokens pasa). ✔
- **≤100 líneas** (regla 12): search.astro 28, search-results.astro 28,
  controller 98, css 54 — verificadas por el ok 23 y por mí. ✔
- **Sin dependencias externas** (regla 2): package.json/lock y
  `docs/dependencies.md` sin cambios. ✔
- **JS de runtime justificado** (regla 9): deep linking y paginación
  client-side son excepción explícita documentada en design.md Decisión 4
  (precedentes 24/43/44), sin frameworks. ✔
- **Nombres** (conventions): `.astro` PascalCase, `.css`/carpetas kebab-case,
  funciones camelCase verbo-primero, clase CSS BEM ligero
  (`search-results__card`), UI en español. ✔
- **Inmutabilidad** (regla 4): `const` por defecto; las únicas mutaciones son
  de DOM (necesarias) vía innerHTML/textContent/toggleAttribute, nunca de
  estado compartido. ✔
- **Reutilización por la feature 5 (REQ-05-04)**: la presentación es genérica
  vía atributos `data-*` (el componente no depende de la ruta ni de ids
  únicos de página) y el controlador exporta funciones puras
  (`queryTerm`, `removeQueryParam`, `pageLabel`, `cardHtml`) sin
  document/window en el ámbito de módulo; `import type { SearchIndexEntry }`
  es erasable. El contrato de reutilización está listo. ✔

## Checkpoints

- C1 (Arquitectura): [x] — estilos en `src/styles/*.css` sin `<style>` en
  `.astro`, lógica en `.ts`, datos vía repositorio, solo tokens, ≤100 líneas,
  sin dependencias nuevas.
- C2 (Datos): [x] — `src/data/*.json`, entidades y repositorios intactos;
  dominio `src/domain/search/` de la feature 2 reutilizado sin cambios.
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (300/300, build OK, ruta /search en dist). La
  inspección visual desktop/móvil queda [ ] como en el histórico: el arnés
  no tiene navegador (pendiente del humano).
- C4 (Harness, tarea en `done`): [ ] — feature 3 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en features 1 y 2). Ninguna otra feature a medias
  (1 y 2 `done`; 4-6 `pending`).
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo/verde, decisiones, conteos); `progress/history.md` al día;
  sin archivos temporales, `print()` de debug ni TODOs sin contexto (grep ✔).

## Cambios requeridos

Ninguno.
