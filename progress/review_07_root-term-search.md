# Review — feature 7 `root-term-search`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/07_root-term-search/`
(REQ-07-01..11 + design.md Decisiones 1-6). Análisis:
`progress/research/arquitectura-404-route.md`. Backlog: entrada id 7 de
`feature_list.json` (acceptance ×7). Informe del implementer:
`progress/impl_07_root-term-search.md`.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_07_root-term-search.md` y en
`progress/current.md`:

- **Rojo capturado antes de implementar**: `node --test
  tests/root-term-search.test.mjs` → exit 1, `ERR_MODULE_NOT_FOUND` hacia
  `src\components\search-results\term-route.ts` (módulos inexistentes; el
  test se escribió primero contra la spec), 0 pass / 1 fail. El informe
  reproduce el error completo de Node y documenta además un fallo intermedio
  de wiring (`window is not defined` al invocar el handler de limpiar tras
  retirar los globals de node:test) resuelto con `fireClear()`/`cleanup()`
  antes del verde — señal de TDD real.
- **Verde después de implementar**: test de la feature 21/21 pass, suite
  completa 381/381 pass (360 previos + 21 nuevos), `check-format` ✔,
  `audit-design-tokens` ✔ y `./init.sh` "El entorno está perfecto" — los
  cuatro re-ejecutados por mí abajo.

La feature no salta dependencias: `depends_on: []` en `feature_list.json`
(entrada id 7); features 1-6 `done` y 8 `pending` con `depends_on: [7]`
(verificado en el mismo archivo) — sin dependencias pendientes saltadas.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/root-term-search.test.mjs` → exit 0,
   **# tests 21 / # pass 21 / # fail 0** (TAP). Los 21 subtests cubren
   REQ-07-01..11: [...term].astro on-demand sin getStaticPaths (ok 1),
   PostsRepository + getCollection + buildSearchIndex (ok 2), índice
   embebido con `type="application/json"` + `is:inline` + `set:html` + escape
   `<\/script` (ok 3), título con término vía Astro.params (ok 4), Layout +
   SearchResults sin `<style>` (ok 5), archivos de rutas estáticas existentes
   (ok 6), termFromPathname: extracción simple, decode %20/UTF-8,
   multi-segmento, degradación ante encoding malformado, '/search' → '' para
   la guía de REQ-03-03 (ok 7-11), clearDestination raíz/no-op (ok 12),
   wiring: resultados prefiltrados al cargar /<término> con tarjetas →
   /posts/[id] y título (ok 13), empty state con el término (ok 14), limpiar
   → assign('/') sin replaceState (ok 15), /search sin q → guía (ok 16),
   /search?q= lee q y limpiar conserva la vista (ok 17), inspección del
   controlador: q gana sobre pathname, wireClear distingue origen, conserva
   removeQueryParam (ok 18-20), ≤100 líneas en página/controlador/módulo
   (ok 21).
2. `bash -c "pnpm test"` → **# tests 381 / # pass 381 / # fail 0**. Los
   tests de features previas del ciclo están intactos y verdes en la misma
   corrida: search-dedicated-view (ok 273-297), search-keyboard-escape
   (ok 315-334), search-landing-live-transition (ok 335-353) y
   search-bar-header (ok 253-272) — los cambios del controlador son
   aditivos y su API pública no cambió.
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
   `node scripts/audit-design-tokens.mjs` → exit 0:
   `AUDIT ✔ ningún color fuera de tokens.css en src/styles` (sin CSS nuevo).
4. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests 100% ✔, build ✔ →
   **"✔ El entorno está perfecto. Podemos empezar a trabajar."**
