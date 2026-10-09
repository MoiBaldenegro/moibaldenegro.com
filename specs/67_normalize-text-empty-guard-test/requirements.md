# Requisitos — Test de la guarda de entrada vacía de normalizeText (feature 67 normalize-text-empty-guard-test)
# Origen: cambio manual del humano en src/domain/search/normalize.ts (if (!text) return '';) que se conserva y se regulariza con cobertura. Análisis: progress/research/cards_domain_backlog.md.
# No toca UI: sin design.md.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-67-01→1, REQ-67-02→2, REQ-67-03→2, REQ-67-04→3, REQ-67-05→4, REQ-67-06→5.

## Requisitos

REQ-67-01 WHEN normalizeText recibe la cadena vacía, normalizeText SHALL devolver la cadena vacía.
REQ-67-02 WHEN normalizeText recibe undefined coaccionado a string, normalizeText SHALL devolver la cadena vacía sin lanzar una excepción.
REQ-67-03 WHEN normalizeText recibe null coaccionado a string, normalizeText SHALL devolver la cadena vacía sin lanzar una excepción.
REQ-67-04 WHEN se elimina la línea if (!text) return ''; de normalize.ts, el test tests/normalize-text-empty-guard.test.mjs SHALL fallar en los casos undefined y null, WHERE la mutación sustituye al rojo previo porque el código ya existe.
REQ-67-05 La función normalizeText SHALL conservar el comportamiento de REQ-02-01 para textos no vacíos.
REQ-67-06 La suite completa del arnés y el script ./init.sh SHALL terminar en verde con el test nuevo dentro de 100 líneas, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
