# Requisitos — feature 15 `mxvi-article-search`

## Requisitos

REQ-15-01 La página de artículo SHALL usar las clases mx-page, mx-post-hero, mx-media, mx-post-hero__copy, mx-kicker, mx-post-hero__title, mx-meta, mx-meta--pill y mx-prose del design system.
REQ-15-02 El enlace al siguiente artículo SHALL usar las clases mx-post-next, mx-button y mx-button--surface.
REQ-15-03 Los artículos recomendados SHALL usar las clases mx-post-related, mx-post-related__title, mx-result-list, mx-result-row, mx-thumb, mx-result-row__body, mx-result-row__link y mx-result-row__meta.
REQ-15-04 El script de copiar código SHALL envolver cada bloque en un elemento con la clase mx-code y crear un botón con la clase mx-code__copy.
REQ-15-05 Las páginas de búsqueda SHALL usar las clases mx-page y mx-heading en su contenedor y su título.
REQ-15-06 Los avisos de la búsqueda SHALL usar las clases mx-notice, mx-notice__title, mx-notice__text, mx-notice__text--lg, mx-notice__actions y mx-button--quiet.
REQ-15-07 Cada resultado de búsqueda SHALL usar las clases mx-result-row, mx-thumb, mx-result-row__body, mx-result-row__link, mx-result-row__title, mx-result-row__meta, mx-result-row__description, mx-tag-list, mx-tag y mx-tag--sm.
REQ-15-08 Las listas de resultados SHALL usar la clase mx-result-list.
REQ-15-09 La paginación de la búsqueda SHALL usar las clases mx-pagination, mx-button--surface y mx-pagination__label.
REQ-15-10 La página no encontrada SHALL usar las clases mx-container, mx-notice, mx-notice--page, mx-notice__title, mx-notice__title--lg, mx-notice__text, mx-notice__actions y mx-link.
REQ-15-11 El repositorio SHALL eliminar de src/styles las hojas post.css, post-header.css, post-readability.css, post-next.css, code-copy.css, search-results.css y typography.css.
REQ-15-12 Los archivos de src SHALL dejar de usar las clases post__, search-results__, search-page, not-found__, code-copy y code-block.
REQ-15-13 Cada página de artículo y de búsqueda y la página no encontrada SHALL mostrar el mismo resultado visual que antes del cambio, WHERE el ancho es 390, 768, 1024 o 1440 px.
