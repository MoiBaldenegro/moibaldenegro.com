# Requisitos — El texto del anchor nunca es una URL (feature 27)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-27-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-27-01 IF un href de related no corresponde a ningún Post conocido, THEN resolveRelatedTitles SHALL omitirlo del arreglo resultante.
REQ-27-02 WHEN todos los hrefs de related corresponden a Posts conocidos, resolveRelatedTitles SHALL devolver un item por cada href con el título del Post destino.
REQ-27-03 El texto de cada anchor de recomendados SHALL mostrar el título del Post destino sin contener el prefijo /posts/.
REQ-27-04 related-titles.ts SHALL respetar el límite de 100 líneas tras el cambio.
