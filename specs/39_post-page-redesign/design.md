# Diseño — Rediseño de la página de detalle de artículo (feature 39)

## Contexto visual

- Pantalla afectada: detalle de artículo `src/pages/posts/[id].astro`
  (estilos en `src/styles/post.css`, feature 26).
- Estado actual: (1) el contenido vive en una columna de `max-width: 760px`
  centrada dentro del contenedor de `min(var(--container-max), 95%)`
  (1500px) — el humano lo percibe "delgado"; (2) el header es `h1` → `p` →
  `img` apilados sin jerarquía ni fondo.
- Estado deseado (petición del humano, ciclo 31): (1) el contenido ocupa el
  mismo ancho que la página (ancho completo del contenedor); (2) un header
  vistoso que integre imagen y título con la identidad dark/glow del sitio.

## Decisión de ancho (trade-off documentado)

- Decisión: el contenido ocupa el ancho completo del contenedor
  (`min(var(--container-max), 95%)`, el mismo de la página). Se elimina
  `max-width: 760px; margin: auto` de `.post__content`.
- Trade-off: en pantallas ≥1600px las líneas llegan a ~140 caracteres (vs.
  ~66 a 760px). Mitigación: se conserva `line-height: 1.7`, espaciado
  vertical generoso y `pre` con `overflow-x: auto`. Análisis completo en
  `progress/research/rediseno-detalle-post-ciclo31.md` (§2).
- Escalado futuro (fuera de esta feature): si el humano lo prefiere tras
  verlo, un token `--reading-max` (~1100px) en un ciclo posterior.

## Estructura del header (propuesta)

```html
<main class="post">
  <header class="post__hero">
    <img class="post__image" transition:name={`img-${entry.id}`}
         src={`/assets/content/${img}`} alt={title} />
    <div class="post__hero-copy">
      <h1 class="post__title" transition:name={`title-${entry.id}`}>{title}</h1>
      <p class="post__meta">Por {author} • {readtime} min de lectura</p>
    </div>
  </header>
  <article class="post__content">
    <section><Content /></section>
  </article>
</main>
```

## Tokens usados (solo de los tokens del diseño del proyecto; sin tokens nuevos)

| Token | Uso |
|-------|-----|
| `--color-hero-top` / `--color-hero-mid` / `--color-hero-bottom` | degradado de fondo del panel hero |
| `--color-glow` | resplandor decorativo del panel (pseudo-elemento) |
| `--color-text` / `--color-text-secondary` | título del post y meta |
| `--color-surface` | fondo de la píldora de la meta (color-mix) |
| `--color-border-strong` | borde del panel y de la píldora |
| `--radius-card` | radio del panel |
| `--radius-pill` | píldora de la meta |
| `--shadow-card` | elevación del panel |
| `--gap-card` | espaciados internos del panel |
| `--container-max` | ancho del contenedor y del contenido |
| `--font-sans` / `--transition-default` | tipografía y transiciones |

Los degradados usan `color-mix(in srgb, var(--...), transparent)` (precedente
`hero-section.css`) para no introducir hex/rgba sueltos.

## Decisiones y constraints

- Decisión 1 (ancho): `.post__content` pierde `max-width: 760px` y
  `margin: auto`; el artículo ocupa el ancho completo del contenedor
  (REQ-39-01). El `section` con `<Content />` hereda el ancho.
- Decisión 2 (layout del header): panel hero con la imagen como tarjeta y el
  bloque título+meta debajo DENTRO del panel (no overlay sobre la imagen).
  Motivo: conserva íntegra la regla `.post__image` (contrato REQ-26-04:
  borde/radio/margen en la imagen) y evita títulos largos recortados.
- Decisión 3 (hoja nueva): los estilos del panel van en
  `src/styles/post-header.css` (post.css está en 99 líneas; añadir ahí
  superaría el límite). post.css conserva `.post`, `.post__title`,
  `.post__meta`, `.post__image` y la tipografía scoping bajo
  `.post__content` (contrato REQ-26-03 exige esas reglas en post.css).
- Decisión 4 (transiciones): el primer `<img>` y el primer `<h1>` del archivo
  conservan los pares `transition:name` con `entry.id` (REQ-24-03/05). No se
  añaden imágenes ni encabezados antes que ellos en la página.
- Decisión 5 (meta píldora): `.post__meta` se estiliza como píldora
  (`display: inline-flex`, `var(--radius-pill)`, fondo con color-mix de
  `--color-surface`, borde `--color-border-strong`) dentro del panel.
- Decisión 6 (responsive): media query 768px — título más pequeño y paddings
  del panel reducidos; post.css mantiene su media query de tipografía.
- Restricciones: estilos solo en `src/styles/` (sin `<style>` en el .astro,
  sin `style=` inline), ≤100 líneas por archivo, sin hex/rgba sueltos, sin
  tokens nuevos (REQ-26-07 fija tokens.css en 87 líneas), sin JS de runtime.
- Tests: los existentes (`post-page-styles` REQ-26-02..07 y
  `view-transitions` REQ-24-05) se conservan SIN modificaciones; se añade
  `tests/post-header.test.mjs` (test-first) con el contrato del header.

## Alternativa descartada

- Alternativa 1: ancho de lectura intermedio (~1000-1100px). Mejor
  legibilidad, pero infiel a la petición literal ("el mismo ancho de la
  página"); queda documentado como escalado futuro.
- Alternativa 2: overlay del título sobre la imagen (estilo cover).
  Más dramático, pero obligaría a cambiar REQ-26-04 (borde/radio/margen
  pasarían del `<img>` al contenedor) y arriesga títulos largos sobre la
  imagen; el panel con imagen enmarcada logra el impacto sin tocar tests.
- Alternativa 3: título fuera del panel (solo imagen enmarcada). No integra
  imagen y título, que es justo lo que pide el humano.
