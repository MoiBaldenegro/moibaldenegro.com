# Review — feature 5 `search-landing-live-transition`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/05_search-landing-live-transition/`
(REQ-05-01..07, design.md Decisiones 1-5). Backlog: entrada id 5 de
`feature_list.json` (acceptance ×5). Análisis de diseño:
`progress/research/global-search-landing.md` (D3/D6). Informe del
implementer: `progress/impl_05_search-landing-live-transition.md`.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_05_search-landing-live-transition.md`
y `progress/current.md` (sección "Evolución (implementer, 2026-08-18, feature 5
search-landing-live-transition)"):

- **Rojo capturado antes de implementar**: `node --test
  tests/search-landing-live-transition.test.mjs` → exit 1,
  `ERR_MODULE_NOT_FOUND` hacia `src\components\search-live\search-live.ts`
  (archivos inexistentes; el test se escribió primero contra la spec), 0 pass
  / 1 fail. El informe reproduce el error completo de Node.
- **Verde después de implementar**: test de la feature 20/20 pass, suite
  completa 340/340 pass (320 previos + 20 nuevos), `check-format` ✔,
  `audit-design-tokens` ✔ y `./init.sh` "El entorno está perfecto" — los
  cuatro re-ejecutados por mí abajo.

La feature no salta dependencias: `depends_on: [3, 4]` en `feature_list.json`
(entrada id 5) y las features 3 `search-dedicated-view` y 4
`search-bar-header` están `done` (verificado en el mismo archivo; 1-4 `done`,
5 `in_progress`, 6 `pending`) — dependencias satisfechas.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/search-landing-live-transition.test.mjs` → exit 0,
   **# tests 20 / # pass 20 / # fail 0** (TAP; re-ejecutado 3 veces más, 20/20
   en todas). Los 20 subtests cubren REQ-05-01..07 y las restricciones del
   arnés: layoutMode (ok 1), wiring applyLive oculta/restaura (ok 2), portada
   escucha search:change vía changeEventName + detail (ok 3), alternancia
   hidden sin reload/fetch (ok 4), índice embebido con escape <\/script (ok
   5), reutilización de cardHtml/search-results.css/empty/grid (ok 6), mensaje
   exacto del empty state sin data-search-clear (ok 7), wiring empty con
   término actual (ok 8), livePage PAGE_SIZE/showAllLink/orden fecha (ok 9),
   seeAllUrl (ok 10), wiring enlace /search?q= (ok 11), data-search-all +
   seeAllUrl en control (ok 12), excepción documentada + CustomEvent + sin
   frameworks (ok 13), script importa/arranca initSearchLive (ok 14), panel
   empieza hidden (ok 15), ≤100 líneas (ok 16), tokens solo del set de
   design.md + --container-max sin hex/rgba (ok 17), hoja fuerza [hidden] (ok
   18), sin <style>/inline (ok 19), server:defer de HTB conservado (ok 20).
