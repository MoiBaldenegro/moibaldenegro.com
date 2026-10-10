# Requisitos — Header de escritorio a 64 px (feature 77 header-height-64)
# Origen: petición humana 2026-10-09 «creo que el header podemos bajarlo a 64px y queda más bonito, aplícalo». Análisis: progress/research/header_64.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending. Supersede el valor de REQ-51-01 (74px); el resto de REQ-51 y REQ-61 sigue vigente.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-77-01/02→1, REQ-77-03→2, REQ-77-04/05→3, REQ-77-06/07→4, REQ-77-08→5, REQ-77-09→6, REQ-77-10→7, REQ-77-11→8, REQ-77-12/13/14→9, REQ-77-15/16→10.
# Enmienda 1 (2026-10-09, review_77 ronda 1, puntos 3 y 4): REQ-77-15/16 nuevos (logo display: block solo en >768 px) y REQ-77-09 reformulado (tolerancia de 1 px del borde del header).

## Requisitos

REQ-77-01 El archivo tokens.css SHALL declarar el token --header-height con valor 64px.
REQ-77-02 La feature SHALL dejar tokens.css en 97 líneas sin declarar tokens nuevos, WHERE los tests de conteo REQ-17-09, REQ-26-07, REQ-39-09, REQ-40-11 y REQ-42-09 fijan ese total.
REQ-77-03 La regla .site-navbar nav de layout.css SHALL conservar min-height: var(--header-height) y align-items: center sin ninguna altura en px escrita a mano.
REQ-77-04 WHILE el viewport mide más de 768px de ancho, el elemento .site-navbar SHALL medir 65 px de alto (64 px del nav más 1 px del borde inferior) con una tolerancia de ±1 px.
REQ-77-05 WHILE el viewport mide más de 768px de ancho, el nav del header SHALL cumplir scrollHeight menor o igual que clientHeight sin contenido desbordado.
REQ-77-06 WHILE el viewport mide 1280 px o 1440 px de ancho, el centro vertical del logo de 72×25 y de cada enlace del nav SHALL coincidir con el centro vertical del nav con una tolerancia de ±1 px.
REQ-77-07 WHILE el viewport mide 1280 px o 1440 px de ancho, el campo del buscador SHALL quedar centrado verticalmente en el nav con una tolerancia de ±1 px y dentro de su caja.
REQ-77-08 WHILE el viewport mide más de 768px de ancho, la regla html de layout.css SHALL resolver scroll-padding-top a 64 px mediante var(--header-height).
REQ-77-09 WHEN se navega a un ancla con el viewport a 1280 px o 1440 px o 375 px de ancho, el borde superior del elemento destino SHALL quedar en o por debajo del borde inferior del nav, es decir, en o por debajo del borde inferior del header con una tolerancia de 1 px que corresponde a su borde inferior, WHERE scroll-padding-top usa var(--header-height) sin el borde y ese desfase de 1 px ya ocurría con 74/75 px.
REQ-77-10 WHILE el viewport mide 768px de ancho o menos, el header SHALL conservar el alto medido antes del cambio con una tolerancia de ±1 px manteniendo --header-height-mobile: 170px y padding-block: var(--gap-card).
REQ-77-11 El test tests/header-mobile-reflow.test.mjs SHALL afirmar --header-height: 64px en REQ-51-01 con una nota de ajuste en su encabezado, WHERE el precedente REQ-43-06 permite actualizar aserciones de valor de features cerradas.
REQ-77-12 WHEN se implemente la feature, el test nuevo tests/header-height-64.test.mjs SHALL observarse en rojo antes de modificar tokens.css, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-77-13 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md fija ese máximo.
REQ-77-14 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
REQ-77-15 WHILE el viewport mide más de 768px de ancho, la regla .site-navbar a img { display: block; } de layout.css SHALL declararse solo dentro de un bloque @media (min-width: 769px) situado al final del archivo junto a las demás media queries, WHERE el img inline alineado a la línea de base quedaba 2 px por encima del centro del nav e incumplía REQ-77-06.
REQ-77-16 WHILE el viewport mide 768px de ancho o menos, la imagen del logo SHALL conservar su display inline sin la regla display: block, WHERE aplicarla en móvil bajaba el header de 375 px de 165 a 162 px e incumplía REQ-77-10.
