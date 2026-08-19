# Informe de implementación — feature 9 search-results-list-mode

Fecha: 2026-08-18. Autor: implementer.
Spec: `specs/09_search-results-list-mode/requirements.md` (REQ-09-01..12) y `design.md` (Decisiones 1-5).
Análisis: `progress/research/search-results-list-mode.md`.

## 1. Estado inicial

- `feature_list.json`: feature 9 `pending` → marcada `in_progress` al comenzar (no se marca `done`: pendiente del reviewer).
- Entorno: `./init.sh` en verde antes de tocar nada.
- Presentación canónica previa: grid de tarjetas gigantes (`div.search-results__grid[data-search-grid]`, `cardHtml` en el controlador a 100/100 líneas, `.search-results__card` en `search-results.css`); panel en vivo de la portada reutilizando `cardHtml` y las clases del grid (`search-live.*`).

## 2. Ciclo rojo (evidencia)

Tests escritos/ajustados ANTES de tocar el código (test-first obligatorio) y ejecutados contra el código viejo:

- `node --test tests/search-results-list-mode.test.mjs` → **ROJO**: `ERR_MODULE_NOT_FOUND: Cannot find module '...src\components\search-results\item-html.ts'` (0/14).
- `node --test tests/search-dedicated-view.test.mjs tests/search-landing-live-transition.test.mjs tests/root-term-search.test.mjs tests/search-keyboard-escape.test.mjs` → **ROJO**: 7 fallos (55/62):
  - `REQ-07-03 (wiring)` — "no se pintaron items al cargar /<término> (REQ-07-03)" (el controlador pinta en `[data-search-grid]`, el fake espera `[data-search-list]`).
  - `REQ-07-11 (wiring)` — "con q no se presentan resultados (REQ-03-02)" (ídem).
  - `REQ-06-02 (wiring)` — "Escape no ocultó la lista (REQ-06-02)" (search-escape.ts alterna `'grid'`).
  - `REQ-05-01/02/03 (wiring)` — "con coincidencias no se pinta la lista" (search-live.ts pinta en `[data-search-grid]`).
  - `REQ-05-04` — "el controlador no importa el generador de la feature 3 (REQ-05-04)" (search-live.ts importa `cardHtml` del controlador).
  - `REQ-05-05 (wiring)` — "la lista no se oculta sin coincidencias".
  - `tests/search-dedicated-view.test.mjs` — no carga: import de `item-html.ts` inexistente.

## 3. Archivos creados

- `src/components/search-results/item-html.ts` (27 líneas) — generador extraído (D3): `itemHtml(entry)` emite el item de lista y `esc` escapa HTML. Lo importan el controlador (REQ-09-02) y el panel en vivo (REQ-09-10). Precedente de extracción: `term-route.ts`.
- `tests/search-results-list-mode.test.mjs` (314 líneas) — 14 tests contra los acceptance de la feature 9:
  - REQ-09-01/02: componente con `ul[data-search-list]` (sin `data-search-grid`) y controlador que importa `itemHtml` y pinta/togglea `list`.
  - REQ-09-03/04: `itemHtml` unitario — `li.search-results__item`, título enlazado a `/posts/[id]`, miniatura `img.search-results__thumb`.
  - REQ-09-05: meta (autor • min de lectura) y tags junto al título (orden por posición).
  - Escape de HTML del catálogo (comportamiento conservado del antiguo cardHtml).
  - REQ-09-06/07: hover con `background: var(--color-surface)` y subrayado del título.
  - REQ-09-08: separación entre items con `border-bottom: 1px solid var(--color-border)` (hairline) y `:last-child` sin borde.
  - REQ-09-09: media query `max-width: 768px` oculta `--thumb` (`display: none`) y reduce el padding del item (`12px 6px`).
  - REQ-09-10: `search-live.ts` importa `item-html.ts`/`itemHtml` y pinta en `data-search-list`; `search-live.astro` declara `ul[data-search-list]` y la hoja canónica.
  - REQ-09-11/12: guía, empty state con limpiar, paginación sin recarga y enlaces `/posts/[id]` conservados.
  - Restricciones: `item-html.ts` ≤100 líneas; `search-results.css` solo tokens (incl. `--radius-thumb`) sin hex/rgba; `tokens.css` declara `--radius-thumb: 10px`.

