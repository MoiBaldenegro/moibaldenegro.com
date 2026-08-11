# Diseño — articles-ui-refactor

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La sección de artículos (`src/components/latest-articles.astro`) bajo el hero en la portada.
- ¿Estado actual y estado deseado? Actual: el componente llama a `getCollection('architecture')` directamente (acceso a datos en la UI) y no tiene estilos propios (los artículos se renderizan como lista plana sin estilo). Deseado: el componente consume `PostsRepository` (feature 7), el frontmatter solo importa y pasa datos, y la sección tiene su hoja `src/styles/latest-articles.css` con tokens (tarjeta de artículo con título, autor, tiempo de lectura, descripción y tags).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | de tokens.css | Fondo de cada tarjeta de artículo |
| `--color-text` | de tokens.css | Título del artículo |
| `--color-text-secondary` | de tokens.css | Metadatos del artículo |
| `--color-border` | de tokens.css | Borde de tarjetas |
| `--color-accent` | de tokens.css | Tags |
| `--radius-card` | de tokens.css | Radios |
| `--gap-card` | de tokens.css | Espaciado de la lista |
| `--transition-default` | de tokens.css | Transiciones |

## Decisiones y constraints

- Decisión 1: `latest-articles.astro` obtiene los artículos vía `PostsRepository` y mapea las entidades `Post` a marcado semántico (article, h2, p, span); cero lógica en el frontmatter.
- Decisión 2: la hoja `latest-articles.css` sigue el mismo patrón BEM ligero del resto del sitio y consume solo tokens.
- Decisión 3: el test `tests/articles-ui-refactor.test.mjs` verifica que el componente no importa `astro:content` y que la hoja respeta límites.
- Restricción del proyecto aplicable: datos vía repositorio, estilos separados de la UI, ≤100 líneas por archivo y tokens, no valores sueltos.

## Alternativa descartada

- Alternativa considerada: dejar `getCollection` en el componente y solo añadir estilos.
- Motivo del descarte: viola "Datos vía repositorio" (la UI no debe acceder a la fuente de datos) y dificulta testear la capa de datos.
