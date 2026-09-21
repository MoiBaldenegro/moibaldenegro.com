# Requisitos — Enganche temprano y centrado vertical del pin (feature 31)

## Requisitos

REQ-31-01 La sección fijada de la portada SHALL enganchar el pin con la pista visible y centrada verticalmente en el viewport.
REQ-31-02 WHEN el desplazamiento vertical alcanza el inicio del trigger, el módulo cliente SHALL fijar la sección antes de que la página muestre un hueco en blanco tras el hero.
REQ-31-03 WHILE el pin está activo, la pista SHALL permanecer centrada verticalmente en el viewport durante todo el recorrido horizontal.
REQ-31-04 WHEN el recorrido horizontal se agota, la sección SHALL liberar el pin y ceder el desplazamiento vertical a la página.
REQ-31-05 WHILE la preferencia de movimiento reducido está activa, el módulo cliente SHALL omitir la animación y mostrar el contenido estático.
REQ-31-06 IF JavaScript está deshabilitado, THEN la portada SHALL mostrar las 3 cards visibles sin animación.
REQ-31-07 La pista SHALL conservar las 3 cards recientes con sus pares de transición de título e imagen por identificador de artículo.
REQ-31-08 WHILE la consulta de búsqueda está activa, la portada SHALL ocultar la sección animada y mostrar el panel de resultados.
REQ-31-09 La hoja de estilos de la pista SHALL usar solo tokens de tokens.css.
REQ-31-10 Cada archivo modificado por la feature SHALL respetar el límite de 100 líneas.
