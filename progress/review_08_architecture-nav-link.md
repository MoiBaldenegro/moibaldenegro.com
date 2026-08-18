# Review — feature 8 `architecture-nav-link`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/08_architecture-nav-link/`
(REQ-08-01..05 + design.md Decisiones 1-3). Backlog: entrada id 8 de
`feature_list.json` (acceptance ×3). Informe del implementer:
`progress/impl_08_architecture-nav-link.md`.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final?

Sí, con evidencia verificable en `progress/impl_08_architecture-nav-link.md`
y en `progress/current.md` (bitácora 2026-08-18):

- **Rojo capturado antes de implementar**: `tests/architecture-nav-link.test.mjs`
  (5 tests de inspección por regex sobre Layout.astro + layout.css) se escribió
  primero contra la spec; `node --test` → **3 fallos / 2 passes**. Fallan
  exactamente los acceptance que dependen del enlace inexistente (REQ-08-01,
  REQ-08-02/03, REQ-08-05) y pasan los que ya eran ciertos antes del cambio
  (REQ-08-04 conservación y ≤100 líneas) — señal de test real escrito contra
  la spec, no contra el código.
- **Verde después de implementar**: test de la feature 5/5 pass, suite
  completa 386/386 pass (381 previos + 5 nuevos), `check-format` ✔,
  `audit-design-tokens` ✔ y `./init.sh` "El entorno está perfecto" — los
  cuatro re-ejecutados por mí abajo.

La feature no salta dependencias: `depends_on: [7]` en `feature_list.json`
(entrada id 8) y la feature 7 (`root-term-search`, la ruta `/arquitectura`)
está `done` en el mismo archivo — verificado, sin dependencias pendientes
saltadas.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/architecture-nav-link.test.mjs` → exit 0,
   **# tests 5 / # pass 5 / # fail 0** (TAP). Los 5 subtests cubren
   REQ-08-01..05: ok 1 (enlace `<a href="/arquitectura">Arquitectura</a>`
   dentro de `<nav>`), ok 2 (aria-current con la condición
   `/arquitectura || /arquitectura/` → `'page' : undefined`, idéntico patrón
   ternario al de About — verificado por regex y por comparación estructural
   de ambos anclas), ok 3 (Home, About, @moibaldenegro y `<SearchBar>`
   conservados), ok 4 (ancla sin `class=`/`style=`, sin `<style>` en el
   Layout, y `a[aria-current="page"]` presente en layout.css), ok 5
   (Layout.astro ≤100 líneas).
2. `bash -c "pnpm test"` → **# tests 386 / # pass 386 / # fail 0**. Los
   tests de features previas del ciclo están intactos y verdes en la misma
   corrida: `layout-refactor` (REQ-37-03 cuenta los aria-current del navbar),
   `search-bar-header` (REQ-04-01) y `visual-polish-refactor` siguen en
   verde — el cambio es aditivo (1 línea) y no rompió nada.
3. `node scripts/check-format.mjs` → exit 0: `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
   `node scripts/audit-design-tokens.mjs` → exit 0:
   `AUDIT ✔ ningún color fuera de tokens.css en src/styles` (sin CSS nuevo).
4. `bash ./init.sh` → exit 0: entorno ✔, formato ✔, tests 100% ✔, build de
   producción ✔ → **"✔ El entorno está perfecto. Podemos empezar a
   trabajar."**
