# Requisitos — Restauración del ancho completo de lectura (feature 41)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-41-<xx>.
# Keywords en mayúsculas. Sin verbos vagos. Sin comas en el sujeto.

## Requisitos

REQ-41-01 La columna de lectura del detalle SHALL ocupar el ancho completo del contenedor del sitio, WHERE ninguna regla de la hoja post-readability.css declara max-width ni max-inline-size.
REQ-41-02 La columna de lectura SHALL conservar la sección post__body envolviendo el render del Content, WHERE la sección no recibe acotación de ancho.
REQ-41-03 El cuerpo de lectura SHALL conservar el tamaño de fuente clamp() con límites 1.0625rem y 1.1875rem.
REQ-41-04 Los párrafos del contenido SHALL conservar text-wrap pretty.
REQ-41-05 Los párrafos del contenido SHALL conservar el espaciado final de bloque con la unidad 1lh.
REQ-41-06 Los párrafos del contenido SHALL conservar letter-spacing de 0.01em.
REQ-41-07 Los encabezados del contenido SHALL conservar text-wrap balance.
REQ-41-08 La jerarquía de encabezados del contenido SHALL conservar h2 a 1.75rem y h3 a 1.4rem.
REQ-41-09 WHILE el ancho de pantalla es de 768px o menos, la tipografía del contenido SHALL conservar la adaptación de tamaños de h2 y h3.
REQ-41-10 El test post-readability.test.mjs SHALL actualizarse para verificar la ausencia de acotación de ancho en la hoja de lectura, WHERE los requisitos tipográficos conservados permanecen verificados.
REQ-41-11 Los estilos de lectura SHALL residir en la hoja post-readability.css, WHERE la hoja no supera las 100 líneas.
REQ-41-12 La hoja de lectura SHALL consumir únicamente los tokens existentes, WHERE tokens.css permanece en 87 líneas.
REQ-41-13 La regla .post__content SHALL conservar el ancho completo del contenedor del sitio.