# Review — feature 9 `search-results-list-mode`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/09_search-results-list-mode/`
(REQ-09-01..12 + design.md Decisiones 1-5, token nuevo `--radius-thumb`).
Backlog: entrada id 9 de `feature_list.json` (acceptance ×8). Análisis:
`progress/research/search-results-list-mode.md`. Informe del implementer:
`progress/impl_09_search-results-list-mode.md`.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_09_search-results-list-mode.md`
(§2 y §8) y en `progress/current.md` (bitácora 2026-08-18, líneas 21-24):

- **Rojo capturado antes de implementar**: `tests/search-results-list-mode.test.mjs`
  (14 tests) se escribió primero contra la spec 09; `node --test` → **0/14** con
  `ERR_MODULE_NOT_FOUND: Cannot find module '...item-html.ts'` (el generador no
  existía aún). Los tests ajustados de features 3/5/6/7 → **7 fallos (55/62)**:
  wiring de `[data-search-grid]`→`[data-search-list]` (REQ-07-03/11, REQ-06-02,
  REQ-05-01/02/03/04/05) y `search-dedicated-view` sin cargar por el import
  inexistente. El rojo falla exactamente en lo que la feature debe cambiar —
  señal de tests reales escritos contra la spec, no contra el código.
- **Verde después de implementar**: test de la feature 14/14, suite completa
  400/400 (386 previos + 14 nuevos), `check-format` ✔, `audit-design-tokens` ✔
  y `./init.sh` "El entorno está perfecto" — los cuatro re-ejecutados por mí
  abajo.

La feature no salta dependencias: `depends_on: []` en `feature_list.json`
(entrada id 9) — no hay dependencias pendientes. La migración de
`search-live.*` y `search-escape.*` es la consecuencia necesaria del rename
canónico (design D2/D5, REQ-09-10), documentada en el research §4.1.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/search-results-list-mode.test.mjs` → exit 0,
   **# tests 14 / # pass 14 / # fail 0** (TAP). Subtests: ok 1 (REQ-09-01:
   `ul[data-search-list]` sin `data-search-grid` residual), ok 2 (REQ-09-02:
   controlador importa `item-html.ts`/`itemHtml`, pinta y togglea `list`),
   ok 3 (REQ-09-03/04: `li.search-results__item` con `href="/posts/00-agilismo"`
   y `img.search-results__thumb src="/assets/content/arch00.jpg"`), ok 4
   (REQ-09-05: meta "Por Moises Baldenegro Melendez • 15 min de lectura" y
   `#arquitectura`/`#agilismo` después del título por posición), ok 5 (escape
   `&lt;b&gt;`/`&amp;`), ok 6 (REQ-09-06/07: `.search-results__item:hover`
   `background: var(--color-surface)` + `.search-results__link:hover`
   `text-decoration: underline`), ok 7 (REQ-09-08: `border-bottom: 1px solid
   var(--color-border)` + `:last-child` sin borde), ok 8 (REQ-09-09: media
   query ≤768px con `display: none` del thumb y `padding: 12px 6px`), ok 9
   (REQ-09-10: `search-live.ts` importa `item-html.ts`/`itemHtml` y pinta en
   `[data-search-list]`; `search-live.astro` declara `ul[data-search-list]` y
   la hoja canónica), ok 10 (REQ-09-11: guía + empty "No se encontraron
   resultados para" + `Limpiar búsqueda`), ok 11 (REQ-09-12: paginación nav
   con botones sin `<a data-search-prev|next>`, sin `location.reload|.submit`,
   usa `searchIndex` del dominio, items enlazan `/posts/[id]`), ok 12-14
   (restricciones: item-html.ts ≤100 líneas, search-results.css solo tokens
   permitidos sin hex/rgba, `--radius-thumb: 10px` en tokens.css).
