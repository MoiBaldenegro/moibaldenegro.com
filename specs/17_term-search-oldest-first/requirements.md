# Requisitos — Los más antiguos primero en /<término> (feature 17)

REQ-17-01 El módulo de búsqueda SHALL aceptar un orden de resultados ascendente o descendente por la fecha de publicación, WHERE el orden descendente es el predeterminado.
REQ-17-02 WHEN el término proviene de la ruta /<término>, el controlador de resultados SHALL solicitar el orden ascendente por fecha de publicación.
REQ-17-03 WHEN el término proviene del parámetro q de la vista /search, el controlador de resultados SHALL conservar el orden descendente por fecha de publicación.
REQ-17-04 WHEN el orden solicitado es ascendente, el módulo de búsqueda SHALL colocar los artículos más antiguos primero según la fecha YYYY-MM-DD, WHERE los empates de fecha conservan el orden estable del índice.
REQ-17-05 WHEN el usuario cambia de página en la ruta /<término>, la página SHALL conservar el orden ascendente por fecha de publicación.
REQ-17-06 El panel de resultados en vivo de la portada SHALL conservar el orden descendente por fecha de publicación.
REQ-17-07 Los archivos modificados del dominio de búsqueda y del controlador de resultados SHALL mantener un máximo de 100 líneas.