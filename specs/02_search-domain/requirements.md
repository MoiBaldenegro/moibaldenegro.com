# Requisitos — Dominio de búsqueda (feature 2)

REQ-02-01 El módulo de búsqueda SHALL normalizar el término consultado a minúsculas y sin diacríticos.
REQ-02-02 El módulo de búsqueda SHALL evaluar la coincidencia del término normalizado en el título, la descripción, los tags y el cuerpo del artículo.
REQ-02-03 WHEN el término normalizado aparece en alguno de los campos evaluados, el módulo de búsqueda SHALL incluir el artículo en los resultados.
REQ-02-04 El módulo de búsqueda SHALL ordenar los resultados de forma descendente por la fecha de publicación del artículo.
REQ-02-05 El módulo de búsqueda SHALL convertir la fecha de publicación en formato español con mes en texto a un valor comparable YYYY-MM-DD.
REQ-02-06 El módulo de búsqueda SHALL exponer una paginación que devuelva la página solicitada de un tamaño fijo.
REQ-02-07 El módulo de búsqueda SHALL construir el índice de búsqueda desde los artículos y sus cuerpos de texto para el filtrado en el cliente.
REQ-02-08 IF un artículo carece de alguno de los campos evaluables, THEN el módulo de búsqueda SHALL tratar el campo ausente como texto vacío.
REQ-02-09 Cada archivo del módulo de búsqueda SHALL mantener un máximo de 100 líneas.
