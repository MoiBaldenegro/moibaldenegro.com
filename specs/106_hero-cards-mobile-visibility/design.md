# Diseño — feature 106 hero-cards-mobile-visibility

## Contexto visual

- Sección: cuadrícula del hero de la portada (`src/components/new-hero/new-hero.astro`, `.hero-grid`).
- Hoy: en `<= 768 px` la cuadrícula es de una columna (`hero-section.css:63`) y apila el perfil y las 15 cards (HTB + 14 de icono).
- Deseado: en `<= 768 px` solo el perfil y las cards con `showOnMobile: true` (por defecto solo HACK THE BOX). En `> 768 px` (tablet de 6 columnas y escritorio de 12) todo igual que hoy.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--gap-card` | (sin cambio) | Separación entre los items visibles en móvil |

Ningún token nuevo; `tokens.css` no se toca.

## Decisiones y constraints (valores por defecto revisables)

- Decisión 1 — breakpoint «mobile» = `@media (max-width: 768px)`: es el tramo de una columna que ya usan `hero-section.css` y `hero-card.css`. 769–1200 px es tablet (6 columnas) y queda como hoy, incluido el ancho 800 de la verificación.
- Decisión 2 — nombre y forma del campo: `showOnMobile` booleano, declarado explícito en las 15 cards del JSON (htb `true`, resto `false`). Por defecto si falta: `false` en icono y `true` en ricas (la regla del humano se aplica también a cards nuevas).
- Decisión 3 — mecanismo: `data-show-on-mobile="true|false"` en el `article` y `@media (max-width: 768px) { .hero-grid > .hero-card[data-show-on-mobile="false"] { display: none; } }` en `hero-section.css` (65 líneas). `display: none` quita la card del layout (sin huecos: el gap solo separa items visibles), del árbol de accesibilidad y del orden de tabulación. Sin JS ni style inline.
- Decisión 4 — el mosaico de escritorio no cambia: `hero-grid-layout.ts` y su plantilla siguen recibiendo las 15 cards.
- Restricciones: `hero-cards-parse.ts` está en 99 líneas → se parte en un módulo hermano (p. ej. `hero-cards-fields-parse.ts` con los lectores de campos opcionales y `readSpriteRef`); ≤ 100 líneas por archivo; `hero-card.css` y `tokens.css` sin tocar.

## Verificación visual

Chrome headless + CDP a 375/800/1024/1280/1600 (scripts base en `cdp105/` del scratchpad). A 375: hijos visibles de `.hero-grid` = perfil + HTB, separación entre rectángulos consecutivos = `--gap-card` (±1 px), `Accessibility.getFullAXTree` sin los títulos de las 14 ocultas. A 800/1024/1280/1600: las 15 cards con rectángulos iguales a la línea base (±1 px). 0 errores de consola. Capturas: `progress/research/hero106/hero-<w>.png`.

## Alternativa descartada

- `hidden` / `aria-hidden` en el marcado o filtrar en el dominio: ocultaría también en escritorio o exigiría JS de media query. `visibility: hidden` dejaría el hueco en la columna.