5. Inspección directa de `src/layouts/Layout.astro` (**39 líneas**, contadas
   con `node -e` estilo wc -l):
   - Línea 31: `<a aria-current={Astro.url.pathname === '/arquitectura' ||
     Astro.url.pathname === '/arquitectura/' ? 'page' : undefined}
     href="/arquitectura">Arquitectura</a>` — texto `Arquitectura`, destino
     `/arquitectura` (REQ-08-01); aria-current `page` solo para
     `/arquitectura` o `/arquitectura/` y `undefined` (omisión) en el resto
     (REQ-08-02, REQ-08-03); byte a byte el mismo patrón ternario que About
     (línea 30, design.md D1).
   - Líneas 29/30/32/33: Home (/), About (/about), @moibaldenegro
     (https://x.com/moibaldenegro) y `<SearchBar />` conservados (REQ-08-04).
   - Sin `class=` ni `style=` en el ancla, sin `<style>` en el archivo, sin
     JS nuevo (solo el `ClientRouter` ya presente; sin `<script>` ni
     `console.`/`TODO`/`FIXME`/`debugger` — grep ✔). El estado activo lo
     estiliza `layout.css:47-50` (`.site-navbar a[aria-current="page"]` y su
     `::after`), ya existente (REQ-08-05, design.md tabla de tokens: ninguno
     nuevo).
   - `git diff --name-only` → `layout.css`, `tokens.css`, `docs/
     dependencies.md`, `package.json` y `pnpm-lock.yaml` **sin cambios**
     (sin CSS, tokens ni dependencias nuevos). El diff de Layout.astro vs el
     estado tras la feature 6 es exactamente **+1 línea** (la de
     Arquitectura); las otras 4 del diff vs HEAD son de las features 4/6
     (SearchBar/SearchEscape) ya aprobadas.
6. Dependencia satisfecha: `src/pages/[...term].astro` existe en el working
   tree (ruta `/arquitectura` de la feature 7, done) — el enlace apunta a
   una URL servida, no a un 404.

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 8) | REQ | Test | Estado |
|---|---|---|---|
| Test de inspección: Layout.astro incluye un enlace de texto Arquitectura con destino /arquitectura y conserva Home, About, @moibaldenegro y la barra de búsqueda | REQ-08-01, REQ-08-04 | ok 1 (regex `<a ... href="/arquitectura">Arquitectura</a>` en `<nav>`) + ok 3 (Home/About/@moibaldenegro/SearchBar presentes) | ✔ |
| Test de inspección: el enlace declara aria-current page con la misma condición de ruta que About (/arquitectura y /arquitectura/) y lo omite en el resto de rutas | REQ-08-02, REQ-08-03 | ok 2 (condición ternaria exacta + comparación estructural del degradado `? 'page' : undefined` contra About; inspección directa línea 31 vs línea 30) | ✔ |
| Test de inspección: el enlace no añade estilos propios y hereda los estilos del navbar existente | REQ-08-05 | ok 4 (sin class/style propios, sin `<style>` en Layout, `a[aria-current="page"]` en layout.css; audit tokens ✔) | ✔ |
| (Constraint de design.md) Layout.astro ≤100 líneas | design.md | ok 5 (39 líneas, confirmado por el reviewer) | ✔ |

## Conformidad con architecture.md / conventions.md

- **Capas y layout único** (reglas 1/11): el cambio vive únicamente en
  `src/layouts/Layout.astro` (chrome compartido); no se crea layout nuevo. ✔
- **Estilos separados de la UI** (regla 7): sin `<style>` en el `.astro`, sin
  CSS nuevo; el enlace hereda `.site-navbar a` y `a[aria-current="page"]` de
  `layout.css` (patrón REQ-37-03 de About). ✔
- **Tokens, no valores sueltos** (regla 6): cero tokens nuevos, cero colores
  hardcodeados (audit ✔). ✔
- **Lógica separada de la UI** (regla 8): el enlace es marcado declarativo
  con la condición ternaria inline sobre `Astro.url.pathname` — el mismo
  patrón ya aprobado en About/Home; no añade lógica nueva. ✔
- **Estático por defecto** (regla 9): sin JS de runtime (design.md D3); la
  navegación usa el `ClientRouter` ya presente. ✔
- **≤100 líneas** (regla 12): Layout.astro 39 líneas (1 línea nueva + la
  condición aria-current). ✔
- **Sin dependencias externas** (regla 2): package.json/lock y
  `docs/dependencies.md` sin cambios. ✔
- **Nombres y estilo** (conventions): texto del enlace en español
  ("Arquitectura"), atributos `aria-current` con la misma forma que About,
  sin clases nuevas. ✔
- **No rompe features previas**: suite 386/386 en una corrida completa por el
  reviewer; `layout-refactor` (cuenta aria-current), `search-bar-header` y
  `visual-polish-refactor` verdes; build de producción ✔. ✔

## Checkpoints

- C1 (Arquitectura): [x] — estilos en `src/styles/*.css` (sin `<style>`, sin
  CSS/tokens nuevos), sin lógica JS nueva en UI, ≤100 líneas (39), sin
  dependencias nuevas, layout único conservado, datos vía repositorio
  intactos.
- C2 (Datos): [x] — `src/data/*.json`, entidades y repositorios intactos
  (esta feature no toca datos).
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (entorno, formato, tests 386/386 al 100%, build
  de producción ✔). La inspección visual desktop/móvil queda [ ] como en el
  histórico: el arnés no tiene navegador (pendiente del humano).
- C4 (Harness, tarea en `done`): [ ] — feature 8 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en features 1-7). Feature 7 `done` (dependencia
  satisfecha); ninguna otra a medias.
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo 3 fail/2 pass, verde 5/5, conteos, informe referenciado);
  `progress/history.md` al día; sin `print()` de debug, TODOs ni temporales
  (grep ✔ sobre Layout.astro).

## Cambios requeridos

Ninguno.