# Diseño — Búsqueda por término en la raíz (feature 7)

## Contexto visual

- **Pantalla afectada**: nueva ruta catch-all en la raíz (`src/pages/[...term].astro`)
  que sirve la URL `/<término>` (p. ej. `/arquitectura`, `/typescript`,
  `/agilismo`). Hoy esas URLs responden 404.
- **Estado actual**: la búsqueda solo vive en `/search?q=<término>` (feature 3,
  prerendered, filtrado client-side sobre índice embebido) y en el live search
  de la portada (feature 5).
- **Estado deseado**: al cargar `/<término>`, el usuario ve los mismos
  resultados prefiltrados que con `/search?q=<término>` (misma presentación:
  `SearchResults` — guía, cuadrícula de tarjetas, empty state, paginación),
  con la URL slash+argumento compartible (deep linking). Sin coincidencias →
  empty state con el término (nunca 404).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| (reutilización completa) | — | La página reutiliza `search-results.css` y `search-results.astro` tal cual (tokens existentes: `--color-surface`, `--color-border`, `--color-text`, `--color-text-secondary`, `--color-accent`, `--radius-card`, `--gap-card`, `--transition-default`); no se añade CSS ni tokens nuevos |

## Decisiones y constraints

- **Decisión 1 — Forma de URL: catch-all en la raíz `/[...term]`, no `/search/[term]`**:
  el humano probó literalmente `http://localhost:4321/arquitectura` y pidió
  "slash lo que se busque slash :argumento /loquesea" (sin prefijo). Un
  `/search/[term]` dejaría `/arquitectura` en 404 y no cumpliría lo probado.
  La prioridad de rutas de Astro garantiza que las rutas estáticas (`/`,
  `/about`, `/search`) y las dinámicas más específicas (`/posts/[id]`, 2
  segmentos) ganan al catch-all (REQ-07-09) — verificado en la doc oficial
  (Routing: Route Priority Order).
- **Decisión 2 — On-demand SSR con precedente en el sitio**: el catch-all no es
  prerenderizable (términos arbitrarios no enumerables con getStaticPaths). Se
  sirve on-demand (`export const prerender = false`): el proyecto ya es
  `output: 'server'` con adapter Cloudflare (`prerenderEnvironment: 'workerd'`)
  y el único punto on-demand actual es HTB stats (`server:defer`, feature 20).
  `getCollection` está disponible en rutas SSR (patrón oficial de Astro:
  `prerender = false` + `getEntry`/`getCollection` en server mode) — se reabre
  la decisión D2 de `progress/research/global-search-landing.md`: el humano
  ahora exige la forma slash+arg, que solo el on-demand cumple en la raíz.
- **Decisión 3 — El documento no depende del término**: el frontmatter
  construye el índice embebido (PostsRepository + getCollection + buildSearchIndex,
  mismo patrón de `search.astro`) y el cliente extrae el término de
  `window.location.pathname` para filtrar (mecanismo client-side de la feature
  3, `search-results-controller.ts`). El servidor nunca filtra ni renderiza
  por término: con 2 artículos el coste por request es trivial y no rompe
  "node:fs solo en build" (getCollection en runtime usa el content layer
  empaquetado, no el filesystem).
- **Decisión 4 — Coexistencia con `/search?q=`**: la vista existente se
  conserva intacta (REQ-07-11); el controlador lee `q` si existe y, si no,
  deriva el término del pathname. Ambas formas producen los mismos resultados.
- **Decisión 5 — Limpiar en la ruta dinámica navega a la raíz**: la acción
  "Limpiar búsqueda" (patrón de la feature 3) no puede quitar un parámetro que
  no existe; en `/<término>` limpia = volver a `/` (portada). El comportamiento
  en `/search?q=` queda como está (REQ-03-08).
- **Decisión 6 — La barra de búsqueda NO se toca**: el Enter de la barra
  (feature 4) sigue navegando a `/search?q=`; cambiarlo tocaría la feature 4 y
  sus tests (REQ-04-05/06) sin necesidad. Se documenta como limitación
  conocida; la forma slash+arg es la URL directa compartible que el humano
  pidió, y ambas coexisten.
- **Restricción aplicable — datos vía repositorio**: la página obtiene el
  catálogo solo con `PostsRepository` + `buildSearchIndex`; jamás JSON directo
  desde el componente.
- **Restricción aplicable — ≤100 líneas por archivo**: la página replica el
  frontmatter corto de `search.astro`; la extracción del término se añade al
  controlador existente como función pura testeable.
- **Restricción aplicable — estilos separados de la UI**: sin `<style>`; se
  importa `search-results.css` existente.

## Alternativa descartada

- **Alternativa considerada 1**: ruta `/search/[term]` (bajo prefijo).
  **Motivo**: no cumple lo que el humano probó (`/arquitectura` sin prefijo
  seguiría en 404).
- **Alternativa considerada 2**: redirect/middleware de `/<término>` →
  `/search?q=<término>`.
  **Motivo**: la URL canónica visible dejaría de ser slash+arg (el humano pide
  esa forma compartible), y añade una pieza de infraestructura (middleware)
  sin precedente en el proyecto.
- **Alternativa considerada 3**: catch-all prerendered con getStaticPaths.
  **Motivo**: imposible para términos de usuario ilimitados (no enumerables).