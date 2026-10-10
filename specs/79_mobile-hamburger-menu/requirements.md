# Requisitos — Menú hamburguesa en el header móvil (feature 79 mobile-hamburger-menu)
# Origen: petición humana 2026-10-09 «el header está saturadísimo; realmente lo que deberíamos tener en mobile es un menú hamburguesa». Hoy el header mide 165 px a 375 px (impl_77.md). Análisis: progress/research/mobile_hamburger.md.
# Toca UI/presentación: ver design.md en esta carpeta. depends_on [78] (estado y wiring de src/domain/site-menu.ts y src/components/site-menu/site-menu.ts).
# Estado pending.
# «Modo hamburguesa» = @media (max-width: 768px) and (scripting: enabled) (design.md D1). Sin JS o sin la media feature rige el layout envuelto actual: REQ-51, REQ-61 y REQ-77-10/16 siguen vigentes en ese caso y sus tests de texto no cambian. Con el modo activo, REQ-79-09 sustituye al alto de 165 px de REQ-77-10.
# tokens.css no cambia (97 líneas): los tests de conteo REQ-17-09, REQ-26-07, REQ-39-09, REQ-40-11, REQ-42-09 y el meta-test REQ-16-09 no se tocan.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-79-01/02/03→1, REQ-79-04/05→2, REQ-79-06/07/08/09→3, REQ-79-10/11/12/13→4, REQ-79-14/15→5, REQ-79-16/17/18→6, REQ-79-19/20/21/22→7, REQ-79-23/24/25→8, REQ-79-26/27→9, REQ-79-28/29→10, REQ-79-30/31→11, REQ-79-32/33/34→12, REQ-79-35/36/37→13.

## Requisitos

