# Análisis — client-init-on-navigation (bug de navegación /arquitectura)

Fecha: 2026-08-18. Rol: spec_author. Feature: 10 `client-init-on-navigation`.

## 1. Problema reportado

El humano reporta: "el arquitectura del nav cuando navega no da resultados nomas
checa eso". Al navegar por el enlace **Arquitectura** del navbar (navegación
suave con `<ClientRouter />` de `astro:transitions`, feature 24), la página
`/arquitectura` se carga (HTTP 200, HTML correcto con el índice JSON embebido
válido de 2 entradas y tags `["arquitectura","agilismo","software-design"]`)
pero **no pinta resultados**: queda la guía ("Buscar en el catálogo…"). La
simulación del dominio confirma que `searchIndex(index, 'arquitectura', 1)`
devuelve 2 resultados. El fallo es 100% client-side.

## 2. Causa raíz (verificada)

Mecanismo documentado en Astro (View Transitions → Script re-execution) y
contrastado en `node_modules/astro/dist/transitions/router.js` y
`events.js`:

- Los `<script>` empaquetados de Astro (default, bundling) se ejecutan **una
  única vez por sesión**: el module map del navegador ignora el módulo aunque
  el script exista en la página nueva tras una transición.
- El ClientRouter en navegación suave hace: swap del DOM →
  `history.pushState` → `runScripts()` (línea 72/351 de router.js; los
  módulos ya cargados **no** se re-ejecutan) → dispara el evento
  `astro:page-load` (`onPageLoad` en events.js; en la carga inicial el
  listener de `window load` del router lo dispara igualmente).
- `initSearchResults()` se invoca **directamente** en el `<script>` de
  `search-results.astro` → corre solo la primera vez. En la 2ª+ visita por
  navegación suave a `/search`, `/<término>` o `/arquitectura`, el DOM nuevo
  queda sin inicializar → sin resultados (guía visible).

El índice embebido (`<script type="application/json" id="search-index"
is:inline set:html>`) persiste por el swap porque `runScripts` lo salta (type
json) ✓. El HTML es correcto; el problema es exclusivamente que el controlador
no arranca sobre el DOM nuevo.

## 3. Alcance sistémico (misma clase de bug, 4 módulos)

| # | Módulo | Init | Feature | Efecto en 2ª+ visita suave |
|---|--------|------|---------|----------------------------|
| 1 | `src/components/search-results/search-results.astro` | `initSearchResults()` | 3/7 (reportado) | Sin resultados en /search, /<término>, /arquitectura |
| 2 | `src/components/search-bar/search-bar.astro` | `initSearchBar(navigate)` (navigate de `astro:transitions/client`) | 4 | Input nuevo sin listener Enter/limpiar X |
| 3 | `src/components/search-live/search-live.astro` | `initSearchLive()` | 5 | Panel en vivo muerto en la portada (capturas obsoletas) |
| 4 | `src/components/search-escape/search-escape.astro` + `.ts` | `initSearchEscape()` | 6 | El handler keydown va sobre `document` (persiste) pero captura `barRoot`/`baseTitle` por parámetro en cada llamada; su comentario de cabecera (líneas 43-44) asume **falsamente** que los scripts del layout se re-ejecutan en cada navegación. Ya tiene guard de re-init (removeEventListener antes de add) que evita acumular manejadores |

Los 4 controladores `.ts` son **re-parametrizables por llamada**: sus default
params (`document.querySelector(...)`) se evalúan en cada invocación →
referencias frescas al DOM de la página nueva:

- `initSearchBar(navigate, root = document.querySelector('[data-search-bar]'))`
- `initSearchLive(panel = querySelector('[data-search-live]'), landing = querySelector('[data-landing-sections]'))`
- `initSearchEscape(root = document, barRoot = querySelector('[data-search-bar]'), baseTitle = document.title)`
- `initSearchResults()` lee `window.location` y `document` en cada llamada

No requieren cambios de firma: basta re-invocarlos en cada navegación.

## 4. Decisión de diseño del fix

### D1 — UNA feature única (id 10) para los 4 módulos

Misma clase de bug, mismo patrón de fix mecánico, mismos tests afectados.
Dividir en 4 features fragmentaría la entrega sin valor de trazabilidad
adicional: el fix es atómico (o se aplica el patrón en los 4 sitios o el bug
sigue vivo en el módulo restante). `depends_on: [3, 4, 5, 6, 7, 9]`: modifica
artefactos de esas features (todas done, sin impacto en selección del arnés).

### D2 — Patrón oficial: listener `astro:page-load` en los 4 `<script>`

Sustituir la llamada directa por:

```html
<script>
  import { initX } from './x.ts';
  document.addEventListener('astro:page-load', () => initX());
</script>
```

El evento dispara **en la carga inicial** (vía listener `window load` del
router) **y tras cada navegación suave**, después del swap y de `runScripts`:
el pathname y el DOM ya son los nuevos. No se añade llamada directa: el evento
cubre la carga inicial. El listener del script se registra una única vez (el
módulo corre una vez por sesión), así que **no se acumula** el propio listener
de page-load.

### D3 — Guard de idempotencia SOLO en `initSearchLive`

