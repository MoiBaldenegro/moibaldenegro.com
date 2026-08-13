# Requisitos — post-page-styles

REQ-26-01 El test de estilos de la página de artículo SHALL escribirse antes de la implementación de la hoja, WHERE el test verifica estructura y contrato sin navegador.
REQ-26-02 La página de artículo SHALL importar la hoja src/styles/post.css.
REQ-26-03 La hoja post.css SHALL estilizar el contenedor el título la meta la imagen y la tipografía del contenido, WHERE la página declara las clases post post__content post__title post__meta y post__image.
REQ-26-04 La imagen del artículo SHALL mantener la proporción 16:9 y el recorte cover con el radio y el borde de los tokens del diseño, WHERE la hoja aplica width 100 por ciento object-fit cover var(--radius-card) y var(--color-border).
REQ-26-05 La hoja post.css SHALL aplicar colores radios bordes y transiciones solo desde tokens, WHERE el resto de valores tipográficos y de layout son literales del componente.
REQ-26-06 La hoja post.css SHALL respetar un máximo de 100 líneas sin valores hex ni rgba sueltos.
REQ-26-07 El sistema de tokens SHALL permanecer sin cambios, WHERE tokens.css no añade tokens nuevos.
REQ-26-08 El proyecto SHALL completar la feature sin romper la suite de tests ni el build.