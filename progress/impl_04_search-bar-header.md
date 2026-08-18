# Informe de implementación — feature 4 search-bar-header

Fecha: 2026-08-18. Rol: implementer. Feature: 4 — search-bar-header
("Barra de búsqueda en el header con limpieza X, foco y navegación Enter").
Spec: specs/04_search-bar-header/ (REQ-04-01..08, design.md Decisiones 1-5,
D7/D8 de progress/research/global-search-landing.md). Estado al iniciar:
pending → in_progress (feature_list.json). NO marcada done (el APPROVED del
reviewer la cierra).

## Estado inicial

- Suite 300/300 en verde; features 1-3 done. Feature 4 depende de 2 (done).
- No existían: src/components/search-bar/, src/styles/search-bar.css,
  tests/search-bar-header.test.mjs. Layout.astro: navbar solo con enlaces
  (Home/About/@moibaldenegro) + ClientRouter (feature 24).

## Ciclo rojo/verde (test-first)

1. Tests escritos PRIMERO: tests/search-bar-header.test.mjs (20 tests,
   patrón mixto del arnés, precedente search-dedicated-view.test.mjs):
   - Unitarios por import directo del control `.ts` puro: isFilled
     (REQ-04-03), searchUrl con URLSearchParams/escaping (REQ-04-05),
     submitQuery navega/no navega (REQ-04-05/06), activeQuery/changeEventName
     (REQ-04-02), emitChange con stub de document (REQ-04-07).
   - Wiring con DOM fake (root/input/clear inyectados a initSearchBar y
     clearQuery): input → clase is-filled; botón X vacía y devuelve foco
     (REQ-04-04); Enter navega con consulta y omite con vacía/otra tecla;
     emisión de search:change con detail { term }.
   - Inspección por regex: Layout.astro integra <SearchBar /> en el nav
     (REQ-04-01), input con aria-label (REQ-04-08), botón X con aria-label y
     type="button" (Decisión 4), componente importa hoja y arranca el control
     (Decisión 1), script navega con navigate de astro:transitions/client
     (Decisión 3), control despacha CustomEvent search:change con detail
     (REQ-04-07), clearQuery vacía + focus (REQ-04-04), hoja condiciona X a
     .is-filled (Decisión 2), tokens solo del set de design.md y sin
     hex/rgba, ≤100 líneas en layout/componente/control/hoja, sin <style> ni
     style inline, ClientRouter conservado (view transitions).
2. ROJO capturado (archivos inexistentes):

   ```
   Error [ERR_MODULE_NOT_FOUND]: Cannot find module
   '...src\components\search-bar\search-bar.ts' imported from
   ...tests\search-bar-header.test.mjs
   not ok 1 - tests\search-bar-header.test.mjs
   exitCode: 1
   ```

   (0 pass / 1 fail, exit 1).
3. VERDE (feature): `node --test tests/search-bar-header.test.mjs` →
   `# tests 20 / # pass 20 / # fail 0`.

## Archivos creados/modificados

| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/components/search-bar/search-bar.astro | 21 | UI sin lógica (input + botón X + script que importa y arranca) |
| src/components/search-bar/search-bar.ts | 64 | Control: lógica separada (regla 8), funciones puras + wiring |
| src/styles/search-bar.css | 75 | Hoja del componente (solo tokens existentes de design.md) |
| tests/search-bar-header.test.mjs | 340 | 20 tests REQ-04-01..08 (unitarios + wiring + inspección) |
| src/layouts/Layout.astro (MODIFICADO) | 36 | Importa SearchBar y lo integra en el `<nav>` (34 → 36 líneas) |

Modificados además: feature_list.json (feature 4 → in_progress),
progress/current.md (bitácora). layout.css, tokens.css, dominio de búsqueda y
features previas: intactos (layout-refactor.test.mjs y view-transitions.test.mjs
siguen en verde sin ajustes).

## API del control exportada (src/components/search-bar/search-bar.ts)

- `searchUrl(term): string` — `/search?q=<término>` con URLSearchParams
  (trim + escaping; REQ-04-05).
