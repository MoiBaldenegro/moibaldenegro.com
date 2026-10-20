# Diseño — feature 103 hero-cards-extra-logos

## Contexto visual

- Componente: cards de icono del hero (`src/components/hero-card.astro`), tech y social. La card rica HTB no cambia.
- Hoy: título arriba a la izquierda (`.card-header`, z-index 4) e icono principal grande abajo a la derecha (`.card-icon svg`, rotación y escala por `data-color-token`, hover a rotate 2deg y escala x1.12).
- Deseado: dos capas opcionales y decorativas más, iguales en todas las cards que las declaren:
  - **Esquina** (`.card-corner`): icono pequeño arriba a la derecha, a la altura del título.
  - **Fondo** (`.card-backdrop`): logo (normalmente un wordmark) en la franja inferior, con opacidad 0,1, pintado **por encima** del icono principal como marca de agua (z-index 2; ajuste de la revisión 1).
- Sin campos, la card queda igual que hoy (mismo HTML y mismas reglas aplicadas).

## Datos (src/data/hero-cards.json)

| Card | icon | cornerIcon | backgroundIcon |
|------|------|------------|----------------|
| CLAUDE CODE | `#claude-code` (sin cambios) | `/assets/svg/sprite.svg#claude` | `/assets/svg/sprite.svg#anthropic-wordmark` |
| GITHUB | `#github` (sin cambios) | (omitido) | `/assets/svg/sprite.svg#github-wordmark` |
| Resto (12 de icono) | sin cambios | (omitido) | (omitido) |

GITHUB con fondo es decisión del spec_author (mismo tratamiento que Anthropic: símbolo + wordmark de la marca), revisable por el humano.

## Marcado (hero-card.astro)

