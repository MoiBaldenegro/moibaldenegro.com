# Diseño — Botón de siguiente post en el detalle (feature 19)

> La feature 18 (`next-post-data`) no toca UI y no lleva `design.md`.
> Esta feature sí: añade un pie de navegación con botón en `posts/[id].astro`.

## Contexto visual

- Pantalla afectada: página de detalle `src/pages/posts/[id].astro` (ruta
  `/posts/[id]`, prerendered).
- Estado actual: hero (imagen + título + meta) seguido del cuerpo markdown;
  al terminar el artículo no hay ninguna recomendación de lectura.
- Estado deseado: pie de navegación bajo el contenido con un botón-enlace
  "Siguiente artículo →" hacia `post.next`; ausente cuando `next` es nulo
  (último artículo de la cadena).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | (existente) | Fondo del botón |
| `--color-surface` | (existente) | Texto del botón |
| `--radius-card` | (existente) | Radio del botón |
| `--gap-card` | (existente) | Separación del pie respecto al contenido |

## Decisiones y constraints

- Decisión 1: botón como `<a>` estático prerendered con `href={post.next}`;
  cero JS de runtime (estático por defecto, el detalle ya es prerendered).
- Decisión 2: hoja nueva `src/styles/post-next.css` importada por `[id].astro`
  (D4 del research): `post.css` está en 100/100 líneas y no se toca; scoping
  bajo `.post__next`.
- Decisión 3: destino solo desde la entidad `Post` vía `PostsRepository`
  (datos vía repositorio; la página jamás lee la colección directamente).
- Restricción aplicable: ≤100 líneas por archivo (`[id].astro` en 54,
  `post-next.css` nueva), sin tokens nuevos, sin dependencias, breakpoint
  móvil 768px.

## Alternativa descartada

- Alternativa considerada: ampliar `post.css` con las reglas del botón.
- Motivo del descarte: `post.css` está exactamente en 100 líneas; añadir una
  sola regla violaría la modularización estricta sin discusión previa.
