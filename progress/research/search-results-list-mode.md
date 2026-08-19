# Análisis — Modo lista en los resultados de búsqueda (feature 9)

Fecha: 2026-08-18. Autor: spec_author.

## 1. Interpretación de la petición

Texto íntegro del humano:

> "en los resultados de búsqueda no queremos que salgan las tarjetas gigantes
> diseñate nuevos items para un modo lista atractivo, y que puedan navegar al
> detalle también"

Interpretación: los resultados de búsqueda actuales presentan tarjetas grandes
(grid de una columna con imagen 16:9 a ancho completo, título 1.35rem, padding
24×28px). El humano pide **rediseñar la presentación** a un **modo lista
atractivo**: items compactos en filas, bien diseñados, y que **sigan
navegando al detalle** del artículo (`/posts/[id]`).

Es una petición de **presentación** (UI), no de comportamiento: resultados,
empty state, guía, paginación y enlaces de detalle se conservan (contratos de
las features 3/5/7).

## 2. Superficie de cambio (lo que toca)

Presentación canónica (feature 3):

- `src/components/search-results/search-results.astro` — contenedor
  `div.search-results__grid[data-search-grid]` donde se pintan las tarjetas.
- `src/components/search-results/search-results-controller.ts` — `cardHtml`
  genera el HTML de cada tarjeta (imagen, título, meta, descripción, tags,
  enlace a `/posts/[id]`); `renderSearch` pinta en `[data-search-grid]`.
  **El archivo está exactamente en 100 líneas** (límite del arnés).
- `src/styles/search-results.css` — estilos del grid y de la tarjeta grande.

Consumidores de la presentación:

1. `src/pages/search.astro` (feature 3) — importa `SearchResults`.
2. `src/pages/[...term].astro` (feature 7) — importa `SearchResults`.
3. `src/components/search-live/search-live.astro` + `search-live.ts`
   (feature 5) — NO importa el componente pero **reutiliza** las clases
   `search-results.css` (`search-results__empty`, `search-results__grid`) y
   `cardHtml` para pintar el panel en vivo; enlace "ver todos" → `/search?q=`.

Tests que inspeccionan la presentación:

- `tests/search-dedicated-view.test.mjs` (REQ-03-04: cuadrícula de tarjetas;
  REQ-03-09: enlaces `/posts/[id]`; REQ-03-00: tokens permitidos de
  `search-results.css`).
- `tests/search-landing-live-transition.test.mjs` (REQ-05-04: el panel reutiliza
  `cardHtml` y `search-results.css`; importa `cardHtml` directamente del
  controlador).
- `tests/root-term-search.test.mjs` (REQ-07-06: tarjetas enlazan a
  `/posts/[id]`; DOM fake con selector `[data-search-grid]`).

## 3. Decisiones de diseño del modo lista

### D1. Estructura del item (fila compacta)

Cada resultado es una fila apilada en una columna única:

```
[thumbnail 112×63]  Título (enlace, stretched link a /posts/[id])
                    Por <autor> • <N> min de lectura
                    Descripción (máx. 2 líneas con clamp)
                    #tag1 #tag2 (píldoras pequeñas)
```

- **Contenedor**: `ul.search-results__list[data-search-list]` (semántica de
  lista, `list-style: none`, flex column). Sustituye al
  `div.search-results__grid[data-search-grid]`: el término "grid" ya no
  describe la presentación.
- **Item**: `li.search-results__item` con `display: flex; align-items: center;
  gap: var(--gap-card)`.
- **Miniatura**: `img.search-results__thumb` de 112×63 (16:9),
  `object-fit: cover`, borde `--color-border`. Mantiene el ancla visual del
  catálogo (ambos artículos tienen imagen) sin el peso de la tarjeta gigante.
- **Cuerpo**: `div.search-results__body` con `flex: 1; min-width: 0` (evita
  desbordes con títulos largos).
- **Título**: el enlace `a.search-results__link` (texto blanco, ~1.05rem).
  Con patrón **stretched link** (`::after` absoluto sobre el item,
  `position: relative` en el item) la fila entera navega al detalle con **un
  solo enlace accesible** (los tags son `span`, no hay interactivos anidados).
- **Meta**: autor • tiempo de lectura (mismo contenido que hoy; NO se añade la
  fecha: requeriría un formateador nuevo del `date` YYYY-MM-DD del índice y el
  presupuesto de líneas del controlador está al límite — el detalle completo
  vive en `/posts/[id]`).
- **Descripción**: con clamp a 2 líneas (`-webkit-line-clamp`), fila compacta
  y escaneable.
- **Tags**: píldoras pequeñas (padding 3px 10px, font 0.78rem) — los tags
  participan en la coincidencia de búsqueda, mostrarlos aporta contexto.

