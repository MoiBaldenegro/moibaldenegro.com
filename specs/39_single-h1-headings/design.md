# Diseño — Un solo h1 por página en artículos y en /about (feature 39 single-h1-headings)

## Contexto visual

- Artículos y /about. Estado actual: segundo encabezado de nivel 1 con tamaño de h1 del navegador. Estado deseado: el título de la plantilla es el único h1; el encabezado del markdown se ve como h2 del cuerpo del post; en /about el texto se ve como párrafo destacado.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-text-secondary` | #b8b8c5 | color de .about__intro |
| `--font-sans` | Inter… | tipografía |

## Decisiones y constraints

- Degradar a h2 y no borrar: conserva la numeración «01.», «02.» del contenido.
- about__intro con tamaño de párrafo destacado (1.15rem a 1.25rem), sin color hardcodeado.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Eliminar la línea «# …» de los markdown.
- Motivo del descarte: Pierde texto del autor; la decisión de borrarlo corresponde al humano.