2. `bash -c "pnpm test"` → **# tests 400 / # pass 400 / # fail 0** (0 fail).
   Los tests ajustados de features previas están verdes en la misma corrida:
   `search-dedicated-view` (REQ-03-04/09 con `itemHtml`/`data-search-list`),
   `search-landing-live-transition` (REQ-05-04 con `item-html.ts`),
   `root-term-search` (REQ-07-03/06/11), `search-keyboard-escape`
   (REQ-06-02 con `list`), y los 5 que fijan tokens.css en 91 líneas
   (REQ-17-09 ok, REQ-26-07 ok, REQ-39-09 ok, REQ-40-11 ok, REQ-42-09 ok) —
   ninguno roto por el cambio de presentación.
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
   `node scripts/audit-design-tokens.mjs` → exit 0:
   `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
4. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests 100% ✔, build de
   producción ✔ → **"✔ El entorno está perfecto. Podemos empezar a
   trabajar."**
5. Inspección directa del código (conteos `Get-Content` reales):
   - `src/components/search-results/item-html.ts` (**27 líneas**): `itemHtml`
     emite `li.search-results__item` → `img.search-results__thumb` (src
     `/assets/content/<img>`, alt título, `loading="lazy"`) → `div
     .search-results__body` → `a.search-results__link[href="/posts/<id>"]` con
     `h2.search-results__title` (REQ-09-03/04) → `p.search-results__meta`
     "Por <autor> • <N> min de lectura" → `p.search-results__description` →
     `div.search-results__tags` con `span.search-results__tag` (REQ-09-05);
     `esc` escapa `& < > "` (comportamiento del antiguo `cardHtml` conservado).
   - `search-results-controller.ts` (**84 líneas**, antes 100): importa
     `itemHtml` de `./item-html.ts`; `renderSearch` pinta en
     `[data-search-list]` con `toggle('list')`; `wireClear` alterna `list`;
     `queryTerm`/`removeQueryParam`/`pageLabel`/`readIndex`/`toggle` intactos
     (REQ-09-02, D3/D5).
   - `search-results.astro` (**28 líneas**): `ul.search-results__list
     [data-search-list hidden]` (REQ-09-01); guía `[data-search-guide]`,
     empty `[data-search-empty]` con `Limpiar búsqueda` y paginación
     `[data-search-pagination]` conservadas (REQ-09-11/12); sin `<style>`,
     frontmatter solo importa la hoja.
   - `src/styles/search-results.css` (**62 líneas**): `.search-results__list`
     (list-style none, flex column), `__item` (position relative, flex,
     gap `--gap-card`, padding 16px 12px, `border-bottom: 1px solid
     var(--color-border)`, `:last-child` sin borde, hover
     `background: var(--color-surface)` con radio `--radius-card`),
     `__thumb` (112px, aspect-ratio 16/9, `--radius-thumb`, borde
     `--color-border`), `__link::after` con `inset: 0` (stretched link sobre
     el item relative) + hover underline, `__description` clamp 2 líneas,
     `__tag` píldoras (`--radius-pill`, `--color-accent`), media query
     `max-width: 768px` (thumb `display: none`, item `12px 6px`, título 1rem).
     Cero hex/rgba: todas las declaraciones usan `var(--token)` (audit ✔ y
     grep visual ✔). REQ-09-06/07/08/09 ✔.
   - `src/components/search-live/search-live.ts` (**99 líneas**): importa
     `itemHtml` desde `../search-results/item-html.ts` (línea 11, antes
     `cardHtml` del controlador) y pinta en `[data-search-list]`
     (REQ-09-10, D2). `applyLive`/`livePage`/`seeAllUrl`/`layoutMode`
     intactos.
   - `search-live.astro` (**17 líneas**): `ul.search-results__list
     [data-search-list hidden]` + import de `search-results.css` (REQ-09-10).
   - `search-escape.ts` (**76 líneas**): `['empty', 'grid', 'pagination']` →
     `['empty', 'list', 'pagination']` (línea 71) — rename coherente con el
     atributo canónico (D5); resto intacto (REQ-06-01..04).
   - `src/styles/tokens.css` (**91 líneas** ≤100): `--radius-thumb: 10px`
     (línea 71) con comentario de justificación de 3 líneas (68-70, design.md).
   - `git status` → `package.json`/`pnpm-lock.yaml`/`docs/dependencies.md`
     **sin cambios** (cero dependencias nuevas); dominio `src/domain/search/`
     y repositorios sin cambios.
   - **Cero ocurrencias de `data-search-grid`/`search-results__grid`/
     `search-results__card`/`cardHtml`** en `src/` (grep ✔) y **cero
     `data-search-grid` en `dist/client`** (Select-String sobre los HTML/CSS/JS
     del build ✔).
   - Sin `<style>` en `search-results.astro` ni `search-live.astro` (grep ✔).

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 9) | REQ | Test | Estado |
|---|---|---|---|
| Test de inspección: componente declara ul con data-search-list en lugar de data-search-grid y el controlador pinta en ese contenedor | REQ-09-01, REQ-09-02 | ok 1 (`ul[data-search-list]` + `doesNotMatch data-search-grid`) + ok 2 (import `item-html.ts`, pinta y `toggle('list')`) | ✔ |
| Test unitario: itemHtml emite li con título enlazado a /posts/[id] y miniatura de la imagen | REQ-09-03, REQ-09-04 | ok 3 (`li.search-results__item`, `href="/posts/00-agilismo"`, `img.search-results__thumb src="/assets/content/arch00.jpg"`) | ✔ |
| Test unitario: itemHtml incluye la meta y las etiquetas junto al título | REQ-09-05 | ok 4 (meta y tags con orden por posición `meta > title`, `tags > title`) | ✔ |
| Test de inspección: la hoja define resaltado del fondo de la fila y subrayado del título al hover, con separación entre items mediante var(--color-border) | REQ-09-06, REQ-09-07, REQ-09-08 | ok 6 (hover `--color-surface` + underline) + ok 7 (`border-bottom var(--color-border)` + `:last-child` sin borde) | ✔ |
| Test de inspección: la hoja oculta la miniatura y reduce el espaciado en la media query ≤768px | REQ-09-09 | ok 8 (`@media (max-width: 768px)` con `display: none` del thumb y `padding: 12px 6px`) | ✔ |
| Test de inspección: el panel en vivo reutiliza el contenedor de lista y el generador itemHtml | REQ-09-10 | ok 9 (`search-live.ts` importa `item-html.ts`/`itemHtml`, pinta en `data-search-list`; `search-live.astro` declara `ul[data-search-list]` + hoja canónica) | ✔ |
| Test de inspección: el modo lista conserva guía, empty con limpiar, paginación sin recarga y enlaces /posts/[id] de features 3/5/7 | REQ-09-11, REQ-09-12 | ok 10 (guía + mensaje empty + `Limpiar búsqueda`) + ok 11 (nav con botones sin enlaces prev/next, sin `location.reload`/`submit`, `searchIndex` del dominio, `href="/posts/00-agilismo"`) | ✔ |
| Test de inspección: item-html.ts ≤100 líneas y la hoja usa solo tokens existentes o el nuevo --radius-thumb justificado, sin colores sueltos | restricciones arnés | ok 12 (27 líneas) + ok 13 (whitelist de 13 tokens, cero hex/rgba) + ok 14 (`--radius-thumb: 10px`) | ✔ |

