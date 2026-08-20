# Requisitos — El logo es el enlace Home del navbar (feature 15)

REQ-15-01 El navbar del Layout SHALL enlazar la portada mediante el ancla del logo, WHERE el enlace de texto Home queda retirado del navbar.
REQ-15-02 WHEN la ruta activa es /, el ancla del logo SHALL declarar el atributo aria-current con el valor page, WHERE las demás rutas degradan el atributo a undefined.
REQ-15-03 El ancla del logo SHALL contener una imagen del asset mxvi_logo.webp con texto alternativo y ancho de 72 píxeles, WHERE el logo es el único enlace de la portada del navbar.
REQ-15-04 El navbar SHALL conservar los enlaces About, Arquitectura y @moibaldenegro y la barra de búsqueda, WHERE el enlace de texto Home queda retirado.
REQ-15-05 El asset mxvi_logo.webp SHALL conservarse en public/assets, WHERE el ancla del logo lo referencia desde el navbar.
REQ-15-06 El Layout SHALL respetar el límite de 100 líneas, WHERE el ancla del logo reemplaza al enlace de texto Home.
REQ-15-07 Los tests de inspección de la navbar SHALL asercionar el contrato real del logo como enlace de la portada, WHERE el ajuste invierte las aserciones de las features 12 y 13 con justificación documentada en el encabezado de cada test (precedente REQ-43-06).