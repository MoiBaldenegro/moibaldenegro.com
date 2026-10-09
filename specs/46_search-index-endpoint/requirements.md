# Requisitos — Publicar el índice de búsqueda como asset estático /search-index.json (feature 46 search-index-endpoint)
# Origen: audit_perf_security.md M1 (paso 1 de 2). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-46-01→1, REQ-46-02→2, REQ-46-03→3, REQ-46-04→4, REQ-46-05→5, REQ-46-06→6, REQ-46-07→7.

## Requisitos

REQ-46-01 El endpoint src/pages/search-index.json.ts SHALL prerenderizarse en build y responder con Content-Type application/json.
REQ-46-02 El cuerpo de /search-index.json SHALL ser igual al índice que construye buildSearchIndex con el catálogo y los cuerpos de los posts.
REQ-46-03 La construcción del índice serializado SHALL vivir en una única función de dominio compartida por el endpoint y las páginas.
REQ-46-04 El build SHALL emitir dist/client/search-index.json como archivo estático.
REQ-46-05 WHEN se implemente la feature, el test tests/search-index-endpoint.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-46-06 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-46-07 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
