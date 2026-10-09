# Diseño — Nombres accesibles de enlaces e imágenes: alts duplicados, logo, enlace externo y recomendados (feature 53 link-image-accessible-names)

## Contexto visual

- Cards de la portada, resultados de búsqueda, cabecera y recomendados del post, logo y enlace a X. Estado deseado: sin cambios visibles salvo que toda la fila de un recomendado es clicable.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `(ninguno nuevo)` | - | El ::after no declara color; el hover existente conserva sus tokens |

## Decisiones y constraints

- alt="" porque las imágenes son decorativas junto al título.
- Mismo patrón ::after que search-results.css para coherencia.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Escribir un alt descriptivo para cada portada.
- Motivo del descarte: Requiere texto de contenido del autor; queda como mejora opcional del humano.
