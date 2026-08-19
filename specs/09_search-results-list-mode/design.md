# Diseño — Modo lista en los resultados de búsqueda (feature 9)

## Contexto visual

- **Qué pantalla**: presentación de resultados de búsqueda en las tres
  superficies que la consumen: `/search?q=` (feature 3), `/<término>`
  (feature 7) y el panel en vivo de la portada (feature 5).
- **Estado actual**: cuadrícula de tarjetas gigantes — imagen 16:9 a ancho
  completo, título 1.35rem, padding 24×28px, caja surface con borde y radio
  22px por resultado. El humano la rechaza: "no queremos que salgan las
  tarjetas gigantes".
- **Estado deseado**: modo lista atractivo — filas compactas apiladas en una
  columna, separadas por hairline, con miniatura pequeña a la izquierda y
  contenido escaneable a la derecha. Cada fila navega al detalle
  `/posts/[id]` (contrato de comportamiento conservado).

## Estructura del item (fila compacta)

```
┌────────────────────────────────────────────────────────────────┐
│ [thumb 112×63]  Título del artículo (enlace, stretched link)   │
│                 Por <autor> • <N> min de lectura               │
│                 Descripción del artículo (clamp 2 líneas)      │
│                 #tag1  #tag2                                   │
└────────────────────────────────────────────────────────────────┘
```

- Contenedor: `ul.search-results__list[data-search-list]` — `list-style:
  none; display: flex; flex-direction: column; margin: 0; padding: 0`.
  Sustituye al `div.search-results__grid[data-search-grid]`.
- Item: `li.search-results__item` — `position: relative; display: flex;
  align-items: center; gap: var(--gap-card); padding: 16px 12px;
  border-bottom: 1px solid var(--color-border); border-radius:
  var(--radius-card); transition: var(--transition-default)`. El último item
  sin borde (`:last-child`).
- Miniatura: `img.search-results__thumb` — `width: 112px; aspect-ratio: 16 /
  9; object-fit: cover; border-radius: var(--radius-thumb); border: 1px solid
  var(--color-border); flex-shrink: 0`.
- Cuerpo: `div.search-results__body` — `flex: 1; min-width: 0`.
- Título: `a.search-results__link` — `color: var(--color-text); font-size:
  1.05rem; line-height: 1.35; text-decoration: none`. Patrón stretched link:
  `.search-results__link::after { content: ''; position: absolute; inset: 0;
  }` sobre el item con `position: relative`: la fila entera es un único
  enlace accesible a `/posts/[id]`.
- Meta: `p.search-results__meta` — `color: var(--color-text-secondary);
  font-size: 0.85rem`. Mismo contenido que hoy (autor • tiempo de lectura);
  la fecha NO se añade (ver D1 del research).
- Descripción: `p.search-results__description` — `color: var(--color-text);
  font-size: 0.95rem; line-height: 1.5;` clamp a 2 líneas
  (`display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient:
  vertical; overflow: hidden`).
- Tags: `div.search-results__tags` (flex, wrap, gap 8px, margin-top 6px) con
  píldoras `span.search-results__tag` más pequeñas que hoy: `padding: 3px
  10px; font-size: 0.78rem; color: var(--color-accent); border: 1px solid
  var(--color-border); border-radius: var(--radius-pill)`.

## Estados

- **Reposo**: fila transparente sobre `--color-background`; la separación la
  dan los hairline `--color-border`. Sin caja por item: lee como lista, no
  como tarjetas pequeñas.
- **Hover** (REQ-09-06/07): la fila resalta con `background:
  var(--color-surface)` (wash suave con radio `--radius-card`) y el título se
  subraya. Transición `var(--transition-default)`.
- **Focus**: outline nativo del navegador sobre el enlace (mismo nivel que el
  resto del sitio; sin estilos de focus propios en esta feature).
- **Responsive ≤768px** (REQ-09-09): `img.search-results__thumb { display:
  none; }`, padding del item reducido (`12px 6px`), título 1rem.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#070716` | Fondo de la página (los items no tienen caja) |
| `--color-surface` | `#101018` | Wash de hover de la fila |
| `--color-border` | `rgba(255,255,255,.08)` | Separadores entre filas y borde de miniatura |
| `--color-text` | `#ffffff` | Título del item y descripción |
| `--color-text-secondary` | `#b8b8c5` | Meta de la fila |
| `--color-accent` | `#7d68ff` | Tags en píldora |
| `--radius-card` | `22px` | Radio del wash de hover de la fila |
| `--radius-pill` | `999px` | Tags en píldora |
| `--radius-thumb` | `10px` (**NUEVO**) | Radio de la miniatura 112×63 |
| `--gap-card` | `14px` | Gap entre miniatura y cuerpo |
| `--transition-default` | `.28s cubic-bezier(.2,.8,.2,1)` | Hover de la fila |
| `--font-sans` | Inter… | Tipografía del item |

> **Justificación del token nuevo `--radius-thumb: 10px`**: los radios
> existentes son 22px (tarjeta) y 999px (píldora). Sobre una miniatura de
> 112×63px, 22px equivale a un tercio del alto (blob casi circular) y el pill
> es inaplicable; 10px mantiene el lenguaje redondeado del sitio a escala
> proporcional. `tokens.css` está en 87/100 líneas: añadir una línea no supera
> el límite del arnés. El resto del CSS usa exclusivamente tokens existentes.

## Decisiones y constraints

- Decisión 1 (una sola presentación, sin toggle): el modo lista **sustituye**
  al grid como presentación única (REQ-09-01). El humano pidió lista, no un
  selector de vistas.
- Decisión 2 (migración del panel en vivo en la misma feature): `search-live`
  reutiliza las mismas clases y el mismo generador (REQ-05-04); sin migrarlo
  en la misma feature el panel quedaría roto al cerrar (REQ-09-10).
- Decisión 3 (extracción de `item-html.ts`): el controlador está en 100/100
  líneas; el generador (`itemHtml` + `esc`) se extrae a
  `src/components/search-results/item-html.ts` (regla 12, precedente
  `term-route.ts`). El controlador y `search-live.ts` importan `itemHtml`.
- Decisión 4 (JS de runtime): sin cambios — el rediseño no añade JS nuevo; el
  controlador existente (features 3/5/7) sigue siendo la excepción
  justificada.
- Decisión 5 (nombres): `data-search-grid`/`.search-results__grid` →
  `data-search-list`/`.search-results__list` en componente, controlador,
  panel en vivo y tests: el término "grid" ya no describe la presentación.
- Restricciones: estilos solo en `src/styles/*.css` (nunca `<style>` en
  `.astro`), tokens sin valores de color sueltos (guardián
  `audit-design-tokens.mjs`), lógica en `.ts`, ≤100 líneas por archivo, sin
  dependencias, una página por archivo, Layout único. Guía, empty state, botón
  de limpiar y paginación conservan sus estilos actuales (comportamiento de
  features 3/5/7).

## Alternativa descartada

- Alternativa considerada: filas como mini-tarjetas (caja surface + borde +
  gap por item) manteniendo la familia de tarjetas actual en pequeño.
- Motivo del descarte: sigue leyendo como "tarjetas" y el humano pidió
  explícitamente abandonar las tarjetas gigantes; la fila con separador
  hairline es la señal visual inequívoca de modo lista y reduce el ruido
  visual. También se descartó la lista solo texto (sin miniatura): pierde el
  ancla visual del catálogo y la fila queda plana.