## 4. Archivos modificados (código)

| Archivo | Cambio |
|---|---|
| `src/components/search-results/search-results-controller.ts` | 100 → 84 líneas. Eliminados `cardHtml` y `esc` (extraídos a item-html.ts, D3); import de `itemHtml`; `renderSearch` pinta en `[data-search-list]` con `toggle('list')`; `wireClear` alterna `list` en vez de `grid` (D5). Comportamiento (queryTerm/removeQueryParam/pageLabel/initSearchResults/readIndex/renderSearch/wireClear/toggle) intacto. |
| `src/components/search-results/search-results.astro` | `div.search-results__grid[data-search-grid]` → `ul.search-results__list[data-search-list]` (REQ-09-01, D5). Guía/empty/limpiar/paginación sin cambios (REQ-09-11/12). |
| `src/components/search-live/search-live.astro` | Mismo rename del contenedor (REQ-09-10, D2/D5). |
| `src/components/search-live/search-live.ts` | 99 líneas. Import de `itemHtml` desde `item-html.ts` (antes `cardHtml` del controlador); `querySelector('[data-search-list]')` y `list.innerHTML = data.results.map(itemHtml).join('')` (REQ-09-10). |
| `src/components/search-escape/search-escape.ts` | 76 líneas. `['empty', 'grid', 'pagination']` → `['empty', 'list', 'pagination']`: el Escape de la vista /search debe ocultar el contenedor de resultados renombrado (consecuencia directa del rename D5 del atributo `data-search-*`). |
| `src/styles/search-results.css` | Reescrita (62 líneas): bloque de tarjeta grande → bloque de modo lista (`.search-results__list`, `__item`, `__thumb`, `__body`, `__link` + `::after` stretched link, `__title`, `__meta`, `__description` clamp 2 líneas, `__tags`, `__tag` píldoras pequeñas); hover `--color-surface` con radio `--radius-card` y subrayado; hairline `--color-border` con `:last-child` sin borde; media query ≤768px (thumb oculta, padding `12px 6px`, título 1rem); reglas `[hidden]` y paginación/guía/empty conservadas. Solo tokens. |
| `src/styles/tokens.css` | 87 → 91 líneas. Token nuevo `--radius-thumb: 10px` en el grupo Radio con comentario de justificación (design.md). |

## 5. Tests existentes ajustados (LISTA con justificación)

Precedente del arnés **REQ-43-06**: el artefacto de test sigue a la presentación real cuando el producto cambia por decisión del humano. La spec 09 (REQ-09-02/10) y el design D5 prevén el renombrado. Se ajusta SOLO lo que el rediseño cambia; el comportamiento verificado es idéntico.

1. `tests/search-dedicated-view.test.mjs` (feature 3):
   - Import de `cardHtml` (controlador) → `itemHtml` (`item-html.ts`); nueva const `ITEM_HTML_URL`. Justificación: el generador se extrae (D3) y renombra (D5).
   - REQ-03-03: el componente "oculta la cuadrícula" → "oculta la lista": regex `<div[^>]*data-search-grid[^>]*>` → `<ul[^>]*data-search-list[^>]*>`. Justificación: el contenedor cambia de div a ul y de atributo (D5).
   - REQ-03-04: "cuadrícula de tarjetas (grid)" → "lista de items (data-search-list)" + aserción negativa de que `data-search-grid` no persiste. Justificación: rename D5; wording de spec ya actualizado por spec_author.
   - REQ-03-09: `cardHtml` → `itemHtml`; "la tarjeta no enlaza" → "el item no enlaza". Justificación: rename del generador + wording spec 03.
   - REQ-03-04 (vista previa): `<article class="search-results__card">` → `<li class="search-results__item">` y clases de imagen `search-results__image` → `search-results__thumb` en las aserciones; mensajes "la tarjeta no incluye" → "el item no incluye". Justificación: estructura del item del design.md (REQ-09-01/04).
   - REQ-03-04 (escape): `cardHtml` → `itemHtml`. Justificación: rename.
   - REQ-03-00 (≤100 líneas): se añade `item-html.ts` a la lista. Justificación: el generador extraído es parte de la presentación canónica.
   - REQ-03-00 (tokens): se añade `--radius-thumb` a la lista permitida. Justificación: token nuevo aprobado en el design.md de la feature 9.
