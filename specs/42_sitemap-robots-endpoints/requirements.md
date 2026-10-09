# Requisitos — sitemap.xml y robots.txt como endpoints prerenderizados sin dependencias (feature 42 sitemap-robots-endpoints)
# Origen: audit_seo.md A4 (sitemap y robots). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-42-01→1, REQ-42-02→2, REQ-42-03→3, REQ-42-04→4, REQ-42-05→5, REQ-42-06→6, REQ-42-07→7, REQ-42-08→8, REQ-42-09→9, REQ-42-10→10, REQ-42-11→11.

## Requisitos

REQ-42-01 El endpoint src/pages/sitemap.xml.ts SHALL prerenderizarse en build y responder con Content-Type application/xml.
REQ-42-02 La función pura buildSitemap SHALL emitir un elemento url con loc absoluto para /, /about y cada post del repositorio de artículos.
REQ-42-03 La función buildSitemap SHALL excluir /search, las rutas de término y /404.
REQ-42-04 La función buildSitemap SHALL emitir lastmod en formato YYYY-MM-DD a partir del campo updated de cada post, WHERE parseSpanishDate convierte la fecha.
REQ-42-05 IF un post no tiene updated, THEN la función buildSitemap SHALL usar created para lastmod.
REQ-42-06 La función buildSitemap SHALL codificar cada slug con encodeURIComponent y escapar los caracteres especiales de XML en cada loc.
REQ-42-07 El endpoint src/pages/robots.txt.ts SHALL prerenderizarse y responder en text/plain con User-agent: * y Allow: / y Sitemap: https://moibaldenegro.com/sitemap.xml.
REQ-42-08 Los endpoints de sitemap y robots SHALL añadirse sin dependencias nuevas en package.json.
REQ-42-09 WHEN se implemente la feature, el test tests/sitemap-robots-endpoints.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-42-10 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-42-11 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
