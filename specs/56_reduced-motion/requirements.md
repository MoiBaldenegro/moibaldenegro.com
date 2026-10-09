# Requisitos — Respetar prefers-reduced-motion en animaciones y transiciones (feature 56 reduced-motion)
# Origen: audit_a11y.md B3 y audit_perf_security.md B3. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-56-01→1, REQ-56-02→2, REQ-56-03→3, REQ-56-04→4, REQ-56-05→5, REQ-56-06→6, REQ-56-07→7.

## Requisitos

REQ-56-01 La animación float de hero-section.css SHALL declararse solo dentro de @media (prefers-reduced-motion: no-preference).
REQ-56-02 La hoja layout.css SHALL declarar un bloque @media (prefers-reduced-motion: reduce) que reduce animation-duration y transition-duration a 0.01ms en todos los elementos.
REQ-56-03 WHILE el usuario prefiere movimiento reducido, las tarjetas del hero y la tarjeta de perfil SHALL omitir el desplazamiento por transform en hover.
REQ-56-04 Los bloques de movimiento reducido SHALL añadirse sin JavaScript de runtime.
REQ-56-05 WHEN se implemente la feature, el test tests/reduced-motion.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-56-06 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-56-07 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
