# Requisitos — Modo lista en los resultados de búsqueda (feature 9)

REQ-09-01 El componente de resultados SHALL presentar las coincidencias como una lista de items compactos en una sola columna.
REQ-09-02 WHEN existen coincidencias para el término, el controlador SHALL pintar cada item de la lista con el generador itemHtml del módulo item-html.ts.
REQ-09-03 El generador itemHtml SHALL emitir por cada artículo un item con el título enlazado a la ruta /posts/[id] del artículo.
REQ-09-04 El item de lista SHALL incluir la imagen del artículo como miniatura compacta junto al contenido textual.
REQ-09-05 El item de lista SHALL incluir la meta del artículo y sus etiquetas junto al título.
REQ-09-06 WHILE el puntero está sobre un item de la lista, el item SHALL resaltar el fondo de la fila.
REQ-09-07 WHILE el puntero está sobre un item de la lista, el título del item SHALL subrayarse.
REQ-09-08 La hoja de estilos de resultados SHALL separar los items apilados con el token --color-border.
REQ-09-09 WHEN la ventana gráfica es menor o igual a 768 píxeles, la presentación SHALL ocultar la miniatura y reducir el espaciado de los items.
REQ-09-10 El panel de resultados en vivo de la portada SHALL reutilizar la presentación de lista y el generador itemHtml de la vista dedicada.
REQ-09-11 WHEN la presentación pasa al modo lista, las vistas de búsqueda SHALL conservar la guía y el estado vacío con la acción de limpiar.
REQ-09-12 WHEN la presentación pasa al modo lista, las vistas de búsqueda SHALL conservar la paginación sin recarga y los enlaces /posts/[id].