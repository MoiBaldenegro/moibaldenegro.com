# Requisitos — posts-domain-restore

REQ-18-01 La entidad Post SHALL tipar los artículos de la colección architecture en src/domain/entities/post.ts, WHERE la interfaz declara los campos readonly title author img readtime description tags created y updated.
REQ-18-02 El repositorio PostsRepository SHALL entregar los artículos como entidades Post, WHERE el constructor acepta un loader inyectable cuyo default envuelve getCollection de astro:content.
REQ-18-03 IF un artículo no cumple el esquema de la entidad, THEN el repositorio SHALL lanzar un error PostsDataError.
REQ-18-04 IF la lectura de la colección falla, THEN el repositorio SHALL lanzar un error PostsDataError.
REQ-18-05 El archivo posts-repository.ts SHALL exportar la clase PostsRepository, WHERE la función markdownPostRepository queda eliminada.
REQ-18-06 Los archivos de entidad y repositorio SHALL respetar el límite de 100 líneas cada uno.