# Requisitos — SEO base del head: site, meta description, canonical, títulos con marca y orden del head (feature 35 seo-head-base)
# Origen: audit_seo.md A3, A4 (site y canonical), M3 y B1. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-35-01→1, REQ-35-02→2, REQ-35-03→3, REQ-35-04→4, REQ-35-05→5, REQ-35-06→6, REQ-35-07→7, REQ-35-08→8, REQ-35-09→9, REQ-35-10→10, REQ-35-11→11.

## Requisitos

REQ-35-01 El archivo astro.config.mjs SHALL declarar site con el valor https://moibaldenegro.com.
REQ-35-02 La función composeTitle de src/domain/seo/head.ts SHALL devolver «<título> | moibaldenegro.com» sin duplicar la marca cuando el título ya la contiene.
REQ-35-03 La función canonicalUrl de src/domain/seo/head.ts SHALL devolver la URL absoluta del pathname sobre el site configurado.
REQ-35-04 Layout.astro SHALL emitir exactamente una meta description con el valor de la prop description de cada página.
REQ-35-05 Layout.astro SHALL emitir exactamente un link rel="canonical" absoluto por página.
REQ-35-06 El elemento <meta charset="utf-8"> SHALL ser el primer hijo de head seguido de la meta viewport.
REQ-35-07 La portada SHALL usar como título el nombre del perfil seguido de la marca y como descripción el texto de presentación existente del sitio.
REQ-35-08 La lógica de composición de título y canonical SHALL vivir en src/domain/seo/head.ts y no en el frontmatter de Layout.astro.
REQ-35-09 WHEN se implemente la feature, el test tests/seo-head-base.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-35-10 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-35-11 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
