# Requisitos — design-tokens

REQ-02-01 El sitio SHALL definir los tokens de diseño en el archivo src/styles/tokens.css.
REQ-02-02 Los tokens del diseño SHALL cubrir los grupos de color de fondo color de superficie color de texto color de borde color de acento radio espaciado sombra tipografía transición y contenedor.
REQ-02-03 Los tokens de marca de las tarjetas SHALL derivarse de la paleta de colores actual de hero.data.ts.
REQ-02-04 Las custom properties del diseño SHALL nombrarse con el patrón --grupo-nombre en kebab-case.
REQ-02-05 WHEN la hoja tokens.css no define los grupos requeridos, THEN el test de tokens SHALL fallar.
