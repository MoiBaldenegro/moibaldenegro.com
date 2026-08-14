# Requisitos — Reducción de jank de scroll y navegación (feature 44)

REQ-44-01 El elemento html del layout SHALL declarar transition:animate none.
REQ-44-02 El layout SHALL exponer un slot con nombre head en la cabecera del documento.
REQ-44-03 WHEN la página de detalle renderiza su cabecera, la página SHALL pre-cargar la imagen del artículo con rel preload y fetchpriority high.
REQ-44-04 El navbar sticky SHALL omitir la propiedad backdrop-filter.
REQ-44-05 El fondo del navbar SHALL declararse con color-mix en srgb sobre un token de color existente.
REQ-44-06 WHEN el cursor sobrevuela la tarjeta del hero, la tarjeta SHALL animar únicamente transform y border-color sin box-shadow ni filter.
REQ-44-07 WHEN el cursor sobrevuela la card de artículos, la card SHALL animar únicamente border-color y transform sin box-shadow.
REQ-44-08 El morph de imagen y título entre card y detalle SHALL conservar los pares transition:name existentes.