REQ-79-01 El header de Layout.astro SHALL conservar la etiqueta <nav> sin atributos con el ancla del logo como primer enlace seguida del botón de menú y del envoltorio del panel, WHERE seis tests del arnés leen el nav con la regex <nav>[\s\S]*?</nav> y exigen el logo antes de About.
REQ-79-02 El botón de menú SHALL renderizarse como <button type="button" class="site-menu__toggle" data-site-menu-toggle aria-controls="site-menu" aria-expanded="false" aria-label="Abrir menú"> sin texto visible en el marcado.
REQ-79-03 El envoltorio <div class="site-menu" id="site-menu" data-site-menu> SHALL contener en este orden los enlaces About y Arquitectura y @moibaldenegro y <SearchBar /> con sus aria-current y el texto visually-hidden del enlace externo sin cambios.
REQ-79-04 El componente src/components/site-menu/site-menu.astro SHALL limitarse a importar src/styles/site-menu.css y a un <script> que importa initSiteMenu de site-menu.ts sin marcado propio, WHERE Layout.astro lo incluye tras el header como SearchEscape.
REQ-79-05 El <script> del componente SHALL llamar a initSiteMenu al evaluarse el módulo y en cada evento astro:after-swap, WHERE el primer astro:page-load llega con el evento load (router.js:492) y after-swap precede a la captura de la transición.
REQ-79-06 La hoja src/styles/site-menu.css SHALL declarar fuera de toda media query .site-menu { display: contents } y .site-menu__toggle { display: none }.
REQ-79-07 La hoja src/styles/site-menu.css SHALL declarar todas las reglas del modo hamburguesa dentro de @media (max-width: 768px) and (scripting: enabled).
REQ-79-08 La feature SHALL dejar sin cambios src/styles/tokens.css y src/styles/layout.css y src/styles/search-bar.css, WHERE layout.css tiene 99 líneas y tokens.css las 97 que fijan los tests de conteo.
REQ-79-09 WHILE el modo hamburguesa está activo a 375×812 o 768×1024, el elemento .site-navbar SHALL medir 65 px de alto con una tolerancia de ±1 px tanto con el menú cerrado como abierto.
REQ-79-10 WHILE el modo hamburguesa está activo, el nav SHALL ocupar una sola fila sin envolver con min-height: var(--header-height) y sin padding vertical y el logo a la izquierda y el botón a la derecha.
REQ-79-11 WHILE el modo hamburguesa está activo, el centro vertical del logo y el del botón SHALL coincidir con el centro vertical del nav con una tolerancia de ±1 px.
REQ-79-12 WHILE el modo hamburguesa está activo, el botón SHALL medir al menos 44×44 px y mostrar ☰ con aria-expanded="false" y ✕ con aria-expanded="true" mediante un pseudo-elemento ::before.
REQ-79-13 WHILE el modo hamburguesa está activo y el header no tiene data-menu="open", el panel SHALL usar display: none de modo que ningún enlace ni el buscador sea alcanzable con Tab ni figure en el árbol de accesibilidad.
REQ-79-14 WHILE el modo hamburguesa está activo y el header tiene data-menu="open", el panel SHALL mostrarse bajo el borde inferior del header con position: absolute a todo el ancho del viewport y fondo var(--color-background) con los tres enlaces en columna seguidos del buscador a todo el ancho.
REQ-79-15 WHILE el menú está abierto en modo hamburguesa, el panel SHALL limitar su alto a calc(100dvh - var(--header-height)) con overflow-y: auto y dar a cada enlace al menos 44 px de alto.
REQ-79-16 WHILE el modo hamburguesa está activo y la altura del viewport es de 500px o menos, la regla header.site-navbar SHALL usar position: relative, WHERE REQ-51-04 deja el header sin sticky y el panel absoluto necesita anclarse a él.
REQ-79-17 WHILE el modo hamburguesa está activo, la regla :root SHALL declarar scroll-padding-top: var(--header-height), WHERE sin JS se conserva var(--header-height-mobile) de REQ-61-02.
REQ-79-18 La hoja src/styles/site-menu.css SHALL usar para colores y radios y espaciados y bordes solo custom properties de tokens.css y no declarar transition ni animation en el panel.
REQ-79-19 WHEN el usuario activa el botón con un clic real o con Enter o con Espacio a 375×812 o 768×1024, el menú SHALL alternar entre abierto y cerrado con data-menu y aria-expanded y aria-label sincronizados.
REQ-79-20 WHEN el menú se abre desde el botón, el foco SHALL quedar en el enlace About del panel.
REQ-79-21 WHEN se pulsa Escape con el menú abierto y el foco en el panel fuera del buscador o en el botón, el sistema SHALL cerrar el menú y devolver el foco al botón.
REQ-79-22 WHEN el menú está cerrado y se pulsa Tab con el foco en el botón, el foco SHALL pasar a un elemento fuera del header sin pasar por los enlaces ni el buscador del panel.
REQ-79-23 WHEN se hace clic en un punto de la página fuera del header con el menú abierto, el sistema SHALL cerrar el menú sin mover el foco al botón.
REQ-79-24 WHEN se pulsa un enlace del panel que navega con el ClientRouter, la página nueva SHALL mostrar el header con data-menu="closed" y aria-expanded="false" y 65 px de alto ±1 px sin que el alto del header supere 66 px en ningún frame de la navegación.
REQ-79-25 WHEN el menú está abierto a 375 px y el viewport pasa a 1280 px de ancho, el sistema SHALL cerrar el menú y mostrar el header de escritorio de la feature 77.
REQ-79-26 WHEN en la portada se escribe un término en el buscador del panel, el panel en vivo de la feature 5 SHALL mostrar los resultados de ese término con el menú abierto.
REQ-79-27 WHEN en la portada se pulsa Escape con el foco en el buscador del panel y un término escrito, el sistema SHALL limpiar la búsqueda y restaurar las secciones de la portada con el menú abierto y el foco en el buscador, WHERE un segundo Escape con el buscador vacío cierra el menú según REQ-79-21.
REQ-79-28 WHEN se navega a un ancla a 375 px o 768 px con el modo hamburguesa activo, el borde superior del elemento destino SHALL quedar en o por debajo del borde inferior del header con una tolerancia de 1 px por su borde inferior.
REQ-79-29 WHILE el viewport mide 1280×800, el header y las cajas del logo y de los enlaces y del campo del buscador SHALL coincidir con las medidas de la feature 77 con una tolerancia de ±1 px sin renderizar el botón de menú.
REQ-79-30 WHILE JavaScript está deshabilitado a 375×812, el header SHALL medir 165 px con una tolerancia de ±1 px con los enlaces y el buscador visibles y el botón de menú sin renderizar.
REQ-79-31 WHEN se recorre con el ClientRouter portada y /about y /arquitectura y un post y /search abriendo y cerrando el menú en cada paso con la CSP de REQ-74-03, el navegador SHALL registrar cero violaciones de CSP.
REQ-79-32 WHEN la portada se carga en frío con la caché deshabilitada a 375×812, el Cumulative Layout Shift SHALL ser menor o igual que el medido antes del cambio más 0.01.
REQ-79-33 La verificación real con Chrome headless y CDP sobre astro preview SHALL registrar en progress/impl_79.md las medidas de REQ-79-09..32 y guardar capturas del menú cerrado y abierto a 375 y 768 y del modo sin JS a 375 y de 1280 en progress/research/hamburger79/.
REQ-79-34 WHEN se implemente la feature, el test tests/mobile-hamburger-menu.test.mjs SHALL observarse en rojo antes de modificar Layout.astro y de crear site-menu.astro y site-menu.css, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-79-35 Los tests existentes de estructura del nav y de la barra de búsqueda (architecture-nav-link y navbar-logo-home y restore-navbar-home-link y search-bar-header y header-mobile-reflow y header-anchor-offset-mobile y header-height-64) SHALL pasar sin modificar sus aserciones.
REQ-79-36 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-79-37 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre sin dependencias nuevas en package.json, WHERE require_tests_to_close y docs/architecture.md §2 lo exigen.
