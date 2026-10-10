# Requisitos — Estado y wiring del menú de navegación móvil (feature 78 site-menu-state)
# Origen: petición humana 2026-10-09 «el header está saturadísimo; realmente lo que deberíamos tener en mobile es un menú hamburguesa». Análisis: progress/research/mobile_hamburger.md (D2, D4, D5).
# No toca UI: sin design.md. El marcado, el CSS y la verificación en navegador son de la feature 79 (depends_on [78]).
# Estado pending.
# Archivos nuevos: src/domain/site-menu.ts (funciones puras, sin DOM), src/components/site-menu/site-menu.ts (wiring con DOM inyectado) y tests/site-menu-state.test.mjs (node:test con fakes de DOM, patrón code-copy-status).
# Contrato de marcado que consume el wiring (lo crea la 79): header .site-navbar; botón [data-site-menu-toggle]; panel [data-site-menu]; estado en el atributo data-menu del header.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-78-01/02/03/04→1, REQ-78-05→2, REQ-78-06→3, REQ-78-07/08/09/10→4, REQ-78-11/12→5, REQ-78-13/14/15→6, REQ-78-16→7, REQ-78-17/18/19→8, REQ-78-20/21→9, REQ-78-22/23/24/25→10.

## Requisitos

REQ-78-01 El módulo src/domain/site-menu.ts SHALL exportar la función pura nextMenuState(state, event) que devuelve 'open' o 'closed' sin acceder al DOM ni a globales del navegador.
REQ-78-02 WHEN nextMenuState recibe el evento 'toggle', la función SHALL devolver 'open' desde 'closed' y 'closed' desde 'open'.
REQ-78-03 WHEN nextMenuState recibe el evento 'escape' o 'outside' o 'link' o 'focus-out' o 'desktop', la función SHALL devolver 'closed' desde cualquiera de los dos estados.
REQ-78-04 IF nextMenuState recibe un estado o un evento fuera de los valores definidos, THEN la función SHALL lanzar el error nombrado MenuStateError con un mensaje en español que incluye el valor recibido.
REQ-78-05 La función pura menuAttributes(state) SHALL devolver { expanded: 'true', label: 'Cerrar menú' } para 'open' y { expanded: 'false', label: 'Abrir menú' } para 'closed'.
REQ-78-06 La función pura menuEscapeAction SHALL recibir (state, searchWillHandle) y devolver 'close' solo cuando state vale 'open' y searchWillHandle vale false y devolver 'none' en los otros tres casos.
REQ-78-07 El módulo src/components/site-menu/site-menu.ts SHALL exportar initSiteMenu(root, media, searchWillHandle) con el documento y la consulta de medios (max-width: 768px) y la función de coordinación con la búsqueda inyectables y con valores por defecto del navegador.
REQ-78-08 WHEN initSiteMenu se ejecuta sobre un documento con el header .site-navbar y el botón [data-site-menu-toggle] y el panel [data-site-menu], el wiring SHALL fijar data-menu="closed" en el header y aplicar aria-expanded y aria-label de menuAttributes('closed') al botón.
REQ-78-09 IF el documento no contiene el header o el botón o el panel, THEN initSiteMenu SHALL terminar sin lanzar error y sin registrar ningún listener, WHERE el mismo layout se renderiza en todas las páginas y el re-init es un no-op seguro (precedente REQ-10-07).
REQ-78-10 Cada cambio de estado del wiring SHALL aplicar en la misma llamada data-menu en el header y aria-expanded y aria-label en el botón según nextMenuState y menuAttributes.
REQ-78-11 WHEN se dispara click en el botón con el menú cerrado, el wiring SHALL abrir el menú y mover el foco al primer elemento enfocable del panel (a o input o button).
REQ-78-12 WHEN se dispara click en el botón con el menú abierto, el wiring SHALL cerrar el menú sin mover el foco fuera del botón.
REQ-78-13 WHEN se dispara keydown Escape dentro del header con el menú abierto y menuEscapeAction devuelve 'close', el wiring SHALL cerrar el menú y mover el foco al botón.
REQ-78-14 WHEN se dispara keydown Escape dentro del header y searchWillHandle devuelve true, el wiring SHALL dejar el menú abierto y el foco sin mover, WHERE search-escape (features 6 y 57) limpia la búsqueda con ese mismo Escape.
REQ-78-15 La función searchWillHandle por defecto SHALL devolver true solo cuando isSearchFocus(target) es true y escapeAction(activeTerm(context, location.search), context) con context = escapeContext(document) es distinto de 'none', importando esas funciones de src/components/search-escape/search-escape.ts sin duplicarlas.
REQ-78-16 El listener de keydown del menú SHALL registrarse sobre el elemento header y no sobre document, WHERE el evento burbujea por el header antes que por el listener de document de search-escape y la decisión se toma con el término aún sin limpiar.
REQ-78-17 WHEN se dispara click en el documento sobre un objetivo fuera del header con el menú abierto, el wiring SHALL cerrar el menú sin mover el foco.
REQ-78-18 WHEN se dispara click sobre un enlace contenido en el panel, el wiring SHALL cerrar el menú.
REQ-78-19 WHEN se dispara focusout en el header con un relatedTarget que es un elemento fuera del header y el menú abierto, el wiring SHALL cerrar el menú sin mover el foco.
REQ-78-20 WHEN la consulta de medios (max-width: 768px) emite change con matches igual a false, el wiring SHALL cerrar el menú.
REQ-78-21 WHEN initSiteMenu se ejecuta varias veces en la misma sesión, el wiring SHALL mantener un único listener de click en el documento y un único listener de change en la consulta de medios, WHERE el módulo empaquetado corre una vez por sesión y el re-init se repite en cada navegación (guard de módulo como search-escape.ts).
REQ-78-22 WHEN initSiteMenu se ejecuta dos veces sobre el mismo header, el wiring SHALL registrar los listeners del botón y del header y del panel una sola vez.
REQ-78-23 WHEN se implemente la feature, el test tests/site-menu-state.test.mjs SHALL observarse en rojo antes de crear src/domain/site-menu.ts y src/components/site-menu/site-menu.ts, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-78-24 La feature SHALL dejar sin cambios src/layouts/Layout.astro y src/styles/ y los componentes de búsqueda, WHERE el marcado y los estilos pertenecen a la feature 79.
REQ-78-25 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre con cada archivo creado o modificado en 100 líneas o menos y sin dependencias nuevas en package.json, WHERE require_tests_to_close y docs/architecture.md §2 y §12 lo exigen.
