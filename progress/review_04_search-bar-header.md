# Review — feature 4 `search-bar-header`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/04_search-bar-header/`
(REQ-04-01..08, design.md Decisiones 1-5). Backlog: entrada id 4 de
`feature_list.json`. Análisis de diseño:
`progress/research/global-search-landing.md` (D7/D8). Informe del
implementer: `progress/impl_04_search-bar-header.md`.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_04_search-bar-header.md` y
`progress/current.md` (sección "Evolución (implementer, 2026-08-18, feature 4
search-bar-header)"):

- **Rojo capturado antes de implementar**: `node --test
  tests/search-bar-header.test.mjs` → exit 1, `ERR_MODULE_NOT_FOUND` hacia
  `src/components/search-bar/search-bar.ts` (archivos inexistentes; el test
  se escribió primero contra la spec), 0 pass / 1 fail. El informe reproduce
  el error completo de Node.
- **Verde después de implementar**: test de la feature 20/20 pass, suite
  completa 320/320 pass (300 previos + 20 nuevos), `check-format` ✔,
  `audit-design-tokens` ✔ y `./init.sh` "El entorno está perfecto" — los
  cuatro re-ejecutados por mí abajo.

La feature no salta dependencias: `depends_on: [2]` en `feature_list.json`
(entrada id 4) y la feature 2 `search-domain` está `done` (verificado en el
mismo archivo; features 1 y 3 también `done`, ninguna a medias) —
dependencia satisfecha.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/search-bar-header.test.mjs` → exit 0, **# tests 20 /
   # pass 20 / # fail 0** (TAP). Los 20 subtests cubren REQ-04-01..08 y las
   restricciones del arnés: isFilled (ok 1), wiring is-filled + X vacía y
   devuelve foco (ok 2), clearQuery exportada para la feature 6 (ok 3),
   searchUrl con URLSearchParams/escaping (ok 4), submitQuery navega/no
   navega (ok 5), wiring Enter navega/omite (ok 6), activeQuery en memoria
   (ok 7), wiring search:change con detail { term } (ok 8), integración en
   el nav del layout (ok 9), aria-label del input (ok 10), aria-label del
   botón X (ok 11), componente importa hoja y arranca el control (ok 12),
   navigate de astro:transitions/client (ok 13), CustomEvent search:change
   (ok 14), clearQuery vacía + foco (ok 15), CSS condiciona X a .is-filled
   (ok 16), tokens solo del set de design.md sin hex/rgba (ok 17), ≤100
   líneas (ok 18), sin `<style>`/style inline (ok 19), ClientRouter
   conservado (ok 20).
