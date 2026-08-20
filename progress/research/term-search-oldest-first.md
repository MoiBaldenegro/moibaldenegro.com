# Análisis — Los más antiguos primero en /<término> (feature 17)

Fecha: 2026-08-20. Autor: spec_author.

## 1. Petición del humano (íntegra)

> «En las búsquedas cuando accedemos al /algo, queremos que los más antiguos
> aparezcan primero».

## 2. Causa raíz (verificada en disco)

La ruta `/<término>` (feature 7 root-term-search, `src/pages/[...term].astro`
on-demand) embe de el índice del catálogo y el cliente filtra por el término
del pathname. El controlador compartido
`src/components/search-results/search-results-controller.ts` (`initSearchResults`)
sirve TANTO `/search?q=` como `/<término>`: distingue el origen con
`q !== ''` (query) vs pathname (REQ-07-03) y llama a `searchIndex(index, term,
page)` del dominio.

El dominio `src/domain/search/search.ts` **siempre** ordena descendente por
fecha (`byDateDesc`, REQ-02-04/05: «los resultados se ordenan de forma
descendente por fecha»). Por eso `/arquitectura` muestra el artículo más
reciente primero, en contra de lo que el humano espera en una ruta que
funciona como «sección temática» (leer 00→01→02 en orden de publicación).

## 3. Superficie de cambio (lo que toca)

1. `src/domain/search/search.ts` (61 líneas hoy) — `searchIndex()` y
   `searchPosts()`: añadir orden opcional.
2. `src/components/search-results/search-results-controller.ts` (84 líneas
   hoy) — `initSearchResults` deriva el orden por origen; `renderSearch` lo
   propaga a `searchIndex` y a las llamadas recursivas de paginación.

NO toca (ver D3/D4): `src/pages/search.astro`, `src/pages/[...term].astro`,
`src/components/search-live/search-live.ts` (100 líneas exactas — no añadir
nada ahí), `item-html.ts`, `term-route.ts`, ni ningún `.astro`/CSS → **sin
design.md** (cambio 100% lógica, sin UI).

Tests afectados potencialmente (ver §6 Riesgos):

- `tests/search-domain.test.mjs` — REQ-02-04/05 asercionan el orden
  descendente por defecto.
- `tests/root-term-search.test.mjs` — REQ-07-03/11 asercionan regex del
  controlador (`q !== '' ? q : termFromPathname(...)`, `wireClear(...)`,
  `termFromPathname(window.location.pathname)`).
- `tests/search-dedicated-view.test.mjs` y `tests/search-results-list-mode.test.mjs`
  — asercionan `searchIndex(` en el controlador (paginación/filtrado).
- `tests/search-landing-live-transition.test.mjs` — inspecciona `search-live.ts`
  (no cambia: D4).

## 4. Decisiones de diseño

### D1. API del dominio: parámetro opcional `order?: 'desc' | 'asc'` (default 'desc')

`searchIndex(index, query, page, order = 'desc')` y `searchPosts(...)` reciben
un cuarto parámetro opcional `order: SearchOrder = 'desc'`, con
`export type SearchOrder = 'desc' | 'asc'`. El sort usa
`order === 'asc' ? byDateAsc : byDateDesc` (comparadores existentes +
`byDateAsc` nuevo). El default `'desc'` conserva REQ-02-04/05 intactos y no
cambia el comportamiento de ningún consumidor que no pase el parámetro.

**Alternativa descartada**: función separada `searchIndexAsc()` — duplica la
lógica de filtrado/paginación y crea dos caminos que deben mantenerse
sincronizados; el parámetro opcional es el cambio mínimo y retrocompatible.
**Alternativa descartada 2**: parámetro `sortBy: (a, b) => number` — expone
comparadores al llamador y complica el contrato; un union type cerrado
(`'desc' | 'asc'`) es suficiente hoy.

Empates de fecha: `Array.prototype.sort` de JS es estable (ES2019+), así que
dos artículos con la misma YYYY-MM-DD conservan el orden del índice (orden de
aparición en el catálogo). Sin cambios de comportamiento.

### D2. Controlador: el origen del término decide el orden

En `initSearchResults` el término ya se deriva con
`q !== '' ? q : termFromPathname(window.location.pathname)`. Se añade el
orden en la primera render:

