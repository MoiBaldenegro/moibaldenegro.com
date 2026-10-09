# Requisitos — Dimensiones, prioridad y carga diferida en las imágenes (CLS y LCP) (feature 48 image-loading-hints)
# Origen: audit_perf_security.md M2 y M3 (parte de código) y audit_seo.md B3 (height del logo). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-48-01→1, REQ-48-02→2, REQ-48-03→3, REQ-48-04→4, REQ-48-05→5, REQ-48-06→6, REQ-48-07→7, REQ-48-08→8.

## Requisitos

REQ-48-01 Cada img de Layout.astro y new-hero.astro y latest-articles.astro y posts/[id].astro e item-html.ts SHALL declarar los atributos width y height.
REQ-48-02 El logo del header SHALL declarar width="72" y height="25".
REQ-48-03 La imagen del hero de la portada y la portada de cada post SHALL declarar fetchpriority="high" sin loading="lazy".
REQ-48-04 Las miniaturas de artículos y de resultados y de recomendados SHALL declarar loading="lazy" y decoding="async".
REQ-48-05 Las hojas de estilo de las imágenes afectadas SHALL conservar height: auto o aspect-ratio para que los atributos no deformen la imagen.
REQ-48-06 WHEN se implemente la feature, el test tests/image-loading-hints.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-48-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-48-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
