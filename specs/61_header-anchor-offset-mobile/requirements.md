# Requisitos — Anclas visibles bajo el header envuelto en móvil y logo separado del borde (feature 61 header-anchor-offset-mobile)
# Origen: observación al cerrar la auditoría (impl_51.md: header de 137 px a 320 px frente a scroll-padding-top de 74 px). Análisis: progress/research/post_audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-61-01→1, REQ-61-02→2, REQ-61-03→3, REQ-61-04→4, REQ-61-05→5, REQ-61-06→6, REQ-61-07→7, REQ-61-08→8, REQ-61-09→9.

## Requisitos

REQ-61-01 El archivo tokens.css SHALL declarar el token --header-height-mobile con un valor en px mayor o igual que la altura medida del header a 320 px de ancho.
REQ-61-02 WHILE el viewport mide 768px de ancho o menos, la hoja layout.css SHALL aplicar scroll-padding-top: var(--header-height-mobile) sobre html.
REQ-61-03 WHILE el viewport mide más de 768px de ancho, la regla html de layout.css SHALL conservar scroll-padding-top: var(--header-height).
REQ-61-04 WHILE el viewport mide 768px de ancho o menos, la regla .site-navbar nav SHALL declarar padding-block: var(--gap-card).
REQ-61-05 WHEN se navega a un ancla con el viewport a 320 px o 375 px o 768 px de ancho, el borde superior del elemento destino SHALL quedar en o por debajo del borde inferior del header.
REQ-61-06 WHEN la página carga con el viewport a 320 px de ancho, el logo del header SHALL quedar separado del borde superior del viewport por al menos 8 px.
REQ-61-07 WHEN se implemente la feature, el test tests/header-anchor-offset-mobile.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-61-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-61-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
