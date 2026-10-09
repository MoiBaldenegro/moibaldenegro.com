# Requisitos — Datos estructurados JSON-LD BlogPosting en las páginas de artículo (feature 44 article-json-ld)
# Origen: audit_seo.md M2. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-44-01→1, REQ-44-02→2, REQ-44-03→3, REQ-44-04→4, REQ-44-05→5, REQ-44-06→6, REQ-44-07→7, REQ-44-08→8, REQ-44-09→9.

## Requisitos

REQ-44-01 La función pura blogPostingJsonLd SHALL devolver un objeto con @context https://schema.org y @type BlogPosting y headline igual al título del post.
REQ-44-02 La función blogPostingJsonLd SHALL devolver datePublished y dateModified en formato YYYY-MM-DD a partir de created y updated.
REQ-44-03 La función blogPostingJsonLd SHALL devolver author de tipo Person con el autor del post y la URL absoluta de /about.
REQ-44-04 La función blogPostingJsonLd SHALL devolver image y mainEntityOfPage como URLs absolutas sobre el site.
REQ-44-05 La serialización del JSON-LD SHALL escapar la secuencia </script como <\/script.
REQ-44-06 Cada página de post del build SHALL contener exactamente un script application/ld+json con un BlogPosting válido.
REQ-44-07 WHEN se implemente la feature, el test tests/article-json-ld.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-44-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-44-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
