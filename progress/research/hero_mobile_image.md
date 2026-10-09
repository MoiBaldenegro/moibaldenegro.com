# Análisis: imagen de perfil del hero invisible en móvil (feature 69 hero-profile-image-mobile)

Fecha: 2026-10-09 · Autor: spec_author · Petición humana: «arregla eso de mobile de una vez en la imagen».

## Qué es

En la portada, `.profile-card > .profile-image > img` (src/components/new-hero/new-hero.astro) no se ve en
móvil: el contenedor `.profile-image` mide 0 px de alto. El líder lo midió a 375 px (img 352×0) durante la
feature 65; a 1280 px la img mide 502×359 y se ve bien.

## Medición propia (Chrome headless + CDP, build estático de dist/client servido en local)

`getBoundingClientRect()` redondeado (ancho×alto, top absoluto). La img lleva `transform: scale(1.02)`, por eso a
1280 su caja es 502×359 mientras el contenedor `.profile-image` mide 493×352.

| ancho | .profile-card | .profile-image | .profile-content | .profile-username (top) | hero-cards |
|-------|---------------|----------------|------------------|-------------------------|------------|
| 320  | 304×190 @197 | 302×**0**   | 302×244 (desborda la tarjeta) | 126: fuera de la tarjeta, recortado | 12 × 304×190, una por fila |
| 375  | 356×190 @197 | 354×**0**   | 354×220 (desborda) | 126: fuera, recortado | 12 × 356×190 |
| 768  | 730×190 @155 | 728×**24**  | 728×164 | 108: fuera, recortado | 12 × 730×190 |
| 769  | 721×650 @107 | 719×441 | 719×207 | 473 | 6+6 de 109×140 en @261 y @415: **encima de la tarjeta** |
| 1024 | 963×650 @107 | 961×441 | 961×207 | 473 | 6+6 de 149×140 en @261 y @415: **encima de la tarjeta** |
| 1200 | 1131×650 @107 | 1129×441 | 1129×207 | 473 | 6+6 de 177×140: **encima de la tarjeta** |
| 1201 | 463×640 | 461×358 | 461×280 | 390 | layout de escritorio, correcto |
| 1280 | 495×640 | 493×352 (img 502×359) | 493×286 | 384 | layout de escritorio, correcto |

Capturas (scratchpad del agente): a 375 px solo se ven el h1 y el párrafo; a 1024 px la foto se ve, pero las
12 hero-cards la tapan desde y=261 (incluido el username y el badge, en y=473).

## Causa

1. **≤768 px**: `.hero-grid { grid-template-columns: 1fr; grid-auto-rows: 190px }` (hero-section.css) y
   `.profile-card { grid-column: auto; min-height: auto }` (profile-card.css). La regla base `grid-row: 1 / span 6`
   se anula desde ≤1200 (`grid-row: auto`), así que la tarjeta ocupa **una fila de 190 px**. Es un flex column con
   `overflow: hidden`; `.profile-content` (`flex: 1`, h1 + p ≈ 220-244 px) consume todo el alto y
   `.profile-image { height: 68% }` (flex-shrink 1) se encoge a 0. El username (`position: absolute; bottom: 24px`
   dentro de una caja de 0 px) cae por encima de la tarjeta y lo recorta el `overflow: hidden`.
2. **769-1200 px** (hallazgo adicional): `grid-auto-rows: 140px` + `.profile-card { grid-row: auto; min-height: 650px }`.
   La tarjeta mide 650 px pero su pista mide 140, así que **desborda su fila** y las hero-cards de las filas 2 y 3 se
   pintan encima de la foto y del username. La foto «se ve», pero tapada. También es un fallo de este hero.
3. **≥1201 px**: correcto (`grid-row: 1 / span 6` con filas de 95 px).

## ¿Es preexistente?

Sí. `git diff c19d375` sobre profile-card.css, hero-section.css, hero-card.css y new-hero.astro solo muestra:
atributos `width="952" height="960" fetchpriority="high"` (feature 48), badge accesible (feature 55),
`<main>` → `<div>` y bloques `prefers-reduced-motion` (feature 56). Ninguna regla de alto, fila o flex cambió.
Sin los atributos, la img con `height: 100%` dentro de una caja de 0 px también medía 0: el fallo existe desde que
la cuadrícula móvil fija filas de 190 px. La feature 65 no toca el hero (lo confirma impl_65.md: 352×0 antes y
después).

## Qué toca

- src/styles/profile-card.css (71 líneas): reglas de `.profile-image` y `.profile-card` en ≤1200 y ≤768.
- src/styles/hero-section.css (54 líneas): `grid-auto-rows` en ≤1200 y ≤768 (si la solución pasa por la pista).
- Sin cambios en new-hero.astro, datos ni repositorios. Sin JavaScript.
- Tests vigentes que leen estas hojas: hero-cards-styles (REQ-04-0x: tokens para color/radio/sombra, ≤100 líneas),
  image-loading-hints (REQ-48-05/REQ-65-06: `.profile-image img` con height explícito; `height: 100%` se conserva),
  reduced-motion (REQ-56-0x).

## Propuesta de solución (decide el implementer; la spec fija el resultado)

- En ≤1200: `.profile-image { height: auto; aspect-ratio: 16 / 9 }` (a 1024 ≈ 961×540) y la fila de la tarjeta
  crece con su contenido: `grid-auto-rows: minmax(140px, auto)` en ≤1200 y `minmax(190px, auto)` en ≤768. Las
  hero-cards no tienen contenido en flujo (todo es absoluto), así que conservan 140/190 px exactos.
- En ≤768: `.profile-image { aspect-ratio: 1 / 1 }` (la foto es 952×960, casi cuadrada: sin recorte apreciable):
  320 → ≈302 px, 375 → ≈354 px, 768 → ≈728 px de alto.
- `aspect-ratio` con literales tiene precedente (article.css, post.css, post-header.css, latest-articles.css) y
  `height: auto` es palabra clave: **no hace falta ningún token nuevo**. Si el implementer necesitara uno,
  tokens.css (97 líneas) obliga a actualizar REQ-17-09, REQ-26-07, REQ-39-09, REQ-40-11, REQ-42-09 y el meta-test
  REQ-16-09 con nota (precedente REQ-43-06); la spec lo contempla.
- Alternativa descartada: `grid-row: span N` en la tarjeta. Acopla N al alto de fila y al tamaño del texto; se
  rompe con otra descripción u otra fuente.

## Riesgos y trabas

- La percentage `height: 68%` dentro de una fila `auto` es cíclica: si se deja, el navegador la trata como `auto` y
  la img toma su alto natural (≈969 px a 1024). Por eso la propuesta fija `aspect-ratio` + `height: auto`.
- 1280 debe quedar idéntico (referencia img 502×359, contenedor 493×352, ±1 px): los cambios van solo dentro de
  los `@media` ≤1200/≤768.
- El dev server en localhost:4321 servía una página de búsqueda en `/` en el momento del análisis; la medición se
  hizo sobre el build estático. El implementer debe medir sobre `astro preview` o un build recién generado.
- Feature 65 (in_progress, en revisión) toca otras hojas; no hay solapamiento de archivos con esta feature.

## Feature creada

- 69 hero-profile-image-mobile (pending, depends_on [68]). Spec: specs/69_hero-profile-image-mobile/requirements.md
  y design.md.
