# Requisitos — Confirmar el copiado de código con región de estado y texto visible (feature 54 code-copy-status)
# Origen: audit_a11y.md M5. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-54-01→1, REQ-54-02→2, REQ-54-03→3, REQ-54-04→4, REQ-54-05→5, REQ-54-06→6, REQ-54-07→7, REQ-54-08→8.

## Requisitos

REQ-54-01 El componente code-copy.astro SHALL contener una única región role="status" con aria-live="polite" marcada con data-code-copy-status.
REQ-54-02 WHEN el portapapeles confirma la copia, el controlador de copiado SHALL escribir «Código copiado» en la región de estado.
REQ-54-03 IF la escritura en el portapapeles falla, THEN el controlador de copiado SHALL escribir «No se pudo copiar el código» en la región de estado.
REQ-54-04 WHEN el portapapeles confirma la copia, el botón SHALL mostrar el texto visible «Copiado» durante 2000 ms.
REQ-54-05 Los estilos del texto visible de copiado SHALL vivir en code-copy.css y usar exclusivamente tokens de tokens.css para colores.
REQ-54-06 WHEN se implemente la feature, el test tests/code-copy-status.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-54-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-54-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