2. `tests/search-landing-live-transition.test.mjs` (feature 5):
   - DOM fake de `applyLive`: selector `[data-search-grid]` → `[data-search-list]` y rename interno `grid*` → `list*` (calls.listHidden/listHtml). Justificación: el panel pinta en el contenedor renombrado (D5); el fake replica el contrato del controlador.
   - REQ-05-04 (inspección): verifica import de `item-html.ts`/`itemHtml` en search-live.ts (antes `search-results-controller.ts`/`cardHtml`) y clase `search-results__list` en el panel (antes `search-results__grid`). Justificación: el panel reutiliza el generador extraído (REQ-09-10) y el contenedor renombrado (D5); REQ-05-04 "misma presentación que la vista dedicada" sigue vigente textualmente.
   - Mensajes "la cuadrícula" → "la lista" en los wiring. Justificación: wording.
3. `tests/root-term-search.test.mjs` (feature 7):
   - DOM fake: selector `[data-search-grid]` → `[data-search-list]` y rename interno `grid` → `list`. Justificación: el controlador pinta en el contenedor renombrado (D5).
   - Mensajes "no se pintaron tarjetas"/"la tarjeta no enlaza"/"se pintan tarjetas" → "items". Justificación: wording spec 07 (REQ-07-06 ya actualizado por spec_author).
4. `tests/search-keyboard-escape.test.mjs` (feature 6):
   - DOM fake de la vista /search: regex `data-search-(guide|empty|grid|pagination)` → `data-search-(guide|empty|list|pagination)` y `toggles.grid` → `toggles.list`. Justificación: search-escape.ts alterna el contenedor renombrado (`list`); el fake replica el namespace `data-search-*` real. No estaba en el research original, pero es la misma categoría (rename D5 del atributo) — sin este ajuste la suite quedaría roja al cerrar la feature.
5. `tests/article-card-images.test.mjs` (REQ-17-09), `tests/post-page-styles.test.mjs` (REQ-26-07), `tests/post-header.test.mjs` (REQ-39-09), `tests/post-readability.test.mjs` (REQ-40-11), `tests/post-header-horizontal.test.mjs` (REQ-42-09):
   - Fijaban `tokens.css` en **87 líneas exactas** (estado canónico post-feature 25). El design.md de la feature 9 anticipa el token nuevo aprobado (`tokens.css está en 87/100 líneas: añadir una línea no supera el límite`) y su acceptance #8 exige `--radius-thumb` en tokens.css. Se actualiza la aserción al nuevo estado canónico **91 líneas** (87 + 4: comentario de 3 líneas + token) y los comentarios de cabecera que describían el estado canónico. Las aserciones negativas de grupos (`--post-`, `--reading-`, `--font-size-`, `--aspect-`, `--radius-image`) se conservan intactas: el espíritu "sin tokens nuevos de su feature" se mantiene.

## 6. Estructura del item implementada (design.md)

