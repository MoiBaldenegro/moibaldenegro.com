# Diseño — Geist Pixel en el header, títulos de cards y tags (feature 87 geist-pixel-extend)

## Contexto visual

- Petición humana 2026-10-12: Pixel también en el header, en los títulos pequeños de las
  cards (cards de artículos y cards bento del hero) y en los tags de los artículos.
- Estado actual (tras la 86): h1 y h2 en Geist Pixel Circle; header, títulos de card y tags
  en Geist Sans (heredada de body o declarada como `var(--font-sans)`).
- Estado deseado: estos textos pasan a `var(--font-display)`; meta, descripciones, cuerpo,
  h3 de /about y botones-icono siguen en Sans.

| Zona | Selector (en typography.css) | Tamaño actual | Punto Circle (0,038 em) |
|------|------------------------------|---------------|-------------------------|
| Enlaces del header | `.site-navbar nav a` | 0.95rem (15,2 px); móvil 0.85rem, menú abierto 1rem | 0,58 / 0,52 / 0,61 px |
| Buscador del header | `.site-navbar .search-bar__input` | 0.95rem | 0,58 px |
| Título bento | `.hero-card .card-title` | 0.95rem, 700, uppercase, +0.08em; móvil 0.82rem | 0,58 / 0,50 px |
| Título card portada | `.latest-articles__title` (h3) | 1.35rem; móvil 1.15rem | 0,82 / 0,70 px |
| Título Recomendados | `.post__related .post__related-link` | 1.05rem | 0,64 px |
| Tag portada | `.latest-articles__tag` | 0.85rem | 0,52 px |
| Tag búsqueda / término | `.search-results__tag` | 0.78rem | 0,47 px |
| Kicker del post | `.post__hero .post__kicker` | 0.8rem; móvil 0.75rem, 700, uppercase | 0,49 / 0,46 px |

```
┌ header ────────────────────────────────────────────────────────────┐
│ [logo img]  ▞About  ▞Arquitectura  ▞@moibaldenegro  (▞Buscar…   ×) │  ☰ en móvil (Sans)
└────────────────────────────────────────────────────────────────────┘
┌ bento ──────┐  ┌ card portada ───────────────────┐  ┌ kicker post ┐
│ ▞TYPESCRIPT │  │ [img]                           │  │ ▞ARQUITEC.. │
│        icon │  │ ▞Título del artículo (h3)       │  └─────────────┘
└─────────────┘  │ Por … • 5 min (Sans)            │
                 │ (▞agilismo) (▞software)  tags   │
                 └─────────────────────────────────┘
```

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-display` | `var(--font-geist-pixel, ui-monospace, monospace)` (feature 86) | todos los selectores de la tabla |
| `--font-sans` | (feature 85) | sin cambios: meta, descripción, botones, cuerpo |

No se crean tokens nuevos ni se tocan colores, tamaños, pesos ni espaciados.

## Decisiones y constraints

- Decisión 1 — Todo en `src/styles/typography.css`. Las hojas de componente tienen listas
  cerradas de tokens fijadas por tests: `search-bar.css` solo admite `--font-sans` entre sus
  tokens (tests/search-bar-header.test.mjs) y `post-next.css`, `post.css`, `search-results.css`
  y `latest-articles.css` tienen tests de tokens. Añadir `var(--font-display)` ahí rompería esos
  tests. typography.css (15 líneas tras la 86) ya es la hoja tipográfica global importada por el
  único layout y está exenta del guard REQ-86-07.
- Decisión 2 — Especificidad, no orden de carga: el orden del CSS empaquetado de los
  componentes frente a typography.css no está garantizado. Donde la hoja del componente declara
  `font-family: var(--font-sans)` (`.search-bar__input` 0,1,0 y `.post__related-link` 0,1,0) el
  selector nuevo lleva un ancestro (0,2,0) y gana siempre. Por uniformidad, el resto también
  lleva ancestro (`.hero-card .card-title`, `.post__hero .post__kicker`, `.site-navbar nav a`).
- Decisión 3 — `font-synthesis: none` en todas las reglas nuevas: Circle tiene una sola cara
  de peso 400 y `.card-title`, `.post__kicker` y el h3 de la portada van a 700; sin esto el
  navegador sintetiza negrita sobre los puntos. Se acepta el cambio visual: dejan de verse en
  negrita (misma decisión que la 86).
- Decisión 4 — Fuera de alcance: el botón hamburguesa usa ☰ (U+2630) y ✕ (U+2715) en
  `::before`, que NO están en el cmap de GeistPixel-Circle (verificado: `#`, `@`, `…`, `×`, `•`
  y las vocales acentuadas sí están); pasarlo a Pixel solo daría el fallback. El `×` de limpiar
  es un icono. El logo es una imagen.
- Decisión 5 — Prohibido el carácter `#` en typography.css, también en comentarios: el test
  REQ-86-05/06 aplica `/#[0-9a-f]{3,8}\b/i` al archivo completo.
- Decisión 6 — El h3 `.latest-articles__title` tiene `transition:name` compartido con el h1
  `.post__title` del post: con ambos en Pixel la view transition morfa entre la misma familia.
- Riesgo de legibilidad (medido, no oculto): el punto de Circle mide 0,038 em. En todos los
  textos de esta feature queda entre 0,46 y 0,82 px, por debajo del píxel físico en pantallas
  1x: la textura de puntos desaparece y el antialiasing la convierte en un trazo gris fino y
  más claro (el círculo cubre ~78,5 % de la celda). Lo más comprometido: el kicker del post a
  12 px y los tags de búsqueda a 12,5 px, y los enlaces de navegación a 13,6-15,2 px (texto de
  navegación de uso constante). El contraste percibido baja aunque el color no cambie. Por eso
  REQ-87-17/18 exigen capturas a DPR 1 y DPR 2 para que el humano juzgue; si lo pide, una feature
  posterior puede subir tamaños o devolver nav/tags a Sans (cambio de una regla).
- Riesgo de desborde: Pixel tiene avances más anchos que Sans. El header de escritorio ya va
  justo en 769-900 px (logo + 3 enlaces + buscador de 240 px + 4 huecos de 42 px ≈ 730 px en un
  contenedor del 95 %): REQ-87-13 compara su altura con la base anotada antes del cambio. Títulos
  bento en tarjetas de 2 columnas («TYPESCRIPT») y títulos largos (66 caracteres) se comprueban
  con REQ-87-12. Si algo desborda, el implementer para y lo reporta (bloqueo), sin tocar hojas
  con listas cerradas.
- Restricciones: sin `<style>` en .astro, ≤100 líneas, solo tokens, cero JS de runtime, sin
  dependencias nuevas, un solo layout.

## Alternativa descartada

- Declarar `font-family: var(--font-display)` en cada hoja de componente: rompe las listas
  cerradas de tokens de search-bar.css y post-next.css. Descartado.
- `.site-navbar { font-family: … }` en el contenedor: el input no hereda (el UA y search-bar.css
  le fijan fuente) y arrastraría a los botones-icono. Descartado frente a selectores explícitos.
- Nuevo token por zona (`--font-nav`, `--font-tag`): sin necesidad hoy; un solo token
  `--font-display` mantiene la decisión reversible en una regla.
