# Requisitos — Hrefs next/related a los post.id reales (feature 26)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-26-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-26-01 El frontmatter del artículo 00-agilismo SHALL declarar next con el valor exacto /posts/01-diseño-detallado y related con el valor exacto /posts/02-principios-del-diseno-de-software.
REQ-26-02 El frontmatter del artículo 01-diseño_detallado SHALL declarar next con el valor exacto /posts/02-principios-del-diseno-de-software y related con el valor exacto /posts/03-principios solid.
REQ-26-03 El frontmatter del artículo 02-principios SHALL declarar next con el valor exacto /posts/03-principios solid y related con el valor exacto /posts/00-agilismo.
REQ-26-04 El frontmatter del artículo 03-principios_solid SHALL declarar related con los valores exactos /posts/00-agilismo y /posts/01-diseño-detallado.
REQ-26-05 Cada ruta de next y related SHALL corresponder a un post.id entregado por PostsRepository, WHERE la verificación usa el repositorio y no el nombre de fichero.
