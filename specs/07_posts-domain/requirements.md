# Requisitos — posts-domain

REQ-07-01 La entidad Post SHALL tipar los artículos de la colección architecture en src/domain/entities/post.ts.
REQ-07-02 El repositorio PostsRepository SHALL entregar los artículos de la colección architecture como entidades Post.
REQ-07-03 IF un artículo de la colección no cumple el esquema de la entidad, THEN el repositorio SHALL lanzar un error PostsDataError.
REQ-07-04 El repositorio PostsRepository SHALL ser la única vía de acceso a los artículos para los componentes de UI.
REQ-07-05 Los archivos de entidad y repositorio SHALL respetar el límite de 100 líneas cada uno.