5. Inspección directa de los archivos de la feature:
   - `src/pages/[...term].astro` (31 líneas): catch-all en la raíz
     (REQ-07-01) con `export const prerender = false` (REQ-07-02, on-demand;
     `astro.config.mjs` confirma `output: 'server'` + adapter cloudflare con
     `prerenderEnvironment: 'workerd'`, precedente HTB stats). **Sin
     getStaticPaths** (términos arbitrarios no enumerables). Frontmatter
     idéntico al patrón de search.astro (design.md D3): PostsRepository +
     getCollection('architecture') + buildSearchIndex (REQ-07-05), índice
     serializado con `JSON.stringify(...).replace(/<\/script/gi,
     '<\\/script')` y `set:html` en script `is:inline` (escape `<\/script`
     idéntico byte a byte a search.astro — verificado). El servidor nunca
     filtra: `termFromPathname(\`/${Astro.params.term ?? ''}\`)` alimenta el
     título `<Layout title={\`Búsqueda: ${term}\`}>` con la MISMA
     normalización que el cliente (REQ-07-07). `<SearchResults />` +
     Layout.astro (REQ-07-08). Sin `<style>`, sin CSS ni tokens nuevos.
   - `src/components/search-results/term-route.ts` (33 líneas): funciones
     puras sin document/window en ámbito de módulo (regla 8).
     `termFromPathname` (REQ-07-03): decodeURIComponentSafe (degradación
     ante URIError: '/%E0%A4%A' → crudo, nunca rompe), slashes
     iniciales/finales quitados, multi-segmento slashes → espacios
     ('/foo/bar' → 'foo bar'), '/search' → '' protege la guía de REQ-03-03.
     `clearDestination` (REQ-07-10): '/' en /<término>, no-op en /search.
   - `src/components/search-results/search-results-controller.ts` (100
     líneas): API pública intacta — `queryTerm`, `removeQueryParam`,
     `pageLabel`, `cardHtml` sin cambios de firma (importadas sin cambios
     por search-dedicated-view.test.mjs, search-live.ts y search-escape.ts,
     confirmado por la suite 381/381). `initSearchResults`:
     `const q = queryTerm(window.location.search)` y
     `const term = q !== '' ? q : termFromPathname(window.location.pathname)`
     — **q gana cuando existe** (REQ-07-11) y el pathname solo se usa si q
     está ausente/vacío (REQ-07-03). `wireClear(baseTitle, fromQuery)`:
     fromQuery=true conserva REQ-03-08 (removeQueryParam + replaceState,
     título base, guía visible); fromQuery=false
     `window.location.assign(clearDestination(...))` → raíz (REQ-07-10).
   - `src/pages/search.astro`: **sin cambios** (REQ-07-11) — sigue
     `prerender = true`, título "Búsqueda", mismo índice embebido; no
     importa term-route.ts ni termFromPathname. El componente
     `search-results.astro` también intacto (guide/empty/grid/pagination y
     botón `data-search-clear`, contrato `data-search-*` compartido).
6. Build on-demand verificado en `dist/`: **NO existe**
   `dist/client/arquitectura` (la ruta la sirve el worker on-demand;
   `dist/server` existe) mientras `dist/client/search` y `dist/client/about`
   SÍ existen como HTML estático — las rutas estáticas no son capturadas por
   el catch-all (REQ-07-09, prioridad de rutas de Astro confirmada además
   por el research §2 con la doc oficial).
7. `git diff --name-only -- package.json pnpm-lock.yaml docs/dependencies.md`
   → vacío: **sin dependencias externas nuevas** (regla 2). `git diff`
   sobre los archivos trackeados confirma que la feature 7 no tocó
   `Layout.astro` (sus modificaciones son de las features 4/6: SearchBar +
   SearchEscape), `index.astro` (feature 5) ni `hero-card.css`/fixture
   (feature 1) — cambios aditivos sin efectos colaterales.
8. Grep sobre página, term-route.ts y controlador: sin `console.`, `print(`,
   `TODO`, `FIXME` ni `debugger`. Sin `<style>` ni atributos style. Sin
   archivos temporales en la raíz (`.log`/`.tmp`/`*~`: ninguno).
9. Trazado REQ→comportamiento verificado en código y tests:
   REQ-07-01/02 → [...term].astro + prerender=false + sin getStaticPaths,
   ok 1; REQ-07-03 → termFromPathname + wiring init prefiltrado, ok 7-11/13;
   REQ-07-04 → empty state con término, ok 14; REQ-07-05 → PostsRepository +
   dominio + escape `<\/script`, ok 2-3; REQ-07-06 → cardHtml href
   /posts/[id], ok 13; REQ-07-07 → título Layout + document.title, ok 4/13;
   REQ-07-08 → Layout + SearchResults, ok 5; REQ-07-09 → archivos estáticos
   intactos + build sin captura, ok 6; REQ-07-10 → clearDestination +
   assign('/'), ok 12/15/19; REQ-07-11 → search.astro intacto + q gana +
   REQ-03-08 conservado, ok 17/20.

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 7) | REQ | Test | Estado |
|---|---|---|---|
| [...term].astro sirve /<término> sin declarar prerender, término arbitrario y no enumerable | REQ-07-01, 07-02 | ok 1 (prerender=false, sin getStaticPaths; archivo en la raíz leído por mí, 31 líneas) | ✔ |
| La página obtiene artículos con PostsRepository y el índice del dominio | REQ-07-05 | ok 2 (PostsRepository + getCollection + buildSearchIndex) + ok 3 (índice embebido con escape `<\/script`) | ✔ |
| El controlador deriva el término del pathname y presenta resultados prefiltrados al cargar (deep linking) | REQ-07-03 | ok 7-11 (termFromPathname pura: decode, multi-segmento, degradación, /search → '') + ok 13 (wiring: grid pintado al init con /arquitectura, guía oculta) + ok 18 (inspección: q gana, pathname como fallback) | ✔ |
| Término sin coincidencias → empty state con el término, no 404 | REQ-07-04 | ok 14 (wiring: data-search-term = 'zzz-no-existe', empty visible, 0 tarjetas) | ✔ |
| Título con el término, reutiliza Layout.astro y la presentación de /search; tarjetas → /posts/[id] | REQ-07-06, 07-07, 07-08 | ok 4 (título con term), ok 5 (Layout + SearchResults, sin `<style>`), ok 13 (href="/posts/00-agilismo") | ✔ |
| Rutas estáticas /, /about, /search y /posts/[id] no capturadas por el catch-all | REQ-07-09 | ok 6 (los 4 archivos existen) + build (dist/client/search y about estáticos, sin dist/client/arquitectura) + prioridad de rutas de Astro (research §2) | ✔ |
| Limpiar en /<término> navega a la raíz; /search?q= queda sin cambios | REQ-07-10, 07-11 | ok 12/15/19 (clearDestination '/' + assign sin replaceState) + ok 16/17/20 (q leído, REQ-03-08 conservado, search.astro intacto por inspección) | ✔ |

