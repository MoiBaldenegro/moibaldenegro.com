# Diseño — Imagen de perfil del hero visible en móvil y tablet (feature 69 hero-profile-image-mobile)

## Contexto visual

- Portada, sección hero: `.profile-card` (foto + username/badge + h1 + descripción) y las 12 `.hero-card`.
- Estado actual (Chrome headless + CDP, progress/research/hero_mobile_image.md):
  - ≤768 px: la tarjeta ocupa una fila fija de 190 px; `.profile-image { height: 68% }` se encoge a 0 px
    (320: 302×0; 375: 354×0; 768: 728×24). El username queda fuera de la tarjeta y lo recorta `overflow: hidden`.
  - 769-1200 px: la tarjeta mide 650 px (min-height) en una fila de 140 px y las hero-cards de las filas 2 y 3 se
    pintan encima de la foto y del username (1024: foto 961×441 tapada desde y=261).
  - ≥1201 px: correcto. Referencia 1280: img 502×359 (con scale(1.02)), contenedor 493×352.
- Estado deseado: en 320, 375, 768 y 1024 la foto se ve entera con ≥240 px de alto, el username y el badge se leen
  encima de la foto sin tocar el texto, el h1 y la descripción caben en la tarjeta y ninguna hero-card la tapa.
  Escritorio (≥1201) idéntico.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| (ninguno nuevo) | - | `height: auto`, `aspect-ratio` y `minmax(<alto actual>, auto)` no son valores de color, espaciado, radio ni sombra; `aspect-ratio` literal tiene precedente en article.css, post.css, post-header.css y latest-articles.css |
| `--gap-card`, `--radius-card`, `--color-*` existentes | sin cambio | se conservan tal cual |

Si el implementer necesita un token nuevo, tokens.css (97 líneas) obliga a actualizar REQ-17-09, REQ-26-07,
REQ-39-09, REQ-40-11, REQ-42-09 y el meta-test REQ-16-09 con nota (precedente REQ-43-06; REQ-69-11).

## Decisiones y constraints

- Decisión 1 (propuesta): en `@media (max-width: 1200px)` de profile-card.css, `.profile-image { height: auto;
  aspect-ratio: 16 / 9; }`; en `@media (max-width: 768px)`, `.profile-image { aspect-ratio: 1 / 1; }` (la foto es
  952×960). Resultado esperado: 320 ≈ 302×302, 375 ≈ 354×354, 768 ≈ 728×728, 1024 ≈ 961×540.
- Decisión 2 (propuesta): en hero-section.css, `grid-auto-rows: minmax(140px, auto)` en ≤1200 y
  `minmax(190px, auto)` en ≤768, para que la fila de la tarjeta de perfil crezca con su contenido. Las hero-cards
  no tienen contenido en flujo y conservan 140/190 px exactos (REQ-69-09).
- Decisión 3: `.profile-image img { width: 100%; height: 100%; object-fit: cover }` se conserva (REQ-48-05 y
  REQ-65-06 exigen height explícito en la img).
- Decisión 4: todo cambio va dentro de los `@media` ≤1200/≤768; las reglas base (escritorio) no se tocan.
- Restricciones: sin dependencias, sin JavaScript, sin tocar new-hero.astro ni datos, ≤100 líneas por archivo
  (profile-card.css 71, hero-section.css 54), estilos separados de la UI.

## Verificación visual

- Chrome headless + CDP sobre `astro preview` (o build recién generado) a 320, 375, 768, 1024 y 1280 px, antes y
  después: rectángulos de `.profile-card`, `.profile-image`, su img, `.profile-username`, `.verified`, h1, p y las 12
  `.hero-card`; `document.elementFromPoint` en el centro de `.verified`; captura PNG por ancho revisada a ojo.
  Tabla antes/después y rutas de las capturas en progress/impl_69.md.

## Alternativa descartada

- Alternativa considerada: `.profile-card { grid-row: span N }` en ≤1200/≤768.
- Motivo del descarte: acopla N al alto de fila y al largo del texto; se rompe con otra descripción u otra fuente.
