# Requisitos — Cargar el índice de búsqueda bajo demanda y quitarlo del HTML (feature 47 search-index-lazy-load)
# Origen: audit_perf_security.md M1 (paso 2 de 2). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-47-01→1, REQ-47-02→2, REQ-47-03→3, REQ-47-04→4, REQ-47-05→5, REQ-47-06→6, REQ-47-07→7, REQ-47-08→8, REQ-47-09→9.

## Requisitos

REQ-47-01 Las páginas index.astro y search.astro y [...term].astro SHALL dejar de embeber el script search-index en su HTML.
REQ-47-02 El loader del índice SHALL pedir /search-index.json con un único fetch por sesión y reutilizar la promesa en llamadas posteriores.
REQ-47-03 WHEN el buscador del header de la portada recibe el primer focus o input, el panel en vivo SHALL solicitar el índice al loader.
REQ-47-04 WHEN se inicializa la vista de /search o de /<término>, el controlador de resultados SHALL solicitar el índice al loader antes de renderizar.
REQ-47-05 IF la petición del índice falla, THEN el controlador SHALL escribir «No se pudo cargar el índice de búsqueda» en el nodo de estado.
REQ-47-06 El tamaño de dist/client/index.html SHALL quedar por debajo de 40 000 bytes tras quitar el índice embebido.
REQ-47-07 WHEN se implemente la feature, el test tests/search-index-lazy-load.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-47-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-47-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
