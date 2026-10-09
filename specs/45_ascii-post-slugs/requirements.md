# Requisitos — Slugs de artículos en ASCII con guiones y redirecciones 301 desde las URLs antiguas (feature 45 ascii-post-slugs)
# Origen: audit_seo.md M4 y audit_perf_security.md B7. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-45-01→1, REQ-45-02→2, REQ-45-03→3, REQ-45-04→4, REQ-45-05→5, REQ-45-06→6, REQ-45-07→7, REQ-45-08→8.

## Requisitos

REQ-45-01 El slug de cada post de src/content/posts SHALL cumplir el patrón ^[a-z0-9]+(-[a-z0-9]+)*$.
REQ-45-02 Los posts 03-principios_solid.md y 01-diseño_detallado.md y 04-ciclo-de-vida-y-arquitectura.md SHALL declarar los slugs 03-principios-solid y 01-diseno-detallado y 04-ciclo-de-vida-y-arquitectura.
REQ-45-03 Cada referencia next o related de los posts SHALL apuntar a un slug existente de la colección.
REQ-45-04 El archivo astro.config.mjs SHALL declarar redirecciones 301 desde las tres URLs antiguas a las nuevas.
REQ-45-05 WHEN un test existente cite un slug antiguo, el test SHALL actualizarse al slug nuevo documentando el ajuste con el precedente REQ-43-06.
REQ-45-06 WHEN se implemente la feature, el test tests/ascii-post-slugs.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-45-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-45-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
