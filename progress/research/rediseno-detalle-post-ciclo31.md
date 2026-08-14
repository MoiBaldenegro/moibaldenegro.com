# Rediseño de la página de detalle de post — ciclo 31

> Fecha: 2026-08-14. Rol: spec_author. Petición del humano sobre
> `src/pages/posts/[id].astro`: (1) contenido a ancho completo, (2) header más
> vistoso. Documenta hallazgos, decisión de ancho, propuesta de header,
> análisis de tests afectados y riesgos. No implementa nada.

## 1. Qué es y qué toca

- Ruta: `src/pages/posts/[id].astro` (46 líneas, feature 36): `main.post` >
  `article.post__content` > `h1.post__title` (transition:name
  `title-${entry.id}`) + `p.post__meta` + `img.post__image` (transition:name
  `img-${entry.id}`) + `section` con `<Content />`. Frontmatter: import de
  `post.css`, `Layout`, `PostsRepository` + `getCollection`/`render`,
  emparejado por id con `Map` (feature 36), `prerender = true`.
- Estilos: `src/styles/post.css` (99 líneas, feature 26) y `tokens.css`
  (87 líneas, estado canónico).
- Tokens disponibles relevantes: `--container-max` 1500px, `--color-hero-top/
  mid/bottom` (#25144f/#0b0818/#05050b), `--color-glow`
  rgba(120,70,255,.25), `--color-surface`, `--color-text(-secondary)`,
  `--color-border(-strong)`, `--color-accent(-hover)`, `--radius-card` 22px,
  `--radius-pill`, `--gap-card` 14px, `--shadow-card`, `--transition-default`,
  `--font-sans`. Precedente de gradiente/glow: `hero-section.css`
  (radial-gradient con color-mix + tokens).
- Contrato transiciones: las cards (`latest-articles.astro`) declaran los
  pares `img-${post.id}` / `title-${post.id}`; el detalle declara los mismos
  pares con `entry.id` (REQ-24-03/05, verificado por
  `tests/view-transitions.test.mjs` con "primer `<h1>`" y "primer `<img>`").

## 2. Petición 1 — ancho del contenido

### Estado actual
`.post__content { max-width: 760px; margin: auto; }` dentro de `.post` que ya
mide `min(var(--container-max), 95%)` (1500px en pantallas grandes). El
artículo ocupa una columna de 760px centrada: "delgado" en comparación con el
ancho de página.

### Opciones consideradas

| Opción | Ancho | Fidelidad a la petición | Legibilidad |
|--------|-------|-------------------------|-------------|
| A. Ancho completo del contenedor (elegida) | `min(var(--container-max), 95%)` = ancho de la página | 100 % ("el mismo ancho de la página") | líneas de hasta ~140 caracteres en ≥1600px (vs ~66 de 760px); mitigada con line-height 1.7 y pre con overflow-x |
| B. Ancho de lectura amplio | ~1000-1100px | Parcial ("razonablemente similar") | ~90-100 caracteres; buena | 
| C. Mantener 760px | — | Nula | Óptima |

### Decisión
**Opción A**: eliminar `max-width: 760px` (y `margin: auto`) de
`.post__content`; el contenido ocupa el ancho completo del contenedor del
sitio, exactamente el ancho de la página. Motivos:

1. Es la petición literal del humano; el líder pidió "el diseño más fiel".
2. El lenguaje visual del sitio es de contenedor ancho (1500px, cards
   amplias): un artículo a ancho completo es coherente con la marca.
3. El trade-off de legibilidad se documenta (líneas largas) y se mitiga
   manteniendo `line-height: 1.7`, espaciado vertical generoso y `pre` con
   `overflow-x: auto` (ya existente).
4. Escalado futuro si el humano lo ve y quiere estrechar: introducir un token
   `--reading-max` (~1100px) en un ciclo posterior. **Hoy no se añade**: los
   tests REQ-26-07/17-09 fijan tokens.css en 87 líneas y el grupo `--reading-`
   está prohibido por REQ-26-07 (alternativa descartada del design de la 26).

## 3. Petición 2 — header vistoso

### Estado actual
`h1` → `p` → `img` apilados sin jerarquía ni fondo; nada destaca.

### Propuesta (coherente con el estilo dark/glow del sitio)
Panel hero con la identidad del hero de portada (tokens `--color-hero-*` +
`--color-glow` + `--shadow-card`), que integra la imagen y el título:

```
main.post
└─ header.post__hero        ← panel: degradado hero (color-mix con tokens),
  │                            glow decorativo (::before), radio, borde,
  │                            sombra, padding con tokens
  ├─ img.post__image        ← tarjeta 16:9 (regla actual intacta, REQ-26-04)
  └─ div.post__hero-copy
      ├─ h1.post__title     ← grande (p. ej. clamp 2rem-3rem), --color-text
      └─ p.post__meta       ← píldora: --radius-pill, fondo color-mix con
                               --color-surface, borde --color-border-strong
article.post__content
└─ section > <Content />    ← ancho completo (petición 1)
```

Razones del layout "imagen + título dentro del panel" (NO overlay sobre la
imagen): conserva la regla `.post__image` con su borde/radio/margen
(contrato REQ-26-04, cero cambios de test), no recorta títulos largos sobre
la imagen y logra el impacto con el degradado + glow + sombra + píldora.

### Tokens: no se añaden
Se reutilizan `--color-hero-top/mid/bottom`, `--color-glow`, `--shadow-card`,
`--radius-card`, `--radius-pill`, `--gap-card`, `--color-border-strong`,
`--color-surface`, `--color-text(-secondary)`, `--container-max`,
`--font-sans`, `--transition-default`. Gradientes con `color-mix(in srgb,
var(--...), transparent)` (precedente hero-section.css) — sin hex/rgba
sueltos. Justificación: los tokens del hero YA son la identidad dark/glow del
sitio; añadir tokens rompería REQ-26-07 (87 líneas) sin valor real.

### Límite de 100 líneas
`post.css` está en 99: los estilos del panel hero van en una **hoja nueva**
`src/styles/post-header.css` (importada por `[id].astro`). post.css conserva
solo: `.post`, `.post__title`, `.post__meta`, `.post__image` y la tipografía
scoping (contrato REQ-26-03 exige esas reglas en post.css). Estimación
post.css ≈ 97 líneas (se eliminan max-width/margin de `.post__content` y
3 líneas de imagen… no: la regla de imagen se conserva íntegra; el ahorro
viene del bloque `.post__content` y el ajuste de la meta a píldora).

## 4. Análisis de tests afectados

Solo dos archivos de test leen la ruta (`grep` verificado):
`tests/post-page-styles.test.mjs` y `tests/view-transitions.test.mjs`.
`latest-articles-restore`, `article-card-images` y `articles-ui-refactor`
solo tocan las cards: no se rompen.

### Contratos que el diseño PRESERVA (cero cambios de tests existentes)
- `view-transitions.test.mjs` REQ-24-05/Resolución: "primer `<h1>`" y "primer
  `<img>`" de la página deben llevar `transition:name` con `entry.id`. El
  nuevo marcado mantiene el h1 y el img como los únicos/primero de la página,
  con sus pares intactos → pasa sin tocar.
- `post-page-styles.test.mjs`:
  - REQ-26-02: se conserva el import `../../styles/post.css`.
  - REQ-26-03 (página): se conservan `main.post`, `article.post__content`,
    `post__title`, `post__meta`, `post__image`.
  - REQ-26-03 (css): post.css sigue declarando `.post`, `.post__title`,
    `.post__meta`, `.post__image` y el scoping `.post__content h2/h3/p/ul/ol/
    li/a/code/pre`.
  - REQ-26-04: la regla `.post__image` queda íntegra (display block, width
    100%, aspect-ratio 16/9, cover, radius-card, border color-border, margin
    gap-card). Es la razón de diseño "panel, no overlay".
  - REQ-26-05: los 10 tokens de la tabla siguen en post.css (`--gap-card` se
    mantiene por el margen de la imagen; `--container-max` en `.post`).
  - REQ-26-06: post.css ≤100 líneas y sin hex/rgba (color-mix + var no
    dispara `/rgba?\(/` — "srgb," no es "rgb(").
  - REQ-26-07: tokens.css sigue en 87 líneas (sin tokens nuevos).
- REQ-24-03 (cards): no toca el detalle.

### Autorización de cambios de tests
- **No se autoriza ningún cambio** en los tests existentes: el diseño los
  preserva íntegros (verificado regla a regla arriba). Si el implementador
  encontrara que un cambio es imprescindible, debe parar y reportar
  (no decidirlo por su cuenta).
- **Se autoriza (y exige) un test NUEVO**: `tests/post-header.test.mjs`
  (test-first, patrón de inspección del arnés) que verifica: marcado del
  header (`header.post__hero` con img + `post__hero-copy` con h1 y p),
  import de `post-header.css`, hoja ≤100 líneas sin hex/rgba con solo tokens,
  reglas `.post__hero`/`.post__hero-copy`/píldora de `.post__meta`,
  media query 768px, y que `[id].astro` sigue ≤100 líneas sin `<style>`.

## 5. Riesgos con view transitions

- El primer `<h1>` y el primer `<img>` del archivo son los que casan con las
  cards (REQ-24-03/05). El nuevo marcado debe mantener ese orden: img antes
  que cualquier otro elemento con transición, h1 antes que cualquier otro h1.
  No añadir imágenes decorativas en el detalle.
- El wrap del img en `.post__hero` no afecta al morph: ClientRouter anima el
  elemento con `transition:name` independientemente de su contenedor.
- La hoja nueva no interfiere con `latest-articles.css` (ambas importan
  tokens; sin conflictos de selectores: bloque BEM `post__` vs
  `latest-articles__`).
- Si en el futuro se añadiera un overlay con degradado sobre la imagen, el
  `color-mix` debe seguir la pauta de hero-section.css para no violar los
  guards de tokens.

## 6. Granularidad: UNA feature (39 post-page-redesign)

Criterio del rol: "Simple = 1; Media (2-3 archivos o datos + UI) = 2 separando
capa de datos vs UI/dominio". Aquí NO hay capa de datos: ambos cambios son
presentacionales sobre la misma ruta, los mismos dos archivos de test y el
mismo contexto de diseño (el header hero es el escaparate del ancho completo).
Separar en dos features duplicaría el tránsito por post.css y el análisis de
tests sin beneficio. Por eso: **una sola feature** que cubre ancho + header,
con spec EARS + design.md (toca UI → design.md obligatorio).

## 7. Archivos esperados tras la implementación

- `src/pages/posts/[id].astro`: header hero + import de la hoja nueva
  (~52 líneas).
- `src/styles/post.css`: `.post__content` sin max-width; meta como píldora
  (~97 líneas).
- `src/styles/post-header.css` (nuevo): panel hero + glow + responsive.
- `tests/post-header.test.mjs` (nuevo).
- Sin cambios: `tokens.css`, cards, tests existentes.
