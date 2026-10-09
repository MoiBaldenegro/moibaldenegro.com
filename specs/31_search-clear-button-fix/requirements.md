# Requisitos — Arreglar el botón «Limpiar búsqueda» del estado vacío de /search (feature 31 search-clear-button-fix)
# Origen: audit_a11y.md A3 (bug confirmado por el líder). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-31-01→1, REQ-31-02→2, REQ-31-03→3, REQ-31-04→4, REQ-31-05→5, REQ-31-06→6, REQ-31-07→7, REQ-31-08→8.

## Requisitos

REQ-31-01 El botón «Limpiar búsqueda» del estado vacío de la vista de resultados SHALL identificarse con el atributo data-search-results-clear y no con data-search-clear.
REQ-31-02 El controlador de resultados de búsqueda SHALL localizar el botón de limpiar dentro de la raíz .search-results y no mediante una consulta global al documento.
REQ-31-03 WHEN el usuario pulsa «Limpiar búsqueda» en /search?q=<término> sin resultados, el controlador de resultados SHALL quitar el parámetro q de la URL y restaurar el título base y mostrar la guía ocultando estado vacío y lista y paginación.
REQ-31-04 WHEN el usuario pulsa «Limpiar búsqueda» en /<término> sin resultados, el controlador de resultados SHALL navegar al destino que devuelve clearDestination para ese pathname.
REQ-31-05 El botón × del buscador del header SHALL conservar data-search-clear y quedar sin manejadores registrados por el controlador de resultados.
REQ-31-06 WHEN se implemente la feature, el test tests/search-clear-button-fix.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-31-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-31-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
