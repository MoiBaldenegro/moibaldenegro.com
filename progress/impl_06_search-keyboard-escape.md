# Informe de implementación — feature 6 search-keyboard-escape

Fecha: 2026-08-18. Rol: implementer. Feature: 6 — search-keyboard-escape
("Soporte de teclado: Escape limpia o cierra la búsqueda activa"). Spec:
specs/06_search-keyboard-escape/requirements.md (REQ-06-01..04; sin
design.md: interacción pura sobre elementos existentes). Estado al iniciar:
pending → in_progress (feature_list.json). NO marcada done (el APPROVED del
reviewer la cierra).

## Estado inicial

- Suite 340/340 en verde; features 3, 4 y 5 done. APIs existentes y
  REUTILIZADAS intactas por import:
  - feature 4 `src/components/search-bar/search-bar.ts`: `clearQuery(root)`
    (vacía input + sincroniza + foco), `activeQuery()` (consulta en memoria),
    `emitChange(term)`.
  - feature 3 `src/components/search-results/search-results-controller.ts`:
    `removeQueryParam(search, name)` (elimina q, puro), `queryTerm(search)`
    (lee q de la URL).
  - feature 5 `src/components/search-live/search-live.ts`: `applyLive(term,
    index, panel, landing)` (alterna hidden entre `[data-search-live]` y
    `[data-landing-sections]`).
- No existían: src/components/search-escape/, tests/search-keyboard-escape.test.mjs.
  Layout.astro (36 líneas) tenía la barra (feature 4) pero no Escape.

## Ciclo rojo/verde (test-first)

1. Tests escritos PRIMERO: tests/search-keyboard-escape.test.mjs (20 tests,
   patrón mixto del arnés, precedente search-landing-live-transition.test.mjs):
   - Unitarios por import directo del controlador .ts puro: `escapeAction`
     (REQ-06-01/02/03), `escapeContext` (detección por data-*), `activeTerm`
     (consulta activa por contexto).
   - Wiring con DOM fake: Escape en portada → clearQuery sobre la barra fake
     (input vacío + foco) y applyLive('') → panel hidden / secciones visibles
     (REQ-06-01); Escape en /search → history.replaceState sin q + guía
     visible + empty/grid/pagination ocultas + título base (REQ-06-02);
     consulta vacía → no-op (REQ-06-03); stopPropagation SIEMPRE (REQ-06-04);
     otra tecla no dispara nada; re-ejecución del arranque no duplica el
     manejador (view transitions).
   - Inspección por regex: manejador con stopPropagation, arranque integrado
     en Layout.astro (<SearchEscape /> junto a <SearchBar />), reutilización
     de clearQuery/removeQueryParam/applyLive por import, ≤100 líneas.
2. ROJO capturado (archivos inexistentes):

   ```
   Error [ERR_MODULE_NOT_FOUND]: Cannot find module
   '...src\components\search-escape\search-escape.ts' imported from
   ...tests\search-keyboard-escape.test.mjs
   # tests 1
   # pass 0
   # fail 1
   ```

   (exit 1; 0 pass / 1 fail). Fallo intermedio de test (no de código): el
   fake de la raíz devolvía el panel `[data-search-live]` también en modo
   guía (contexto 'landing' en vez de 'search'); corregido el fake →
   20/20.
3. VERDE (feature): `node --test tests/search-keyboard-escape.test.mjs` →
   `# tests 20 / # pass 20 / # fail 0`.

## Archivos creados/modificados

| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/components/search-escape/search-escape.ts | 66 | Controlador: funciones puras (escapeContext, escapeAction, activeTerm) + wiring initSearchEscape con DOM inyectado |
| src/components/search-escape/search-escape.astro | 9 | Componente sin UI: script que importa y arranca el controlador (regla 8) |
| tests/search-keyboard-escape.test.mjs | 305 | 20 tests REQ-06-01..04 (unitarios + wiring + inspección) |
| src/layouts/Layout.astro (MODIFICADO) | 38 | Importa SearchEscape y lo integra tras </header> (36 → 38 líneas) |

Modificados además: feature_list.json (feature 6 → in_progress),
progress/current.md (bitácora). Ningún archivo de features 3/4/5 tocado
(search-bar.*, search-results.*, search-live.*, dominio intactos; la
reutilización es por import).

## Dónde se arranca el manejador y por qué (decisión)

Se arranca en el **Layout**, vía componente script-only `search-escape.astro`
integrado como `<SearchEscape />` tras `</header>` (junto a `<SearchBar />`).
Razones:

- El Escape es comportamiento **global** del sistema de búsqueda (la barra
  también vive en el Layout): un único punto de arranque cubre todas las
  páginas sin duplicar wiring por página.
