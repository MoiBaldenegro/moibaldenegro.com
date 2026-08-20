# Requisitos — Eliminar el salto horizontal al navegar por el navbar (feature 14)

REQ-14-01 El html del sitio SHALL reservar el hueco del scrollbar vertical con la propiedad scrollbar-gutter stable, WHERE las páginas del sitio tienen alturas distintas.
REQ-14-02 WHEN el usuario navega entre páginas mediante el navbar, el ancho del viewport SHALL permanecer estable, WHERE el sitio reserva el hueco del scrollbar.
REQ-14-03 La hoja layout.css SHALL declarar la reserva del hueco en el selector html, WHERE la regla respeta el límite de 100 líneas y el uso exclusivo de tokens.
REQ-14-04 IF el navegador no soporta la propiedad scrollbar-gutter, THEN el sitio SHALL conservar el comportamiento actual de scrollbar, WHERE el defecto visual queda limitado a ese navegador.
REQ-14-05 El sitio SHALL permanecer sin JavaScript de runtime, WHERE la reserva del hueco del scrollbar se resuelve solo con CSS.