2. `bash -c "pnpm test"` → **# tests 340 / # pass 340 / # fail 0** en 13 de 14
   ejecuciones consecutivas (htb-stadistics, hero y articles intactos; nada
   roto por la feature). **Observación no bloqueante**: en mi PRIMERA
   ejecución del día la suite dio 339/340 (1 fail) durante el arranque en
   frío (18.6 s vs ~3.8 s de las siguientes) y en paralelo con otros comandos;
   el fallo **nunca se reprodujo** (13 corridas verdes consecutivas + 3 de la
   feature + tests internos de `./init.sh`), por lo que no pude capturar el
   test afectado ni su causa. Lo dejo documentado como anomalía transitoria
   no reproducible del entorno, no como defecto de la feature.
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
   `node scripts/audit-design-tokens.mjs` → exit 0:
   `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
4. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests 100% ✔, build ✔ →
   **"✔ El entorno está perfecto. Podemos empezar a trabajar."**
5. Inspección directa de los 4 archivos de la feature:
   - `src/pages/index.astro` (35 líneas): `git diff` confirma **exactamente**
     los cambios declarados — imports (`SearchLive`, `PostsRepository`,
     `buildSearchIndex`, `getCollection`), `prerender = true`, índice embebido
     `<script type="application/json" id="search-index" is:inline
     set:html={indexJson}>` con `JSON.stringify` + `.replace(/<\/script/gi,
     '<\\/script')` (escape `<\/script`, REQ-03-07; patrón idéntico a
     `search.astro` de la feature 3, aprobada), wrapper `<div class="home__landing"
     data-landing-sections>` alrededor de `NewHero`, `LatestArticles` y
     `HtbStadistics server:defer` con `slot="fallback"` intactos (REQ-22-01),
     `<SearchLive />` al final. Frontmatter solo imports + serialización del
     dato (regla 8; precedente exacto de `search.astro`).
   - `src/components/search-live/search-live.ts` (99 líneas): **funciones
     puras sin document/window en ámbito de módulo** — `layoutMode` ('landing'
     si trim==='' / 'results' si no, REQ-05-01/02/03), `livePage` (página 1 de
     `searchIndex` del dominio + `showAllLink = total > pageSize`, REQ-05-06,
     D6), `seeAllUrl` (`/search?q=` con URLSearchParams + trim), `applyLive`
     (alterna `toggleAttribute('hidden')` sobre `[data-search-live]` y
     `[data-landing-sections]`; pinta grid con `cardHtml` de la feature 3;
     empty state con `termNode.textContent = term`; enlace `[data-search-all]`
     solo si sobran — REQ-05-04/05/06), `initSearchLive` (defaults de
     `document.querySelector` evaluados en llamada, no en módulo — testeable
     con node:test; `document.addEventListener(changeEventName(), ...)` con
     `detail?.term` — REQ-04-07 reutilizada, Decisión 1; sync inicial con el
     valor del input `[data-search-bar] input`), `readIndex` (JSON.parse con
     guarda null). Cero `location.reload`/`fetch` (Decisión 5: sin recarga ni
     servidor). Excepción a "estático por defecto" documentada en el header
     (REQ-05-07, Decisión 4, precedentes 24/43/44 + features 3/4; CustomEvent
     + DOM nativos, sin frameworks).
   - `src/components/search-live/search-live.astro` (17 líneas): importa
     `search-results.css` (hoja canónica feature 3) + `search-live.css`;
     `<section class="search-live" data-search-live aria-label="Resultados en
     vivo" hidden>` (modo landing por defecto, REQ-05-01); empty state con el
     mensaje EXACTO de la vista dedicada `No se encontraron resultados para
     '<span data-search-term></span>'` y **sin** `data-search-clear` (Decisión
     3: el X de la barra y Escape de la feature 6 cubren la limpieza —
     REQ-05-05); grid `data-search-grid`; enlace `data-search-all` "Ver todos
     los resultados" (REQ-05-06); `<script>` que **solo importa y arranca**
     `initSearchLive` (regla 8). Sin `<style>` ni atributos style (ok 19).
   - `src/styles/search-live.css` (31 líneas): solo tokens existentes — los 10
     de la tabla de design.md + `--container-max` (precedente de
     `search-results.css`/`latest-articles.css`; verificado en tokens.css
     línea 73); cero hex/rgba (audit ✔ y ok 17); `[hidden]` fuerza
     `display:none` sobre `.search-live` y `.home__landing` (la transición
     funciona aunque las secciones tengan display propios); media query 768px
     móvil-primero al final (conventions.md).
6. Build verificado en `dist/client/index.html` (generado por `./init.sh` →
     `pnpm build`): contiene `data-landing-sections`, `<section
     class="search-live" data-search-live ... hidden>`, el empty state y
     "Ver todos los resultados"; el bloque `id="search-index"` **JSON.parse OK
     con 2 entradas** y **sin `</script` crudo** dentro (el escape `<\/script`
     está en el fuente; con el catálogo actual no hay ocurrencias que escapar
     — coincide con el informe). El bundle
     `_astro/search-live.astro_astro_type_script_index_0_lang.LUxzhH2D.js`
     contiene `addEventListener`, acceso a `detail?.term`,
     `toggleAttribute('hidden')`, pageSize 6, `/search?q=`,
     `data-search-live` y `data-landing-sections`; el literal `search:change`
     vive en el bundle del módulo de la barra (`search-bar.BC3fty3d.js`), que
     el controlador importa como función `e()` — wiring real del evento
     verificado en el build.
