# Requisitos — Footer pegado abajo en páginas cortas (feature 94 sticky-footer)
# Origen: petición humana 2026-10-14 («el footer no se mantiene pegado abajo [...] cuando no hay ninguna busqueda y queda libre el espacio se esta pasando hacia arriba fijalo siempre abajo»).
# Corrección humana 2026-10-14 (ronda 2, literal): «oye pero rompiste el header ya no se va nunca se queda pegado». Se revoca quitar height: 100% del reset; el header vuelve al comportamiento previo a la feature 94 (HEAD~1 de 268e9ad). Medición en progress/impl_sticky-footer.md (Ronda 2).
# Toca UI/presentación: ver design.md en esta carpeta.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-94-01→1, REQ-94-02→1, REQ-94-03→1, REQ-94-04→2, REQ-94-05→2, REQ-94-06→3, REQ-94-07→3, REQ-94-08→4, REQ-94-09→4, REQ-94-10→5, REQ-94-11→5, REQ-94-12→6, REQ-94-13→6, REQ-94-14→4.

## Requisitos

REQ-94-01 La regla body de src/styles/layout.css SHALL declarar display flex con flex-direction column.
REQ-94-02 La regla body de src/styles/layout.css SHALL declarar min-height 100vh seguido de min-height 100dvh.
REQ-94-03 La hoja src/styles/layout.css SHALL declarar la regla body > main con flex 1 0 auto.
REQ-94-04 El reset global de html y body en src/styles/layout.css SHALL declarar height 100%.
REQ-94-05 La hoja src/styles/layout.css SHALL medir exactamente 99 líneas.
REQ-94-06 WHILE el contenido de la página es más bajo que el viewport, el borde inferior del footer SHALL coincidir con el borde inferior del viewport con 1 px de tolerancia.
REQ-94-07 WHILE el contenido de la página es más alto que el viewport, el footer SHALL quedar tras el final del contenido de main sin solaparlo.
REQ-94-08 WHILE el viewport mide 375 o 800 o 1280 px de ancho y 800 px de alto, el header SHALL tener top 0 tras scrollTo(0, 500) y top −1265 px con 1 px de tolerancia tras scrollTo(0, 2000) en / y en /posts/04-ciclo-de-vida-y-arquitectura, igual que antes de la feature 94.
REQ-94-09 WHILE el viewport mide 375 px de ancho, el menú móvil SHALL abrirse y cerrarse sin scroll horizontal del documento.
REQ-94-10 La hoja src/styles/site-footer.css SHALL quedar sin cambios frente a HEAD sin declarar position fixed.
REQ-94-11 El cambio SHALL dejar sin modificar src/layouts/Layout.astro y src/styles/site-menu.css y tests/mobile-hamburger-menu.test.mjs, WHERE esos archivos pertenecen a la feature 93 o están congelados.
REQ-94-12 WHEN se implemente la ronda 2 de la feature, el test de REQ-94-04 en tests/sticky-footer.test.mjs SHALL observarse en rojo antes de editar src/styles/layout.css.
REQ-94-13 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature.
REQ-94-14 WHILE el viewport mide 800 o 1000 o 1280 px de ancho, el header SHALL medir 65 px de alto.
