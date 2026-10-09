# Requisitos — Foco visible global en controles interactivos y × del buscador con objetivo táctil de 32px (feature 37 focus-visible-global)
# Origen: audit_a11y.md A2, B7 y M2. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-37-01→1, REQ-37-02→2, REQ-37-03→3, REQ-37-04→4, REQ-37-05→5, REQ-37-06→6, REQ-37-07→7, REQ-37-08→8, REQ-37-09→9.

## Requisitos

REQ-37-01 La regla de foco global de layout.css SHALL aplicar outline de 2px sólido con var(--color-accent) y outline-offset de 2px a :where(a, button, input, select, textarea, [tabindex]):focus-visible.
REQ-37-02 La hoja search-bar.css SHALL dejar de declarar outline: none o outline: 0 sobre el input del buscador.
REQ-37-03 Ninguna hoja de src/styles SHALL anular el outline de :focus-visible en botones o inputs.
REQ-37-04 El botón × del buscador del header SHALL medir al menos 32px de ancho y 32px de alto con el glifo centrado.
REQ-37-05 El input del buscador SHALL reservar un padding derecho de al menos 40px para que el texto no quede bajo el botón ×.
REQ-37-06 Los estilos nuevos de foco y del botón × SHALL usar exclusivamente custom properties de tokens.css para colores.
REQ-37-07 WHEN se implemente la feature, el test tests/focus-visible-global.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-37-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-37-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
