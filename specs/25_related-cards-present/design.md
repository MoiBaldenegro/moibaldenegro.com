# Diseño — Cards pequeñas de recomendados acordes al diseño (feature 25)

## Contexto visual

- Sección afectada: pie del detalle `/posts/[id]` — sección "Recomendados"
  (`.post__related`), hoy una lista simple de títulos (una línea por item,
  hairline + wash).
- Estado actual: cada item es solo el título enlazado; sin imagen, sin meta,
  sin jerarquía de card.
- Estado deseado: cards pequeñas en rejilla de dos columnas —miniatura a la
  izquierda (canónica 112×63 de la feature 9), cuerpo con título enlazado y
  meta `Por X • N min`— que hablan el idioma del modo lista de
  `search-results.css` y del héroe del detalle (`post.css`).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | #101018 | Wash de la card en hover |
| `--color-text` | #ffffff | Título de la card |
| `--color-text-secondary` | #b8b8c5 | Meta autor • readtime |
| `--color-border` | rgba(255,255,255,.08) | Hairline entre cards + borde de miniatura |
| `--radius-thumb` | 10px | Radio de la miniatura (precedente feature 9) |
| `--radius-card` | 22px | Radio del contenedor de la sección |
| `--gap-card` | 14px | Espaciado de rejilla y paddings |
| `--font-sans` | Inter, ... | Tipografía de título y meta |
| `--transition-default` | .28s ... | Transiciones de hover |

## Decisiones y constraints

- Decisión 1: la card pinta las propiedades del view-model de la feature 24
  (`title`, `img`, `author`, `readtime`); la vista solo importa y pasa datos
  (regla 8), todo resuelto en build, cero JS (estático por defecto).
- Decisión 2: sin descripción ni tags en la card (pertenecen al contexto de
  búsqueda para discriminar; los recomendados ya están curados) —la card queda
  pequeña y cabe en el presupuesto de líneas—.
- Decisión 3: en ≤768px una columna a ancho completo y miniatura oculta
  (precedente REQ-09-09 de `search-results.css`).
- Restricción aplicable: ≤100 líneas por archivo (`post-next.css` 91/100:
  compactar reglas existentes antes de pedir `blocked`; `post.css` 100/100 no
  se toca; `[id].astro` 73/100).

## Alternativa descartada

- Alternativa considerada: reutilizar el generador `item-html.ts` tal cual
  (descripción + tags incluidos).
- Motivo del descarte: emite el item completo de búsqueda para pintado
  client-side (`innerHTML`), mientras el detalle es prerender estático con
  props; además la descripción y los tags engordan la card y el presupuesto
  de líneas.