7. `git diff --name-only -- package.json pnpm-lock.yaml docs/dependencies.md`
   → vacío: **sin dependencias externas nuevas** (regla 2). `git status`
   confirma que los únicos archivos modificados de código previo son los ya
   revisados/aprobados del ciclo (Layout.astro de la feature 4, fixture del
   test del hero de la feature 1, la línea en blanco preexistente de
   hero-card.css) más `index.astro` (esta feature) y los artefactos de
   bitácora.
8. Grep sobre los archivos de la feature: sin `console.`, `print(`, `TODO` ni
   `FIXME` (una coincidencia de Select-String en search-live.astro:11 resultó
   ser un falso positivo case-insensitive de mi patrón sobre "Ver **todo**s";
   verificado carácter a carácter, no hay debug ni TODOs).
9. API suficiente para la feature 6 (Escape): el controlador alterna los
   mismos selectores `data-*` (`[data-search-live]`, `[data-landing-sections]`,
   `[data-search-grid]`, `[data-search-empty]`, `[data-search-term]`,
   `[data-search-all]`) y la barra expone `clearQuery`/`activeQuery`/
   `changeEventName` (features 4/5 probadas) — la feature 6 podrá reutilizar
   ambos contratos sin cambios.

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 5) | REQ | Test | Estado |
|---|---|---|---|
| La portada escucha el evento de cambio de consulta de la barra | REQ-05-01, 05-02, 05-03 | ok 3 (addEventListener + changeEventName() + detail en el controlador; index.astro con data-landing-sections + `<SearchLive/>`), ok 2/ok 8 (wiring applyLive) | ✔ |
| Función de estado del layout: consulta no vacía → results; vacía → landing | REQ-05-01, 05-02, 05-03 | ok 1 (layoutMode con ''/espacios/'a'/' agilismo '), ok 2 (wiring hidden panel/secciones) | ✔ |
| Panel reutiliza el componente de resultados de la vista dedicada y muestra el empty state con el término | REQ-05-04, 05-05 | ok 6 (imports cardHtml + search-results.css + clases __empty/__grid), ok 7 (mensaje exacto sin data-search-clear, Decisión 3), ok 8 (wiring término actual) | ✔ |
| Con más coincidencias que el tamaño de página: primeros PAGE_SIZE con enlace a la vista dedicada | REQ-05-06 | ok 9 (livePage: 3/6/9 coincidencias, showAllLink solo si sobran, orden por fecha), ok 10 (seeAllUrl), ok 11 (wiring href + hidden), ok 12 (inspección data-search-all + /search?) | ✔ |
| Controlador .ts de cliente, excepción a estático por defecto documentada | REQ-05-07 | ok 13 (excepción documentada + CustomEvent + sin frameworks/router), ok 14 (script importa y arranca) | ✔ |
| (Restricciones del arnés) | — | ok 15 (panel empieza hidden, REQ-05-01), ok 16 (≤100 líneas: 35/17/99/31), ok 17 (solo tokens existentes sin hex/rgba), ok 18 ([hidden] en hoja), ok 19 (sin <style>/inline), ok 20 (server:defer de HTB, REQ-22-01) | ✔ |

## Conformidad con architecture.md / conventions.md

- **Capas** (regla 1): componente en `src/components/search-live/` (carpeta
  propia por componente), hoja en `src/styles/`, lógica en módulo `.ts` del
  componente, integrado en `src/pages/index.astro` (una URL por página,
  regla 10) sobre el layout único (regla 11). ✔
- **Lógica separada de la UI** (regla 8): el frontmatter de `index.astro` solo
  importa y serializa el dato (mismo patrón que `search.astro`, feature 3
  aprobada); el `<script>` del `.astro` solo importa y arranca; todo el
  comportamiento (estado, alternancia, render, enlace) está en
  `search-live.ts` con funciones puras exportadas. ✔
- **Estilos separados** (regla 7): sin `<style>` ni atributos style en ningún
  `.astro` (ok 19); la hoja la importa el componente. ✔
- **Tokens** (regla 6): solo custom properties existentes de tokens.css, los
  10 de la tabla de design.md + `--container-max` (precedente de
  `search-results.css`); sin tokens nuevos; cero hex/rgba (audit ✔, ok 17). ✔
- **≤100 líneas** (regla 12): index.astro 35, search-live.astro 17,
  search-live.ts 99, search-live.css 31 — verificadas por el ok 16 y por mí.
  El test (380 líneas) sigue el precedente del arnés para tests de inspección
  (search-dedicated-view 352, search-bar-header 340): la regla aplica a
  `src/`. ✔
