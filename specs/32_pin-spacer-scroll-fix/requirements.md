# Requisitos — El pin no genera espaciado gigante y el scroll vertical sigue funcionando (feature 32)

## Requisitos

REQ-32-01 El pin de la portada SHALL acotar su espaciado adicional al recorrido horizontal real de la pista.
REQ-32-02 WHEN el desplazamiento vertical progresa tras el pin, la página SHALL conservar el desplazamiento vertical sin bloqueos ni bucles de refresco.
REQ-32-03 WHEN el desplazamiento vertical progresa, la pista SHALL trasladarse de un lado al otro del viewport con enganche temprano y centrado vertical.
REQ-32-04 La pista SHALL conservar las 3 cards recientes con sus pares de transición de título e imagen por identificador de artículo.
REQ-32-05 WHILE la consulta de búsqueda está activa, la portada SHALL ocultar la sección animada y mostrar el panel de resultados.
REQ-32-06 WHILE la preferencia de movimiento reducido está activa, el módulo cliente SHALL omitir la animación y mostrar el contenido estático.
REQ-32-07 IF JavaScript está deshabilitado, THEN la portada SHALL mostrar las 3 cards visibles sin animación.
REQ-32-08 El módulo cliente SHALL exponer funciones puras que calculen la distancia y el espaciado acotado del pin sin leer el layout.
REQ-32-09 La hoja de estilos de la pista SHALL usar solo tokens de tokens.css.
REQ-32-10 Cada archivo modificado por la feature SHALL respetar el límite de 100 líneas.
