# Requisitos — La pista horizontal se traslada el recorrido real al avanzar el scroll (feature 34)

## Requisitos

REQ-34-01 El módulo cliente SHALL construir el pin solo con una distancia medida mayor que cero.
REQ-34-02 WHEN el layout se asienta tras la carga, el módulo cliente SHALL re-medir la distancia y sincronizar el fin del pin con el valor medido.
REQ-34-03 WHILE el pin está activo, la pista SHALL trasladarse horizontalmente en proporción al progreso vertical hasta el recorrido medido.
REQ-34-04 El fin del pin SHALL derivar de la distancia medida con un valor mayor que cero.
REQ-34-05 El pin de la portada SHALL acotar su espaciado adicional al recorrido horizontal real de la pista.
REQ-34-06 El pin de la portada SHALL enganchar con la sección visible llenando el viewport.
REQ-34-07 La pista SHALL conservar el recorrido full-bleed de lado a lado con las 3 cards recientes y sus pares de transición por identificador.
REQ-34-08 WHILE la consulta de búsqueda está activa, la portada SHALL ocultar la sección animada y mostrar el panel de resultados.
REQ-34-09 WHILE la preferencia de movimiento reducido está activa, el módulo cliente SHALL omitir la animación y mostrar el contenido estático.
REQ-34-10 IF JavaScript está deshabilitado, THEN la portada SHALL mostrar las 3 cards visibles sin animación.
REQ-34-11 El módulo cliente SHALL exponer la distancia medida como atributo observable en la sección para verificación en DevTools.
REQ-34-12 Los tests que fijan el cableado anterior SHALL actualizar sus aserciones con la justificación documentada en el encabezado.
REQ-34-13 La hoja de estilos de la pista SHALL usar solo tokens de tokens.css.
REQ-34-14 Cada archivo modificado por la feature SHALL respetar el límite de 100 líneas.