- **Sin dependencias externas** (regla 2): package.json/lock y
  `docs/dependencies.md` sin cambios. ✔
- **JS de runtime justificado** (regla 9): el live search y la transición
  dinámica son interacción en tiempo real → excepción explícita documentada
  en design.md Decisión 4 y en el header del controlador (precedentes
  24/43/44 + features 3/4), REQ-05-07; sin frameworks ni dependencias
  (CustomEvent + DOM nativos). ✔
- **Nombres** (conventions): `.astro` PascalCase (`SearchLive`),
  `.css`/carpetas kebab-case (`search-live`, `search-live.css`), funciones
  camelCase verbo-primero (`layoutMode`, `livePage`, `seeAllUrl`,
  `applyLive`, `initSearchLive`), BEM ligero (`search-live__all` reutilizando
  `search-results__*` de la feature 3), UI en español (aria-label "Resultados
  en vivo", "Ver todos los resultados", mensaje del empty state). ✔
- **Inmutabilidad** (regla 4): `const` por defecto; `LivePage` con campos
  `readonly`; las únicas mutaciones son de DOM (atributos hidden, innerHTML,
  textContent, href). ✔
- **Errores explícitos** (regla 3): `readIndex` devuelve `null` ante JSON
  inválido y `initSearchLive` aborta con guardas de null (raíz/panel/índice
  ausentes → no-op), coherente con el wiring opcional de la feature 3 y con
  un panel que empieza `hidden`; sin fallos que deban lanzar. ✔
- **No rompe features previas**: suite 340/340 con htb-stadistics (REQ-22-01
  server:defer intacto — ok 20), hero, latest-articles, search-dedicated-view,
  search-bar-header y search-domain intactos sin ajustes; build de producción
  ✔ con índice válido en dist. ✔
- **REQ-05-04 presentación idéntica**: el panel importa la hoja canónica
  `search-results.css`, usa los bloques `search-results__empty`/
  `search-results__grid` y pinta con la misma `cardHtml` de la feature 3 → la
  presentación en vivo es la misma que en `/search` (Decisión 2). El único
  añadido visual es el enlace "Ver todos los resultados" (`search-live__all`),
  propio del modo en vivo (REQ-05-06). ✔

## Checkpoints

- C1 (Arquitectura): [x] — estilos en `src/styles/*.css` sin `<style>` en
  `.astro`, lógica en `.ts` separado (funciones puras), solo tokens
  existentes, ≤100 líneas en src/, sin dependencias nuevas, capas y layout
  único conservados.
- C2 (Datos): [x] — `src/data/*.json`, entidades, repositorios y dominio
  `src/domain/search/` intactos; el índice embebido lo construye el dominio
  (buildSearchIndex) vía repositorio, sin lecturas directas de JSON. Los
  repositorios y el dominio mantienen sus errores nombrados.
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (tests 100%, formato ✔, build ✔, índice y panel
  verificados en dist/client/index.html). La inspección visual
  desktop/móvil queda [ ] como en el histórico: el arnés no tiene navegador
  (pendiente del humano). Nota: mi primera ejecución de `pnpm test` dio
  339/340 una única vez, no reproducida en 13 corridas consecutivas ni en
  `./init.sh` (documentado arriba; sin impacto en el veredicto).
- C4 (Harness, tarea en `done`): [ ] — feature 5 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en features 1-4). Ninguna otra feature a medias
  (1-4 `done`; 6 `pending`).
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo/verde, decisiones, conteos, build); `progress/history.md` al
  día (cierres de las features 1-4 ya movidos; el cierre de la 5 se moverá al
  cerrar); sin archivos temporales, `print()` de debug ni TODOs sin contexto
  (grep ✔; el único hit era un falso positivo case-insensitive sobre
  "todos").

## Cambios requeridos

Ninguno.

Observación no bloqueante (sin acción requerida): el fallo 339/340 aislado de
mi primera ejecución de la suite no se reprodujo en 13 corridas consecutivas
ni en los tests internos de `./init.sh`; si reapareciera en el futuro, el
próximo ciclo deberá capturar el test afectado (`not ok`) antes de cerrar.