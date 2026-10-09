# Requisitos — Jerarquía de encabezados de la portada: tarjetas del hero sin h3 y títulos de artículo en h3 (feature 55 home-heading-hierarchy)
# Origen: audit_seo.md B2 y audit_a11y.md B1 y B2. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-55-01→1, REQ-55-02→2, REQ-55-03→3, REQ-55-04→4, REQ-55-05→5, REQ-55-06→6, REQ-55-07→7, REQ-55-08→8.

## Requisitos

REQ-55-01 El componente hero-card.astro SHALL renderizar el título de la tarjeta como <p class="card-title"> y no como encabezado.
REQ-55-02 El componente latest-articles.astro SHALL renderizar el título de cada card de artículo como h3 con la clase latest-articles__title.
REQ-55-03 El svg de cada tarjeta del hero SHALL declarar aria-hidden="true" y focusable="false".
REQ-55-04 La portada del build SHALL presentar encabezados sin saltos de nivel desde el h1.
REQ-55-05 Las hojas hero-card.css y latest-articles.css SHALL conservar la apariencia de los títulos con los selectores nuevos y solo tokens para colores.
REQ-55-06 WHEN se implemente la feature, el test tests/home-heading-hierarchy.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-55-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-55-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
