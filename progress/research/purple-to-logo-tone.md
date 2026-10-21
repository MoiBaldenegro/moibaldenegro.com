# Análisis feature 113 — Morados del sitio al tono del logotipo

## Problema (literal humano, 2026-10-20)

«bajar de la pagina todo el color morado o los colores morados igualarlos al
mismo tono de color de SVG del logotipo, asegurate de cambiar todos los tokens
de la web.»

Reformulado: el sitio usa un violeta azulado (#7d68ff, hue 248°, saturación
100 %) que no casa con el logotipo. Todos los morados/violetas/índigos de los
tokens pasan a la familia de tono del logotipo; donde el tono exacto no da AA
se usa una variante derivada (mismo hue y saturación, distinta luminosidad).

## Color del logotipo (muestreado)

- No hay versión SVG del logotipo: solo `public/assets/mxvi_logo.webp`
  (2048x716). `public/assets/svg/sprite.svg` no contiene el logo (y es ajeno).
- Muestreo: Chrome headless `--allow-file-access-from-files --dump-dom` con una
  página que dibuja el webp en un canvas y hace histograma de píxeles opacos
  (928 944 px opacos). Sin dependencias nuevas.
- Resultado: dos tintas. **Morado #6C387A** (503 865 px, el dominante; HSL
  287,3° / 37,1 % / 34,9 %) y naranja #F7941D (347 161 px). El resto son
  variaciones de antialiasing de ±2 en cada canal.
- El «tono del logotipo» para esta feature es **#6C387A** (hue 287,3°,
  saturación 37,1 %).

## Inventario de morados (criterio: hue 250°-330° y saturación >= 15 %)

| Token | Actual | HSL actual | ¿Morado? |
|-------|--------|-----------|----------|
| `--color-accent` | #7d68ff | 248°/100/70 | Sí (violeta azulado, índigo) |
| `--color-accent-hover` | #9a89ff | 249°/100/77 | Sí |
| `--color-hero-top` | #25144f | 257°/60/19 | Sí |
| `--color-hero-mid` | #0b0818 | 251°/50/6 | Sí (índigo casi negro) |
| `--color-glow` | rgba(120,70,255,.25) | 252°/100/64 | Sí |
| `--color-scrollbar-thumb` | #4732a5 | 251°/54/42 | Sí |
| `--color-marca-css` | #6E29C8 | 266°/66/47 | Sí (marca de tecnología) |
| `--color-background`, `--color-surface`, `--color-hero-bottom`, `--color-navbar`, `--color-scrollbar-track`, `--color-text-secondary` | #070716 … | hue 240° | No: azul marino neutro, fuera del rango |

- Hardcodeados: ninguno. `rg` de hex/rgb/hsl y de purple/violet/indigo en
  `src/styles`, `src/components`, `src/layouts`, `src/pages`, `src/domain` y
  `src/data` solo encuentra `THEME_COLOR '#070716'` (azul, no morado) e `INK`
  del PDF (gris). Los derivados (color-mix con `--color-accent` en
  post-header.css, glows y gradientes de hero-section, about-hero, post-header
  y site-footer) cambian solos al cambiar los tokens.
- `site.webmanifest` usa #070716 (no morado).
- Excepción ajena: el símbolo `css` de `sprite.svg` pinta `#639`
  (rebeccapurple); el sprite es ajeno y es la marca oficial de CSS: se lista
  como excepción justificada y el test no escanea `public/`.

## Decisión sobre `--color-marca-css`

Pasa a **#6C387A** (tono exacto del logo). Motivo: el humano pide «cambiar
todos los tokens»; la marca de CSS no tiene un morado fijo (logo clásico azul,
logo comunitario 2024 #663399) y su símbolo del sprite (caja #639 + letras
blancas) ya sobre el fondo actual se lee por el blanco. Blanco sobre #6C387A =
8,45:1 (cumple REQ-97-09, >= 4,5:1). Revisable por el humano.

## Contraste (WCAG, calculado)

- #6C387A sobre #070716 = 2,36:1 → no vale para texto ni foco (se usa solo
  como fondo/relleno: scrollbar, marca CSS, glow).
- Variante `--color-accent` #B37AC2 (L 62 %): 6,17:1 sobre fondo, 5,84:1 sobre
  superficie, 4,40:1 sobre `--color-hero-top` nuevo (solo bordes/foco allí,
  >= 3:1).
- Variante `--color-accent-hover` #C396CF (L 70 %): 8,17:1 fondo, 5,83:1 sobre
  hero-top.
- Skip link: hoy blanco sobre #7d68ff = 3,97:1 (no AA). Blanco sobre #B37AC2
  = 3,24:1 → el texto del `.skip-link` pasa a `--color-background` (6,17:1).
- Scrollbar: #6C387A sobre track #090912 = 2,34:1 (hoy 2,14:1).

## Qué toca

- `src/styles/tokens.css` (7 valores, sigue en 99 líneas, sin tokens nuevos).
- `src/styles/layout.css` (color del texto de `.skip-link`).
- Tests nuevos (detector de morados + contraste) y ajuste de
  `tests/design-tokens.test.mjs:43` (`--color-marca-css`) con nota «Ajuste
  feature 113 (precedente REQ-43-06)», y ajuste permitido de
  `tests/hero-cards-links-xlink.test.mjs:33` (sale `tokens.css` de la lista de
  congelados, con la misma nota).
- Páginas afectadas visualmente: /, /about, posts, /search, 404.

## Riesgos

- El acento pasa de violeta saturado a ciruela apagado: cambio de carácter del
  sitio; valores revisables por el humano.
- Glow con #6C387A es más oscuro que el actual: se sube la alfa a 0,35.
- Peso de la portada: solo cambian valores de tokens (misma longitud ±);
  umbral 42 000 B, no debería crecer.
- Ambigüedad: «bajar todo el color morado» podría leerse como quitar el morado
  por completo; el logo es morado, así que se interpreta «igualar al morado
  del logo» (lectura del orquestador).

## Ajuste 2026-10-21 (decisión técnica del líder)

- `--color-hero-mid` pasa de #140A16 (hue 290,0°, chocaba con REQ-113-06,
  287 ± 2) a **#150A18** (hue 287,1°, sat 41 %, L 6,7 %). No se amplía la
  tolerancia de REQ-113-06. Actualizados REQ-113-03, design.md y el acceptance.
