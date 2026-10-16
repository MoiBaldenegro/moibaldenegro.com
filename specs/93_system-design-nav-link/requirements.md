# Requisitos — Atajo de diseño de sistemas en el navbar (feature 93)

## Requisitos

REQ-93-01 El menú del navbar del Layout SHALL incluir dentro de .site-menu, justo tras el enlace Arquitectura, un enlace que apunta a /diseno-de-sistemas cuyo contenido es exactamente el texto Diseño de sistemas.
REQ-93-02 WHEN la ruta activa es /diseno-de-sistemas o /diseno-de-sistemas/, el enlace Diseño de sistemas SHALL declarar el atributo aria-current con valor page.
REQ-93-03 WHEN la ruta activa no es /diseno-de-sistemas ni /diseno-de-sistemas/, el enlace Diseño de sistemas SHALL omitir el atributo aria-current.
REQ-93-04 WHEN se solicita /diseno-de-sistemas, la ruta de término SHALL responder con estado 200 y listar al menos un artículo.
REQ-93-05 La adición del enlace Diseño de sistemas SHALL conservar el logo y los enlaces About y Arquitectura y @moibaldenegro y la barra de búsqueda dentro del navbar.
REQ-93-06 El enlace Diseño de sistemas SHALL carecer de elementos hijos.
REQ-93-07 El enlace Diseño de sistemas SHALL carecer del atributo aria-label.
REQ-93-08 El directorio src SHALL carecer del archivo src/styles/nav-label.css y de toda mención a nav-label.css o a site-menu__label-rest.
REQ-93-09 Las media queries de layout.css y site-menu.css y search-bar.css que hoy declaran max-width: 768px SHALL declarar max-width: 969px.
REQ-93-10 La media query del logo de escritorio en layout.css SHALL declarar min-width: 970px en lugar de min-width: 769px.
REQ-93-11 La función initSiteMenu de src/components/site-menu/site-menu.ts SHALL usar por defecto la consulta matchMedia (max-width: 969px).
REQ-93-12 La regla .site-navbar a de layout.css SHALL declarar white-space: nowrap.
REQ-93-13 La feature SHALL dejar sin cambios toda media query de src/styles fuera de layout.css y site-menu.css y search-bar.css.
REQ-93-14 WHEN el ancho del viewport es 970 px o más, el header SHALL mostrar en la barra el enlace con el texto visible Diseño de sistemas en una sola línea.
REQ-93-15 WHEN el ancho del viewport es 969 px o menos y el scripting está habilitado, el header SHALL mostrar el botón del menú hamburguesa en lugar de los enlaces del menú.
REQ-93-16 WHEN el usuario abre el menú hamburguesa con un ancho de viewport de 969 px o menos, el panel del menú SHALL mostrar el enlace con el texto visible Diseño de sistemas en una sola línea.
REQ-93-17 WHEN se carga una página en Chrome headless a 375 y 768 y 800 y 850 y 900 y 1024 y 1280 px de ancho, el header.site-navbar y el documento SHALL mostrarse sin scroll horizontal.
REQ-93-18 WHEN se carga una página en Chrome headless a 768 y 800 y 850 y 900 y 1024 y 1280 px de ancho con el menú cerrado, la altura de header.site-navbar SHALL igualar 65 px.
REQ-93-19 WHEN el usuario abre el menú hamburguesa en Chrome headless a 375 y 768 y 800 y 850 y 900 px, el panel del menú y el documento SHALL mostrarse sin scroll horizontal.
REQ-93-20 IF a 970 px el enlace se parte en más de una línea o el header desborda en horizontal, THEN el implementer SHALL parar y reportar las mediciones en progress/current.md.
REQ-93-21 El artículo src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md SHALL incluir el tag #diseno-de-sistemas en su campo tags.
REQ-93-22 La feature SHALL dejar sin cambios en los artículos de src/content/posts todo contenido distinto del tag #diseno-de-sistemas añadido.
REQ-93-23 Layout.astro SHALL tener 100 líneas o menos tras el cambio.
REQ-93-24 layout.css SHALL conservar 99 líneas tras el cambio.
REQ-93-25 IF un test heredado congela un archivo o un breakpoint que esta feature cambia, THEN el implementer SHALL reapuntar ese test con una nota que diga Ajuste feature 93 (precedente REQ-43-06).
REQ-93-26 El implementer SHALL anotar en progress/impl_system-design-nav-link.md el rojo del test nuevo, la tabla de mediciones de navegador y las rutas de las capturas guardadas en progress/research/nav93/impl/ antes de cerrar la feature.

## Requisitos de la apertura suave del menú hamburguesa (añadidos 2026-10-16)

REQ-93-27 WHILE el ancho del viewport es 969 px o menos y el scripting está habilitado, el panel .site-menu cerrado SHALL declarar visibility: hidden y opacity: 0 y un transform de desplazamiento vertical negativo en lugar de display: none.
REQ-93-28 WHEN el usuario abre el menú hamburguesa, el panel .site-menu SHALL pasar de opacity 0 a opacity 1 y de su desplazamiento a transform none mediante una transición de opacity y transform con la duración y el easing de var(--transition-default).
REQ-93-29 WHEN el menú hamburguesa se cierra por el botón o Escape o clic fuera o clic en un enlace o foco fuera del header, el panel .site-menu SHALL volver a opacity 0 y a su desplazamiento con la misma transición de var(--transition-default).
REQ-93-30 La transición de visibility del panel .site-menu SHALL usar var(--transition-default) para que el panel siga visible durante toda la animación de cierre y quede en visibility: hidden al terminarla.
REQ-93-31 El panel .site-menu SHALL declarar position: absolute tanto abierto como cerrado en el modo hamburguesa para que abrir o cerrar el menú deje sin cambios la altura de 65 px de header.site-navbar y la posición del contenido de la página.
REQ-93-32 WHILE el menú hamburguesa está cerrado, los enlaces y el input y los botones del panel .site-menu SHALL quedar fuera del orden de tabulación y del árbol de accesibilidad.
REQ-93-33 WHEN el menú hamburguesa se abre o se cierra, el botón .site-menu__toggle SHALL declarar aria-expanded con valor true si el menú está abierto y false si está cerrado.
REQ-93-34 WHEN el menú hamburguesa se abre, el foco SHALL pasar al primer enlace del panel aunque la transición de apertura siga en curso.
REQ-93-35 WHEN el usuario pulsa Escape con el menú abierto y la búsqueda no consume la tecla, el foco SHALL volver al botón .site-menu__toggle tras cerrarse el menú.
REQ-93-36 WHILE el usuario prefiere movimiento reducido (prefers-reduced-motion: reduce), site-menu.css SHALL declarar transition: none para el panel .site-menu.
REQ-93-37 La apertura suave SHALL implementarse solo con CSS en src/styles/site-menu.css, sin dependencias nuevas, sin tokens nuevos y sin cambios en tokens.css ni en layout.css.
REQ-93-38 WHEN el usuario navega con el ClientRouter a otra página y vuelve, el menú hamburguesa SHALL arrancar cerrado y animar de nuevo su apertura y su cierre.
REQ-93-39 El implementer SHALL anotar en progress/impl_system-design-nav-link.md la verificación CDP de apertura y cierre (opacity intermedia muestreada o evento transitionend), la ausencia de transición con prefers-reduced-motion: reduce emulado y la prueba tras navegar ida y vuelta, con frames en progress/research/nav93/impl/.
REQ-93-40 El implementer SHALL actualizar docs/conventions.md para documentar que el header usa el corte 969/970 px como excepción al breakpoint móvil de 768 px.
