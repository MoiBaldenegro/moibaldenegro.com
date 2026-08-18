# Requisitos — Búsqueda por término en la raíz (feature 7)

REQ-07-01 La página de búsqueda por término SHALL servir la ruta /<término> mediante el archivo src/pages/[...term].astro.
REQ-07-02 La página /<término> SHALL servirse on-demand por el servidor, WHERE el término de la URL es arbitrario y no enumerable.
REQ-07-03 WHEN el navegador carga la ruta /<término>, la página SHALL presentar los resultados prefiltrados para ese término.
REQ-07-04 WHEN el término de la URL no coincide con ningún artículo, la página SHALL mostrar el estado vacío con el término consultado.
REQ-07-05 La página /<término> SHALL obtener los artículos mediante el repositorio PostsRepository y el índice de búsqueda del dominio.
REQ-07-06 WHEN la página /<término> presenta resultados, cada tarjeta SHALL enlazar a la ruta /posts/[id] del artículo.
REQ-07-07 La página /<término> SHALL declarar el título del documento con el término consultado.
REQ-07-08 La página /<término> SHALL reutilizar el layout compartido Layout.astro y la presentación de resultados de la vista /search.
REQ-07-09 El catch-all /<término> SHALL no capturar las rutas estáticas existentes /, /about, /search y /posts/[id].
REQ-07-10 WHEN el usuario activa la acción de limpiar en la ruta /<término>, la página SHALL navegar a la raíz del sitio.
REQ-07-11 La página /<término> SHALL conservar la vista /search?q= existente sin cambios.