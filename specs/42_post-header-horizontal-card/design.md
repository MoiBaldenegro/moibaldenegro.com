# Diseño — Header de post como tarjeta horizontal (feature 42)

## Contexto visual

- Pantalla afectada: header de la página de detalle de artículo
  `src/pages/posts/[id].astro` (estilos en `src/styles/post-header.css`,
  feature 39).
- Estado actual: panel hero VERTICAL — imagen full-width arriba (16:9) y copia
  (título + meta píldora) debajo, dentro del panel con degradado hero + glow.
  El humano lo percibe "prácticamente igual" a las cards de la portada
  (`latest-articles__card`: imagen + título apilados).
- Estado deseado (petición del humano, ciclo 34): "la tarjeta como en
  horizontal, un diseño más atrevido" — imagen a un lado y copia al otro,
  con acentos de la identidad dark/glow del sitio (tokens `--color-accent`,
  `--color-glow`, `--color-hero-*`).

## Estructura final del header (marcado)

```html
<header class="post__hero">
  <img transition:name={`img-${entry.id}`} src={`/assets/content/${img}`} alt={title} class="post__image" />
  <div class="post__hero-copy">
    <p class="post__kicker">#{post.tags[0]}</p>
    <h1 transition:name={`title-${entry.id}`} class="post__title">{title}</h1>
    <p class="post__meta">Por {author} • {readtime} min de lectura</p>
  </div>
</header>
```

- El orden DOM conserva imagen → copia (REQ-39-02 literal: aserción de índice
  del test). El grid coloca la imagen en la columna 1 (izquierda).
- `post.tags[0]` se renderiza directo desde la entidad (el schema ya entrega
  `tags` como array de strings sin `#`; la card de portada usa el mismo
  patrón `#{tag}`). Cero cambios de frontmatter.
- El kicker es `<p>` obligatoriamente: un `<div>` anidado dentro de
  `.post__hero-copy` rompería el regex lazy de REQ-39-02.

## CSS propuesto (post-header.css, ~70 líneas; post.css NO se toca)

```css
.post__hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 32px;
  padding: 32px;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-card);
  background: linear-gradient(160deg, var(--color-hero-top) 0%, var(--color-hero-mid) 45%, var(--color-hero-bottom) 100%),
              radial-gradient(circle at 78% 0%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 55%);
  font-family: var(--font-sans);
  margin: 0 0 32px;
}

.post__hero::before { /* glow existente, intacto (REQ-39-02) */
  content: "";
  position: absolute;
  width: 640px;
  height: 640px;
  top: -260px;
  right: -160px;
  border-radius: var(--radius-pill);
  background: radial-gradient(circle, var(--color-glow), transparent 70%);
  pointer-events: none;
}

.post__hero::after { /* acento inferior */
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-accent), transparent 70%);
  pointer-events: none;
}

.post__hero .post__image {
  margin: 0;
  aspect-ratio: 4 / 3;
  border-color: var(--color-border-strong);
  box-shadow: 0 0 48px var(--color-glow);
}

.post__hero-copy {
  position: relative;
  padding: 0;
}

.post__kicker {
  display: inline-flex;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  padding: 4px 14px;
  margin: 0 0 14px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post__hero .post__title {
  font-size: clamp(2.2rem, 4.5vw, 3.6rem);
  line-height: 1.15;
  margin: 0 0 18px;
  text-wrap: balance;
  text-shadow: 0 0 32px var(--color-glow);
}

.post__meta { /* píldora existente, intacta (REQ-39-04) */
  display: inline-flex;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  border: 1px solid var(--color-border-strong);
  padding: 6px 14px;
}

@media (max-width: 768px) { /* apilado */
  .post__hero {
    grid-template-columns: 1fr;
    gap: var(--gap-card);
    padding: 20px;
  }
  .post__hero .post__image { aspect-ratio: 16 / 9; }
  .post__kicker { padding: 3px 10px; font-size: 0.75rem; }
  .post__meta { padding: 4px 10px; }
}
```

## Tokens usados (solo de los tokens del diseño del proyecto; sin tokens nuevos)

| Token | Uso |
|-------|-----|
| `--color-hero-top` / `--color-hero-mid` / `--color-hero-bottom` | degradado de fondo del panel (layer 1) |
| `--color-glow` | glow de `::before`, halo de la imagen y text-shadow del título |
| `--color-accent` | wash radial del panel (layer 2), kicker (color/borde/fondo color-mix) y acento inferior de `::after` |
| `--color-border-strong` | borde del panel, borde de la imagen en hero y borde de la píldora de meta |
| `--color-surface` | fondo de la píldora de la meta (color-mix) |
| `--radius-card` | radio del panel y de la imagen |
| `--radius-pill` | kicker y píldora de la meta |
| `--shadow-card` | elevación del panel |
| `--gap-card` | espaciados internos y gap del apilado móvil |
| `--font-sans` | tipografía del panel |

