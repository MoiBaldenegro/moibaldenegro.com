# Requisitos — article-card-images

REQ-17-01 El componente latest-articles SHALL renderizar la imagen de cada artículo con la clase latest-articles__image, WHERE la clase se aplica al elemento img que referencia el campo img de la entidad Post.
REQ-17-02 La hoja src/styles/latest-articles.css SHALL limitar la imagen de la tarjeta al ancho del contenido de la tarjeta, WHERE la imagen ocupa el 100 por ciento del ancho disponible.
REQ-17-03 La imagen de la tarjeta SHALL mantener una proporción fija de 16:9, WHERE la altura se deriva del ancho de la caja.
REQ-17-04 La imagen de la tarjeta SHALL recortar el contenido que excede la caja, WHERE la imagen no se deforma y el encuadre usa object-fit cover.
REQ-17-05 La imagen de la tarjeta SHALL aplicar el radio el borde y el margen desde los tokens del diseño, WHERE los valores provienen de --radius-card --color-border y --gap-card.
REQ-17-06 La imagen de la tarjeta SHALL declarar un texto alternativo, WHERE el texto alternativo es el título del artículo.
REQ-17-07 La imagen de la tarjeta SHALL diferir su carga, WHERE el elemento img declara el atributo loading lazy.
REQ-17-08 La hoja src/styles/latest-articles.css SHALL conservar un máximo de 100 líneas y consumir únicamente tokens del diseño, WHERE la regla de la imagen no introduce colores sueltos.
REQ-17-09 El sistema de tokens SHALL permanecer sin cambios en esta feature, WHERE tokens.css no define tokens nuevos y conserva 96 líneas.
