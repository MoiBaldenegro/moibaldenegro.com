# Requisitos — Atajo de diseño de sistemas en el navbar (feature 93)

## Requisitos

REQ-93-01 El menú del navbar del Layout SHALL incluir dentro de .site-menu, justo tras el enlace Arquitectura, un enlace que apunta a /diseno-de-sistemas con el atributo aria-label con valor Diseño de sistemas.
REQ-93-02 WHEN la ruta activa es /diseno-de-sistemas o /diseno-de-sistemas/, el enlace Diseño de sistemas SHALL declarar el atributo aria-current con valor page.
REQ-93-03 WHEN la ruta activa no es /diseno-de-sistemas ni /diseno-de-sistemas/, el enlace Diseño de sistemas SHALL omitir el atributo aria-current.
REQ-93-04 WHEN se solicita /diseno-de-sistemas, la ruta de término SHALL responder con estado 200 y listar al menos un artículo.
REQ-93-05 La adición del enlace Diseño de sistemas SHALL conservar el logo y los enlaces About y Arquitectura y @moibaldenegro y la barra de búsqueda dentro del navbar.
REQ-93-06 El enlace Diseño de sistemas SHALL contener el texto Diseño seguido de un span con la clase site-menu__label-rest cuyo texto es « de sistemas».
REQ-93-07 WHEN el ancho del viewport es 960 px o más, el enlace Diseño de sistemas SHALL mostrar el texto visible Diseño de sistemas en una sola línea.
REQ-93-08 WHEN el ancho del viewport es 959 px o menos, el enlace Diseño de sistemas SHALL mostrar solo el texto visible Diseño.
REQ-93-09 WHEN el usuario abre el menú hamburguesa a 375 px, el panel del menú SHALL mostrar el enlace con el texto visible Diseño sin scroll horizontal.
REQ-93-10 El nombre accesible del enlace Diseño de sistemas SHALL valer Diseño de sistemas en todos los anchos de viewport.
REQ-93-11 La regla que oculta .site-menu__label-rest SHALL vivir en un archivo CSS de src/styles sin JavaScript y con 100 líneas o menos.
REQ-93-12 WHEN se carga una página en Chrome headless a 800x800 y 1000x800 y 1280x800, la altura de header.site-navbar SHALL igualar 65 px.
REQ-93-13 WHEN se carga una página en Chrome headless con anchos entre 769 px y 1000 px y a 375 px, el header.site-navbar SHALL mostrarse sin desborde horizontal.
REQ-93-14 IF el header desborda con la etiqueta Diseño, THEN el implementer SHALL parar y reportar en progress/current.md.
REQ-93-15 El artículo src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md SHALL incluir el tag #diseno-de-sistemas en su campo tags.
REQ-93-16 La feature SHALL dejar sin cambios en los artículos de src/content/posts todo contenido distinto del tag #diseno-de-sistemas añadido.
REQ-93-17 Layout.astro SHALL tener 100 líneas o menos tras el cambio.
REQ-93-18 IF resulta imprescindible tocar un archivo que un test heredado congela frente a HEAD, THEN el implementer SHALL reapuntar ese test con una nota que cite REQ-93-18 y el precedente REQ-43-06.
REQ-93-19 El implementer SHALL anotar en progress/impl_system-design-nav-link.md el rojo del test nuevo y la verificación de navegador antes de cerrar la feature.