Los degradados y fondos usan `color-mix(in srgb, var(--...), transparent)`
(precedente `hero-section.css`) para no introducir hex/rgba sueltos.

## Decisiones y constraints

- Decisión 1 (layout): `.post__hero` pasa a `display: grid` con
  `grid-template-columns: 1fr 1fr`, `align-items: center` y `gap: 32px`.
  La imagen (DOM primero, REQ-39-02) ocupa la columna 1; la copia la columna
  2. La regla base `.post__image` de post.css (contrato REQ-26-04: width 100%,
  16:9, borde/radio/margen) NO se toca: el grid acota el ancho a la columna y
  `.post__hero .post__image` (especificidad mayor, en post-header.css) ajusta
  margen, proporción y acentos.
- Decisión 2 (kicker): `<p class="post__kicker">#{post.tags[0]}</p>` — primera
  etiqueta del artículo como píldora de acento (precedente de
  `latest-articles__tag`, en versión hero). Sin fallback: el schema garantiza
  array de strings y los posts actuales tienen 3 tags (verificado).
- Decisión 3 (título): `.post__hero .post__title` escala con
  `clamp(2.2rem, 4.5vw, 3.6rem)` (tipografía literal, precedente feature 40),
  con `text-wrap: balance` y glow sutil con `--color-glow`.
- Decisión 4 (imagen): `aspect-ratio: 4 / 3` en desktop (más presencia que el
  16:9 de las cards; el morph de View Transitions anima la proporción) y
  `box-shadow: 0 0 48px var(--color-glow)`.
- Decisión 5 (acentos del panel): wash radial de acento como SEGUNDO layer
  del `background` (el primero debe seguir siendo el linear-gradient con
  `var(--color-hero-*` — contrato REQ-39-02/03) y línea inferior degradada de
  acento en `::after`.
- Decisión 6 (responsive): en ≤768px la tarjeta se apila en una columna
  (`grid-template-columns: 1fr`), imagen 16:9 arriba y copia debajo; la media
  query conserva la regla `.post__hero` (REQ-39-07).
- Restricciones duras:
  - post-header.css ≤100 líneas, sin hex/rgba sueltos (audit-design-tokens).
  - Guard REQ-39-09: TODA declaración de {color, background, background-color,
    border, border-color, border-radius, box-shadow, transition} debe
    contener `var(--`. PROHIBIDO `box-shadow: none`, `border: none`,
    `color: inherit` o literales de color en la hoja (incluida la media
    query).
  - Sin tokens nuevos: tokens.css permanece en 87 líneas (REQ-26-07/39-09).
  - Sin `<style>` en el .astro, sin `style=` inline, sin JS de runtime,
    prerender true, página ≤100 líneas.
  - El primer `<img>` y el primer `<h1>` conservan los pares
    `img-${entry.id}` / `title-${entry.id}` (REQ-24-03/05, REQ-42-08).
- Tests: los existentes (`post-header` REQ-39-01..09, `post-page-styles`
  REQ-26-02..07, `view-transitions` REQ-24-03/05, `post-readability`
  REQ-40/41, `design-tokens`) se conservan SIN modificaciones; se añade
  `tests/post-header-horizontal.test.mjs` (test-first) con el contrato de la
  tarjeta horizontal (REQ-42-01..09, lista completa en el research del
  ciclo 34 §5).

## Alternativa descartada

- Alternativa 1: copia a la izquierda e imagen a la derecha con
  `flex-direction: row-reverse`. Visualmente válida, pero exige mantener el
  DOM imagen → copia (REQ-39-02) y el row-reverse añade una capa de lectura
  invertida sin beneficio sobre el orden editorial natural.
- Alternativa 2: overlay del título sobre la imagen (cover). Ya descartada en
  la feature 39 (recorta títulos largos y obligaría a cambiar REQ-26-04).
- Alternativa 3: solo maquillar el panel vertical (más glow, más padding).
  No responde a la petición literal de "tarjeta horizontal".
- Alternativa 4: kicker estático "Artículo". Más seguro pero menos personal;
  la primera tag del post (datos ya existentes) diferencia cada header.
- Alternativa 5: hoja nueva `post-header-horizontal.css`. Innecesaria:
  post-header.css pasa de 48 a ~70 líneas, lejos del tope de 100, y añadir
  una hoja tocaría el contrato de orden de imports (REQ-40-01).