2. `bash -c "pnpm test"` → **# tests 320 / # pass 320 / # fail 0** (suite
   completa; layout-refactor REQ-08-01..06 y view-transitions REQ-24-01
   en verde sin ajustes — nada roto por la feature).
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
4. `node scripts/audit-design-tokens.mjs` → exit 0:
   `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
5. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests 100% ✔, build ✔ →
   **"✔ El entorno está perfecto. Podemos empezar a trabajar."**
6. Inspección directa de los 4 archivos de la feature:
   - `src/layouts/Layout.astro` (36 líneas): `git diff` confirma **exactamente
     2 líneas añadidas** — `import SearchBar from
     '../components/search-bar/search-bar.astro'` y `<SearchBar />` dentro
     del `<nav>` (REQ-04-01, D7). `ClientRouter` intacto (view transitions,
     REQ-24-01). Frontmatter solo imports (regla 8).
   - `src/components/search-bar/search-bar.astro` (21 líneas): div
     `data-search-bar` > input `type="text"` con
     `aria-label="Buscar artículos"` (REQ-04-01/08) + botón X
     `type="button"` con `aria-label="Limpiar búsqueda"` (Decisión 4); sin
     `<style>` ni atributos style (ok 19); `<script>` que **solo importa y
     arranca**: `initSearchBar` del control `.ts` + `navigate` de
     `astro:transitions/client` (Decisión 1 y 3; regla 8). Frontmatter solo
     imports (regla 8).
   - `src/components/search-bar/search-bar.ts` (64 líneas): **funciones
     puras sin document/window en ámbito de módulo** — `searchUrl` con
     `URLSearchParams` (trim + escaping, REQ-04-05), `isFilled`
     (REQ-04-03), `submitQuery` (navega solo si no vacía, REQ-04-05/06),
     `changeEventName` ('search:change'), `activeQuery` (consulta activa en
     memoria, REQ-04-02), `emitChange` (CustomEvent `search:change` con
     `detail: { term }` en el documento, REQ-04-07), `clearQuery` (vacía el
     input, sincroniza `is-filled` y devuelve el foco, REQ-04-04; exportada
     para la feature 6). `initSearchBar(navigate, root?)` con DOM inyectado:
     input → sync (clase + evento), keydown Enter → submitQuery, click X →
     clearQuery. La única referencia a `document` es el default del
     parámetro `root` (evaluado en llamada, no en módulo) — testeable con
     node:test.
   - `src/styles/search-bar.css` (75 líneas): solo los 10 tokens de la tabla
     de design.md (`--color-navbar`, `--color-surface`, `--color-border`,
     `--color-border-strong`, `--color-text`, `--color-text-secondary`,
     `--color-accent`, `--radius-pill`, `--transition-default`,
     `--font-sans`); cero hex/rgba sueltos (audit ✔ y ok 17). Botón X oculto
     con `visibility: hidden; opacity: 0; pointer-events: none` (fuera del
     orden de tabulación cuando no aplica) y visible solo con
     `.search-bar.is-filled` (REQ-04-03, Decisión 2); hover con
     `--color-accent`; media query 768px móvil-primero al final
     (conventions.md): el nav hace wrap y la barra ocupa el ancho completo.
7. Build verificado en `dist/client/` (tras `./init.sh`, que ejecuta
   `pnpm build`): la barra aparece en el header de **TODAS** las páginas —
   `index.html`, `about/index.html`, `search/index.html`,
   `posts/00-agilismo/index.html` y `posts/01-diseño-detallado/index.html` —
   con `<input class="search-bar__input" type="text"
   placeholder="Buscar artículos…" aria-label="Buscar artículos">` y
   `<button type="button" class="search-bar__clear" data-search-clear
   aria-label="Limpiar búsqueda">×</button>`. El bundle
   `search-bar.astro_astro_type_script_index_0_lang.yIIwUhZG.js` contiene el
   control completo (`search:change`, `URLSearchParams`, `is-filled`,
   `CustomEvent`, `focus`) y `import{t as e}from"./client.BssYJ-wI.js"` =
   `navigate` del bundle del ClientRouter. Las 5 páginas conservan
   `<meta name="astro-view-transitions-enabled" content="true">` — la
   integración no rompe view transitions.
8. `git diff --name-only -- package.json pnpm-lock.yaml docs/dependencies.md`
   → vacío: **sin dependencias externas nuevas** (regla 2). `git status`
   confirma que el diff de `Layout.astro` es el único cambio en archivos
   previos (junto con los artefactos del ciclo ya revisados: fixture del
   test del hero y la línea en blanco preexistente de hero-card.css,
   documentada).
9. Grep sobre `src/`: sin `console.`, `print(`, `TODO` ni `FIXME` (0
   coincidencias en el código de la feature y del layout).
10. API suficiente para la feature 6 (Escape): `clearQuery(root)`,
    `activeQuery()` y `changeEventName()` exportadas y probadas (ok 3, ok
    7, ok 15) — design.md Decisión 4 cumplida. Para la feature 5: el evento
    `search:change` se despacha en `document` con `detail.term`, escuchable
    por la portada; el contrato está listo.

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 4) | REQ | Test | Estado |
|---|---|---|---|
| Layout.astro incluye la barra con un input que declara aria-label | REQ-04-01, REQ-04-08 | ok 9 (import + `<SearchBar />` en el nav), ok 10 (input type="text" + aria-label) | ✔ |
| Botón X solo con consulta no vacía; al activarlo vacía y devuelve el foco | REQ-04-03, REQ-04-04 | ok 1 (isFilled), ok 2 (wiring is-filled + X vacía + focus), ok 3 (clearQuery exportada), ok 15 (regex clearQuery), ok 16 (CSS `.is-filled`) | ✔ |
| Enter con consulta no vacía navega a /search?q=; vacía no navega | REQ-04-05, REQ-04-06 | ok 4 (searchUrl URLSearchParams + escaping), ok 5 (submitQuery), ok 6 (wiring Enter/otra tecla), ok 13 (navigate de astro:transitions/client) | ✔ |
| El control emite el evento de cambio de consulta para la portada | REQ-04-07 | ok 7 (activeQuery/changeEventName), ok 8 (wiring search:change con detail { term }), ok 14 (CustomEvent + dispatchEvent + detail) | ✔ |
| (Restricciones del arnés) | — | ok 11 (aria-label botón X, Decisión 4), ok 12 (Decisión 1: hoja + arranque), ok 17 (solo tokens de design.md), ok 18 (≤100 líneas: 36/21/64/75), ok 19 (sin `<style>`/inline), ok 20 (ClientRouter conservado) | ✔ |

## Conformidad con architecture.md / conventions.md

- **Capas** (regla 1): componente en `src/components/search-bar/` (carpeta
  propia por componente, precedente `new-hero/`), hoja en `src/styles/`,
  lógica en módulo `.ts` del componente, integrado en el layout único
  (regla 11) vía su `<nav>`. ✔
- **Lógica separada de la UI** (regla 8): el frontmatter del `.astro` solo
  importa la hoja; el `<script>` solo importa y arranca; todo el
  comportamiento (estado, eventos, navegación, limpieza) está en
  `search-bar.ts` con funciones puras exportadas. ✔
- **Estilos separados** (regla 7): sin `<style>` ni atributos style en el
  `.astro` (ok 19); la hoja la importa el componente. ✔
- **Tokens** (regla 6): solo custom properties existentes de tokens.css,
  exactamente los 10 de la tabla de design.md; sin tokens nuevos; cero
  hex/rgba (audit ✔, ok 17). Nota no bloqueante: la media query de
  `search-bar.css` toca `.site-navbar nav` (flex-wrap en móvil) — es el
  ajuste de integración necesario para que la barra entre en el navbar
  compartido en ≤768px, dentro de la hoja del componente, con tokens y
  móvil-primero; no viola ninguna regla explícita y no rompe el layout
  (REQ-08 verdes, build ✔). ✔
- **≤100 líneas** (regla 12): Layout.astro 36, search-bar.astro 21,
  search-bar.ts 64, search-bar.css 75 — verificadas por el ok 18 y por mí.
  El test (340 líneas) sigue el precedente del arnés para tests de
  inspección (search-dedicated-view 352, search-domain 248): la regla
  aplica a `src/`. ✔
- **Sin dependencias externas** (regla 2): package.json/lock y
  `docs/dependencies.md` sin cambios. ✔
- **JS de runtime justificado** (regla 9): la interacción del input (X,
  Enter, eventos) es excepción explícita documentada en design.md Decisión
  5 (precedentes 24/43/44), sin frameworks ni dependencias; el mecanismo de
  navegación es el `navigate` del framework del sitio (view transitions,
  feature 24). ✔
- **Nombres** (conventions): `.astro` PascalCase, `.css`/carpetas
  kebab-case (`search-bar`), funciones camelCase verbo-primero
  (`searchUrl`, `submitQuery`, `clearQuery`), clase CSS BEM ligero
  (`search-bar__input`, `search-bar__clear`), UI en español (placeholder,
  aria-labels). ✔
- **Inmutabilidad** (regla 4): `const` por defecto; la única mutación de
  estado es `active` (necesaria, dentro del control, con setter único
  `emitChange`); el resto son mutaciones de DOM (clase, value, focus). ✔
- **Errores explícitos** (regla 3): el control usa guardas de null en
  `initSearchBar`/`clearQuery` (raíz/input ausentes → no-op silencioso),
  coherente con un wiring opcional de UI; sin fallos que deban lanzar. ✔
- **No rompe features previas**: suite 320/320 con layout-refactor
  (REQ-08), view-transitions (REQ-24), hero, posts, search-dedicated-view y
  search-domain intactos sin ajustes; build de producción ✔ con
  `astro-view-transitions-enabled` en todas las páginas. ✔

## Checkpoints

- C1 (Arquitectura): [x] — estilos en `src/styles/*.css` sin `<style>` en
  `.astro`, lógica en `.ts` separado (funciones puras), solo tokens
  existentes, ≤100 líneas en src/, sin dependencias nuevas, layout único
  conservado.
- C2 (Datos): [x] — `src/data/*.json`, entidades, repositorios y dominio
  `src/domain/search/` intactos; la barra no lee datos (navega a la vista
  que los consume).
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (320/320, formato ✔, build ✔, barra verificada
  en las 5 páginas de dist). La inspección visual desktop/móvil queda [ ]
  como en el histórico: el arnés no tiene navegador (pendiente del humano).
- C4 (Harness, tarea en `done`): [ ] — feature 4 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en features 1-3). Ninguna otra feature a medias
  (1-3 `done`; 5 y 6 `pending`).
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo/verde, decisiones, conteos); `progress/history.md` al día
  (cierres de las features 1-3 del ciclo de búsqueda global ya movidos; el
  cierre de la 4 se moverá al cerrar); sin archivos temporales, `print()`
  de debug ni TODOs sin contexto (grep ✔).

## Cambios requeridos

Ninguno.