## Conformidad con architecture.md / conventions.md

- **Capas** (regla 1): página en `src/pages/`, módulo puro en
  `src/components/search-results/` (junto al controlador que extiende),
  datos vía `PostsRepository` + dominio `src/domain/search/` — jamás JSON
  directo desde el componente (restricción del design). ✔
- **Lógica separada de la UI** (regla 8): el frontmatter de [...term].astro
  replica el patrón aprobado de search.astro (carga de datos de página) y la
  extracción del término vive en `term-route.ts` (funciones puras, sin
  document/window en ámbito de módulo — ejecutable en SSR y en node:test por
  import directo). ✔
- **Estilos separados** (regla 7): sin `<style>` ni CSS nuevo; reutiliza
  `search-results.css` y sus tokens existentes (design.md tabla) — audit de
  tokens ✔. ✔
- **≤100 líneas** (regla 12): [...term].astro 31, term-route.ts 33,
  search-results-controller.ts 100 (el límite es "no superar 100"; 100 es
  conforme) — verificadas por ok 21 y por mí. El test (394 líneas) sigue el
  precedente del arnés para tests de inspección (search-dedicated-view 352,
  search-landing-live-transition 380): la regla aplica a `src/`. ✔
- **Sin dependencias externas** (regla 2): package.json/lock y
  `docs/dependencies.md` sin cambios; sin frameworks; JS propio (patrón
  features 3/4/5). ✔
- **JS de runtime justificado** (regla 9): deep linking client-side sobre
  índice embebido (mecanismo de la feature 3), excepción documentada en el
  header del controlador y en design.md D2/D3. ✔
- **On-demand SSR sin romper "node:fs solo en build"**: getCollection en
  runtime usa el content layer empaquetado (verificado en research §2 contra
  la doc oficial de Astro); precedente HTB stats (feature 20). ✔
- **Nombres** (conventions): archivo `.astro` PascalCase (`[...term].astro`
  sigue la convención de página catch-all de Astro), funciones camelCase
  verbo-primero (`termFromPathname`, `clearDestination`), comentarios en
  español. ✔
- **Errores explícitos** (regla 3): la degradación de decodeURIComponent
  ante URIError está documentada como decisión (la página nunca rompe por la
  URL; errores explícitos siguen en el dominio de datos); wiring con guardas
  de null (clear/selectores ausentes → no-op), coherente con features 3/4/5.
  ✔
- **No rompe features previas**: suite 381/381 (una corrida completa por el
  reviewer), search.astro/search-results.astro/Layout/index/dominio sin
  cambios de esta feature (git diff + inspección); build de producción ✔;
  vista /search?q= intacta (REQ-07-11) y barra sin cambios (design.md D6). ✔

## Checkpoints

- C1 (Arquitectura): [x] — estilos en `src/styles/*.css` (sin `<style>` ni
  CSS nuevo), lógica en `.ts` puro, sin tokens nuevos, ≤100 líneas en src/
  (31/33/100), sin dependencias nuevas, capas y layout único conservados,
  datos vía repositorio.
- C2 (Datos): [x] — `src/data/*.json`, entidades, repositorios y dominio
  intactos; la página consume PostsRepository + buildSearchIndex (vía
  import, no duplicación).
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (entorno, formato, tests 100%, build ✔; build
  on-demand verificado: sin `dist/client/arquitectura`, estáticas intactas).
  La inspección visual desktop/móvil queda [ ] como en el histórico: el
  arnés no tiene navegador (pendiente del humano).
- C4 (Harness, tarea en `done`): [ ] — feature 7 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en features 1-6). Features 1-6 `done`, 8 `pending`
  (depende de 7); ninguna a medias.
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo/verde, decisiones, conteos, build); `progress/history.md` al
  día; sin `print()` de debug, TODOs ni temporales (grep ✔ y escaneo de
  `.log`/`.tmp`/`*~` sin resultados; el `test-run1.log` de la review 6 ya no
  está).

## Cambios requeridos

Ninguno.

Observación no bloqueante (sin acción requerida): `/search/foo` (2 segmentos
no estáticos) cae en el catch-all con término 'search foo' → empty state;
comportamiento documentado en research §2 y en el informe — aceptable y
nunca rompe. La barra de búsqueda sigue navegando a `/search?q=` (D6,
limitación conocida): la forma slash+arg es la URL directa compartible que
el humano pidió y ambas coexisten; si el humano quisiera Enter → `/loquesea`
sería una feature nueva que toca search-bar.ts.