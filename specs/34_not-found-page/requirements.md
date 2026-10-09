# Requisitos — Página 404 propia y noindex en búsqueda y términos para eliminar el soft 404 (feature 34 not-found-page)
# Origen: audit_seo.md A2. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-34-01→1, REQ-34-02→2, REQ-34-03→3, REQ-34-04→4, REQ-34-05→5, REQ-34-06→6, REQ-34-07→7, REQ-34-08→8, REQ-34-09→9, REQ-34-10→10, REQ-34-11→11.

## Requisitos

REQ-34-01 El sitio SHALL incluir una página src/pages/404.astro prerenderizada que use Layout.astro y el componente de no encontrado con un h1 «Página no encontrada» y enlaces a / y a /search.
REQ-34-02 La función statusForTermPath de term-route.ts SHALL devolver 404 para un pathname cuyo último segmento tiene extensión de archivo o cuyo primer segmento es posts.
REQ-34-03 La función statusForTermPath de term-route.ts SHALL devolver 200 para un pathname de término válido de uno o varios segmentos sin extensión.
REQ-34-04 WHEN la ruta [...term] recibe un pathname con estado 404, la página SHALL responder con Astro.response.status igual a 404 y el componente de no encontrado en lugar de los resultados de búsqueda.
REQ-34-05 Layout.astro SHALL emitir <meta name="robots" content="noindex"> solo cuando recibe la prop noindex con valor verdadero.
REQ-34-06 Las páginas 404.astro y search.astro y [...term].astro SHALL pasar la prop noindex al Layout.
REQ-34-07 El frontmatter de [...term].astro SHALL obtener el estado HTTP mediante statusForTermPath sin contener sentencias if.
REQ-34-08 Los estilos de la página de no encontrado SHALL vivir en src/styles/not-found.css y usar exclusivamente tokens de tokens.css para colores y radios.
REQ-34-09 WHEN se implemente la feature, el test tests/not-found-page.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-34-10 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-34-11 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
