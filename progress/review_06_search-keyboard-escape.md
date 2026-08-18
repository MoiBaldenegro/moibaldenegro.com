# Review — feature 6 `search-keyboard-escape`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/06_search-keyboard-escape/`
(REQ-06-01..04; sin design.md: interacción pura sobre elementos existentes).
Backlog: entrada id 6 de `feature_list.json` (acceptance ×4). Informe del
implementer: `progress/impl_06_search-keyboard-escape.md`.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_06_search-keyboard-escape.md`
y en `progress/current.md` (sección "Evolución (implementer, 2026-08-18,
feature 6 search-keyboard-escape)"):

- **Rojo capturado antes de implementar**: `node --test
  tests/search-keyboard-escape.test.mjs` → exit 1,
  `ERR_MODULE_NOT_FOUND` hacia `src\components\search-escape\search-escape.ts`
  (archivos inexistentes; el test se escribió primero contra la spec), 0 pass
  / 1 fail. El informe reproduce el error completo de Node. Se documenta
  además un fallo intermedio de test (fake de la raíz que devolvía el panel
  en modo guía) corregido antes del verde — señal de TDD real.
- **Verde después de implementar**: test de la feature 20/20 pass, suite
  completa 360/360 pass (340 previos + 20 nuevos), `check-format` ✔,
  `audit-design-tokens` ✔ y `./init.sh` "El entorno está perfecto" — los
  cuatro re-ejecutados por mí abajo.

La feature no salta dependencias: `depends_on: [3, 4, 5]` en
`feature_list.json` (entrada id 6) y las features 3 `search-dedicated-view`,
4 `search-bar-header` y 5 `search-landing-live-transition` están `done`
(verificado en el mismo archivo; 1-5 `done`, 6 `in_progress`) —
dependencias satisfechas.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/search-keyboard-escape.test.mjs` → exit 0,
   **# tests 20 / # pass 20 / # fail 0** (TAP). Los 20 subtests cubren
   REQ-06-01..04 y las restricciones del arnés: escapeAction vacía → none
   (ok 1), portada → clear-landing (ok 2), /search → clear-search (ok 3),
   contexto none → none (ok 4), escapeContext por data-* (ok 5), activeTerm
   con q de la URL en /search (ok 6), activeTerm con memoria de la barra en
   portada (ok 7), wiring portada: input vacío + foco + panel hidden +
   secciones visibles + stop (ok 8), inspección selectores de portada (ok 9),
   wiring /search: replaceState sin q + guía visible + empty/grid/pagination
   ocultas + título base + stop (ok 10), no-op en /search sin q (ok 11),
   reutiliza removeQueryParam (ok 12), no-op en portada con consulta vacía
   (ok 13), otra tecla no dispara nada (ok 14), stopPropagation SIEMPRE (ok
   15), guard anti-duplicado del manejador (ok 16), Layout integra SearchEscape
   junto a SearchBar y conserva ClientRouter (ok 17), script solo importa y
   arranca sin <style> (ok 18), reutilización de APIs 3/4/5 por import sin
   frameworks (ok 19), ≤100 líneas en layout/componente/controlador (ok 20).
2. `bash -c "pnpm test"` → **# tests 360 / # pass 360 / # fail 0** en **4 de
   5** ejecuciones (4 corridas consecutivas verdes al final: 360/360, 360/360,
   360/360, 360/360). **Observación no bloqueante**: en mi PRIMERA ejecución
   del día la suite dio 359/360 (1 fail) durante el arranque en frío; no
   pude capturar el test afectado (mi filtro de salida lo descartó) y el
   fallo **nunca se reprodujo** en las 4 corridas posteriores ni en los tests
   internos de `./init.sh` — misma firma exacta que la anomalía transitoria
   ya documentada en la review 5 (339/340 aislado, no reproducido). No lo
   considero defecto de la feature 6 (el test de la feature pasó 20/20 en
   todas las ejecuciones, incluida la del arranque en frío).
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
   `node scripts/audit-design-tokens.mjs` → exit 0:
   `AUDIT ✔ ningún color fuera de tokens.css en src/styles` (sin CSS nuevo:
   interacción pura).
4. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests 100% ✔, build ✔ →
   **"✔ El entorno está perfecto. Podemos empezar a trabajar."**
5. Inspección directa de los 3 archivos de la feature + Layout:
   - `src/components/search-escape/search-escape.ts` (76 líneas):
     **funciones puras sin document/window en ámbito de módulo** — el único
     estado de módulo es `let escapeHandler` (guard anti-duplicado); los
     defaults de `initSearchEscape` (`root = document`,
     `barRoot = document.querySelector(...)`, `baseTitle = document.title`)
     se evalúan en llamada, no en módulo (patrón idéntico a
     search-live.ts/search-bar.ts, features 5/4 aprobadas). `escapeContext`
     detecta 'landing' por `[data-search-live]` y 'search' por
     `[data-search-guide]` (ambos selectores verificados en
     search-live.astro:6 y search-results.astro:6); `escapeAction(term,
     context)` decide clear-landing/clear-search/none con `trim() === ''` →
     none (REQ-06-03); `activeTerm` usa `queryTerm` de la feature 3 en /search
     (deep linking) y `activeQuery` de la feature 4 en portada. El manejador
     llama `event.stopPropagation()` **antes** de cualquier acción y para
     toda tecla Escape (REQ-06-04, verificado también en el bundle), y
     registra con guard `removeEventListener` → `addEventListener` (view
     transitions). `clearLanding` reutiliza `clearQuery(barRoot)` (f4:
     vacía, sincroniza vía search:change, enfoca) + `applyLive('', [], panel,
     landing)` (f5: panel hidden, secciones visibles; el índice vacío es
     intencional — retorno temprano de applyLive en modo landing, comentado
     en el código). `clearSearchView` replica exactamente `wireClear` de la
     feature 3: `removeQueryParam(window.location.search, 'q')` +
     `history.replaceState` + `document.title = baseTitle` + guía visible y
     empty/grid/pagination ocultas — mismo contrato `data-search-*`. El
     doble `applyLive` (vía clearQuery→emitChange y la llamada explícita) es
     idempotente y por diseño: cubre el caso de barra ausente.
   - `src/components/search-escape/search-escape.astro` (9 líneas):
     script-only, sin marcado ni `<style>`; el `<script>` **solo importa y
     arranca** `initSearchEscape()` (regla 8, precedente features 3/4/5).
   - `src/layouts/Layout.astro` (38 líneas): `import SearchEscape` +
     `<SearchEscape />` tras `</header>` y antes de `<slot />`; conserva
     `<SearchBar />` (feature 4), `ClientRouter` (feature 24/REQ-24-01) y el
     `<header>` intactos (ok 17). Arranque único global coherente con la
     barra (también en el Layout) y con la re-ejecución de scripts en view
     transitions (guard).
   - Orden de ejecución en /search verificado: el bundle de SearchEscape
     (layout) se emite antes que el de SearchResults (slot) → `baseTitle`
     captura "Búsqueda" (estático) antes de que `initSearchResults` ponga
     "Búsqueda: <término>" → Escape restaura el título base correcto, igual
     que el botón canónico `data-search-clear` de la feature 3.
6. Build verificado en `dist/`: bundle
   `_astro/search-escape.astro_astro_type_script_index_0_lang.YG48peEk.js`
   (1277 B) referenciado desde `dist/client/index.html` **y**
   `dist/client/search/index.html` (arranque en todas las páginas vía
   Layout). Contenido del bundle: `keydown`, `stopPropagation`,
   `replaceState`, selectores `data-search-guide`/`data-search-live`/
   `data-landing-sections`, las ramas clear-landing/clear-search y la
   auto-invocación `l()`; los imports resueltos apuntan a los bundles de la
   barra (`clearQuery`/`activeQuery` de `search-bar.*.js`), de la vista
   dedicada (`queryTerm`/`removeQueryParam` de
   `search-results-controller.*.js`) y del panel en vivo (`applyLive` de
   `search-live.*.js`) — **reutilización real por import, sin lógica
   duplicada** (el bundle del controlador no redefine ninguna de esas
   funciones, las importa).
