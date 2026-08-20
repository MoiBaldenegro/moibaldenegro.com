# Requisitos — Estilos del iframe de video en el detalle de artículo (feature 11)

REQ-11-01 La página de detalle de artículo SHALL importar la hoja article.css del contenido embebido, WHERE el cuerpo del artículo puede contener iframes de video.
REQ-11-02 El contenedor del video SHALL declarar ancho 100%, proporción 16 / 9, desborde oculto y radio con el token var(--radius-card).
REQ-11-03 El iframe del video SHALL declarar display block, ancho 100% y alto 100%, WHERE el contenedor fija la proporción con aspect-ratio.
REQ-11-04 Los estilos del video SHALL quedar scoping bajo el selector .post__content, WHERE el contenido markdown del artículo se renderiza bajo .post__content.
REQ-11-05 Los estilos del video SHALL usar exclusivamente tokens para radio y espaciado, WHERE el contenedor declara su margen con var(--gap-card).
REQ-11-06 El iframe del video SHALL omitir la altura mínima forzada, WHERE la proporción del contenedor gobierna la altura.
REQ-11-07 La hoja article.css SHALL eliminar las clases muertas .article y .prose, WHERE la página de detalle usa el patrón BEM del bloque .post.
REQ-11-08 La portada SHALL dejar de importar la hoja article.css, WHERE la portada no renderiza cuerpos de artículo.
REQ-11-09 La hoja article.css SHALL respetar el límite de 100 líneas del arnés.