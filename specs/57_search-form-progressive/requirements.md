# Requisitos — Buscador del header como formulario de búsqueda con mejora progresiva (feature 57 search-form-progressive)
# Origen: audit_a11y.md B5 y B6. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-57-01→1, REQ-57-02→2, REQ-57-03→3, REQ-57-04→4, REQ-57-05→5, REQ-57-06→6, REQ-57-07→7, REQ-57-08→8, REQ-57-09→9.

## Requisitos

REQ-57-01 El componente search-bar.astro SHALL envolver el input en un elemento search con un form action="/search" method="get".
REQ-57-02 El input del buscador SHALL declarar type="search" y name="q" y enterkeyhint="search".
REQ-57-03 WHEN el formulario se envía con JavaScript activo, el controlador del buscador SHALL cancelar el envío nativo y navegar a /search?q=<término> con navigate.
REQ-57-04 WHEN la vista /search se inicializa con un parámetro q, el controlador del buscador SHALL precargar el input con ese término.
REQ-57-05 IF el foco no está en el input del buscador ni en la región de resultados, THEN el manejador de Escape SHALL ignorar la tecla.
REQ-57-06 La hoja search-bar.css SHALL ocultar el botón de cancelar nativo del input de tipo search.
REQ-57-07 WHEN se implemente la feature, el test tests/search-form-progressive.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-57-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-57-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
