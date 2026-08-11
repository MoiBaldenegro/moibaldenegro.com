# Requisitos — articles-ui-refactor

REQ-10-01 El componente LatestArticles SHALL obtener los artículos desde el repositorio PostsRepository.
REQ-10-02 El componente LatestArticles SHALL importar sus estilos desde src/styles/latest-articles.css.
REQ-10-03 La hoja latest-articles.css SHALL consumir únicamente los tokens del diseño y respetar el límite de 100 líneas.
REQ-10-04 WHEN el componente importa astro:content directamente, THEN el test de UI SHALL fallar.
