# Requisitos — Nombres accesibles de enlaces e imágenes: alts duplicados, logo, enlace externo y recomendados (feature 53 link-image-accessible-names)
# Origen: audit_a11y.md M7, B8, B9 y B10; audit_seo.md B3. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-53-01→1, REQ-53-02→2, REQ-53-03→3, REQ-53-04→4, REQ-53-05→5, REQ-53-06→6, REQ-53-07→7, REQ-53-08→8.

## Requisitos

REQ-53-01 Las imágenes que acompañan a un título enlazado o a un h1 SHALL declarar alt vacío.
REQ-53-02 El img del logo del header SHALL declarar alt «Inicio — moibaldenegro.com».
REQ-53-03 El enlace a https://x.com/moibaldenegro SHALL incluir el texto visually-hidden «(X, sitio externo)».
REQ-53-04 El enlace de cada recomendado SHALL extender su área de clic a la fila completa mediante un pseudo-elemento ::after.
REQ-53-05 El HTML del build SHALL contener el título de cada card de artículo una sola vez dentro del nombre accesible de su enlace.
REQ-53-06 WHEN se implemente la feature, el test tests/link-image-accessible-names.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-53-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-53-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
