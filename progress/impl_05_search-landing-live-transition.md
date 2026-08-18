# Informe de implementación — feature 5 search-landing-live-transition

Fecha: 2026-08-18. Rol: implementer. Feature: 5 —
search-landing-live-transition ("Búsqueda en tiempo real en la Landing con
transición dinámica del layout"). Spec: specs/05_search-landing-live-transition/
(REQ-05-01..07, design.md Decisiones 1-5). Estado al iniciar: pending →
in_progress (feature_list.json). NO marcada done (el APPROVED del reviewer la
cierra).

## Estado inicial

- Suite 320/320 en verde; features 3 (search-dedicated-view) y 4
  (search-bar-header) done: `search-results.astro` +
  `search-results-controller.ts` (cardHtml/queryTerm/removeQueryParam/
  pageLabel/initSearchResults) + `search-results.css` (presentación canónica)
  y `search-bar.ts` (changeEventName/activeQuery/clearQuery, evento
  `search:change` con `detail.term`, REQ-04-07) existen y se REUTILIZAN
  intactos. Dominio `src/domain/search/` (searchIndex, PAGE_SIZE=6,
  SearchIndexEntry) intacto.
- No existían: src/components/search-live/, src/styles/search-live.css,
  tests/search-landing-live-transition.test.mjs; index.astro no tenía índice
  embebido ni reacción a la búsqueda.

## Ciclo rojo/verde (test-first)

1. Tests escritos PRIMERO: tests/search-landing-live-transition.test.mjs (20
   tests, patrón mixto del arnés: unitarios por import directo del controlador
   .ts puro — layoutMode, livePage, seeAllUrl — + wiring con DOM fake de
   applyLive + inspección por regex sobre index.astro, search-live.astro,
   search-live.ts y search-live.css).
2. ROJO capturado (archivos inexistentes):

   ```
   Error [ERR_MODULE_NOT_FOUND]: Cannot find module
   '...src\components\search-live\search-live.ts' imported from
   ...tests\search-landing-live-transition.test.mjs
   # tests 1
   # pass 0
   # fail 1
   ```

   (exit 1; 0 pass / 1 fail).
3. VERDE (feature): `node --test tests/search-landing-live-transition.test.mjs`
   → `# tests 20 / # pass 20 / # fail 0`.

## Archivos creados/modificados

| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/pages/index.astro (MODIFICADO) | 35 | Índice embebido + wrapper data-landing-sections + <SearchLive /> |
| src/components/search-live/search-live.ts | 99 | Controlador client-side de la transición (.ts puro) |
| src/components/search-live/search-live.astro | 17 | Wrapper del panel en vivo (reusa presentación feature 3) |
| src/styles/search-live.css | 31 | Hoja del panel (solo tokens existentes de design.md) |
| tests/search-landing-live-transition.test.mjs | 380 | 20 tests REQ-05-01..07 (inspección + unitarios + wiring) |

Modificados: feature_list.json (feature 5 → in_progress), progress/current.md
(bitácora). Ningún archivo de features previas tocado (search-results.*,
search-bar.*, dominio intactos; la reutilización es por import).

## Cómo se suscribe al evento y alterna el estado (Decisión 1/5)

- `index.astro` integra `<SearchLive />` y envuelve las secciones habituales
  (NewHero, LatestArticles, HtbStadistics server:defer — REQ-22-01 intacto) en
  `<div class="home__landing" data-landing-sections>`; el panel vive en
  `search-live.astro` (`<section class="search-live" data-search-live hidden>`).
- El `<script>` de search-live.astro importa y arranca el controlador:
  `initSearchLive()` (frontmatter solo imports y paso de datos, regla 8).
- `initSearchLive` lee el índice embebido (`#search-index`), se suscribe con
  `document.addEventListener(changeEventName(), ...)` — reutiliza la API de la
  feature 4 (REQ-04-07) — y lee el término de `event.detail?.term`. Aplica un
  sync inicial con el valor actual del input de la barra (`[data-search-bar]
  input`) para cubrir navegaciones con view transitions.
- `applyLive(term, index, panel, landing)`: `layoutMode(term)` decide
  'results' (term.trim() !== '') o 'landing' (''); alterna atributos `hidden`
  (puramente client-side, sin recarga ni servidor, Decisión 5):
  - consulta no vacía → `panel.hidden=false`, `landing.hidden=true` (REQ-05-02);
  - `''` → restaura de inmediato `panel.hidden=true`, `landing.hidden=false`
    (REQ-05-01/03).
- La hoja fuerza `display:none` con `[hidden]` (`.search-live[hidden]`,
  `.home__landing[hidden]`) porque las secciones tienen display propios.

## Cómo reutiliza la presentación de la feature 3 (REQ-05-04, Decisión 2)

- `search-live.astro` importa `../../styles/search-results.css` (hoja canónica
  de la vista dedicada) y usa los mismos bloques/clases
  (`search-results__empty`, `search-results__grid`) → presentación idéntica.
- El controlador importa `cardHtml` de `search-results-controller.ts` y
  `searchIndex`/`PAGE_SIZE` del dominio (feature 2): pinta las tarjetas con la
  misma función de la feature 3.
- Modo en vivo (REQ-05-06): `livePage(index, term, PAGE_SIZE)` devuelve los
  primeros PAGE_SIZE (searchIndex página 1) y `showAllLink = total > PAGE_SIZE`;
  el enlace `[data-search-all]` se actualiza con `seeAllUrl(term)` →
  `/search?q=<término>` y solo se muestra si sobran coincidencias.
- Sin coincidencias (REQ-05-05): mensaje exacto de la vista dedicada
  `No se encontraron resultados para '<span data-search-term></span>'` con el
  término actual; SIN botón de limpiar duplicado (Decisión 3: el X de la barra
  y Escape de la feature 6 cubren la limpieza).
- El panel empieza `hidden` (REQ-05-01: modo landing por defecto).

## Evidencia del VERDE

- Feature: `node --test tests/search-landing-live-transition.test.mjs` →
  `# tests 20 / # pass 20 / # fail 0`.
- Suite completa: `pnpm test` → `# tests 340 / # pass 340 / # fail 0`
  (320 previos + 20 nuevos; htb-stadistics-section, hero y articles intactos;
  no se rompió ningún test existente que inspecciona index.astro).
- `node scripts/check-format.mjs` → `FORMATO ✔`.
- `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
  tokens.css en src/styles`.
- `bash ./init.sh` → todas las comprobaciones ✔ → `✔ El entorno está
  perfecto. Podemos empezar a trabajar.` (incluye `pnpm build`).
- Build verificado en dist/: `dist/client/index.html` contiene
  `data-landing-sections`, `<section class="search-live" data-search-live
  aria-label="Resultados en vivo" hidden>`, el empty state y el enlace
  "Ver todos los resultados"; `<script type="application/json"
  id="search-index">` con JSON.parse OK (2 entradas: 00-agilismo,
  01-diseño-detallado), sin `</script` crudo en el bloque; el escape
  `<\/script` está aplicado en el fuente (con el catálogo actual no hay
  ocurrencias que escapar). Bundle
  `_astro/search-live.astro_astro_type_script_index_0_lang.LUxzhH2D.js`
  minificado verificado: `document.addEventListener(e(), ...)` (e() =
  changeEventName → 'search:change' desde search-bar), lee `detail?.term`,
  `toggleAttribute('hidden')` sobre panel/secciones, livePage con pageSize 6
  y seeAllUrl → `/search?q=`.

## Confirmación ≤100 líneas

src/pages/index.astro 35 · search-live.astro 17 · search-live.ts 99 ·
search-live.css 31. El test (380 líneas) sigue el precedente de tests del
arnés (search-dedicated-view.test.mjs 352, search-bar-header.test.mjs 340):
la regla de 100 líneas aplica a código de src/, no a tests de inspección.

## Notas

- Tokens: search-live.css usa solo tokens existentes (los 10 de design.md +
  --container-max, precedente search-results.css); el guardián
  audit-design-tokens.mjs pasa.
- JS de runtime justificado (REQ-05-07, Decisión 4): live search en tiempo
  real, excepción explícita a "estático por defecto" (regla 9) documentada en
  el propio controlador, con precedentes 24/43/44 y features 3/4; sin
  frameworks ni dependencias (CustomEvent + DOM nativos).
- Reutilización por la feature 6 (Escape): el controlador alterna los mismos
  selectores data-* y la barra expone clearQuery/activeQuery.