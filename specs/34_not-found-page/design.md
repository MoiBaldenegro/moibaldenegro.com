# Diseño — Página 404 propia y noindex en búsqueda y términos para eliminar el soft 404 (feature 34 not-found-page)

## Contexto visual

- Página nueva /404 (y contenido 404 de [...term]): hoy cualquier URL desconocida muestra «Búsqueda por término». Estado deseado: bloque centrado con h1 «Página no encontrada», un párrafo breve «La página que buscas no existe o cambió de dirección.» y dos enlaces: «Volver al inicio» (/) y «Buscar artículos» (/search).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-text` | #ffffff | h1 |
| `--color-text-secondary` | #b8b8c5 | párrafo |
| `--color-accent` | #7d68ff | enlaces |
| `--color-surface` | #101018 | fondo del bloque |
| `--radius-card` | 22px | radio del bloque |

## Decisiones y constraints

- Reutilizar el ancho y márgenes de .search-page para coherencia visual con la vista de búsqueda.
- Componente not-found.astro compartido por 404.astro y [...term].astro para no duplicar marcado.
- Restricciones: estático, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/not-found.css, solo tokens.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Fijar status 404 para términos sin resultados.
- Motivo del descarte: El filtrado ocurre en cliente: el servidor no sabe si hay resultados (audit_seo.md A2 opción 2).
