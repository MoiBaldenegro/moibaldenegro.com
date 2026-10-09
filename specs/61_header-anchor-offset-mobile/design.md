# Diseño — Anclas visibles bajo el header envuelto en móvil y logo separado del borde (feature 61 header-anchor-offset-mobile)

## Contexto visual

- Header compartido (Layout.astro, layout.css, search-bar.css) en ≤768px.
- Estado actual: a 320 px el nav se envuelve en varias líneas (~137 px de alto) pero scroll-padding-top es 74 px, así que ~63 px del destino de un ancla (encabezados de los posts, #contenido) quedan bajo la barra sticky; el logo toca el borde superior del viewport porque el nav no tiene padding vertical.
- Estado deseado: en ≤768px el header tiene aire arriba y abajo (padding-block) y el destino de cualquier ancla aparece completo bajo la barra. Escritorio sin cambios.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--header-height` | 74px | scroll-padding-top y min-height en escritorio (sin cambios) |
| `--header-height-mobile` | nuevo; valor medido ≥ altura real del header a 320 px con el padding nuevo (orientativo ~168px) | scroll-padding-top en ≤768px |
| `--gap-card` | 14px | padding-block del nav en ≤768px |

## Decisiones y constraints

- Decisión 1: token medido en lugar de cálculo en JS (estático por defecto, cero JavaScript de runtime).
- Decisión 2: las reglas nuevas van dentro del bloque @media (max-width: 768px) existente de layout.css (97 líneas: compactar comentarios si hace falta para no pasar de 100).
- Decisión 3: el header sigue sticky en móvil vertical (comportamiento acordado en la feature 51); con alto ≤500px sigue static.
- Añadir el token sube tokens.css de 95 a 97 líneas: los tests de conteo de tokens.css (REQ-17-09, REQ-42-09 y los ajustados en la 51) se actualizan a 97 dentro de esta feature (precedente REQ-43-06).
- Restricciones: sin dependencias, ≤100 líneas por archivo, estilos en src/styles, solo tokens.

## Alternativa descartada

- Alternativa considerada: header position: static en ≤768px (sin scroll-padding móvil).
- Motivo del descarte: cambia el comportamiento sticky acordado en la feature 51; queda como opción si el humano prefiere no fijar un valor medido.
