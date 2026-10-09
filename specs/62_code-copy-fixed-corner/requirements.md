# Requisitos — Botón de copiar fijo en la esquina del bloque de código con scroll horizontal (feature 62 code-copy-fixed-corner)
# Origen: observación al cerrar la auditoría (el botón cuelga del pre con overflow-x: auto y se desplaza con su scroll). Análisis: progress/research/post_audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-62-01→1, REQ-62-02→1, REQ-62-03→2, REQ-62-04→3, REQ-62-05→4, REQ-62-06→5, REQ-62-07→6, REQ-62-08→7, REQ-62-09→8.

## Requisitos

REQ-62-01 WHEN initCodeCopy procesa un pre.astro-code, el controlador de copiado SHALL envolver ese pre en un elemento div con la clase code-block insertado en la posición original del pre.
REQ-62-02 WHEN initCodeCopy procesa un pre.astro-code, el controlador de copiado SHALL añadir el botón code-copy como hijo del envoltorio code-block y no como hijo del pre.
REQ-62-03 WHEN initCodeCopy se ejecuta dos veces sobre la misma página, el controlador de copiado SHALL conservar un único envoltorio y un único botón por bloque.
REQ-62-04 La hoja code-copy.css SHALL declarar position: relative sobre .post__content .code-block y no sobre pre.astro-code.
REQ-62-05 WHEN el usuario desplaza horizontalmente un bloque de código con desbordamiento, el botón de copiar SHALL mantener su posición en pantalla en la esquina superior derecha del bloque visible.
REQ-62-06 WHEN el usuario pulsa el botón de copiar, el controlador de copiado SHALL copiar al portapapeles el texto del code del pre envuelto.
REQ-62-07 WHEN se implemente la feature, el test tests/code-copy-fixed-corner.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-62-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-62-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
