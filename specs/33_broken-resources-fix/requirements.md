# Requisitos — Eliminar recursos rotos: /favicon.svg inexistente y portada arch03.webp del post de SOLID (feature 33 broken-resources-fix)
# Origen: audit_seo.md M6 y audit_perf_security.md B1 (favicon.svg confirmado por el líder). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-33-01→1, REQ-33-02→2, REQ-33-03→3, REQ-33-04→4, REQ-33-05→5, REQ-33-06→6, REQ-33-07→7, REQ-33-08→8.

## Requisitos

REQ-33-01 Layout.astro SHALL dejar de enlazar /favicon.svg mientras ese archivo no exista en public/.
REQ-33-02 Layout.astro SHALL declarar cada recurso de favicon y el manifest exactamente una vez.
REQ-33-03 Cada ruta local referenciada por href o src en Layout.astro SHALL corresponder a un archivo existente en public/.
REQ-33-04 El post 03-principios_solid.md SHALL declarar en su campo img un archivo existente en public/assets/content/, WHERE la portada asignada es arch00.webp hasta que el humano aporte arch03.webp.
REQ-33-05 El campo img de cada post de src/content/posts SHALL corresponder a un archivo existente en public/assets/content/.
REQ-33-06 WHEN se implemente la feature, el test tests/broken-resources-fix.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-33-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-33-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
