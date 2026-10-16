# Requisitos — Mosaico del hero con todas las tecnologías y colocación calculada en el dominio (feature 98 hero-mosaic-layout)
# Origen: petición humana 2026-10-16 (todas las tecnologías del sprite; solo YouTube y GitHub como redes y al final; filas inferiores de 5 cards con una sola doble; personalizadas siempre arriba). Análisis: progress/research/hero-mosaic-layout.md.
# Toca UI/presentación: ver design.md en esta carpeta (mapa del mosaico fila por fila, tokens y plantilla de tamaños).
# Valores por defecto revisables (anotados en progress/current.md): zona superior opción B (HTB 5x4); doble de cada fila inferior en el 4.º hueco; reglas de tamaño en hero-section.css; hex #B4532F (claude) y #3D2B1F (bun).
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-98-01→1, REQ-98-02→1, REQ-98-03→1, REQ-98-04→1, REQ-98-05→2, REQ-98-06→2, REQ-98-07→2, REQ-98-08→3, REQ-98-09→4, REQ-98-10→4, REQ-98-11→5, REQ-98-12→6, REQ-98-13→6, REQ-98-14→6, REQ-98-15→7, REQ-98-16→8, REQ-98-17→8, REQ-98-18→8, REQ-98-19→9, REQ-98-20→10, REQ-98-21→10, REQ-98-22→10, REQ-98-23→10, REQ-98-24→11, REQ-98-25→11, REQ-98-26→12, REQ-98-27→12, REQ-98-28→13, REQ-98-29→13, REQ-98-30→13, REQ-98-31→14, REQ-98-32→14, REQ-98-33→14, REQ-98-34→15, REQ-98-35→15, REQ-98-36→16, REQ-98-37→16, REQ-98-38→16.

## Requisitos

