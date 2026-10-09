# Diseño — Anunciar los resultados de búsqueda a lectores de pantalla con una región aria-live (feature 36 search-status-announcements)

## Contexto visual

- Vista /search, /<término> y panel en vivo de la portada. Estado actual: sin región de estado. Estado deseado: un párrafo de estado invisible a la vista y leído por lectores de pantalla; ningún cambio visual.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `(ninguno)` | - | La utilidad .visually-hidden no declara colores ni espaciados de diseño |

## Decisiones y constraints

- aria-live="polite" (no assertive) para no interrumpir la escritura.
- Debounce de 300 ms en la portada (recomendación de audit_a11y.md A1).
- Utilidad .visually-hidden global en layout.css porque la reutilizan varias features (52, 53, 54).
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Anunciar con aria-live sobre la propia lista de resultados.
- Motivo del descarte: Leería el contenido completo de cada item en cada render, demasiado verboso.