Con re-init por page-load, `initSearchLive` añadiría un listener
`search:change` sobre `document` por cada visita a la portada (acumulación).
Fix: guard a nivel de módulo con el patrón de `search-escape.ts` — guardar el
manejador y `removeEventListener` antes de `addEventListener`. Los demás no
necesitan guard: `initSearchBar` e `initSearchResults` enganchan listeners
sobre elementos del DOM fresco (input, botones) que se descartan con cada
swap; `initSearchEscape` ya tiene su guard de re-init.

### D4 — Conservar los no-op seguros, sin guards nuevos

Las inits ya son no-ops en páginas sin su DOM; se conservan y **no** se
añaden guards nuevos salvo el D3 (justificado):

- `initSearchResults` sin `#search-index` → `readIndex()` null → return.
- `initSearchLive` sin `[data-search-live]` → return.
- `initSearchBar` sin `[data-search-bar]` → return.
- `initSearchEscape` root = `document` (siempre existe); `escapeContext` sin
  DOM de búsqueda → `'none'` → sin acciones.

Así, en rutas sin búsqueda (`/`, `/about`, `/posts/[id]`) el listener de
page-load dispara inits que retornan sin efecto ni error.

### D5 — Corregir el comentario falso de `search-escape.ts`

El comentario de cabecera de `initSearchEscape` (líneas 43-44: "View
transitions re-ejecutan los scripts del layout en cada navegación") es falso:
los módulos empaquetados no se re-ejecutan; la re-inicialización ahora es vía
`astro:page-load`. El guard de re-init se mantiene (sigue siendo necesario
porque la llamada puede repetirse por el evento) y el comentario declara el
mecanismo real.

### D6 — Ajuste de tests de inspección SOLO donde el fix cambia la forma de arranque

Precedente REQ-43-06: el artefacto de test sigue a la implementación real.
Los tests que asercionan la llamada directa (`initX()` en el `<script>`)
cambian a asercionar el listener `astro:page-load`. Cada ajuste se documenta
en la sección 5. `tests/root-term-search.test.mjs` (línea 152) llama a
`initSearchResults()` directamente como unit test con DOM fake: **no** cambia
(la función exportada sigue existiendo y siendo invocable).

## 5. Impacto en features 3-7/9 y sus tests

| Test | Feature | Aserción actual | Ajuste |
|------|---------|-----------------|--------|
| `tests/search-dedicated-view.test.mjs` (líneas 143-155, "REQ-03-02: el controlador se arranca…") | 3 | `component` matchea `/initSearchResults\(\)/` | Asercionar que el `<script>` registra el listener `astro:page-load` que invoca `initSearchResults` y que **no** hay llamada directa |
| `tests/search-bar-header.test.mjs` (líneas 250-258, "Decisión 1: …arranca el control") | 4 | `component` matchea `/initSearchBar\(/` | Idem: listener `astro:page-load` + `navigate` importado de `astro:transitions/client` |
| `tests/search-landing-live-transition.test.mjs` (líneas 306-313, "REQ-05-07: …arranca el controlador") | 5 | `component` matchea `/initSearchLive\(\)/` | Idem: listener `astro:page-load` |
| `tests/search-keyboard-escape.test.mjs` (líneas 306-313, "REQ-06-00: …arranca el controlador") | 6 | `component` matchea `/initSearchEscape\(\)/` | Idem: listener `astro:page-load`; además el unit test del comentario (si existe) verifica D5 |
| `tests/root-term-search.test.mjs` (línea 152) | 7 | Llamada directa `initSearchResults()` con DOM fake | **Sin cambios** (unit test de la función exportada, no del `<script>`) |

Además, el fix toca `search-live.ts` (guard D3) y `search-escape.ts` (comentario
D5): los tests unitarios existentes de esos módulos (que importan las funciones
exportadas) **no** cambian de contrato; `initSearchLive` mantiene firma y
comportamiento observable, solo deja de acumular listeners.

## 6. Riesgos

- **Listener de page-load duplicado**: no aplica — el módulo del `<script>` se
  ejecuta una vez por sesión; el listener se registra una vez. Riesgo mitigado
  por el propio mecanismo de Astro (D2).
- **Acumulación de `search:change` en el panel en vivo**: riesgo real sin D3;
  el guard module-level lo elimina. Verificable con test unitario que llama
  `initSearchLive` dos veces y cuenta listeners.
- **Regresión de tests de inspección**: los ajustes son acotados a la forma de
  arranque (D6); ninguna aserción de comportamiento (resultados, empty state,
  paginación, Escape) cambia.
- **Romper la carga inicial**: el evento `astro:page-load` cubre la carga
  inicial (listener `window load` del router); si no, la portada y /search en
  frío quedarían sin init — cubierto por REQ-10-05 y por la suite (tests que
  ejercitan los controladores).
- **≤100 líneas**: los cambios son ≤5 líneas por archivo; `search-live.ts`
  (99 líneas) crece ~4 líneas con el guard → se vigila el límite; si se acerca,
  se extrae el guard a una función helper de pocas líneas (no bloquea).

## 7. Verificación

- `node scripts/check-format.mjs` en verde (feature_list.json, specs 10_, progress).
- Suite completa `./init.sh` verde tras implementación (400+ tests).