## Revisión de los ajustes de tests existentes (¿legítimos y acotados?)

Sí. Verifiqué los diffs completos (`git diff`) de los 9 archivos de test
modificados y cada cambio cae en una de las categorías del rediseño
(precedente REQ-43-06: el artefacto de test sigue a la presentación real):

1. `tests/search-dedicated-view.test.mjs` (feature 3): import de `cardHtml`
   → `itemHtml` desde `item-html.ts` (D3/D5); REQ-03-03 regex
   `div[data-search-grid]` → `ul[data-search-list]` con las mismas aserciones
   de visibilidad; REQ-03-04 añade además una aserción **negativa nueva**
   (`doesNotMatch data-search-grid`); REQ-03-09 y REQ-03-04 cambian clases
   (`article.search-results__card` → `li.search-results__item`) y mensajes de
   wording, pero conservan **todas** las aserciones de comportamiento: enlace
   `/posts/00-agilismo`, src de imagen `/assets/content/arch00.jpg`, título,
   meta (autor • lectura), descripción, `#arquitectura`/`#agilismo` y escape
   de HTML. REQ-03-00 añade `item-html.ts` a la lista de ≤100 líneas y
   `--radius-thumb` a la whitelist de tokens. **Nada debilitado.**
2. `tests/search-landing-live-transition.test.mjs` (feature 5): fake DOM
   `[data-search-grid]`→`[data-search-list]` (rename interno `grid*`→`list*`);
   REQ-05-04 ahora verifica el import de `item-html.ts`/`itemHtml` y la clase
   `search-results__list` en el panel — coherente con la implementación real
   (search-live.ts línea 11). Las aserciones de wiring de REQ-05-02/03/05/06
   (panel oculto/visible, empty con término, enlace ver todos) quedan
   idénticas. **Nada debilitado.**
3. `tests/root-term-search.test.mjs` (feature 7): fake DOM y rename
   `grid`→`list`; aserciones de comportamiento intactas: items pintados con
   `href="/posts/00-agilismo"` (REQ-07-06), empty sin items, guía sin q,
   `?q=` sigue leyendo y limpiar conserva la vista (REQ-07-11). **Nada
   debilitado.**
