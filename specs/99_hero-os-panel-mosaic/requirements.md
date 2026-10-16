# Requisitos — Mosaico del hero estilo panel de sistema operativo con las tecnologías más relevantes en grande (feature 99 hero-os-panel-mosaic)
# Origen: notas humanas 2026-10-16 sobre la captura acomodo.PNG (cards no alineadas con patrones distintos por fila como un panel de sistema operativo; las grandes son las tecnologías más «pro»). Análisis: progress/research/hero-os-panel-mosaic.md.
# Toca UI/presentación: ver design.md en esta carpeta (mapa del mosaico de escritorio fila por fila con columna y span de cada card).
# Se conserva de la feature 98 todo lo no revocado: todas las tecnologías del sprite, solo YOUTUBE y GITHUB como redes y al final, personalizadas arriba, 5 cards por fila inferior con una sola de 4 columnas, perfil 1-5 x 1-6, sin huecos ni solapes y cálculo en src/domain/hero-grid-layout.ts. Sustituye a REQ-98-09, REQ-98-10 y REQ-98-15 (plantilla y mapa).
# Valores por defecto revisables (anotados en progress/current.md): grandes NODE JS, NESTJS y TYPESCRIPT (las tres primeras tecnologías del perfil); campo booleano featured en el JSON; patrones de fila inferior 4-2-2-2-2 y 2-2-4-2-2; sin cards de 2 filas de alto.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-99-01→1, REQ-99-02→2, REQ-99-03→2, REQ-99-04→2, REQ-99-05→3, REQ-99-06→3, REQ-99-07→4, REQ-99-08→4, REQ-99-09→4, REQ-99-10→5, REQ-99-11→5, REQ-99-12→5, REQ-99-13→6, REQ-99-14→6, REQ-99-15→7, REQ-99-16→7, REQ-99-17→7, REQ-99-18→8, REQ-99-19→9, REQ-99-20→9, REQ-99-21→9, REQ-99-22→9, REQ-99-23→10, REQ-99-24→10, REQ-99-25→10, REQ-99-26→11, REQ-99-27→11, REQ-99-28→12, REQ-99-29→12, REQ-99-30→13, REQ-99-31→13, REQ-99-32→14, REQ-99-33→15, REQ-99-34→15.

## Requisitos

