# Análisis — Header de escritorio a 64 px (feature 77 header-height-64)

Autor: spec_author, 2026-10-09. Petición humana: «creo que el header podemos bajarlo a 64px y
queda más bonito, aplícalo».

## 1. Qué es

Bajar el alto mínimo de la barra sticky compartida (`.site-navbar`, `src/layouts/Layout.astro`)
de 74 px a 64 px en escritorio (>768 px). El alto visible pasa de 75 px (74 + borde inferior de
1 px) a 65 px. Es un cambio de un token: `--header-height` en `src/styles/tokens.css`.

## 2. Qué toca (estado actual leído)

| Pieza | Estado actual | Efecto del cambio |
|-------|---------------|-------------------|
| `src/styles/tokens.css:81` | `--header-height: 74px;` (feature 51) | pasa a `64px`; el comentario se mantiene en una línea → el archivo sigue en 97 líneas, los 5 tests de conteo (REQ-17-09, 26-07, 39-09, 40-11, 42-09) y REQ-16-09 no cambian |
| `layout.css` `.site-navbar nav` | `min-height: var(--header-height)`, flex, `align-items: center` | hereda 64 px; el centrado vertical ya lo da `align-items: center` |
| `layout.css` `html` | `scroll-padding-top: var(--header-height)` | hereda 64 px en escritorio (REQ-61-03 sigue cumpliéndose) |
| `layout.css` @media ≤768px | `scroll-padding-top: var(--header-height-mobile)` (170px) y `padding-block: var(--gap-card)` | sin cambios |
| `.site-navbar` | sin altura propia; borde inferior 1 px | alto total = alto del nav + 1 |
| `search-bar.css` | input `padding: 10px …`, `font-size: .95rem`, borde 1 px → ~41 px de alto | cabe en 64 px con ~11 px de aire por lado |
| logo | `<img width="72" height="25">` dentro de un `<a>` | cabe; el `<a>` inline puede medir algo más que 25 px por la línea, sigue < 64 |
| enlaces | `font-size: .95rem`, `::after` en `bottom: -6px` (subrayado) | queda dentro de la barra (centro ± ~15 px) |
| `.skip-link` | `top: var(--gap-card)` (14 px), no usa el alto del header | sin cambios; sigue apareciendo sobre la barra |

### Móvil (≤768 px)

El nav sigue teniendo `min-height: var(--header-height)` también en móvil (no hay override), pero a
375/320/768 px el nav se envuelve (el buscador ocupa `flex: 1 1 100%`): dos filas + padding-block
14×2 ≈ 165 px (medido en impl_61). El min-height (74 o 64) no es el que gobierna; por tanto el alto
móvil no cambia. `--header-height-mobile` (170px) no depende de `--header-height`. REQ-61-05
(anclas no tapadas a 320/375/768) se mantiene y se verifica de nuevo.

### Otras piezas

- Sección horizontal de la portada (features 72-76): `pin` sticky con top 0, no lee
  `--header-height` (grep sin coincidencias en `src/`). El documento sube 10 px en escritorio,
  así que las cifras de los informes (`wrapTop 1215`, h2 top 48) cambian en ~10 px, pero:
  - `tests/latest-cards-entrance.test.mjs` usa 1215 solo como argumento de la función pura
    `entranceProgress` (no mide el DOM) → no depende del alto del header.
  - Ningún otro test busca `74px`, 75 px ni posiciones absolutas medidas (grep en `tests/`).
- Único test que fija el valor: `tests/header-mobile-reflow.test.mjs` REQ-51-01
  (`/--header-height:\s*74px;/`). REQ-51-02 solo prohíbe `height: 74px` hardcodeado. Se ajusta a
  64px con nota (precedente REQ-43-06). La spec de la 51 (done) no se reescribe: REQ-77 la supersede.
- `docs/` y `CHECKPOINTS.md` no citan 74 px.

## 3. Riesgos y trabas

1. **Franja 769-~800 px**: el nav de escritorio (logo + 3 enlaces + buscador de 240 px + gaps de
   42 px ≈ 745 px) puede envolverse justo por encima de 768 px (95 % de 769 = 730 px). Si ocurre, el
   nav crece por encima de 64 px y scroll-padding-top (64) taparía parte del ancla. Es
   preexistente con 74 px y queda fuera de alcance; el implementer lo mide a 800 px y lo reporta
   como hallazgo (no lo corrige en esta feature).
2. El subrayado `::after` (bottom −6 px) y el anillo de foco (offset 2 px + 2 px) del input deben
   quedar dentro de los 64 px; con ~11 px de aire no hay recorte (el header no tiene overflow).
3. Las cifras de los informes de 72-76 (1215, 48) quedan desactualizadas en 10 px; solo afecta a
   la bitácora, no a los tests.
4. Feature 76 está in_progress en revisión: la 77 no depende de ella (archivos distintos), pero por
   `one_feature_at_a_time` no empieza hasta que la 76 se cierre. Sin `depends_on`.

## 4. Descomposición

Simple (un token + ajuste de un test + test nuevo): **1 feature**, 77 `header-height-64`, pending,
sin depends_on. Spec: `specs/77_header-height-64/requirements.md` (REQ-77-01..14) y `design.md`.

## 5. Verificación esperada

Chrome headless + CDP sobre `astro preview` a 1280×800, 1440×900 y 375×812: alto de
`.site-navbar` (65 px en escritorio), `scrollHeight <= clientHeight` del nav, centro vertical del
logo, enlaces y buscador = centro del nav ±1 px, ancla (`#contenido` y un encabezado de post) con
top ≥ bottom del header, móvil idéntico al de antes ±1 px, capturas antes/después.

## 6. Enmienda 1 (2026-10-09, review_77 ronda 1, puntos 3 y 4)

- Punto 3: el logo 72×25 inline (línea de base) quedaba 2 px por encima del centro del nav (ya
  con 74 px), incumpliendo REQ-77-06. Se añade al final de layout.css
  `@media (min-width: 769px) { .site-navbar a img { display: block; } }`; acotado a >768 px porque
  en móvil el header de 375 px bajaba de 165 a 162 px (REQ-77-10). Medido después: centrado 0 px
  a 1280 y 1440, móvil idéntico. Nuevos REQ-77-15/16 y acceptance 10; design.md Decisión 1
  corregida (layout.css sí se toca).
- Punto 4: REQ-77-08 (scroll-padding 64) contradecía REQ-77-09 (destino bajo el header de 65).
  REQ-77-09 y el criterio 6 pasan a medir contra el borde inferior del nav (o del header con 1 px
  de tolerancia, su borde); ya ocurría con 74/75. Se descarta `calc(var(--header-height) + 1px)`
  (reescribe REQ-77-08 y REQ-51/61-03 y añade un px a mano). design.md Decisión 5.
