# Header de post como tarjeta horizontal — ciclo 34

> Fecha: 2026-08-14. Rol: spec_author. Petición del humano sobre el header de
> `src/pages/posts/[id].astro`: "quiero que cambies los estilos del header de
> los post porque los hiciste prácticamente igual, la imagen con el título;
> pon aquí la tarjeta como en horizontal, un diseño más atrevido". Documenta
> hallazgos, propuesta visual, decisiones, trade-offs, tests afectados y
> riesgos. No implementa nada.

## 1. Qué es y qué toca

- Ruta: `src/pages/posts/[id].astro` (52 líneas): `main.post` >
  `header.post__hero` > `img.post__image` (transition:name `img-${entry.id}`)
  + `div.post__hero-copy` > `h1.post__title` (transition:name
  `title-${entry.id}`) + `p.post__meta`; luego `article.post__content` >
  `section.post__body` > `<Content />`. Frontmatter sin cambios necesarios.
- Estilos: `src/styles/post-header.css` (48 líneas, feature 39) y
  `src/styles/post.css` (100 líneas, features 26/39, NO se toca).
- Datos disponibles sin tocar nada: la entidad `Post` ya expone
  `tags: readonly string[]` (schema de `src/content.config.ts`: el string
  `"#a #b #c"` se transforma a `["a","b","c"]`, sin `#`, con
  `.replace(/^#/, "").trim()` y `filter(Boolean)`). Los dos posts actuales
  tienen 3 tags cada uno: `tags[0]` es seguro.
- Tokens disponibles (tokens.css, 87 líneas, estado canónico REQ-26-07/39-09,
  sin tokens nuevos permitidos): `--color-hero-top/mid/bottom`,
  `--color-glow`, `--color-accent`, `--color-accent-hover`, `--color-surface`,
  `--color-text(-secondary)`, `--color-border(-strong)`, `--radius-card`,
  `--radius-pill`, `--gap-card`, `--shadow-card`, `--transition-default`,
  `--font-sans`, `--container-max`.
- El layout actual es VERTICAL: imagen full-width arriba y copia debajo
  dentro del panel — estructuralmente igual a las cards de
  `latest-articles.astro` (imagen + título apilados), que es lo que el humano
  percibe como "prácticamente igual".

## 2. Restricciones y contratos verificados en disco (regla a regla)

### tests/post-header.test.mjs (feature 39, REQ-39-01..09) — se conserva SIN cambios

- REQ-39-01: post.css `.post__content` sin max-width y `.post` con
  `var(--container-max)` — no se toca post.css → pasa.
- REQ-39-02: `<header class="post__hero">[\s\S]*?<\/header>` (lazy) debe
  contener `img.post__image` ANTES de `class="post__hero-copy"`; el div de
  copia debe contener `h1.post__title` y `p.post__meta`. Implicaciones del
  nuevo marcado: (a) el orden DOM imagen → copia se conserva; (b) NO pueden
  añadirse `<div>` anidados dentro de `post__hero-copy` (el regex lazy
  `[\s\S]*?<\/div>` cortaría en el primer cierre anidado); los nuevos
  elementos van como `<p>`/`<span>`; (c) no puede haber `</header>` antes.
- REQ-39-02/03: primer match de `\.post__hero\s*\{` en post-header.css debe
  contener `background:\s*(linear-gradient|radial-gradient)[^;]*var\(--color-hero-`,
  `border-radius: var(--radius-card)`, `border:...var(--color-border-strong)`,
  `box-shadow: var(--shadow-card)`; `\.post__hero::before` debe contener
  `var(--color-glow)`. Implicación: la regla base `.post__hero {` debe
  declararse ANTES que cualquier regla descendente y antes de la media query;
  si se añade un segundo gradiente de acento al `background`, el primero debe
  ser el `linear-gradient` con tokens hero (el `[^;]*` corta en el primer
  `;`).
- REQ-39-04: `.post__meta` (primer match en post-header.css) debe conservar
  `display: inline-flex`, `var(--radius-pill)`, `color-mix(...var(--color-surface)`,
  `var(--color-border-strong)` — la píldora se conserva íntegra.
