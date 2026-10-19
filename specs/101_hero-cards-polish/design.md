# Diseño — feature 101 hero-cards-polish

## Contexto visual

- Sección: mosaico de cards del hero de la portada (src/components/new-hero/new-hero.astro, hero-card.astro, hero-cards/htb-card.astro). Geometría de la 99 sin cambios.
- Estado actual (capturas progress/research/hero99/hero-grid-{800,1280}.png): logos de las 3 grandes casi del tamaño del de una 2x2 (card vacía); NESTJS rojo sobre rojo (1,68:1); CSS y HTML tapan su título a 800/1024 (456 y 606 px²); el aviso «Estadísticas no disponibles» de HTB se corta a 800 px; hero-card.css arrastra grid-column/grid-row con --card-column/--card-row sin definir.
- Estado deseado: logos de las grandes claramente mayores en escritorio, NESTJS con logo distinguible, 0 px² de solape título/logo en todas las cards y anchos medidos, aviso HTB legible entero.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-nestjs` | #3A0D18 (antes #A3132F) | fondo card NESTJS: título blanco 16,79:1, logo #E0234E 3,61:1 |
| `--color-text` | #ffffff | título de las cards (sin cambios) |
| `--gap-card` | 14px | base de los paddings de la card HTB en tablet |

Alternativas de fondo NestJS medidas (logo / blanco): #2A0A12 3,93 / 18,25; #330B16 3,77 / 17,50; #4A0F1E 3,28 / 15,24.

## Anchos y escalas de icono (valores de partida, calibrables)

| Card | Escritorio >= 1201 px (regla base) | Tablet <= 1200 px (@media) |
|------|-----------------------------------|-----------------------------|
| node | --icon-width 240px (antes 165), scale 5 | --icon-width 165px, --icon-scale 3 |
| nestjs | --icon-width 230px (antes 160), scale 5 | --icon-width 160px, --icon-scale 3 |
| typescript | --icon-width 220px (antes 150), scale 5 | --icon-width 150px, --icon-scale 2 |
| css | sin cambios (105px, scale 5) | --icon-width 105px, --icon-scale 3 (nuevo) |
| html | sin cambios (115px, scale 5) | --icon-width 115px, --icon-scale 3 (nuevo) |
| resto | sin cambios (valores 97/98/99) | sin cambios |

A <= 768 px sigue rigiendo `.card-icon svg { width: 110px !important; }`. Si la medida pide otro valor para cumplir REQ-101-05/06/08/09, el implementer lo ajusta y actualiza esta tabla con el valor medido (precedente de la 93).

## Card HTB en <= 1200 px

- Dentro de `@media (max-width: 1200px)` en htb-card.css: padding del cuerpo reducido (partida: superior calc(var(--gap-card) * 3.5), laterales calc(var(--gap-card) / 2)) para dejar libre el título de 2 líneas.
- En htb-stadistics.css (mismo tramo): `.htb-stadistics__empty` con padding calc(var(--gap-card) / 2), font-size 0.75rem y sin partir palabras, de forma que «Estadísticas», «no» y «disponibles» quepan en la card de 113 px a 800.
- Valores calibrables con la medida de REQ-101-11/12.

## Decisiones y constraints

- Decisión 1: NestJS se resuelve oscureciendo el token de fondo y no tratando el icono: el fill #E0234E del sprite es fijo y un filtro alteraría el color de marca del logo.
- Decisión 2: las grandes crecen solo en escritorio (regla base) y se fijan sus anchos de tablet en el @media para no mover los resultados medidos de la 99 en <= 1200 px.
- Decisión 3: sin exenciones de solape (NESTJS ya da 0 px²). Si una card no llega a 0 px² con >= 40 % de logo visible, el implementer para y lo reporta.
- Decisión 4: punto 5 fuera (ver Alternativa descartada).
- Restricciones: tokens, <= 100 líneas por hoja (hero-card.css ~97 tras quitar 2 líneas y añadir overrides; si pasa de 100, partir en src/styles/hero-card-icons.css), sin style inline, sin JS, sin dependencias, sin tocar archivos de la 93 (layout.css, site-menu.css, search-bar.css, site-menu.ts).

## Alternativa descartada

- Alternativa considerada: cambiar el patrón de las filas 9-10 (p. ej. 2-2-2-2-4) para que las columnas 9-12 no coincidan con las de las filas 7-8.
- Motivo del descarte: con anchos {4,2,2,2,2} en 12 columnas toda card empieza en columna impar; las 2-col de dos filas ocupan cada una 4 de las 6 ranuras fijas (1-2 ... 11-12) y comparten al menos 2, así que siempre quedan >= 2 cards con columnas idénticas. Solo se mueve la coincidencia (con 2-2-2-2-4 serían CSS/YOUTUBE y REACT/GITHUB); reducirla exige romper «5 cards por fila con 1 doble».