4. `tests/search-keyboard-escape.test.mjs` (feature 6): fake del documento
   regex `data-search-(guide|empty|grid|pagination)` →
   `data-search-(guide|empty|list|pagination)` y `toggles.grid`→`toggles.list`
   con la aserción "Escape no ocultó la lista" — misma fuerza que antes (el
   Escape debe ocultar el contenedor de resultados, sea grid o list).
   Legítimo: sin este ajuste la suite quedaría roja al cerrar (el controlador
   alterna `list`). **Nada debilitado.**
5. Los 5 tests que fijaban `tokens.css` en 87 líneas (`article-card-images`
   REQ-17-09, `post-page-styles` REQ-26-07, `post-header` REQ-39-09,
   `post-readability` REQ-40-11, `post-header-horizontal` REQ-42-09): solo el
   conteo canónico 87 → **91** (87 + 4: comentario de 3 líneas + token
   `--radius-thumb`, verificado por mí en tokens.css líneas 68-71) y wording
   de título/mensaje con la justificación cruzada. **Las aserciones negativas
   de grupos se conservan intactas**: `--post-`, `--reading-`, `--font-size-`,
   `--line-height-`, `--aspect-`, `--radius-image` siguen prohibidas — el
   espíritu "sin tokens nuevos de su feature" se mantiene. Legítimos y
   acotados: el token fue aprobado en el design.md de la feature 9 (no es un
   token "de post").

## Conformidad con architecture.md / conventions.md

- **Capas y estructura** (reglas 1/11): cambio confinado a la presentación
  canónica (`search-results.*`) y sus consumidores (`search-live.*`,
  `search-escape.*`); dominio, repositorios y datos intactos. ✔
- **Estilos separados de la UI** (regla 7): cero `<style>` en `.astro`; todo
  el CSS nuevo en `src/styles/search-results.css`. ✔
- **Lógica separada de la UI** (regla 8): frontmatter solo imports; el
  generador extraído es `.ts` puro (item-html.ts). ✔
- **Tokens, no valores sueltos** (regla 6): search-results.css usa 13 tokens
  whitelisted, cero hex/rgba (test ok 13 + audit ✔); el único token nuevo
  `--radius-thumb: 10px` está justificado en design.md (los radios 22px/999px
  son desproporcionados para una miniatura 112×63). ✔
- **≤100 líneas** (regla 12): 27/84/28/99/17/76/62/91 (contados por el
  reviewer). La extracción de `item-html.ts` (D3) baja el controlador de
  100 a 84. ✔
- **Sin dependencias externas** (regla 2): package.json/lock y
  `docs/dependencies.md` sin cambios. ✔
- **Estático por defecto** (regla 9): sin JS de runtime nuevo (D4); solo
  renames en los controladores client-side ya justificados (features 3/5/6). ✔
- **Datos vía repositorio** (regla 5): el índice lo siguen sirviendo las
  páginas desde el dominio; los componentes no leen JSON directamente. ✔
- **Nombres y estilo** (conventions): BEM consistente (`search-results__item`,
  `__thumb`, `__link`, `__tag`), atributo `data-search-list` coherente con el
  namespace `data-search-*`, comentarios de cabecera en español que citan
  REQ/design. ✔
- **No rompe features previas**: suite 400/400 en una corrida completa por el
  reviewer; los 9 tests ajustados verdes; build de producción ✔; cero
  `data-search-grid` residual en src/ y dist/. ✔

## Checkpoints

- C1 (Arquitectura): [x] — estilos en `src/styles/*.css` sin `<style>`,
  lógica en `.ts` (item-html.ts extraído), solo tokens (13 whitelisted +
  `--radius-thumb` justificado en design.md), ≤100 líneas en los 8 archivos,
  sin dependencias nuevas, layout único y repositorios intactos.
- C2 (Datos): [x] — `src/data/*.json`, entidades y repositorios intactos
  (esta feature no toca datos ni dominio; el índice de búsqueda no cambia).
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (entorno, formato, tests 400/400 al 100%, build
  de producción ✔). La inspección visual desktop/móvil queda [ ] como en el
  histórico: el arnés no tiene navegador (pendiente del humano).
- C4 (Harness, tarea en `done`): [ ] — feature 9 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en features 1-8). `depends_on: []` — sin dependencias
  pendientes; ninguna otra feature a medias.
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo ERR_MODULE_NOT_FOUND + 7 fallos, verde 14/14 y 400/400,
  conteos, informe referenciado); `progress/history.md` se actualiza al cierre
  del ciclo (mismo criterio que features 1-8); sin `print()` de debug, TODOs
  ni temporales (grep ✔ sobre src/).

## Cambios requeridos

Ninguno.