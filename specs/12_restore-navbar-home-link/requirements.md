# Requisitos — Restaurar el enlace Home en el navbar (feature 12)

REQ-12-01 El navbar del Layout SHALL incluir un enlace de texto Home con destino /.
REQ-12-02 El enlace Home SHALL heredar los estilos del navbar existente, WHERE el sitio reutiliza el Layout en todas las páginas.
REQ-12-03 La restauración del enlace Home SHALL conservar el ancla del logo, los enlaces About, Arquitectura y @moibaldenegro y la barra de búsqueda del navbar.
REQ-12-04 El enlace Home SHALL omitir el atributo aria-current, WHERE el ancla del logo ya marca la portada con aria-current page.
REQ-12-05 El Layout SHALL respetar el límite de 100 líneas, WHERE la restauración añade un enlace al navbar.
REQ-12-06 Los tests existentes de la navbar SHALL pasar en verde, WHERE la suite los tiene en rojo antes de la restauración.