- El layout queda limpio (1 import + 1 tag, 38 líneas; sin lógica: el
  componente solo importa y arranca, regla 8).
- El contexto de la página se detecta por DOM en runtime (patrón feature 5):
  `escapeContext(root)` devuelve 'landing' si existe `[data-search-live]`,
  'search' si existe `[data-search-guide]`, 'none' en el resto (About,
  posts…). Fuera de portada y /search, Escape es no-op (la spec solo define
  REQ-06-01/02; REQ-06-03 cubre la vacía).
- El manejador se registra en `keydown` a nivel de documento (funciona con
  el foco en cualquier parte, patrón estándar de "Escape cierra la
  búsqueda"). Con view transitions, los scripts del layout se re-ejecutan en
  cada navegación: un guard a nivel de módulo (removeEventListener antes de
  addEventListener) impide manejadores duplicados en el documento (test 16).

## Cómo reutiliza las APIs de las features 3/4/5 (por import)

- **feature 4 (barra)**: `clearQuery(barRoot)` en 'clear-landing' — vacía el
  input, sincroniza (emite `search:change` con término vacío, que de paso
  restaura el live search vía el listener de la feature 5) y devuelve el
  foco. `activeQuery()` alimenta `activeTerm` en contexto landing.
- **feature 3 (vista dedicada)**: `removeQueryParam(window.location.search,
  'q')` + `history.replaceState` en 'clear-search' — espejo exacto del botón
  "Limpiar búsqueda" (wireClear de feature 3): elimina q de la URL, restaura
  el título base y muestra la guía (empty/grid/pagination ocultas por el
  mismo contrato data-search-*). `queryTerm(search)` alimenta `activeTerm`
  en contexto search (deep linking: Escape funciona también con q en la URL
  aunque la barra esté vacía).
- **feature 5 (panel en vivo)**: `applyLive('', [], panel, landing)` en
  'clear-landing' — restaura las secciones habituales (panel hidden, landing
  visible). Con modo landing el índice no se usa (retorno temprano de
  applyLive), por eso se pasa vacío; se documenta en el código.
- El input de la barra NO se toca en /search: coherente con el botón
  canónico de la feature 3 (wireClear tampoco lo toca); la limpieza de la
  barra es competencia de la feature 4 (X) y de la portada (Escape).

## Decisión de la consulta activa (REQ-06-03)

`activeTerm(context, search)`: en /search la consulta activa es el parámetro
`q` de la URL (deep linking, feature 3); en la portada es la memoria de la
barra (`activeQuery`, feature 4, sincronizada en cada input/limpieza). Con
trim vacío → `escapeAction` = 'none' → no-op (REQ-06-03), pero
`event.stopPropagation()` se ejecuta SIEMPRE sobre Escape (REQ-06-04).

## Evidencia del VERDE

- Feature: `node --test tests/search-keyboard-escape.test.mjs` → 20/20.
- Suite completa: `bash -c "pnpm test"` → `# tests 360 / # pass 360 /
  # fail 0` (340 previos + 20 nuevos; layout-refactor, view-transitions,
  search-bar-header, search-dedicated-view y search-landing-live-transition
  intactos, sin ajustes).
- `node scripts/check-format.mjs` → `FORMATO ✔`.
- `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
  tokens.css en src/styles` (sin CSS nuevo: interacción pura, sin UI).
- `bash ./init.sh` → todas las comprobaciones ✔ → `✔ El entorno está
  perfecto. Podemos empezar a trabajar.` (incluye `pnpm build`).
- Build verificado en dist/: bundle
  `_astro/search-escape.astro_astro_type_script_index_0_lang.*.js` con
  stopPropagation, keydown, replaceState y los selectores data-search-guide /
  data-search-live / data-landing-sections; `dist/client/index.html` y
  `dist/client/search/index.html` referencian el bundle (arranque en todas
  las páginas vía Layout).

## Confirmación ≤100 líneas

search-escape.ts 66 · search-escape.astro 9 · Layout.astro 38. El test (305
líneas) sigue el precedente de tests del arnés (search-bar-header 340,
search-landing-live-transition 380): la regla de 100 líneas aplica a código
de src/, no a tests de inspección.

## Notas

- Sin `<style>` ni CSS nuevo (no hay UI nueva: interacción pura sobre
  elementos existentes); audit de tokens ✔ sin tocarlos.
- JS de runtime justificado: interacción de teclado nativa (keydown +
  stopPropagation), precedente features 3/4/5 (excepción a "estático por
  defecto", regla 9, documentada en el propio controlador); sin frameworks
  ni dependencias; lógica en .ts separado (regla 8), funciones puras sin
  document/window en ámbito de módulo (DOM por inyección).