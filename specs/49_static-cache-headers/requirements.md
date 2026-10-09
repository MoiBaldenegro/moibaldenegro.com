# Requisitos — Caché de /assets/* y de la server island de HTB (feature 49 static-cache-headers)
# Origen: audit_perf_security.md M4 y M5. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-49-01→1, REQ-49-02→2, REQ-49-03→3, REQ-49-04→4, REQ-49-05→5, REQ-49-06→6, REQ-49-07→7, REQ-49-08→8.

## Requisitos

REQ-49-01 El archivo public/_headers SHALL declarar para /assets/* la cabecera Cache-Control: public, max-age=604800.
REQ-49-02 El módulo src/domain/http/cache-policy.ts SHALL exportar las políticas de caché de assets y de la isla de HTB como constantes.
REQ-49-03 La server island htb-stadistics.astro SHALL fijar Cache-Control: public, max-age=3600 en su respuesta mediante la constante de cache-policy.ts.
REQ-49-04 Las páginas HTML SHALL conservar la revalidación por defecto sin caché larga.
REQ-49-05 El build SHALL emitir en dist/client/_headers la regla /assets/* junto a la de seguridad y la de /_astro/*.
REQ-49-06 WHEN se implemente la feature, el test tests/static-cache-headers.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-49-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-49-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
