# Requisitos — Paginación de /search sin listeners acumulados y con foco conservado (feature 32 search-pagination-listeners)
# Origen: audit_a11y.md M6. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-32-01→1, REQ-32-02→2, REQ-32-03→3, REQ-32-04→4, REQ-32-05→5, REQ-32-06→6, REQ-32-07→7, REQ-32-08→8, REQ-32-09→9, REQ-32-10→10.

## Requisitos

REQ-32-01 El controlador de resultados de búsqueda SHALL registrar exactamente un manejador de click en cada botón de paginación por inicialización de la vista.
REQ-32-02 WHEN el usuario pulsa Siguiente, el controlador de resultados SHALL renderizar exactamente una vez la página actual más uno.
REQ-32-03 WHEN el usuario pulsa Anterior, el controlador de resultados SHALL renderizar exactamente una vez la página actual menos uno.
REQ-32-04 El controlador de resultados SHALL conservar la página actual en un estado único que comparten ambos manejadores de paginación.
REQ-32-05 WHEN cambia la página de resultados, el controlador de resultados SHALL mover el foco a la lista de resultados marcada con tabindex="-1".
REQ-32-06 IF el botón pulsado queda deshabilitado tras el cambio de página, THEN el controlador de resultados SHALL dejar el foco en la lista de resultados y no en body.
REQ-32-07 El orden de búsqueda recibido en la inicialización SHALL propagarse sin cambios a cada página renderizada, WHERE REQ-17-05 fija esa propagación.
REQ-32-08 WHEN se implemente la feature, el test tests/search-pagination-listeners.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-32-09 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-32-10 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
