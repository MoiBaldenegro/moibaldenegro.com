# Diseño — Títulos en recomendados y alineación al design system (feature 23)

## Contexto visual

- Sección afectada: pie del detalle `/posts/[id]` — botón "Siguiente
  artículo" (`.post__next`) y sección "Recomendados" (`.post__related`).
- Estado actual: el botón usa fondo de acento con texto oscuro
  (`--color-surface` sobre `--color-accent`) y radio de tarjeta; la lista
  muestra la ruta cruda (`/posts/00-agilismo`) como texto del enlace, en
  columna con `gap`, sin hairlines ni wash, sin escala tipográfica propia.
- Estado deseado: cada recomendado muestra su título; el botón habla el
  idioma de botones de `search-results.css` (superficie + borde + texto
  claro); la lista habla el modo lista de la feature 9 (hairline
  `--color-border`, wash `--color-surface` en hover, subrayado del título,
  meta en `--color-text-secondary`).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | #101018 | Wash de fila en hover + fondo del botón |
| `--color-text` | #ffffff | Título del recomendado + texto del botón |
| `--color-text-secondary` | #b8b8c5 | Meta del recomendado (autor • readtime) |
| `--color-border` | rgba(255,255,255,.08) | Hairline entre filas + borde del botón |
| `--color-accent` | #7d68ff | Color del título-enlace en reposo |
| `--color-accent-hover` | #9a89ff | Título-enlace en hover |
| `--radius-card` | 22px | Radio del contenedor de la sección |
| `--gap-card` | 14px | Espaciado entre filas y paddings |
| `--font-sans` | Inter, ... | Tipografía de títulos y meta |
| `--transition-default` | .28s ... | Transiciones de hover |

## Decisiones y constraints

- Decisión 1: el título se resuelve en build con un módulo `.ts` nuevo (la
  vista lo importa; cero JS de runtime, prerender intacto). El repositorio
  no se extiende (98/100 líneas) y el frontmatter solo importa y pasa datos
  (regla 8 de arquitectura).
- Decisión 2: la alineación vive solo en `post-next.css`; `post.css` está en
  100/100 líneas y no se toca (precedente D4 de la feature 19).
- Decisión 3: sin tokens nuevos; la escala tipográfica reusa la existente
  (`1.35rem` del heading de resultados, `1.05rem` del título de item).
- Restricción aplicable: ≤100 líneas por archivo (`[id].astro` 72,
  `post-next.css` 71: hay margen; si no cabe, compactar antes de `blocked`).
- Los tests REQ-21-01/04 que asercionan el texto del enlace se ajustan al
  título con justificación en el encabezado (precedente REQ-43-06: el test
  sigue a la presentación real; los destinos `/posts/[id]` no cambian).

## Alternativa descartada

- Alternativa considerada: resolver el título leyendo la colección
  directamente en el frontmatter de `[id].astro`.
- Motivo del descarte: viola la regla 8 (lógica separada de la UI) y la
  regla de repositorio como única vía de acceso a los datos.
