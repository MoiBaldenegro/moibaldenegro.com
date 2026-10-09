# Requisitos — Contraste y texto accesible de la insignia verificado y contraste del kicker del artículo (feature 52 contrast-badge-kicker)
# Origen: audit_a11y.md M3 y M4. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-52-01→1, REQ-52-02→2, REQ-52-03→3, REQ-52-04→4, REQ-52-05→5, REQ-52-06→6, REQ-52-07→7, REQ-52-08→8.

## Requisitos

REQ-52-01 La insignia de verificado del hero SHALL marcar el glifo ✓ con aria-hidden="true" y exponer el texto «Verificado» en un span visually-hidden.
REQ-52-02 El token --color-verified SHALL ofrecer un contraste de al menos 4.5:1 con --color-text.
REQ-52-03 El token --color-verified SHALL ofrecer un contraste de al menos 3:1 con --color-username-bg.
REQ-52-04 La regla .post__kicker SHALL usar var(--color-accent-hover) como color de texto.
REQ-52-05 El contraste entre --color-accent-hover y --color-hero-top SHALL ser de al menos 4.5:1.
REQ-52-06 WHEN se implemente la feature, el test tests/contrast-badge-kicker.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-52-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-52-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
