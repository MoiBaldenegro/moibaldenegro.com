# Requisitos — Pulido de las cards del hero: logos grandes, NestJS legible, títulos sin tapar y HTB sin recorte (feature 101 hero-cards-polish)
# Origen: observaciones no bloqueantes 1-5 del reviewer de la 99 (progress/review_hero-os-panel-mosaic.md) y petición humana 2026-10-16 (literal): «Has todo lo que tengas pendiente de una ves». Análisis: progress/research/hero-cards-polish.md.
# Toca UI/presentación: ver design.md en esta carpeta (valores de partida de tokens, anchos y escalas).
# Se conserva de 97/98/99 todo lo no revocado: YouTube como red, colores de marca (salvo --color-marca-nestjs), NODE JS/NESTJS/TYPESCRIPT como grandes, mapa del mosaico de specs/99_hero-os-panel-mosaic/design.md y cálculo en src/domain sin cambios. El punto 5 opcional (menos alineación en las columnas 9-12) queda fuera por no ser barato (prueba en el análisis y en design.md).
# Medición: Chrome headless + CDP con el criterio de la 97/99 (rect de cada palabra del título ∩ bbox visible del logo proyectado con su transform en reposo, recortado al article).
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-101-01→1, REQ-101-02→1, REQ-101-03→1, REQ-101-04→2, REQ-101-05→2, REQ-101-06→2, REQ-101-07→3, REQ-101-08→4, REQ-101-09→4, REQ-101-10→4, REQ-101-11→5, REQ-101-12→5, REQ-101-13→5, REQ-101-14→6, REQ-101-15→7, REQ-101-16→7, REQ-101-17→8, REQ-101-18→8, REQ-101-19→9, REQ-101-20→9, REQ-101-21→10.

## Requisitos

REQ-101-01 La hoja src/styles/tokens.css SHALL declarar --color-marca-nestjs con el hex de design.md en lugar de #A3132F.
REQ-101-02 El fondo --color-marca-nestjs SHALL dar un contraste de al menos 4,5:1 frente al color --color-text del título de la card NESTJS.
REQ-101-03 El fondo --color-marca-nestjs SHALL dar un contraste de al menos 3:1 frente al fill #E0234E del símbolo nestjs de public/assets/svg/sprite.svg.
REQ-101-04 Las reglas base de [data-color-token="node"]/[data-color-token="nestjs"]/[data-color-token="typescript"] de las hojas del hero SHALL declarar el --icon-width de escritorio de la tabla de design.md.
REQ-101-05 WHILE el viewport mide 1280 o 1600 px de ancho, el área visible del logo de cada card grande (NODE JS/NESTJS/TYPESCRIPT) SHALL medir al menos 1,5 veces la mediana del área visible del logo de las cards de icono de 2x2.
REQ-101-06 WHILE el viewport mide 1280 o 1600 px de ancho, el logo de cada card grande (NODE JS/NESTJS/TYPESCRIPT) SHALL tener el centro dentro del article y al menos el 40 % de su área visible.
REQ-101-07 El bloque @media (max-width: 1200px) de las hojas del hero SHALL declarar para node, nestjs, typescript, css y html el --icon-width y el --icon-scale de tablet de la tabla de design.md.
REQ-101-08 WHILE el viewport mide uno de los anchos 375/769/800/1024/1200/1280/1600 px, cada una de las 14 cards de icono del hero SHALL dejar en 0 px² el solape entre los rects de las palabras de su título y el área visible de su logo.
REQ-101-09 WHILE el viewport mide uno de los anchos 375/769/800/1024/1200/1280/1600 px, el logo de cada una de las 14 cards de icono SHALL tener el centro dentro del article y al menos el 40 % de su área visible.
REQ-101-10 WHILE el viewport mide uno de los anchos 375/769/800/1024/1200/1280/1600 px, cada palabra del título de las 15 cards del hero SHALL quedar dentro de su article en una sola caja de línea.
REQ-101-11 WHILE el viewport mide uno de los anchos 375/769/800/1024/1200/1280/1600 px, cada palabra del aviso «Estadísticas no disponibles» de la card HTB SHALL quedar dentro del article en una sola caja de línea.
REQ-101-12 WHILE el viewport mide uno de los anchos 375/769/800/1024/1200/1280/1600 px, el rect de .htb-stadistics__empty SHALL quedar dentro del article HTB sin intersección con los rects de las palabras del título «HACK THE BOX».
REQ-101-13 Los cambios de la card HTB SHALL limitarse a src/styles/htb-card.css y src/styles/htb-stadistics.css con valores derivados de los tokens de tokens.css.
REQ-101-14 La hoja src/styles/hero-card.css SHALL quedar sin las declaraciones grid-column: var(--card-column) y grid-row: var(--card-row) y sin ninguna referencia a --card-column o --card-row.
REQ-101-15 Cada hoja CSS tocada o creada por la feature SHALL medir 100 líneas o menos y tomar los colores solo de custom properties de tokens.css.
REQ-101-16 IF las reglas de iconos superan las 100 líneas de hero-card.css, THEN la feature SHALL moverlas a src/styles/hero-card-icons.css importada por src/components/hero-card.astro.
REQ-101-17 Los archivos src/domain/hero-grid-layout.ts y src/domain/hero-grid-template.ts y src/data/hero-cards.json SHALL quedar sin cambios respecto al estado aprobado de la feature 99.
REQ-101-18 WHILE el viewport mide 1280 o 1600 px de ancho, el grid del hero SHALL mostrar cada article en la columna, la fila y el tamaño del mapa de specs/99_hero-os-panel-mosaic/design.md sin celdas vacías ni solapes.
REQ-101-19 Los componentes del hero SHALL renderizarse sin atributo style y sin etiquetas script nuevas, con 0 errores de consola a 375, 800, 1024, 1280 y 1600 px.
REQ-101-20 Cada test existente ajustado por la feature SHALL llevar la nota «Ajuste feature 101 (precedente REQ-43-06)» junto a la aserción cambiada.
REQ-101-21 La verificación de la feature SHALL guardar las capturas del grid del hero en progress/research/hero101/hero-grid-375.png, hero-grid-800.png, hero-grid-1024.png, hero-grid-1280.png y hero-grid-1600.png.
