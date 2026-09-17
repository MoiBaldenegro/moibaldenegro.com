# Diseño — Lista de recomendados en el detalle (feature 21)

> La feature 20 (`related-posts-data`) no toca UI y no lleva `design.md`.
> Esta feature sí: añade la sección "Recomendados" en `posts/[id].astro`.

## Contexto visual

- Pantalla afectada: página de detalle `src/pages/posts/[id].astro` (ruta
  `/posts/[id]`, prerendered).
- Estado actual: hero (imagen + título + meta) seguido del cuerpo markdown y
  el pie `post__next` con el botón "Siguiente artículo" (ausente cuando `next`
  es nulo: el último artículo no recomienda nada).
- Estado deseado: sección bajo el contenido con encabezado "Recomendados" y
  una lista de enlaces hacia `post.related`; convive con el botón de siguiente
  cuando ambos existen y queda como única recomendación cuando `next` es nulo.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | (existente) | Acento de los enlaces de la lista |
| `--color-surface` | (existente) | Superficie si la lista usa fondo |
| `--radius-card` | (existente) | Radio de la sección de la lista |
| `--gap-card` | (existente) | Separación de la sección respecto al contenido |

## Decisiones y constraints

- Decisión 1: lista como `<ul>` estático prerendered con `href` de cada
  `post.related`; cero JS de runtime (estático por defecto, el detalle ya es
  prerendered).
- Decisión 2: estilos extendiendo `src/styles/post-next.css` importada por
  `[id].astro` (36 líneas, hay margen): `post.css` sigue en 100/100 líneas y
  no se toca (precedente D4 de la feature 19); scoping bajo `.post__related`.
- Decisión 3: destinos solo desde la entidad `Post` vía `PostsRepository`
  (datos vía repositorio; la página jamás lee la colección directamente).
- Restricción aplicable: ≤100 líneas por archivo (`[id].astro` en 60,
  `post-next.css` en 36), sin tokens nuevos, sin dependencias, breakpoint
  móvil 768px.

## Alternativa descartada

- Alternativa considerada: hoja nueva `src/styles/post-related.css` para la lista.
- Motivo del descarte: `post-next.css` tiene margen de sobra (36/100) y la
  lista vive en el mismo pie de navegación; una hoja nueva fragmenta sin
  necesidad los estilos del pie.