```
<ul class="search-results__list" data-search-list hidden>     ← contenedor (REQ-09-01)
  <li class="search-results__item">                           ← fila, position:relative (stretched link)
    <img class="search-results__thumb" src="/assets/content/<img>" alt="<título>" loading="lazy" />
    <div class="search-results__body">
      <a class="search-results__link" href="/posts/<id>">     ← título enlazado (REQ-09-03), ::after inset:0
        <h2 class="search-results__title">…</h2>
      </a>
      <p class="search-results__meta">Por <autor> • <N> min de lectura</p>   ← REQ-09-05
      <p class="search-results__description">…</p>            ← clamp 2 líneas (REQ-09-04/05)
      <div class="search-results__tags"><span class="search-results__tag">#tag</span>…</div>
    </div>
  </li>
</ul>
```

- Fila entera navega a `/posts/[id]` con un solo enlace accesible (patrón stretched link: `::after` absoluto sobre el item `position: relative`); los tags son `span`, sin interactivos anidados.
- Estados: reposo sin caja (separación hairline `--color-border`, REQ-09-08); hover con wash `var(--color-surface)` + radio `--radius-card` y título subrayado (REQ-09-06/07); focus con outline nativo; ≤768px con miniatura oculta, padding `12px 6px` y título 1rem (REQ-09-09).
- Guía, empty state con limpiar, paginación sin recarga y enlaces `/posts/[id]` conservados (REQ-09-11/12).

## 7. Token nuevo y justificación

- `--radius-thumb: 10px` en `src/styles/tokens.css` (grupo Radio, junto a `--radius-card: 22px` y `--radius-pill: 999px`).
- Justificación (design.md de la feature 9): sobre una miniatura de 112×63px, 22px equivale a un tercio del alto (blob casi circular) y el pill 999px es inaplicable; 10px mantiene el lenguaje redondeado del sitio a escala proporcional. `tokens.css` pasa de 87 a 91 líneas (≤100). El guardián `audit-design-tokens.mjs` no se ve afectado (comprueba colores, no tokens): las hojas no contienen ningún color suelto.

## 8. Evidencia del VERDE

- Test de la feature: `node --test tests/search-results-list-mode.test.mjs` → **14/14 pass** (0 fail).
- Suite completa: `bash -c "pnpm test"` → **400/400 pass** (386 previos + 14 nuevos; 0 fail). Ningún test de features previas roto.
- Formato: `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos`.
- Tokens: `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
- `bash ./init.sh` → todas las comprobaciones ✔ → **"El entorno está perfecto"** (incluye `pnpm build`).
- Verificación del build:
  - `dist/client/search/index.html` y `dist/client/index.html` contienen `<ul class="search-results__list" data-search-list hidden></ul>` (estado inicial con guía; los items se pintan en cliente por el controlador, igual que antes).
  - Cero ocurrencias de `data-search-grid` en `dist/client`.
  - CSS empaquetado (`dist/client/_astro/*.css`) contiene `.search-results__list`, `--radius-thumb` y el hover wash `background: var(--color-surface)`.

## 9. Confirmación ≤100 líneas por archivo (src/)

| Archivo | Líneas |
|---|---|
| `src/components/search-results/item-html.ts` | 27 |
| `src/components/search-results/search-results-controller.ts` | 84 (antes 100) |
| `src/components/search-results/search-results.astro` | 28 |
| `src/components/search-live/search-live.ts` | 99 |
| `src/components/search-live/search-live.astro` | 17 |
| `src/components/search-escape/search-escape.ts` | 76 |
| `src/styles/search-results.css` | 62 |
| `src/styles/tokens.css` | 91 (≤100) |

## 10. Fuera de alcance (no tocado)

Resaltado del término, fecha en la meta, toggle grid/lista, dominio (`searchIndex`, `PAGE_SIZE`, repositorios) y JS de runtime nuevo (D4): sin cambios. La feature no toca otra feature: la migración de `search-live.*` y `search-escape.*` es la consecuencia necesaria del rename canónico (D2/D5), documentada en el research.

## 11. Estado del backlog

`feature_list.json`: feature 9 en `in_progress` (NO marcada `done`). Pendiente: reviewer externo (lo lanza el líder).