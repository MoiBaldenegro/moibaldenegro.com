# Diseño — Geist Pixel en títulos h1 y h2 (feature 86 geist-pixel-display)

## Contexto visual

- Afecta a todos los h1 y h2 del sitio: nombre del hero de la portada
  (`.profile-content h1`), «Últimos artículos», «Estadísticas de Hack The Box», h1 y h2 de
  /about (features 82-84), título y h2 del markdown de los artículos, «Recomendados»,
  h1 de búsqueda y de la 404. El logo es una imagen (`mxvi_logo.webp`): no aplica.
- Estado actual (tras la 85): títulos en Geist Sans heredada del contenedor.
- Estado deseado: títulos en Geist Pixel Circle (estética de puntos de
  https://vercel.com/font?type=pixel) sobre el cuerpo en Geist Sans; h3+ y etiquetas de
  tarjetas (`.card-title`, un `<p>`) siguen en Sans.

```
┌──────────────────────────────────────────────┐
│ ▛▀▖▞▀▖▌ ▌  Moisés Baldenegro   (h1, Pixel)   │
│ Texto del perfil en Geist Sans …             │
│ ▌ ▌▐ ▐  Últimos artículos      (h2, Pixel)   │
│ ┌ card ┐ título h3 en Sans                   │
└──────────────────────────────────────────────┘
typography.css:  h1, h2 { font-family: var(--font-display); font-synthesis: none; }
```

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-display` | `var(--font-geist-pixel, ui-monospace, monospace)` | h1 y h2 (typography.css) |
| `--font-sans` | (feature 85) | sin cambios: cuerpo, h3+ |
| `--font-mono` | (feature 85) | sin cambios: código |
| `--font-geist-pixel` | definido por `<Font>` de Astro | solo referenciado desde tokens.css |

## Decisiones y constraints

- Decisión 1 — Variante Circle, **elección humana del 2026-10-12** («me gusta la Circle,
  se ve bastante sexy y fuera de lo común, hasta cierto punto elegante, no tan friki»),
  sustituye a la Square que propuso el spec_author. Archivo verificado en geist@1.7.2:
  `dist/fonts/geist-pixel/GeistPixel-Circle.woff2`, 28 044 bytes, una sola cara (OS/2
  usWeightClass 400; el `next/font` oficial la declara 500), 420 caracteres, cobertura
  completa de á é í ó ú ñ ¿ ¡ Á É Í Ó Ú Ñ ü — « ». Métricas idénticas a Square (UPM 1000,
  x-height 532, cap 722, mismos avances) → mismo ancho de línea y mismo fallback.
  Las otras 4 variantes (Square, Grid, Triangle, Line) no se registran → no se emiten.
- Riesgo de legibilidad (medido, no oculto): cada glifo de Circle se dibuja con puntos
  circulares de 38 unidades (paso 38, mayúscula = 19 puntos de alto). El punto mide
  0,038 em: en el h1 del hero (64 px) son 2,4 px y la textura de puntos se ve; en los h2
  de 1,35-1,75rem (21,6-28 px) son 0,8-1,1 px, por debajo del píxel físico en pantallas
  1x → la textura de puntos desaparece, el antialiasing la convierte en un trazo gris y
  el círculo cubre ~78,5 % de cada celda → títulos visiblemente más claros y finos que con
  Square. Sigue siendo legible (la forma de letra es la misma), pero el efecto «Circle»
  solo se aprecia a partir de ~50 px o en pantallas 2x. Por eso REQ-86-18 exige capturas
  del h2 más pequeño para revisión humana; si el humano lo pide, una feature posterior
  puede subir el tamaño de los h2 o limitar Pixel a h1.
- Decisión 2 — Regla de elemento global `h1, h2` en typography.css (importada por el único
  layout): ninguna hoja actual declara `font-family` sobre un h1/h2 (solo en contenedores),
  y una regla de elemento prevalece sobre la herencia del contenedor. No se tocan las hojas
  con listas cerradas de tokens (search-*, post.css, about*.css).
- Decisión 3 — `font-synthesis: none`: Pixel tiene una sola cara de peso 400 y varios
  títulos heredan 700 (estilo UA de h1/h2, `.post__title`); sin esto el navegador sintetiza
  negrita y emborrona los píxeles. No se fuerza `font-weight` para no pisar estilos.
- Decisión 4 — Preload de Pixel: el h1 del hero y el de los artículos están sobre el
  pliegue. Fallback `monospace` con métricas ajustadas por Astro; objetivo CLS ≤ 0,1.
- Decisión 5 — Si el nombre del hero desborda a 375 px (clamp 2.5rem-4rem, móvil 2rem,
  `letter-spacing: -2px` en profile-card.css), se ajusta solo en profile-card.css.
- Restricciones: sin `<style>` en .astro, ≤100 líneas (tokens.css queda en 99), CSS solo con
  tokens, cero JS de runtime, un solo layout, dependencia ya aprobada e instalada en la 85.

## Alternativa descartada

- Aplicar Pixel también a h3 y a `.card-title`: Pixel en tamaños pequeños y en párrafos
  largos de títulos de tarjetas pierde legibilidad; el humano pidió títulos/display (h1, h2,
  títulos del hero, encabezados de sección). Descartado.
- Declarar `font-family: var(--font-display)` en cada hoja de componente: tocaría hojas con
  listas cerradas de tokens y tests fijados. Descartado frente a la regla global.