Orden de hijos del `article.hero-card`: `header.card-header`, `div.card-backdrop` (si hay backgroundIcon), `div.card-icon`, `div.card-corner` (si hay cornerIcon). Cada capa nueva lleva `<svg aria-hidden="true" focusable="false"><use href=… xlink:href=…/></svg>`, como el icono principal. El backdrop sigue antes de `.card-icon` en el DOM (REQ-103-09 sin cambios), pero su z-index 2 lo pinta por encima del icono principal (que no declara z-index) y por debajo de la esquina (3) y del header (4).

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--gap-card` | 14px | `bottom` de la franja del fondo |
| `--card-bg` (por card, ya existe) | `--color-marca-*` | fondo de marca sobre el que se calcula el contraste compuesto |

Sin tokens nuevos en `tokens.css` (99 líneas). `--card-backdrop-opacity: 0.1` es una custom property local de la hoja nueva (precedente `--icon-scale`, `--icon-width`): la opacidad no es un grupo de tokens del proyecto. Los offsets en px siguen el precedente de `hero-card.css` (22px/18px del header, 14px en tablet).

## Valores por defecto (revisables, no bloquean)

| Propiedad | >= 1201 px | <= 1200 px |
|-----------|-----------|-----------|
| svg de `.card-corner` | 22x22 px, top 16px, right 16px | 18x18 px, top 14px, right 14px |
| `right` del header con esquina | 46px (16 + 22 + 8) | 40px (14 + 18 + 8) |
| franja `.card-backdrop` | left/right 22px, bottom var(--gap-card), alto 40px | left/right 14px, alto 28px |
| opacidad del fondo | 0.1 | 0.1 |
| z-index de `.card-backdrop` (revisión 1) | 2 | 2 |
| visibilidad mínima del fondo (revisión 1) | >= 60 % de la rejilla | >= 60 % de la rejilla |

El svg del fondo ocupa el 100 % de la franja con el `preserveAspectRatio` por defecto (xMidYMid meet): un wordmark ancho se ajusta al ancho y queda centrado; el alto de la franja limita su tamaño en cards anchas (móvil de una columna).

## Ajuste de la revisión 1 (CHANGES_REQUESTED)

El reviewer midió en `progress/review_hero-cards-extra-logos.md` que el rectángulo del icono principal cubre el 84 % (CLAUDE CODE) y el 91 % (GITHUB) del wordmark a 1280 px: solo se lee «AN». La causa es el orden de pintado: el fondo estaba en z-index 0 y antes de `.card-icon`, y el icono principal a escala 5 ocupa en escritorio casi toda la tarjeta. Se elige la opción (a) del reviewer: el fondo sube a z-index 2 y se pinta encima del icono como marca de agua tenue. Franja, alineación, tamaño y opacidad no cambian.

- Visibilidad (REQ-103-32): la CDP coloca una rejilla de 20 x 5 puntos sobre el rectángulo del `use` de `.card-backdrop`, recortado a la tarjeta. Solo para medir, inyecta en la página (no en el código) `pointer-events: auto` en los svg de `.card-backdrop`, `.card-icon` y `.card-corner`. En cada punto llama a `document.elementsFromPoint` y anota cuál de estas capas sale primero: svg del fondo, svg del icono principal, `.card-title` o svg de la esquina. Cuenta como visible el punto donde gana el fondo. El umbral es de al menos el 60 % a 375/800/1024/1280/1600 px en CLAUDE CODE y GITHUB (valor por defecto revisable).
- Título (REQ-103-24/33): solape 0 px entre título y fondo, y contraste del título de al menos 4,5:1 frente al color compuesto (fondo de marca más blanco a 0,1). El header (z-index 4) sigue por encima de todo.
- Capturas: se regeneran `claude-code-<w>.png` y `github-<w>.png` en `progress/research/hero103/`.

## Decisiones y constraints

- Decisión 1 — hoja nueva `src/styles/hero-card-accents.css`: `hero-card.css` está en 99 líneas. El nombre evita `hero-card-icons.css`, que los tests de la 101 incluyen en sus reglas de icono.
- Decisión 2 — todas las reglas de la hoja nueva nombran `.card-corner` o `.card-backdrop` (incluido `.hero-card:has(> .card-corner) .card-header`): una card sin campos no recibe ninguna regla nueva, que es la garantía de no-regresión en CSS.
- Decisión 3 — el header se reserva con `:has()` (CSS estático, sin JS ni clase calculada en el frontmatter). Si el título no cabe en el ancho restante, parte en dos líneas; nunca se superpone al icono de esquina.
- Decisión 4 — capas estáticas en hover: sin transform ni transition propios. El `filter: contrast(1.4)` del hover de la card las afecta como al resto de la card (se acepta).
- Decisión 5 — accesibilidad: capas `aria-hidden` y `focusable="false"`; el título (z-index 4) queda por encima. Con fill blanco al 10 % sobre `--color-marca-claude-code` (#5C2A1C) o `--color-marca-github` (#091223), el título blanco mantiene más de 4,5:1 (8,73:1 y 14,46:1 medidos en el impl); la CDP mide el solape 0 y el contraste (REQ-103-24/33).
- Restricciones: estático (0 JS), sin dependencias, sin style inline, <= 100 líneas por archivo, colores solo desde tokens, mosaico sin cambios (`hero-grid-layout.ts`, `hero-grid-template.ts`), sprite del humano sin tocar.

## Verificación visual

Chrome headless + CDP (scripts de las 97/99/101 en el scratchpad) a 375, 800, 1024, 1280 y 1600 px: línea base de los rectángulos de las 15 cards antes de implementar; después, mismos rectángulos (±1 px), solape título/esquina y título/fondo en CLAUDE CODE y GITHUB, contraste compuesto si hay solape, scroll horizontal del hero y errores. Capturas en `progress/research/hero103/`.

## Alternativa descartada

- (Revisión 1) Mover el fondo a la franja central o superior, o alinearlo a la izquierda: en escritorio el icono principal escalado x5 cubre casi toda la tarjeta (de 2x2), así que ninguna posición dentro de ella libra el icono de forma estable a los cinco anchos, y subir la franja la acerca al título. Además cambiaría los valores de REQ-103-19, que el reviewer da por buenos. Se descarta en favor del z-index.

- Fondo como `background-image` CSS con la URL del sprite por card: obliga a una regla por `data-color-token` con la URL en CSS (dato en estilos) y no permite `<use>` del sprite con fragmento en todos los navegadores. Se descarta en favor del svg `<use>` en el marcado, igual que el icono principal.
- Clase modificadora calculada en el frontmatter para reservar el header: añade lógica al `.astro`; `:has()` lo resuelve en CSS.
