# Requisitos — Nombre real en site.webmanifest y quitar la meta generator (feature 58 manifest-generator-cleanup)
# Origen: audit_seo.md B5 y B6. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-58-01→1, REQ-58-02→2, REQ-58-03→3, REQ-58-04→4, REQ-58-05→5, REQ-58-06→6.

## Requisitos

REQ-58-01 El archivo public/site.webmanifest SHALL declarar name y short_name con el valor moibaldenegro.com.
REQ-58-02 Layout.astro SHALL omitir la meta generator.
REQ-58-03 El HTML del build SHALL omitir la meta generator en todas las páginas.
REQ-58-04 WHEN se implemente la feature, el test tests/manifest-generator-cleanup.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-58-05 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-58-06 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
