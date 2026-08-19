# Requisitos — Vista dedicada de búsqueda (feature 3)

REQ-03-01 La página /search SHALL declarar la ruta prerendered en el archivo src/pages/search.astro.
REQ-03-02 WHEN la página /search se carga con el parámetro de URL q no vacío, la página SHALL inicializar los resultados prefiltrados con ese término.
REQ-03-03 WHEN la página /search se carga sin el parámetro q o con q vacío, la página SHALL mostrar el estado inicial de la búsqueda.
REQ-03-04 WHEN existen coincidencias para el término, la página SHALL presentar una lista de items con la vista previa de cada artículo.
REQ-03-05 WHEN no existen coincidencias para el término q, la página SHALL mostrar el mensaje No se encontraron resultados para el término con una acción para limpiar la búsqueda.
REQ-03-06 WHEN la lista de resultados supera el tamaño de página, la página SHALL paginar los resultados sin recargar el documento.
REQ-03-07 La página /search SHALL serializar el índice de búsqueda del catálogo en el documento para el filtrado en el cliente.
REQ-03-08 WHEN el usuario activa la acción de limpiar, la página SHALL eliminar el parámetro q y mostrar el estado inicial.
REQ-03-09 WHEN la página /search presenta resultados, cada item SHALL enlazar a la ruta /posts/[id] del artículo.
REQ-03-10 WHEN la página /search se carga con un término q, la página SHALL declarar el título del documento con el término consultado.
