# Requisitos — latest-articles-restore

REQ-20-01 El componente LatestArticles SHALL obtener los artículos desde el repositorio PostsRepository, WHERE el frontmatter se limita a imports y paso de datos.
REQ-20-02 El componente SHALL no importar astro:content ni getCollection directamente.
REQ-20-03 El componente SHALL interpolar los campos de la entidad Post en marcado semántico, WHERE se usan article h2 p y span con post.title post.author post.readtime post.description y post.tags.
REQ-20-04 El componente SHALL mostrar el texto "min de lectura", WHERE el tiempo de lectura se presenta junto al autor.
REQ-20-05 El componente SHALL renderizar la imagen con la clase latest-articles__image y el atributo loading lazy, WHERE el src referencia post.img y el alt interpola post.title.
REQ-20-06 El componente SHALL eliminar el enlace a la ruta /posts y los atributos de transición, WHERE la ruta no existe y el mecanismo de transiciones se canaliza en la feature 24.
REQ-20-07 El componente y la hoja latest-articles.css SHALL respetar el límite de 100 líneas, WHERE la hoja conserva las reglas de la feature 17 sin colores sueltos.