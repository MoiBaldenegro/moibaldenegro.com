# Requisitos — Un solo h1 por página en artículos y en /about (feature 39 single-h1-headings)
# Origen: audit_seo.md A5 y audit_a11y.md B1 (parte de /about). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-39-01→1, REQ-39-02→2, REQ-39-03→3, REQ-39-04→4, REQ-39-05→5, REQ-39-06→6, REQ-39-07→7, REQ-39-08→8, REQ-39-09→9.

## Requisitos

REQ-39-01 Ningún post de src/content/posts SHALL contener fuera de bloques de código una línea de encabezado de nivel 1 que empiece por «# ».
REQ-39-02 Los encabezados iniciales de nivel 1 de los siete posts afectados SHALL convertirse en encabezados de nivel 2 con el mismo texto.
REQ-39-03 Cada página de post generada en el build SHALL contener exactamente un h1.
REQ-39-04 La página /about SHALL contener exactamente un h1.
REQ-39-05 El texto de presentación de la segunda sección de about.astro SHALL renderizarse como párrafo con la clase about__intro.
REQ-39-06 La regla .about__intro de about.css SHALL usar exclusivamente tokens de tokens.css para colores.
REQ-39-07 WHEN se implemente la feature, el test tests/single-h1-headings.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-39-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-39-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