### D2. Separación entre items y estado hover

- **Separadores**: los items se apilan SIN caja individual (fondo transparente
  sobre `--color-background`) y se separan con `border-bottom: 1px solid
  var(--color-border)` (el último item sin borde). Esto lee inequívocamente
  como "lista" y ataca directamente el síntoma "tarjetas gigantes".
- **Hover**: la fila resalta con fondo `var(--color-surface)` y radio
  `var(--radius-card)` para suavizar la mancha, y el título se subraya
  (affordance clásica de lista). Transición `var(--transition-default)`.
- El focus del teclado conserva el outline nativo del navegador sobre el
  enlace (mismo nivel de accesibilidad que el resto del sitio; no se añaden
  estilos de focus propios en esta feature).

### D3. Responsive (≤768px)

En móvil la miniatura se oculta (las filas quedan como texto limpio: título +
meta + descripción + tags) y el padding de la fila se reduce. Mismo breakpoint
que la media query existente de `search-results.css`.

### D4. Tokens (solo tokens existentes + 1 nuevo justificado)

| Token | Uso |
|-------|-----|
| `--color-background` | Fondo de la página (los items no tienen caja) |
| `--color-surface` | Wash de hover de la fila |
| `--color-border` | Separadores entre filas, borde de miniatura |
| `--color-text` | Título del item |
| `--color-text-secondary` | Meta y mensajes secundarios |
| `--color-accent` | Tags en píldora |
| `--radius-card` | Radio del wash de hover de la fila |
| `--radius-pill` | Tags |
| `--radius-thumb` (**NUEVO, 10px**) | Radio de la miniatura |
| `--gap-card` | Gap entre miniatura y cuerpo |
| `--transition-default` | Hover |
| `--font-sans` | Tipografía |

**Justificación de `--radius-thumb: 10px`**: los radios existentes son
`--radius-card: 22px` y `--radius-pill: 999px`. Sobre una miniatura de
112×63px, 22px es un tercio del alto (se ve un blob casi circular) y el pill
es inaplicable. Un radio de 10px mantiene el lenguaje redondeado del sitio a
escala proporcional. `tokens.css` está en 87/100 líneas: añadir una línea no
supera el límite. El guardián `audit-design-tokens.mjs` no se ve afectado
(comprueba colores, no tokens).

### D5. Alternativa descartada

- **Mini-tarjetas compactas** (filas con caja individual: fondo surface, borde
  y gap entre ellas): es la misma familia visual que las tarjetas actuales
  solo que más pequeñas; no lee como "lista" y el humano pidió explícitamente
  dejar atrás las tarjetas.
- **Lista solo texto** (sin miniatura): pierde el ancla visual del catálogo y
  la fila queda plana; la miniatura pequeña es lo que hace el modo lista
  "atractivo" con poco coste.

## 4. Impacto en features 3/5/7 y sus tests

La presentación cambia por petición del humano; los contratos de
comportamiento se conservan: resultados, empty state, guía, paginación sin
recarga y enlaces `/posts/[id]` (REQ-03-05/06/08/09, REQ-05-04/05/06,
REQ-07-04/06/10). Precedente del arnés: **REQ-43-06** (fixture/test sigue al
dato real cuando el producto cambia por decisión del humano).

### 4.1 Cambios de código coherentes (todos en la feature 9)

1. `search-results.astro`: `div[data-search-grid]` → `ul[data-search-list]`.
2. `search-results-controller.ts`: `cardHtml` → `itemHtml` **extraído a un
   módulo nuevo** `src/components/search-results/item-html.ts` (junto con
   `esc`, que solo usa el generador). Motivo: el controlador está en **100/100
   líneas**; añadir el wrapper `li` + `div.search-results__body` al generador
   lo desbordaría. La extracción sigue la regla 12 (modularización estricta) y
   el precedente de `term-route.ts`. El controlador importa `itemHtml` y pinta
   en `[data-search-list]` (`toggle('grid')` → `toggle('list')`).
3. `search-results.css`: bloque de tarjeta grande → bloque de lista
   (`.search-results__list`, `__item`, `__thumb`, `__body`, `__link`,
   `__title`, `__meta`, `__description`, `__tags`, `__tag`) + media query
   ≤768px + reglas `[hidden]` actualizadas. Guía, empty state, clear y
   paginación **sin cambios**.
4. `search-live.astro`: `div[data-search-grid]` → `ul[data-search-list]`
   (mismas clases canónicas; REQ-05-04 exige la misma presentación).
5. `search-live.ts`: importa `itemHtml` desde `item-html.ts` (antes `cardHtml`
   del controlador) y pinta en `[data-search-list]`.