- REQ-39-05: primer `<h1>` y primer `<img>` con `transition:name` de
  `entry.id` — el kicker es `<p>`, no altera el orden.
- REQ-39-06: la página importa post-header.css; post-header.css ≤100 líneas
  (hoy 48; la propuesta ~70) y post.css ≤100 (intacto).
- REQ-39-07: la media query 768px de post-header.css debe contener
  `.post__hero` — se conserva y extiende.
- REQ-39-08: `main.post` y `article.post__content` presentes.
- REQ-39-09 (guard fuerte): tokens.css en 87 líneas sin `--post-`; y el test
  de var() recorre TODAS las declaraciones de post-header.css: para las
  props {color, background, background-color, border, border-color,
  border-radius, box-shadow, transition} TODA línea debe contener `var(--`.
  **Trampa detectada**: `box-shadow: none` o `border: none` o `color:
  inherit` en la hoja HACEN FALLAR el test → la media query no debe resetear
  sombras/bordes con literales.

### tests/post-page-styles.test.mjs (feature 26, REQ-26-02..07) — se conserva SIN cambios

- REQ-26-03/04: la regla BASE `.post__image` de post.css debe conservar
  `width: 100%`, `aspect-ratio: 16/9`, `object-fit: cover`,
  `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border)`,
  `margin: var(--gap-card)`, `display: block`. **Decisión estructural**: la
  imagen del hero NO cambia su ancho en post.css; en el layout horizontal el
  grid de `.post__hero` (2 columnas) hace que `width: 100%` de la imagen llene
  su columna (~50% del panel). Solo se sobrescribe en post-header.css con
  `.post__hero .post__image` (especificidad mayor) para `margin`, `aspect-ratio`
  y acentos — contrato REQ-26-04 intacto.

### tests/view-transitions.test.mjs (feature 24, REQ-24-03/05) — se conserva SIN cambios

- Primer `<h1>` y primer `<img>` de la página con los pares `title-${entry.id}`
  / `img-${entry.id}`: no se añaden h1/img antes; el kicker es `<p>`.
- Convenciones: página ≤100 líneas (pasa de 52 a ~53), sin `<style>`, sin
  `style=`, prerender true, Layout único.

### tests/post-readability.test.mjs (features 40/41) — se conserva SIN cambios

- Orden de imports: post.css < post-header.css < post-readability.css
  (indexOf). No se añade ninguna hoja ni se reordena; solo cambia el contenido
  de post-header.css y una línea del marcado.
- `section.post__body` envuelve `<Content />` — intacto.

### scripts/audit-design-tokens.mjs

- Ninguna hoja de src/styles puede contener hex/rgba: todos los acentos
  nuevos usan `var(--color-accent)` y `color-mix(in srgb, var(--...),
  transparent)` (precedente hero-section.css). `color-mix(in srgb, ...)` no
  dispara `rgba?\(` (comprueba "srgb" seguido de coma).

## 3. Propuesta visual — tarjeta horizontal "atrevida" (solo tokens existentes)

### Marcado final de [id].astro (solo se añade el kicker; el resto intacto)

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

- `post.tags[0]` se usa directo en la plantilla: cero cambios de frontmatter.
- DOM: imagen → copia (REQ-39-02 literal). Visual: columna 1 = imagen (izq),
  columna 2 = copia (der) — orden de lectura editorial.

### CSS concreto en post-header.css (~70 líneas, ≤100)

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

