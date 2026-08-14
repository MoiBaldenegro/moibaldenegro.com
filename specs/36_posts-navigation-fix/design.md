# Diseño — Arreglo de la navegación a los detalles de los artículos (feature 36)

## Contexto visual

- Componentes afectados: `src/components/latest-articles.astro` (cards de la
  portada), `src/pages/posts/[id].astro` (detalle), dominio `Post`.
- Estado actual: las cards no son enlaces; `post.id` no existe (los
  `transition:name` renderizan `img-undefined`/`title-undefined`); el detalle
  usa `entry.id` y empareja por índice.
- Estado deseado: cada card es navegable a `/posts/<id>` con el id real,
  estados hover/focus visibles y pares de transición coherentes
  (`img-<id>`/`title-<id>` en card y detalle). El slug queda expuesto en la
  entidad para uso futuro (ruta actual no cambia: `/posts/[id]` con
  `id = entry.id`, contrato REQ-24-05).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Uso |
|-------|-----|
| `--color-accent` / `--color-accent-hover` | estados del enlace del título |
| `--color-border` / `--color-border-strong` | borde de la card en reposo/hover |
| `--shadow-card-hover` | elevación de la card en hover |
| `--transition-default` | transiciones de hover/focus |
| `--radius-card` | radio del foco visible del enlace |
| `--gap-card` | márgenes internos de la card |

## Decisiones y constraints

- Decisión 1: la card mantiene el `article` semántico y el enlace envuelve
  imagen + título (`<a class="latest-articles__link" href={/posts/${post.id}}>`
  con la imagen y el `<h2>` dentro); meta, descripción y tags quedan fuera
  del enlace. Patrón accesible y simple, sin JS.
- Decisión 2: la ruta sigue siendo `/posts/[id]` con `id = entry.id`
  (REQ-24-05); el `slug` se expone en la entidad `Post` (REQ-36-01/02) pero no
  se usa en la URL todavía — quedará listo para routing por slug.
- Decisión 3: `getStaticPaths` empareja por id (mapa id → post) y lanza
  `PostsDataError` si un post no tiene entrada; se elimina el emparejado por
  índice (`posts[index]`), que es una desalineación silenciosa.
- Decisión 4: hover de la card = borde acento + `--shadow-card-hover`;
  `:focus-visible` con anillo acento (mismo patrón que la feature 37).
- Restricciones: estilos solo en `src/styles/latest-articles.css` (ya
  importada), sin `style=` inline, ≤100 líneas por archivo, sin hex/rgba
  sueltos (guard de la feature 12), `transition:name` intactos en el primer
  `<img>` y primer `<h2>` (regex REQ-24-03).

## Alternativa descartada

- Alternativa considerada: enlace «stretched link» con `::after` cubriendo
  toda la card (patrón común).
- Motivo del descarte: complica el marcado con pseudo-elementos solapados,
  interfiere con la selección de texto de meta/descripción/tags y añade CSS
  frágil; el enlace explícito sobre imagen+título es más simple, semántico y
  testeable.
