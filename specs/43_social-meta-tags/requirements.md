# Requisitos — Metadatos Open Graph y Twitter/X cards en el head (feature 43 social-meta-tags)
# Origen: audit_seo.md M1. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-43-01→1, REQ-43-02→2, REQ-43-03→3, REQ-43-04→4, REQ-43-05→5, REQ-43-06→6, REQ-43-07→7, REQ-43-08→8, REQ-43-09→9.

## Requisitos

REQ-43-01 La función pura socialMeta de src/domain/seo/social.ts SHALL devolver og:title y og:description y og:url y og:image y og:type y og:site_name y og:locale con valores no vacíos.
REQ-43-02 La función socialMeta SHALL devolver og:url igual a la URL canonical y og:image como URL absoluta sobre el site.
REQ-43-03 La función socialMeta SHALL devolver twitter:card summary_large_image y twitter:site @moibaldenegro.
REQ-43-04 WHEN la página es un post, la función socialMeta SHALL devolver og:type article con article:published_time y article:modified_time en formato YYYY-MM-DD.
REQ-43-05 IF la página no declara imagen, THEN la función socialMeta SHALL usar /assets/moises-hero.jpg como og:image.
REQ-43-06 Cada página del build SHALL contener las metas og y twitter de socialMeta en su head.
REQ-43-07 WHEN se implemente la feature, el test tests/social-meta-tags.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-43-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-43-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