- `isFilled(term): boolean` — X visible solo con consulta no vacía
  (REQ-04-03).
- `submitQuery(term, navigate): void` — navega solo si no vacía (REQ-04-06).
- `changeEventName(): string` — 'search:change' (REQ-04-07).
- `activeQuery(): string` — consulta activa en memoria (REQ-04-02).
- `emitChange(term): void` — actualiza memoria + CustomEvent
  `search:change` con `detail: { term }` en el documento (REQ-04-07).
- `clearQuery(root): void` — vacía el input, sincroniza y devuelve el foco
  (REQ-04-04).
- `initSearchBar(navigate, root?)` — wiring: input → sync (is-filled +
  evento), keydown Enter → submitQuery, click X → clearQuery.

API para la feature 6 (Escape): clearQuery(root), activeQuery(),
changeEventName() (design.md Decisión 4: "deja el control con API
suficiente").

## Decisión de navegación con view transitions

La barra navega con `navigate` de `astro:transitions/client` — el mecanismo
de navegación programática del framework del sitio (el mismo ClientRouter de
la feature 24, verificado en node_modules/astro/dist: el virtual module
`astro:transitions/client` exporta `navigate`). Para mantener el control
`.ts` puro e importable por node:test (sin módulos virtuales de Astro en
ámbito de módulo), el `<script>` del .astro importa `navigate` y lo inyecta
en `initSearchBar(navigate)` — el script solo importa y arranca (Decisión
1). Resultado: Enter con consulta no vacía navega a `/search?q=...` CON
transición de vista (no recarga completa); con vacía no navega (REQ-04-06).
El build lo confirma: el bundle del control importa navigate del bundle del
ClientRouter y las páginas conservan `astro-view-transitions-enabled`.

## Evidencia del VERDE

- Feature: `node --test tests/search-bar-header.test.mjs` → 20/20.
- Suite completa: `bash -c "pnpm test"` → `# tests 320 / # pass 320 /
  # fail 0` (300 previos + 20 nuevos; layout-refactor y view-transitions
  intactos, sin ajustes).
- `node scripts/check-format.mjs` → `FORMATO ✔`.
- `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
  tokens.css en src/styles`.
- `bash ./init.sh` → todas las comprobaciones ✔ → `✔ El entorno está
  perfecto. Podemos empezar a trabajar.` (incluye `pnpm build`).
- Build verificado en dist/: la barra aparece en el header de TODAS las
  páginas (/, /about, /search, /posts/00-agilismo, /posts/01-diseño-detallado)
  con `<input type="text" placeholder="Buscar artículos…"
  aria-label="Buscar artículos">` y `<button type="button"
  class="search-bar__clear" data-search-clear aria-label="Limpiar
  búsqueda">×</button>`; el bundle `search-bar.astro_...js` contiene el
  control completo (search:change, URLSearchParams q, is-filled, focus) y
  `import{t as e}from"./client...js"` = navigate del ClientRouter.

## Confirmación ≤100 líneas

search-bar.astro 21 · search-bar.ts 64 · search-bar.css 75 · Layout.astro 36.
El test (340 líneas) sigue el precedente del arnés (search-dedicated-view
352, search-domain 248): la regla de 100 líneas aplica a código de src/, no a
tests de inspección.

## Notas

- Tokens: solo los 10 de design.md (--color-navbar, --color-surface,
  --color-border, --color-border-strong, --color-text, --color-text-secondary,
  --color-accent, --radius-pill, --transition-default, --font-sans); sin
  tokens nuevos, sin hex/rgba (audit ✔). Botón X oculto con visibility+opacity
  (fuera del orden de tabulación cuando no aplica, a11y).
- JS de runtime justificado: design.md Decisión 5 (precedentes 24/43/44); sin
  frameworks ni dependencias; lógica en .ts separado (regla 8), funciones
  puras sin document/window en ámbito de módulo (precedente feature 3).
- La portada (feature 5) escuchará `search:change` con `detail.term`;
  search-results (feature 3) se reutiliza intacto desde /search.