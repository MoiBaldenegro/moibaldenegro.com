# Diseño — Jerarquía de encabezados de la portada: tarjetas del hero sin h3 y títulos de artículo en h3 (feature 55 home-heading-hierarchy)

## Contexto visual

- Portada: tarjetas de tecnologías del hero y cards de «Últimos artículos». Estado deseado: idéntico a la vista actual; solo cambia la semántica.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-text` | #ffffff | títulos (sin cambios) |
| `--font-sans` | Inter… | tipografía (sin cambios) |

## Decisiones y constraints

- Las reglas tipográficas de h3 de la tarjeta pasan a .card-title para que el cambio sea invisible.
- El h3 de la card hereda las reglas de .latest-articles__title, no del elemento.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Añadir un h2 oculto para la sección de tarjetas.
- Motivo del descarte: Las tarjetas no son contenido navegable por encabezados; un párrafo basta.