REQ-98-01 El archivo src/data/hero-cards.json SHALL contener exactamente una tarjeta de icono con category tech por cada símbolo react, node, typescript, html, css, nestjs, aws, cloudflare, rust, claude, bun y claude-code del sprite con el id, title, colorToken e icon de la tabla de design.md.
REQ-98-02 El archivo src/data/hero-cards.json SHALL contener las tarjetas de icono youtube y github con category social y los títulos YOUTUBE y GITHUB.
REQ-98-03 El archivo src/data/hero-cards.json SHALL dejar de contener tarjetas cuyo icon apunte a #twitch, #instagram, #x, #linkedin, #strava, #verified o #htb-wordmark.
REQ-98-04 Cada fragmento de icon del sprite SHALL aparecer como mucho en una tarjeta de src/data/hero-cards.json.
REQ-98-05 Las tarjetas de src/data/hero-cards.json y las entidades de src/domain/entities/hero-card.ts SHALL dejar de declarar los campos gridColumn y gridRow.
REQ-98-06 WHEN una tarjeta de icono de hero-cards.json omite category, el parseo de src/domain/repositories/hero-cards-parse.ts SHALL entregarla con category tech.
REQ-98-07 IF una tarjeta de icono de hero-cards.json declara un category distinto de tech o social, THEN el parseo de src/domain/repositories/hero-cards-parse.ts SHALL lanzar HeroCardsDataError con el índice de la tarjeta y el nombre del campo category.
REQ-98-08 La función layoutHeroCards de src/domain/hero-grid-layout.ts SHALL entregar las tarjetas con las de kind distinto de icon primero, las de category tech después y las de category social al final, conservando el orden del JSON dentro de cada grupo.
REQ-98-09 La función layoutHeroCards SHALL asignar a las cinco primeras tarjetas ordenadas los tamaños 5x4, 2x2, 2x2, 5x2 y 2x2 (columnas x filas) de la plantilla de la zona superior de design.md.
REQ-98-10 La función layoutHeroCards SHALL asignar a cada grupo consecutivo de cinco tarjetas tras la zona superior los anchos 2, 2, 2, 4 y 2 columnas con 2 filas de alto.
REQ-98-11 La función layoutHeroCards SHALL entregar para cada tarjeta la columna y la fila de inicio que produce el auto-placement de CSS Grid en 12 columnas con el perfil reservado en las columnas 1 a 5 y las filas 1 a 6.
REQ-98-12 IF el número de tarjetas tras la zona superior no es múltiplo de 5, THEN la función layoutHeroCards SHALL lanzar HeroGridLayoutError con el número de tarjetas recibido.
REQ-98-13 IF la entrada contiene más de cinco tarjetas de kind distinto de icon, THEN la función layoutHeroCards SHALL lanzar HeroGridLayoutError.
REQ-98-14 IF alguna tarjeta de category social queda fuera de la última fila inferior, THEN la función layoutHeroCards SHALL lanzar HeroGridLayoutError con el id de esa tarjeta.
REQ-98-15 La salida de layoutHeroCards sobre src/data/hero-cards.json SHALL coincidir con el mapa del mosaico de design.md en id, columna, fila y tamaño de cada tarjeta.
REQ-98-16 El componente src/components/new-hero/new-hero.astro SHALL renderizar las tarjetas en el orden y con los tamaños que entrega layoutHeroCards.
REQ-98-17 Los componentes src/components/hero-card.astro y src/components/hero-cards/htb-card.astro SHALL emitir en su article los atributos data-col-span y data-row-span con el tamaño de layoutHeroCards y sin atributo style.
REQ-98-18 La hoja src/styles/hero-section.css SHALL traducir cada valor de data-col-span y data-row-span a --card-column y --card-row con la forma span N sin línea de inicio.
REQ-98-19 Las reglas [data-color-token] de src/styles/hero-card.css SHALL dejar de declarar --card-column y --card-row.
REQ-98-20 WHILE el viewport mide 1280 o 1600 px de ancho, el grid del hero SHALL mostrar cada article en la columna, la fila y el tamaño del mapa del mosaico de design.md.
REQ-98-21 WHILE el viewport mide 1280 o 1600 px de ancho, las filas 1 a 10 del grid del hero SHALL quedar cubiertas por el perfil y los article sin celdas vacías ni solapes.
REQ-98-22 WHILE el viewport mide 1280 o 1600 px de ancho, cada fila inferior del grid del hero SHALL contener 5 article con exactamente uno de 4 columnas y cuatro de 2 columnas.
REQ-98-23 WHILE el viewport mide 1280 o 1600 px de ancho, los article YOUTUBE y GITHUB SHALL quedar en la última fila del grid y la card HACK THE BOX en las columnas 6 a 12 y las filas 1 a 6.
REQ-98-24 La hoja src/styles/tokens.css SHALL declarar --color-marca-claude y --color-marca-bun con los hex de design.md sin superar 100 líneas.
REQ-98-25 Los tokens --color-marca-claude y --color-marca-bun SHALL alcanzar un contraste de al menos 4,5:1 frente al blanco de --color-text.
REQ-98-26 La hoja src/styles/tokens.css SHALL dejar de declarar --color-overlay-strong y --color-overlay-soft, WHERE ninguna hoja de src/ los referencia.
REQ-98-27 La hoja src/styles/hero-card.css SHALL declarar una regla [data-color-token] para claude y otra para bun con --card-bg a su token de marca y el --icon-width y el --icon-rotation de la tabla de design.md.
REQ-98-28 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, cada p.card-title del grid SHALL quedar con su borde derecho dentro del borde derecho de su card sin partir palabras.
REQ-98-29 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, ningún article del grid del hero SHALL sobrepasar el borde derecho del viewport, WHERE el scroll horizontal que provoca el header a 800 px pertenece a la feature 93 y queda fuera de alcance.
REQ-98-30 WHILE el viewport mide 1280 o 1600 px de ancho, el contenido de la card HACK THE BOX SHALL quedar dentro de su article sin recorte.
REQ-98-31 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, la nube del símbolo cloudflare (región 0 0 165 76 de su viewBox 0 0 512 76) SHALL quedar proyectada con al menos el 90 % de su área dentro del article de la card CLOUDFLARE.
REQ-98-32 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, el rectángulo proyectado del logo de cada card RUST y AWS y CLAUDE CODE y NESTJS y CLAUDE y BUN y GITHUB y YOUTUBE SHALL quedar con su centro dentro del article de su card y al menos el 40 % de su área dentro de él.
REQ-98-33 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, la parte visible del icono de cada card RUST y AWS y CLAUDE CODE y NESTJS y CLOUDFLARE y GITHUB y CLAUDE y BUN SHALL tener intersección de área 0 con los rectángulos de las palabras de su p.card-title, WHERE algún fill del símbolo tiene un contraste inferior a 4,5:1 frente a --color-text.
REQ-98-34 Los ajustes de icono por tramo de src/styles/hero-card.css SHALL vivir solo dentro de sus bloques @media existentes como reglas [data-color-token] que declaran únicamente --icon-width o --icon-rotation o --icon-scale.
REQ-98-35 Los campos iconWidth y rotate de cada tarjeta de icono de src/data/hero-cards.json SHALL coincidir con el --icon-width y el --icon-rotation de su regla base fuera de @media en src/styles/hero-card.css.
REQ-98-36 Los tests que fijan 13 tarjetas o celdas o geometría o que congelan hero-section.css o hero-card.astro SHALL pasar a comprobar invariantes o la tabla de design.md con la nota «Ajuste feature 98 (precedente REQ-43-06)», WHERE la petición humana 2026-10-16 cambia el número de tarjetas y la colocación del mosaico.
REQ-98-37 WHEN se implemente la feature, el test tests/hero-mosaic-layout.test.mjs SHALL observarse en rojo antes de crear src/domain/hero-grid-layout.ts o de cambiar el JSON o las hojas.
REQ-98-38 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature con cada archivo tocado en 100 líneas o menos.
