# Requisitos — Footer del sitio (feature 89 site-footer)
# Origen: petición humana 2026-10-14 («un footer bien bonito y profesional además de super útil, acorde a la página»).
# Toca UI/presentación: ver design.md en esta carpeta.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-89-01→1, REQ-89-02→1, REQ-89-03→1, REQ-89-04→2, REQ-89-05→2, REQ-89-06→3, REQ-89-07→3, REQ-89-08→3, REQ-89-09→4, REQ-89-10→4, REQ-89-11→5, REQ-89-12→5.

## Requisitos

REQ-89-01 El módulo src/domain/site-footer.ts SHALL entregar la columna Navegación con los enlaces internos a /, /about, /arquitectura y /search.
REQ-89-02 El módulo src/domain/site-footer.ts SHALL entregar la columna Conecta con GitHub, LinkedIn y YouTube tomados de about.json vía heroLinks más el enlace a X de @moibaldenegro.
REQ-89-03 La función copyrightLine SHALL componer el aviso con el año de la fecha inyectada y el nombre recibido.
REQ-89-04 El layout único src/layouts/Layout.astro SHALL renderizar el componente SiteFooter justo después del elemento main.
REQ-89-05 El componente site-footer.astro SHALL pintar un elemento footer con el logo, el titular y la ubicación de about.json, el enlace de descarga a /cv.pdf, los 3 artículos más recientes y el enlace Volver arriba.
REQ-89-06 Cada enlace externo del footer SHALL anunciar «sitio externo» con texto visually-hidden.
REQ-89-07 Cada icono de red del footer SHALL salir del sprite /assets/svg/sprite.svg con aria-hidden.
REQ-89-08 La hoja src/styles/site-footer.css SHALL usar solo var() de tokens.css como color, WHERE docs/architecture.md prohíbe valores sueltos.
REQ-89-09 WHILE el viewport mide 900 px o más, la rejilla del footer SHALL mostrar la marca y las 3 columnas en una sola fila.
REQ-89-10 WHILE el viewport mide menos de 600 px, la rejilla del footer SHALL apilar la marca y las columnas en una sola columna sin scroll horizontal.
REQ-89-11 WHEN se implemente la feature, el test tests/site-footer.test.mjs SHALL observarse en rojo antes de escribir el dominio, el componente o la hoja.
REQ-89-12 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature.
