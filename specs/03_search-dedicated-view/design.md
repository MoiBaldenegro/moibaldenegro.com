# Diseño — Vista dedicada de búsqueda (feature 3)

## Contexto visual

- **Qué pantalla**: nueva página `/search?q=<término>` (`src/pages/search.astro`),
  prerendered, que muestra los resultados del catálogo de artículos.
- **Estado actual**: no existe la ruta; la búsqueda es inexistente en el sitio.
- **Estado deseado**: al cargar `/search?q=x` la página inicializa los
  resultados prefiltrados (deep linking); con `q` ausente muestra el estado
  inicial de búsqueda (guía/placeholder). Con coincidencias: cuadrícula de
  tarjetas con vista previa (imagen, título, meta, descripción, tags — mismo
  lenguaje visual que `latest-articles`). Sin coincidencias: empty state con
  el mensaje "No se encontraron resultados para '<término>'" y una acción para
  limpiar la búsqueda (elimina `q` y vuelve al estado inicial). Lista larga:
  paginación client-side con `PAGE_SIZE` constante del dominio.
- La página reutiliza `Layout.astro` (único layout, regla 11) y el título del
  documento incluye el término cuando `q` no está vacío (REQ-03-10).

## Tokens usados (solo tokens existentes de tokens.css)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#070716` | Fondo de la página (heredado del layout) |
| `--color-surface` | `#101018` | Fondo de tarjetas de resultado y del panel |
| `--color-border` | `rgba(255,255,255,.08)` | Bordes de tarjetas y del estado inicial |
| `--color-text` | `#ffffff` | Títulos y texto principal |
| `--color-text-secondary` | `#b8b8c5` | Meta, descripción y mensajes secundarios |
| `--color-accent` | `#7d68ff` | Acción de limpiar / enlace "ver todos" |
| `--radius-card` | `22px` | Radios de tarjetas de resultado |
| `--gap-card` | `14px` | Separación de la cuadrícula |
| `--transition-default` | `.28s cubic-bezier(.2,.8,.2,1)` | Hover y transiciones de estado |
| `--font-sans` | Inter… | Tipografía del sitio |

> No se añaden tokens nuevos en esta feature: el set existente cubre la vista.
> Si el implementador necesitara un token de espaciado adicional, hay margen
> en tokens.css (87/100 líneas) y debe justificarlo aquí.

## Decisiones y constraints

- Decisión 1 (forma de URL): `/search?q=<término>` con la página prerendered
  (`export const prerender = true`) y filtrado en el cliente sobre el índice
  embebido. Justificación completa en
  `progress/research/global-search-landing.md` (D1 y D2): coherente con el
  prerender-by-default del sitio; el deep linking se satisface porque el
  documento siempre trae el catálogo y el cliente filtra por `q` al iniciar.
- Decisión 2 (índice embebido): el frontmatter de la página compone
  `PostsRepository` + `getCollection('architecture')` y `buildSearchIndex`
  (feature 2) para serializar el índice como `<script type="application/json">`
  con `JSON.stringify` y escape de `</script` (`<\/script`). El filtrado en el
  cliente lee el índice y el parámetro `q` (URLSearchParams) sin recargar.
- Decisión 3 (componentes): se crea el componente de resultados
  `src/components/search-results/search-results.astro` (cuadrícula + empty
  state + paginación) con su hoja `src/styles/search-results.css`; es la
  presentación canónica de resultados y la feature 5 la reutiliza para el
  panel en vivo de la portada (REQ-05-04). Cada tarjeta enlaza a
  `/posts/${post.id}` (REQ-03-09). El controlador client-side es un módulo
  `.ts` separado (lógica fuera de la UI, regla 8; ≤100 líneas por archivo).
- Decisión 4 (JS de runtime): el filtrado por URL y la paginación sin recarga
  requieren JS de cliente. Excepción justificada a "estático por defecto"
  (regla 9), con precedentes aprobados (24, 43, 44) y documentada también en
  la feature 5 (REQ-05-07). Sin frameworks ni dependencias nuevas.
- Decisión 5 (estado inicial sin `q`): con `q` ausente la vista muestra la
  guía de búsqueda (placeholder sobre el catálogo), no una lista vacía —
  evita listar todo el catálogo sin consulta (REQ-03-03).
- Restricciones aplicables: estilos solo en `src/styles/*.css`, tokens sin
  valores sueltos, datos vía repositorio (la página usa `PostsRepository`,
  jamás JSON directo), ≤100 líneas por archivo, una página por archivo.

## Alternativa descartada

- Alternativa considerada: ruta `/search/[arg].astro` con SSR on-demand
  (render server-side por request en workerd) y `getStaticPaths` para
  términos conocidos.
- Motivo del descarte: los términos son ilimitados (getStaticPaths no puede
  enumerarlos); el SSR on-demand rompería el patrón prerender del sitio y
  exigiría acceso a la colección/markdown en runtime en Cloudflare
  ("node:fs solo en build"), y sería redundante porque el live search de la
  Landing (feature 5) exige el índice en el cliente de todas formas. El
  humano aceptó explícitamente la forma `?q=` en la petición.