7. `git diff --name-only -- package.json pnpm-lock.yaml docs/dependencies.md`
   → vacío: **sin dependencias externas nuevas** (regla 2). `git status`
   confirma que los archivos de código de features previas no se tocaron:
   las únicas modificaciones de src/ son `Layout.astro` (esta feature) y los
   ya aprobados del ciclo (index.astro f5, hero-card.css y el fixture de la
   f1); `src/components/search-bar|search-results|search-live/`,
   `src/domain/search/` y las hojas de estilos del ciclo aparecen como
   untracked porque el ciclo completo es nuevo en working tree (nada de la
   feature 6 los modificó — verificado por inspección de contenido y por la
   suite 360/360 intacta).
8. Grep sobre los archivos de la feature: sin `console.`, `print(`, `TODO`,
   `FIXME` ni `debugger`. Sin `<style>` ni atributos style en
   search-escape.astro ni en el controlador.
9. Trazado REQ→comportamiento verificado en código y bundle:
   REQ-06-01 → rama clear-landing (clearQuery + applyLive('')), ok 2/8/9/19;
   REQ-06-02 → rama clear-search (removeQueryParam + replaceState + estado
   inicial vía toggles data-search-*), ok 3/10/12; REQ-06-03 → escapeAction
   none con trim vacío y no-op verificado en wiring, ok 1/11/13; REQ-06-04 →
   stopPropagation incondicional sobre Escape, ok 8/10/11/13/15. Consulta
   vacía en /search también deja el input de la barra intacto (decisión
   coherente: el botón canónico de la feature 3 tampoco lo toca; la limpieza
   del input es competencia de la feature 4/portada — documentada en el
   informe).

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 6) | REQ | Test | Estado |
|---|---|---|---|
| Escape con consulta activa en la portada vacía la consulta y restaura las secciones habituales | REQ-06-01 | ok 2 (escapeAction clear-landing), ok 8 (wiring: input.value '' + focusCalls 1 + panelHidden true + landingHidden false), ok 9 (selectores data-search-live/data-landing-sections), ok 19 (imports clearQuery/applyLive) | ✔ |
| Escape con consulta activa en /search limpia la consulta y muestra el estado inicial | REQ-06-02 | ok 3 (escapeAction clear-search), ok 10 (wiring: replaceState [null,'','/search'] + guía visible + empty/grid/pagination hidden + título base), ok 12 (import removeQueryParam), ok 6 (activeTerm q de la URL) | ✔ |
| Escape con consulta vacía no ejecuta ninguna acción | REQ-06-03 | ok 1 (escapeAction none con ''/'   '), ok 11 (wiring /search: 0 replaceState), ok 13 (wiring portada: input intacto + 0 toggles de panel) | ✔ |
| El manejador de Escape detiene la propagación del evento | REQ-06-04 | ok 15 (inspección stopPropagation en el manejador keydown), ok 8/10/11/13 (stop llamado 1 vez en cada wiring, incluidos los no-op), ok 14 (otra tecla no detiene) | ✔ |

## Conformidad con architecture.md / conventions.md

- **Capas** (regla 1): componente en `src/components/search-escape/` (carpeta
  propia), lógica en módulo `.ts` del componente, integrado en el layout
  único `src/layouts/Layout.astro` (regla 11). ✔
- **Lógica separada de la UI** (regla 8): el frontmatter del `.astro` solo
  comenta; el `<script>` solo importa y arranca; todo el comportamiento
  (contexto, decisión, wiring) está en `search-escape.ts` con funciones puras
  exportadas (`escapeContext`, `escapeAction`, `activeTerm`) y wiring con DOM
  inyectado (`initSearchEscape`). ✔
- **Estilos separados** (regla 7): sin `<style>` ni atributos style (ok 18);
  cero CSS nuevo (interacción pura) — audit de tokens ✔ sin tocarlos. ✔
- **≤100 líneas** (regla 12): search-escape.ts 76, search-escape.astro 9,
  Layout.astro 38 — verificadas por ok 20 y por mí. El test (343 líneas)
  sigue el precedente del arnés para tests de inspección
  (search-bar-header 340, search-landing-live-transition 380): la regla
  aplica a `src/`. ✔
