# Diseño — latest-articles-restore

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La sección de artículos de la portada (`src/components/latest-articles.astro`) bajo el hero.
- ¿Estado actual y estado deseado? Actual: el componente reescrito manualmente consume entradas crudas (`post.data.img`, `post.data.title`), sin marcado semántico de la feature 10 (span con autor/tags/tiempo), sin `alt={post.title}` ni `loading="lazy"` de la feature 17, con un enlace muerto a `/posts/${post.id}` (ruta inexistente, 404) y atributos `transition:name` sin amparo. Deseado: el estado canónico de las features 10+17 — el componente obtiene `Post[]` de `PostsRepository` y mapea a marcado semántico (article/h2/p/span con título, autor, tiempo de lectura, descripción y tags), con la imagen estilizada (`latest-articles__image`, `post.img`, `alt={post.title}`, `loading="lazy"`).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-card` | de tokens.css | Radio de la imagen (regla existente de la feature 17) |
| `--color-border` | de tokens.css | Borde de la imagen (regla existente de la feature 17) |
| `--gap-card` | de tokens.css | Margen vertical de la imagen (regla existente de la feature 17) |

> La hoja `src/styles/latest-articles.css` (75 líneas) **no se toca**: ya
> consume los 8 tokens del design de la feature 10 y la regla
> `.latest-articles__image` de la feature 17. tokens.css conserva 96/100
> líneas; esta feature no añade tokens.

## Decisiones y constraints

- Decisión 1 (origen de datos): el componente vuelve a `new PostsRepository().getPosts()` (loader default con astro:content) — REQ-10-01/04; el frontmatter solo importa e interpola.
- Decisión 2 (marcado): se restaura el marcado de la feature 10 (Decisión 1 de `specs/10_articles-ui-refactor/design.md`): `<article>` con `<h2>` (título), `<p>` (meta: autor • `readtime min de lectura`), `<p>` (descripción) y `<div>` de tags con `<span>` por tag; y el `<img>` de la feature 17 con `class="latest-articles__image"`, `src={`/assets/content/${post.img}`}`, `alt={post.title}` y `loading="lazy"`.
- Decisión 3 (enlace muerto): se elimina el `<a href={`/posts/${post.id}`}>` — la ruta `/posts/` no existe en `src/pages/` (solo `index.astro` y `about.astro`); un enlace a 404 es un bug, no contenido.
- Decisión 4 (transiciones): se eliminan los atributos `transition:name` del componente reescrito. El mecanismo de View Transitions se canaliza como feature aparte (24) con spec/design/tests: reincorporará los atributos según SU diseño; la restauración no debe mezclar ambos problemas.
- Decisión 5 (estilos intactos): `latest-articles.css` se conserva tal cual (regla de imagen incluida); el test de la feature 17 (REQ-17-01..09) vuelve a verde y el líder podrá cerrar la feature 17 (in_progress) con revisión. Esta feature no toca su status ni los tokens.
- Restricciones del proyecto aplicables: datos vía repositorio, lógica separada de la UI (cero lógica en el frontmatter), estilos separados (sin `<style>` ni atributos style), ≤100 líneas por archivo, tokens sin valores sueltos.

## Alternativa descartada

- Alternativa considerada: conservar el enlace a `/posts/${post.id}` y los `transition:name` del componente reescrito, adaptando solo las interpolaciones a la entidad.
- Motivo del descarte: mezcla dos problemas (restauración del contrato vs mecanismo de transiciones sin spec), mantiene un enlace roto y deja JS/atributos de runtime fuera del arnés — la feature 24 los canaliza por separado.