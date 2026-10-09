# Diseño — Header sin desborde en móvil y anclas no tapadas por la barra sticky (feature 51 header-mobile-reflow)

## Contexto visual

- Header en todas las páginas. Estado actual: en móvil el buscador queda fuera de la barra y las anclas se esconden bajo ella. Estado deseado: la barra crece con su contenido y los saltos a ancla dejan visible el encabezado.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--header-height` | 74px (nuevo) | altura mínima del header y scroll-padding-top |
| `--color-navbar` | rgba(8, 8, 18, 0.75) | fondo de la barra (sin cambios) |

## Decisiones y constraints

- Altura mínima en vez de fija: conserva el aspecto de escritorio.
- Header no sticky en viewports bajos (móvil horizontal, zoom).
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Ocultar el buscador en móvil tras un botón.
- Motivo del descarte: Añade JS de runtime e interacción nueva; fuera del alcance.
