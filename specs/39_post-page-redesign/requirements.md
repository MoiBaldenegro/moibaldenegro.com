# Requisitos — Rediseño de la página de detalle de artículo (feature 39)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-39-<xx>.
# Keywords en mayúsculas. Sin verbos vagos. Sin comas en el sujeto.

## Requisitos

REQ-39-01 El contenido del artículo SHALL ocupar el ancho completo del contenedor del sitio.
REQ-39-02 El header del post SHALL mostrar la imagen destacada y el título dentro de un panel hero con degradado y resplandor de los tokens del hero.
REQ-39-03 El panel hero SHALL enmarcar la imagen con radio, borde y sombra de los tokens del diseño.
REQ-39-04 La meta del artículo SHALL mostrarse como píldora estilada con tokens del diseño.
REQ-39-05 El título y la imagen del detalle SHALL conservar los pares de transición title-${entry.id} e img-${entry.id}.
REQ-39-06 Los estilos del panel hero SHALL residir en la hoja post-header.css, WHERE la hoja no supera las 100 líneas.
REQ-39-07 WHILE el ancho de pantalla es de 768px o menos, el header y la tipografía del detalle SHALL adaptar tamaños y espaciados.
REQ-39-08 La página de detalle SHALL conservar la estructura principal y las clases del contrato, WHERE main.post y article.post__content siguen presentes.
REQ-39-09 Los estilos modificados SHALL consumir únicamente los tokens existentes, WHERE tokens.css permanece en 87 líneas.
