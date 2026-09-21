# Requisitos — Sección full-bleed con recorrido de lado a lado (feature 30)

## Requisitos

REQ-30-01 La sección de artículos recientes de la portada SHALL ocupar todo el ancho del viewport fuera de la columna de contenido.
REQ-30-02 WHEN el desplazamiento vertical progresa, la pista SHALL trasladarse de un lado al otro del viewport.
REQ-30-03 El hero de la portada SHALL desplazarse con el flujo normal de la página.
REQ-30-04 WHILE la preferencia de movimiento reducido está activa, el módulo cliente SHALL omitir la animación y mostrar el contenido estático.
REQ-30-05 IF JavaScript está deshabilitado, THEN la portada SHALL mostrar las 3 cards visibles sin animación.
REQ-30-06 La pista SHALL conservar las 3 cards recientes con sus pares de transición de título e imagen por identificador de artículo.
REQ-30-07 WHILE la consulta de búsqueda está activa, la portada SHALL ocultar la sección animada y mostrar el panel de resultados.
REQ-30-08 El módulo cliente SHALL calcular el recorrido de la pista contra el ancho del viewport.
REQ-30-09 La hoja de estilos de la pista SHALL usar solo tokens de tokens.css.
REQ-30-10 Cada archivo modificado por la feature SHALL respetar el límite de 100 líneas.