```ts
renderSearch(term, index, 1, q !== '' ? 'desc' : 'asc');
```

- `q !== ''` (vista `/search?q=`) → `'desc'` (comportamiento actual).
- `q === ''` (ruta `/<término>`) → `'asc'` (lo que pide el humano).

`renderSearch` recibe `order: SearchOrder` y lo propaga a
`searchIndex(index, term, page, order)` y a las llamadas recursivas de
paginación (`data.page - 1` / `data.page + 1`), para que el orden ascendente
se conserve en todas las páginas. El cambio preserva **exactamente** las
expresiones que asercionan los tests REQ-07-03/10/11
(`q !== '' ? q : termFromPathname`, `wireClear(document.title, q !== '')`,
`termFromPathname(window.location.pathname)`, `clearDestination(...)`): no se
refactoriza la derivación del término, solo se añade el argumento de orden.

### D3. Alcance: `/search?q=` conserva el orden descendente

La petición dice «cuando accedemos al /algo»: la interpretación literal es
que el cambio aplica a la **ruta por término**. Además la ruta `/algo`
funciona como **sección temática** (el humano navega `/arquitectura` esperando
leer 00→01→02 en orden de publicación), mientras `/search?q=` es una
**búsqueda puntual** donde el descendente (más reciente primero) es lo
habitual. Se documenta y no se extiende.

### D4. Alcance: el panel en vivo de la portada conserva el orden descendente

`search-live.ts` llama `searchIndex(index, term, 1)` (default `'desc'`): **no
cambia**. Motivos:

1. La petición menciona solo /algo; el panel en vivo es una búsqueda en vivo
   disparada por la barra (no una «sección temática»).
2. El enlace «Ver todos los resultados» del panel navega a `/search?q=`
   (`seeAllUrl` → `/search?q=`): el panel es una vista previa de la búsqueda
   dedicada, cuyo orden es descendente (D3).
3. REQ-05-04 exige que el panel use la misma presentación que `/search`;
   conservar el mismo orden mantiene esa coherencia.

### D5. Sin design.md

El cambio no toca UI: ningún `.astro`, CSS, token, layout ni responsive. Es
lógica de dominio + controlador. `specs/17_term-search-oldest-first/` contiene
solo `requirements.md`.

## 5. Descomposición: una sola feature (id 17)

El problema es **uno solo** (orden de presentación en la ruta por término) y
el cambio es mínimo y unitario: parámetro opcional en el dominio + derivación
por origen en el controlador. No hay capas separables (no hay datos nuevos ni
UI nueva). `depends_on: [2, 7]`: modifica `search.ts` (feature 2) y el
comportamiento de la ruta por término (feature 7). La feature 10
(in_progress) toca el `<script>` de `search-results.astro` (patrón
astro:page-load), no el interior de `initSearchResults`: sin conflicto y sin
dependencia.

## 6. Riesgos y trabas

- **REQ-02-04/05 (search-domain.test.mjs)**: el default `'desc'` preserva el
  contrato; el test existente pasa sin cambios. No se invoca el precedente
  REQ-43-06: ningún test existente cambia de aserción.
- **REQ-07 (root-term-search.test.mjs)**: las regex del controlador se
  conservan textualmente (D2); el wiring con DOM fake no depende del orden
  (el fixture `/arquitectura` solo coincide con un artículo). Sin cambios en
  el test.
- **REQ-03-02/06 y REQ-09 (dedicated-view / list-mode)**: asercionan
  `searchIndex(` — la llamada sigue existiendo con el argumento extra.
- **Límite 100 líneas**: `search.ts` 61 → ~68; `search-results-controller.ts`
  84 → ~85. Ambos bajo el límite. `search-live.ts` está en 100/100: por eso
  NO se toca (D4).
- **Paginación con orden**: si el orden no se propaga a las llamadas
  recursivas, la página 2 de `/algo` volvería al descendente — el acceptance
  REQ-17-05 lo cubre con inspección.
- **Empates de fecha**: sort estable de JS; se cubre con test explícito.

## 7. Fuera de alcance

- Cambiar el orden de `/search?q=` (D3).
- Cambiar el orden del panel en vivo (D4).
- Orden configurable por el usuario (toggle asc/desc en la UI).
- Mostrar la fecha en los items (pendiente del research de la feature 9).
- Cualquier cambio de UI/presentación.