El panel en vivo **queda cubierto por la misma feature**: sin este cambio,
tras rediseñar la hoja canónica el panel pintaría `cardHtml` sin estilos y
REQ-05-04 quedaría roto. No es pulido opcional: es la consecuencia necesaria
del cambio canónico.

### 4.2 Cambios de tests y wording de features cerradas (justificados)

1. `tests/search-dedicated-view.test.mjs`: importa `itemHtml` de
   `item-html.ts`; aserciones de `cardHtml` → `itemHtml` (item `li`, thumb,
   título, meta, descripción, tags, enlace `/posts/[id]`); `data-search-grid`
   → `data-search-list`; lista de tokens permitidos de `search-results.css`
   añade `--radius-thumb`; el test de ≤100 líneas incluye `item-html.ts`.
2. `tests/search-landing-live-transition.test.mjs`: DOM fake de
   `applyLive` usa `[data-search-list]`; la inspección REQ-05-04 pasa a
   verificar el import de `itemHtml` desde el módulo de search-results y las
   clases `search-results__empty` + `search-results__list`.
3. `tests/root-term-search.test.mjs`: DOM fake usa `[data-search-list]`;
   REQ-07-06 (enlace `/posts/[id]`) se conserva tal cual en comportamiento.
4. `specs/03_search-dedicated-view/requirements.md`: REQ-03-04
   "cuadrícula de tarjetas" → "lista de items"; REQ-03-09 "cada tarjeta" →
   "cada item". El resto de REQ-03 no cambia (comportamiento).
5. `specs/07_root-term-search/requirements.md`: REQ-07-06 "cada tarjeta" →
   "cada item". El resto de REQ-07 no cambia.
6. `specs/05_search-landing-live-transition/requirements.md`: sin cambios
   (REQ-05-04 "misma presentación que la vista dedicada" sigue siendo válida
   textualmente).
7. `feature_list.json` (features 3 y 7, acceptance): "tarjetas de resultados /
   las tarjetas enlazan" → "items de resultados / los items enlazan". Solo
   wording de presentación; el comportamiento verificado (enlace
   `/posts/[id]`, paginación, título, empty state) es idéntico.

Los `description` de las features cerradas se conservan como registro
histórico (describen lo que se construyó en su ciclo).

## 5. Descomposición: una sola feature (id 9)

La sugerencia del líder era 1 feature central + evaluar el panel en vivo.
Decisión: **una única feature** `search-results-list-mode` (id 9):

- El problema es **uno solo**: rediseñar la presentación de resultados a modo
  lista. No hay capa de datos que separar (el dominio feature 2 no cambia).
- El panel en vivo comparte el mismo generador y las mismas clases
  (REQ-05-04): migrarlo en la misma feature es la consecuencia necesaria del
  cambio canónico, no una feature independiente.
- La suite exige coherencia al cierre: `search-landing-live-transition.test.mjs`
  importa `cardHtml` del controlador; renombrar el generador sin tocar ese
  test dejaría la suite roja, y cerrar con el panel roto dejaría el producto
  inconsistente. Un split en 2 features crearía un estado intermedio
  inválido, violando "cada feature es independiente y testeable por sí sola".
- Cumple `one_feature_at_a_time`: 1 sola entrada pending, implementer →
  reviewer sin encadenar ciclos.

## 6. Riesgos y trabas

- **Límite de 100 líneas del controlador**: mitigado con la extracción de
  `item-html.ts` (D4.1). Si el implementador detectara que el controlador
  sigue al límite, debe extraer más (p. ej. el bloque de render), nunca
  superar 100 líneas sin estado `blocked`.
- **Guardián de tokens**: `search-results.css` reescrita debe usar solo
  `var(--token)` y cero hex/rgba; el nuevo `--radius-thumb` se añade a
  `tokens.css` y se justifica en design.md.
- **Regla 7/8**: nada de `<style>` ni lógica en `.astro`; el frontmatter solo
  imports/datos.
- **REQ-05-04 regex**: el test de inspección que verifica el import de
  `search-results-controller.ts` desde `search-live.ts` cambia de objetivo
  (ahora `item-html.ts`) — la actualización del test es parte de la feature.

## 7. Fuera de alcance

- **Resaltado del término** en resultados: sigue fuera (nota del research de
  la feature 3; el modo lista no lo exige para ser atractivo).
- **Fecha en la meta** del item: fuera (D1; formateador nuevo no justificado
  para un catálogo de 2 artículos; el detalle vive en `/posts/[id]`).
- **Alternancia grid/lista** (toggle de vista): el humano pidió modo lista,
  no un selector de vistas. La lista sustituye al grid (REQ-09-01).
- **Datos/dominio**: `SearchIndexEntry`, `searchIndex`, `PAGE_SIZE` y
  repositorios no cambian.