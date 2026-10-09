# Requisitos — Header sin desborde en móvil y anclas no tapadas por la barra sticky (feature 51 header-mobile-reflow)
# Origen: audit_a11y.md M1. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-51-01→1, REQ-51-02→2, REQ-51-03→3, REQ-51-04→4, REQ-51-05→5, REQ-51-06→6, REQ-51-07→7, REQ-51-08→8.

## Requisitos

REQ-51-01 El archivo tokens.css SHALL declarar el token --header-height con valor 74px.
REQ-51-02 La regla .site-navbar de layout.css SHALL usar height: auto y min-height: var(--header-height) en lugar de una altura fija.
REQ-51-03 La hoja layout.css SHALL declarar scroll-padding-top: var(--header-height) sobre html.
REQ-51-04 WHILE la altura del viewport es de 500px o menos, el header SHALL usar position: static.
REQ-51-05 WHEN el viewport mide 320px de ancho, el header SHALL contener el buscador dentro de su caja sin solaparse con el contenido.
REQ-51-06 WHEN se implemente la feature, el test tests/header-mobile-reflow.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-51-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-51-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