- **Sin dependencias externas** (regla 2): package.json/lock y
  `docs/dependencies.md` sin cambios; sin frameworks (el controlador no
  importa react/vue/… ni astro:transitions — ok 19; el bundle solo importa
  los módulos propios del ciclo). ✔
- **JS de runtime justificado** (regla 9): interacción de teclado nativa
  (keydown + stopPropagation), excepción documentada en el header del
  controlador con precedente features 3/4/5; DOM nativos, sin dependencias. ✔
- **Nombres** (conventions): carpeta kebab-case `search-escape`, `.astro`
  PascalCase (`SearchEscape`), funciones camelCase verbo-primero
  (`escapeAction`, `escapeContext`, `activeTerm`, `initSearchEscape`,
  `clearLanding`, `clearSearchView`), tipos PascalCase (`EscapeContext`,
  `EscapeAction`). ✔
- **Inmutabilidad** (regla 4): `const` por defecto; única mutación de estado
  de módulo es el guard del manejador (`escapeHandler`), imprescindible para
  el anti-duplicado en view transitions; el resto son mutaciones de DOM
  (hidden, value, replaceState). ✔
- **Errores explícitos** (regla 3): funciones de decisión puras sin fallos
  que deban lanzar; wiring con guardas de null (barRoot/panel/landing
  ausentes → no-op), coherente con features 3/4/5. ✔
- **No rompe features previas**: suite 360/360 (4 corridas consecutivas),
  Layout conserva SearchBar (REQ-04-01) y ClientRouter (REQ-24-01) — ok 17;
  search-bar/search-results/search-live/dominio intactos; la reutilización
  por import está verificada en el bundle del build (sin duplicación de
  lógica); build de producción ✔. ✔

## Checkpoints

- C1 (Arquitectura): [x] — estilos en `src/styles/*.css` sin `<style>` en
  `.astro` (y sin CSS nuevo en esta feature), lógica en `.ts` separado con
  funciones puras (sin document/window en ámbito de módulo), sin tokens
  nuevos, ≤100 líneas en src/ (76/9/38), sin dependencias nuevas, capas y
  layout único conservados.
- C2 (Datos): [x] — `src/data/*.json`, entidades, repositorios y dominio
  `src/domain/search/` intactos (la feature no toca datos; la reutilización
  de queryTerm/removeQueryParam/applyLive/clearQuery es por import, no por
  duplicación).
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (tests 100%, formato ✔, build ✔; bundle de
  Escape verificado en dist para `/` y `/search`). La inspección visual
  desktop/móvil queda [ ] como en el histórico: el arnés no tiene navegador
  (pendiente del humano). Nota: mi primera ejecución de `pnpm test` dio
  359/360 una única vez, no reproducida en 4 corridas consecutivas
  (360/360) ni en los tests internos de `./init.sh` (misma firma que la
  anomalía transitoria de la review 5; sin impacto en el veredicto).
- C4 (Harness, tarea en `done`): [ ] — feature 6 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en features 1-5). Ninguna otra feature a medias
  (1-5 `done`).
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo/verde, decisiones, conteos, build); `progress/history.md` al
  día (cierres 1-5 movidos; el cierre de la 6 se moverá al cerrar); sin
  `print()` de debug ni TODOs (grep ✔). Observación de limpieza no
  bloqueante: existe `test-run1.log` (log de una corrida completa de
  `pnpm test`, sin `not ok`, 2026-08-18 11:51) untracked en la raíz del
  repo, **preexistente** a esta feature (no figura en los archivos
  creados/modificados del informe y su timestamp es anterior a la sesión);
  el líder puede pedir al humano si lo elimina.

## Cambios requeridos

Ninguno.

Observación no bloqueante (sin acción requerida): el fallo 359/360 aislado
de mi primera ejecución de la suite no se reprodujo en 4 corridas
consecutivas (360/360) ni en los tests internos de `./init.sh`; si
reapareciera en el futuro, el próximo ciclo deberá capturar el test afectado
(`not ok`) antes de cerrar. `test-run1.log` es un artefacto preexistente de
una corrida de tests en la raíz del repo; ajeno a esta feature, pero si el
humano quiere repo impecable conviene borrarlo.