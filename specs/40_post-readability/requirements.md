# Requisitos — Legibilidad del detalle de artículo (feature 40)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-40-<xx>.
# Keywords en mayúsculas. Sin verbos vagos. Sin comas en el sujeto.

## Requisitos

REQ-40-01 La página de detalle SHALL envolver el render del Content en una sección con la clase post__body.
REQ-40-02 La columna de lectura SHALL acotar su ancho a la medida de 70ch centrada, WHERE el contenedor y el header del post conservan el ancho completo del sitio.
REQ-40-03 El cuerpo de la columna de lectura SHALL declarar el tamaño de fuente como clamp() con límites 1.0625rem y 1.1875rem.
REQ-40-04 Los párrafos del contenido SHALL declarar text-wrap pretty.
REQ-40-05 Los párrafos del contenido SHALL declarar el espaciado final de bloque con la unidad 1lh.
REQ-40-06 Los párrafos del contenido SHALL declarar letter-spacing de 0.01em.
REQ-40-07 Los encabezados del contenido SHALL declarar text-wrap balance.
REQ-40-08 La jerarquía de encabezados del contenido SHALL escalar h2 a 1.75rem y h3 a 1.4rem.
REQ-40-09 WHILE el ancho de pantalla es de 768px o menos, la tipografía de la columna de lectura SHALL adaptar los tamaños de h2 y h3.
REQ-40-10 Los estilos de lectura SHALL residir en la hoja post-readability.css, WHERE la hoja no supera las 100 líneas.
REQ-40-11 La hoja de lectura SHALL consumir únicamente los tokens existentes, WHERE tokens.css permanece en 87 líneas.
REQ-40-12 La regla .post__content SHALL conservar el ancho completo del contenedor del sitio, WHERE la medida de lectura se aplica en la clase post__body.