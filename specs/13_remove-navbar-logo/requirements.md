# Requisitos — Retirar el ancla del logo del navbar (feature 13)

REQ-13-01 El navbar del Layout SHALL enlazar la portada mediante el enlace de texto Home, WHERE el ancla del logo queda retirada del navbar.
REQ-13-02 WHEN la ruta activa es /, el enlace Home SHALL declarar el atributo aria-current con el valor page, WHERE el resto de rutas degradan el atributo a undefined.
REQ-13-03 El navbar SHALL conservar los enlaces About, Arquitectura y @moibaldenegro y la barra de búsqueda, WHERE se retira el ancla del logo.
REQ-13-04 El Layout SHALL respetar el límite de 100 líneas, WHERE se retira el ancla del logo y el enlace Home asume el estado activo de la portada.
REQ-13-05 Los tests de inspección de la navbar SHALL seguir el contrato de presentación real, WHERE la retirada del logo invierte las aserciones REQ-12-03 y REQ-12-04 del test restore-navbar-home-link.
REQ-13-06 Ningún archivo de src/ SHALL referenciar el asset mxvi_logo.webp, WHERE el ancla del logo queda retirada del navbar.