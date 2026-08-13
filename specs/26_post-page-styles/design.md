# Diseño — post-page-styles

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La página de detalle
  `/posts/[id]` (`src/pages/posts/[id].astro`, 38 líneas, adaptada a
  `PostsRepository` en la feature 24). Hoy renderiza `main.post` →
  `article.post__content` con `h1.post__title`, `p.post__meta` (autor y min de
  lectura), `img.post__image` y `<section><Content /></section>` (contenido
  markdown) **sin ninguna hoja CSS**: el título, la meta y la imagen salen sin
  estilo (proporción natural — misma clase de problema que las cards de la
  feature 17) y el markdown hereda defaults del navegador.
- ¿Estado actual y estado deseado? Actual: página sin estilos propios (las
  clases `post__*` no tienen reglas). Deseado: hoja `src/styles/post.css`
  importada desde la página con el patrón del sitio (BEM ligero, tokens),
  imagen uniforme y tipografía legible del contenido markdown.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-text` | de tokens.css | Título y cuerpo del artículo |
| `--color-text-secondary` | de tokens.css | Meta (autor/min de lectura) |
| `--color-border` | de tokens.css | Borde de la imagen |
| `--color-accent` | de tokens.css | Enlaces del contenido |
| `--color-surface` | de tokens.css | Bloques de código del contenido |
| `--radius-card` | de tokens.css | Radio de la imagen |
| `--gap-card` | de tokens.css | Espaciado entre bloques |
| `--container-max` | de tokens.css | Ancho del contenedor |
| `--font-sans` | de tokens.css | Tipografía (heredada de body) |
| `--transition-default` | de tokens.css | Hover de enlaces |

Sin tokens nuevos (tokens.css está en 96/100 líneas; precedentes features 17
y 24). Tamaños tipográficos, interlineados, anchos de lectura y paddings son
literales del componente (precedente absoluto: latest-articles.css usa
font-size 0.9rem/1.35rem; about.css usa 2rem y paddings literales).
`scripts/audit-design-tokens.mjs` solo prohíbe hex/rgb()/rgba() → no afecta.

## Decisiones y constraints

- Decisión 1 (hoja propia): `post.css` sigue el patrón de `about.css` y
  `latest-articles.css`: BEM ligero sobre el bloque `post`, importada desde
  la página, ≤100 líneas, test estructural al estilo `tests/about-page.test.mjs`.
- Decisión 2 (tipografía del contenido): el markdown del `<Content />` pide
  estilo propio (sin él, encabezados/listas/enlaces/código usan defaults).
  Se estiliza con scoping bajo `.post__content` (h2/h3, p, ul/ol/li, a,
  code/pre y márgenes entre bloques) **sin tocar el marcado** de la página ni
  del contenido — el `<Content />` vive en `<section>` dentro de
  `.post__content`.
- Decisión 3 (imagen): bloque uniforme igual que la feature 17
  (REQ-17-02..05): width 100%, aspect-ratio 16/9, object-fit cover,
  `var(--radius-card)` + `var(--color-border)` + margen. El `alt={title}` y
  `transition:name` ya existen en la página y no se tocan.
- Decisión 4 (enlace a /posts): la reincorporación del enlace desde
  `latest-articles.astro` queda FUERA de alcance. Verificado: REQ-20-06 de la
  feature 20 eliminó el enlace al 404 de entonces y su test lo exige ausente;
  la ruta hoy existe pero la decisión de navegación pertenece al contrato del
  componente (`latest-articles.astro`), no a una feature de estilos de la
  página de detalle → si el usuario la pide, será feature propia.
- Decisión 5 (convenciones): solo el import de la hoja cambia en la página
  (38 → 39 líneas, ≤100 ✓). `tests/view-transitions.test.mjs` exige
  `transition:name` intactos, `<Layout>`, `prerender = true`, sin `<style>`:
  no se rompen (verificado, sus aserciones no prohíben imports CSS).
- Restricción del proyecto aplicable: estilos separados de la UI, tokens no
  valores sueltos (colores/radios/bordes/transiciones), ≤100 líneas, hoja por
  componente/página.

## Alternativa descartada

- Alternativa considerada: añadir tokens de tipografía (grupo `--text-*`,
  tamaños/interlineados) para la página de artículo.
- Motivo del descarte: tokens.css está en 96/100 líneas (precedentes 17/24 de
  NO añadir tokens sin permiso) y las hojas existentes ya usan literales
  tipográficos sin fricción con el auditor (solo colores son auditados).
- Alternativa considerada: reutilizar `latest-articles.css` para la página de
  detalle.
- Motivo del descarte: hoja por componente/página es el patrón canónico
  (arquitectura regla 7); el bloque `post` es distinto del bloque
  `latest-articles`.