REQ-99-01 El archivo src/data/hero-cards.json SHALL declarar featured true en las tarjetas node, nestjs y typescript y en ninguna otra tarjeta, con el orden del array de la tabla de design.md.
REQ-99-02 La entidad HeroCard de src/domain/entities/hero-card.ts SHALL declarar el campo readonly featured de tipo boolean.
REQ-99-03 WHEN una tarjeta de icono de hero-cards.json omite featured, el parseo de src/domain/repositories/hero-cards-parse.ts SHALL entregarla con featured false.
REQ-99-04 IF una tarjeta de icono de hero-cards.json declara un featured que no es booleano, THEN el parseo de src/domain/repositories/hero-cards-parse.ts SHALL lanzar HeroCardsDataError con el índice de la tarjeta y el nombre del campo featured.
REQ-99-05 La función layoutHeroCards de src/domain/hero-grid-layout.ts SHALL usar la plantilla de la zona superior 5x4, 2x2, 2x2, 2x2 y 5x2 (columnas x filas) con el quinto hueco como hueco grande.
REQ-99-06 La función layoutHeroCards SHALL asignar a la fila inferior de índice i los anchos 4, 2, 2, 2 y 2 cuando i es par y 2, 2, 4, 2 y 2 cuando i es impar, con 2 filas de alto y el hueco de 4 columnas como hueco grande.
REQ-99-07 La función layoutHeroCards SHALL colocar las tarjetas de kind distinto de icon en los primeros huecos de la zona superior en el orden del JSON.
REQ-99-08 La función layoutHeroCards SHALL asignar las tarjetas de category tech con featured true a los huecos grandes en el orden del JSON.
REQ-99-09 La función layoutHeroCards SHALL asignar a los huecos pequeños de 2x2 las tarjetas de category tech sin featured en el orden del JSON y después las de category social.
REQ-99-10 IF el número de tarjetas de category tech con featured true difiere del número de huecos grandes de la plantilla, THEN la función layoutHeroCards SHALL lanzar HeroGridLayoutError con los dos números.
REQ-99-11 IF una tarjeta de category social declara featured true, THEN la función layoutHeroCards SHALL lanzar HeroGridLayoutError con el id de esa tarjeta.
REQ-99-12 La función layoutHeroCards SHALL conservar los errores de REQ-98-12, REQ-98-13 y REQ-98-14 y la columna y fila de inicio del auto-placement de REQ-98-11.
REQ-99-13 La salida de layoutHeroCards sobre src/data/hero-cards.json SHALL coincidir con el mapa del mosaico de design.md en id, columna, fila y tamaño de cada tarjeta.
REQ-99-14 La función layoutHeroCards SHALL devolver la misma salida en llamadas repetidas con la misma entrada sin usar Math.random ni Date.
REQ-99-15 Las tarjetas de tecnología con featured true de la salida de layoutHeroCards SHALL ocupar columnas disjuntas cuando sus filas se solapan o son contiguas.
REQ-99-16 La secuencia de anchos de las tarjetas que empiezan en cada par de filas (1-2 o 3-4 o 5-6 o 7-8 o 9-10) de la salida de layoutHeroCards SHALL diferir de la del par de filas siguiente.
REQ-99-17 Las tarjetas de category social y las de category tech sin featured SHALL recibir el tamaño 2x2 en la salida de layoutHeroCards.
REQ-99-18 Los componentes src/components/new-hero/new-hero.astro y src/components/hero-card.astro y src/components/hero-cards/htb-card.astro SHALL renderizar el orden y el tamaño de layoutHeroCards solo con data-col-span y data-row-span sin atributo style y sin etiquetas script nuevas.
REQ-99-19 WHILE el viewport mide 1280 o 1600 px de ancho, el grid del hero SHALL mostrar cada article en la columna, la fila y el tamaño del mapa del mosaico de design.md.
REQ-99-20 WHILE el viewport mide 1280 o 1600 px de ancho, las filas 1 a 10 del grid del hero SHALL quedar cubiertas por el perfil y los article sin celdas vacías ni solapes.
REQ-99-21 WHILE el viewport mide 1280 o 1600 px de ancho, los article NODE JS y NESTJS y TYPESCRIPT SHALL quedar sin columnas compartidas entre los que ocupan filas contiguas.
REQ-99-22 WHILE el viewport mide 1280 o 1600 px de ancho, los article YOUTUBE y GITHUB SHALL quedar en la última fila del grid con 2 columnas y la card HACK THE BOX en las columnas 6 a 10 y las filas 1 a 4.
REQ-99-23 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, cada p.card-title del grid SHALL quedar con su borde derecho dentro del borde derecho de su card sin partir palabras.
REQ-99-24 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, ningún article del grid del hero SHALL sobrepasar el borde derecho del viewport, WHERE el scroll horizontal que provoca el header a 800 px pertenece a la feature 93 y queda fuera de alcance.
REQ-99-25 WHILE el viewport mide 1280 o 1600 px de ancho, el contenido de la card HACK THE BOX SHALL quedar dentro de su article sin recorte.
REQ-99-26 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, el rectángulo proyectado del símbolo cloudflare completo (viewBox 0 0 512 76 con nube y texto) SHALL quedar al 100 % dentro del article de la card CLOUDFLARE.
REQ-99-27 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, el rectángulo proyectado del símbolo cloudflare SHALL tener intersección de área 0 con los rectángulos de las palabras del p.card-title de su card.
REQ-99-28 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, el rectángulo proyectado del logo de cada card de icono del grid SHALL quedar con su centro dentro del article de su card y al menos el 40 % de su área dentro de él.
REQ-99-29 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, la parte visible del icono de cada card RUST y AWS y CLAUDE CODE y NESTJS y GITHUB y CLAUDE y BUN SHALL tener intersección de área 0 con los rectángulos de las palabras de su p.card-title, WHERE algún fill del símbolo tiene un contraste inferior a 4,5:1 frente a --color-text.
REQ-99-30 Los ajustes de icono por tramo de src/styles/hero-card.css SHALL vivir solo dentro de sus bloques @media existentes como reglas [data-color-token] que declaran únicamente --icon-width o --icon-rotation o --icon-scale.
REQ-99-31 Los campos iconWidth y rotate de cada tarjeta de icono de src/data/hero-cards.json SHALL coincidir con el --icon-width y el --icon-rotation de su regla base fuera de @media en src/styles/hero-card.css.
REQ-99-32 Los tests que fijan la plantilla o el mapa de la feature 98 o el orden del JSON o los valores de icono que cambian SHALL pasar a comprobar las invariantes o la tabla de design.md con la nota «Ajuste feature 99 (precedente REQ-43-06)», WHERE las notas humanas 2026-10-16 cambian la colocación y el tamaño de las cards.
REQ-99-33 WHEN se implemente la feature, el test tests/hero-mosaic-layout.test.mjs con las invariantes de esta spec SHALL observarse en rojo antes de cambiar src/domain/hero-grid-layout.ts o el JSON o las hojas.
REQ-99-34 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature con cada archivo tocado en 100 líneas o menos.
