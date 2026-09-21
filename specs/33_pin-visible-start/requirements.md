# Requisitos — El pin engancha con la sección visible llenando el viewport (feature 33)

## Requisitos

REQ-33-01 El pin de la portada SHALL enganchar con la sección visible llenando el viewport.
REQ-33-02 WHEN el desplazamiento vertical alcanza el inicio del trigger, el módulo cliente SHALL fijar la sección con su borde superior alineado al borde superior del viewport.
REQ-33-03 WHILE el pin está activo, la pista SHALL trasladarse de un lado al otro del viewport de forma visible.
REQ-33-04 WHEN el recorrido horizontal se agota, la sección SHALL liberar el pin y ceder el desplazamiento vertical a la página.
REQ-33-05 La transición entre el hero y la sección fijada SHALL mostrar contenido visible sin huecos en blanco antes del pin.
REQ-33-06 WHILE el pin está activo, la página SHALL mostrar la pista sin huecos en blanco durante el recorrido.
REQ-33-07 WHEN el pin se libera, la página SHALL continuar el desplazamiento vertical normal sin huecos en blanco tras la sección.
REQ-33-08 La pista SHALL conservar las 3 cards recientes con sus pares de transición de título e imagen por identificador de artículo.
REQ-33-09 WHILE la consulta de búsqueda está activa, la portada SHALL ocultar la sección animada y mostrar el panel de resultados.
REQ-33-10 WHILE la preferencia de movimiento reducido está activa, el módulo cliente SHALL omitir la animación y mostrar el contenido estático.
REQ-33-11 IF JavaScript está deshabilitado, THEN la portada SHALL mostrar las 3 cards visibles sin animación.
REQ-33-12 Los tests de las features 31 y 32 que fijan el inicio fuera de vista SHALL actualizar sus aserciones al inicio visible con la justificación documentada en el encabezado.
REQ-33-13 La hoja de estilos de la pista SHALL usar solo tokens de tokens.css.
REQ-33-14 Cada archivo modificado por la feature SHALL respetar el límite de 100 líneas.