.post__hero::before {  /* glow existente, intacto (REQ-39-02) */
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

.post__hero::after {  /* acento inferior: firma "atrevida" con --color-accent */
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

.post__meta {  /* píldora existente, intacta (REQ-39-04) */
  display: inline-flex;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  border: 1px solid var(--color-border-strong);
  padding: 6px 14px;
}

@media (max-width: 768px) {  /* apilado: imagen arriba, copia abajo */
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

### Elementos "atrevidos" (todos con tokens existentes)

1. **Horizontalidad**: grid de 2 columnas dentro del panel (imagen izq ~50%,
   copia der ~50%, gap 32px, alineación centrada vertical).
2. **Kicker de etiqueta**: píldora con `--color-accent` (color, borde y fondo
   color-mix al 12%) con la primera tag del post — precedente visual de
   `latest-articles__tag` pero en versión hero.
3. **Título gigante con glow**: `clamp(2.2rem, 4.5vw, 3.6rem)` +
   `text-shadow` con `--color-glow` + `text-wrap: balance` (precedente
   feature 40).
4. **Imagen 4:3 con halo**: `aspect-ratio: 4 / 3` (más presencia que el 16:9
   de las cards) + `box-shadow: 0 0 48px var(--color-glow)` + borde fuerte
   `--color-border-strong`.
5. **Doble acento del panel**: wash radial de `--color-accent` al 22% en la
   esquina superior derecha (refuerza el glow existente) + línea inferior
   degradada de `--color-accent` a transparente (firma del header).
6. Responsive ≤768px: apilado en una columna con la imagen 16:9 arriba.

## 4. Decisiones y trade-offs

- **Decisión 1 (imagen izquierda, copia derecha)**: el DOM conserva
  imagen → copia (REQ-39-02 literal) y el grid la coloca a la izquierda;
  orden de lectura natural (imagen → texto). Alternativa copia-izquierda vía
  `flex-direction: row-reverse` descartada: innecesaria y arriesga la
  aserción de orden del test sin beneficio real.
- **Decisión 2 (sin tocar post.css)**: la regla base `.post__image`
  (contrato REQ-26-04) se conserva íntegra; el ancho de la columna lo da el
  grid y los ajustes van en `.post__hero .post__image` (especificidad mayor)
  dentro de post-header.css. post.css sigue en 100 líneas.
- **Decisión 3 (kicker con `post.tags[0]`, sin fallback)**: los dos posts
  actuales tienen 3 tags (verificado en disco) y el schema garantiza array de
  strings; un fallback `?? 'Artículo'` añadiría lógica en plantilla sin
  necesidad real. El kicker es `<p>` (no `<div>`) para no romper el regex
  lazy de `post__hero-copy`.
- **Decisión 4 (imagen 4:3 en desktop, 16:9 en ≤768px)**: 4:3 da más
  presencia horizontal ("atrevido"); el morph de View Transitions anima la
  proporción desde la card 16:9 con naturalidad. En móvil vuelve a 16:9
  (ancho completo apilado).
- **Decisión 5 (gradiente de acento como segundo layer)**: el regex de
  REQ-39-02/03 exige que el `background` empiece con un gradiente con
  `var(--color-hero-*` antes del primer `;` → el `linear-gradient` hero va
  primero y el wash de acento después de la coma.
- **Decisión 6 (sin `box-shadow: none` ni literales de color en la hoja)**:
  el guard REQ-39-09 de var() exige `var(--` en TODA declaración de
  color/borde/sombra; la media query solo ajusta layout (grid, padding, gap,
  aspect-ratio, font-size) para no disparar el guard.
- **Decisión 7 (una sola hoja)**: post-header.css pasa de 48 a ~70 líneas,
  lejos del tope de 100; no se crea hoja nueva ni se toca el orden de
  imports (contrato REQ-40-01).
- **Decisión 8 (granularidad: UNA feature)**: el cambio es 100% presentacional
  sobre una misma ruta + una hoja; no hay capa de datos (tags ya existen).
  Precedente: la feature 39 agrupó cambios mayores en una sola feature.
  Separar en dos features duplicaría el tránsito sin beneficio.
- Trade-off: el título grande `clamp(..., 4.5vw, ...)` escala con el viewport
  (4.5vw ≈ 64px en 1440px); en pantallas muy anchas el tope 3.6rem evita
  tamaños grotescos. El kicker añade una línea al marcado (+1 línea, 53 ≤ 100).

## 5. Tests afectados y autorización

### Cambios de tests existentes: NINGUNO (verificado regla a regla en §2)

- `tests/post-header.test.mjs` REQ-39-01..09: pasa sin modificarse (el
  marcado conserva orden imagen → copia, sin divs anidados; la hoja conserva
  las reglas/valores que el test exige; media query conserva `.post__hero`).
- `tests/post-page-styles.test.mjs` REQ-26-02..07: pasa sin modificarse
  (post.css intacto; clases de página intactas).
- `tests/view-transitions.test.mjs` REQ-24-03/05: pasa sin modificarse
  (primer h1 y primer img con sus pares; página ≤100 líneas).
- `tests/post-readability.test.mjs` REQ-40/41: pasa sin modificarse (orden de
  imports intacto; post__body intacto).
- `tests/design-tokens.test.mjs` y `scripts/audit-design-tokens.mjs`: sin
  cambios (tokens.css intacto, sin hex/rgba en la hoja).
- Si el implementador encontrara que un cambio de test existente es
  imprescindible, debe PARAR y reportar (no decidirlo).

### Test nuevo autorizado y exigido (test-first)

`tests/post-header-horizontal.test.mjs` (patrón de inspección del arnés,
verifica contra esta spec):
1. El marcado de [id].astro conserva img.post__image antes de
   .post__hero-copy y declara p.post__kicker con `{post.tags[0]}` dentro de
   la copia antes de h1.post__title (REQ-42-01/03).
2. El primer h1 y el primer img conservan los pares title-${entry.id} e
   img-${entry.id} (REQ-42-08).
3. La regla .post__hero declara display grid con grid-template-columns de dos
   columnas y gap, conservando background con var(--color-hero-*),
   var(--radius-card), var(--color-border-strong) y var(--shadow-card)
   (REQ-42-01/02).
4. La regla .post__hero::after declara background con var(--color-accent)
   (REQ-42-06).
5. La regla .post__hero .post__image declara aspect-ratio 4/3, margin 0 y
   box-shadow con var(--color-glow) (REQ-42-05).
6. La regla .post__kicker declara color y border con var(--color-accent) y
   background con color-mix (REQ-42-03).
7. La regla .post__hero .post__title declara font-size clamp(2.2rem, 4.5vw,
   3.6rem) (REQ-42-04).
8. La media query 768px de post-header.css declara grid-template-columns 1fr
   en .post__hero y conserva el ajuste responsive (REQ-42-07).
9. post-header.css ≤100 líneas, sin hex/rgba sueltos, sin tokens nuevos en
   tokens.css (87 líneas) y página ≤100 líneas sin <style> (REQ-42-09).

## 6. Riesgos

- **Guard REQ-39-09 (var())**: cualquier `box-shadow: none`, `border: none`,
  `color: inherit` o valor literal de color en post-header.css rompe la
  suite. La spec prohíbe expresamente esos reset en la hoja.
- **Regex lazy de post__hero-copy**: un `<div>` anidado dentro de la copia
  rompería REQ-39-02; el kicker es `<p>` obligatoriamente.
- **Orden del primer match `.post__hero {`**: la regla base debe ir antes de
  `.post__hero::before`, `.post__hero::after`, `.post__hero .post__image` y
  de la media query (REQ-39-02/03 usa el primer match).
- **Background multicapa**: el primer gradiente debe contener
  `var(--color-hero-*` antes del primer `;` (REQ-39-02/03).
- **Morph de View Transitions**: la imagen cambia de 16:9 (card) a 4:3
  (hero); el morph lo anima sin problema (ClientRouter anima el elemento con
  transition:name, no el contenedor).
- **`tags[0]`**: seguro con los datos actuales (2 posts × 3 tags); si en el
  futuro un post sin tags rompiera el render, se abordaría en otro ciclo.

## 7. Archivos esperados tras la implementación

- `src/pages/posts/[id].astro`: +1 línea (kicker) → 53 líneas.
- `src/styles/post-header.css`: reescrito a ~70 líneas (grid horizontal,
  kicker, título gigante, acento inferior, imagen 4:3, media query apilada).
- `tests/post-header-horizontal.test.mjs` (nuevo).
- Sin cambios: `tokens.css`, `post.css`, `post-readability.css`, tests
  existentes, datos, dominio.