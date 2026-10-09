# Requisitos — Un único main en el Layout y enlace «Saltar al contenido» (feature 38 layout-main-skip-link)
# Origen: audit_a11y.md A4. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-38-01→1, REQ-38-02→2, REQ-38-03→3, REQ-38-04→4, REQ-38-05→5, REQ-38-06→6, REQ-38-07→7, REQ-38-08→8, REQ-38-09→9, REQ-38-10→10, REQ-38-11→11.

## Requisitos

REQ-38-01 Layout.astro SHALL envolver el slot de contenido en un único elemento <main id="contenido">.
REQ-38-02 Layout.astro SHALL renderizar como primer hijo de body un enlace con clase skip-link y href="#contenido" con el texto «Saltar al contenido».
REQ-38-03 Ningún archivo de src/pages o src/components SHALL declarar un elemento <main>.
REQ-38-04 Cada página del build SHALL contener exactamente un elemento main.
REQ-38-05 WHILE el enlace skip-link no tiene foco, el enlace SHALL permanecer fuera de la vista sin display: none ni visibility: hidden.
REQ-38-06 WHEN el enlace skip-link recibe foco, el enlace SHALL mostrarse visible por encima del header.
REQ-38-07 Los estilos del skip-link SHALL vivir en layout.css y usar exclusivamente tokens de tokens.css para colores y radios.
REQ-38-08 WHEN un test existente asevere un <main> de página, el test SHALL documentar en su encabezado el ajuste con el precedente REQ-43-06.
REQ-38-09 WHEN se implemente la feature, el test tests/layout-main-skip-link.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-38-10 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-38-11 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
