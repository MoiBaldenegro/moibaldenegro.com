# Requisitos — Endurecer el iframe de YouTube del post de principios (feature 50 youtube-embed-hardening)
# Origen: audit_perf_security.md M6. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-50-01→1, REQ-50-02→2, REQ-50-03→3, REQ-50-04→4, REQ-50-05→5, REQ-50-06→6, REQ-50-07→7.

## Requisitos

REQ-50-01 Cada iframe de YouTube de src/content/posts SHALL usar el dominio https://www.youtube-nocookie.com/embed/.
REQ-50-02 Cada iframe de src/content/posts SHALL declarar loading="lazy" y referrerpolicy="strict-origin-when-cross-origin".
REQ-50-03 El atributo allow de cada iframe de src/content/posts SHALL omitir autoplay.
REQ-50-04 Cada iframe de src/content/posts SHALL conservar un atributo title no vacío.
REQ-50-05 WHEN se implemente la feature, el test tests/youtube-embed-hardening.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-50-06 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-50-07 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
