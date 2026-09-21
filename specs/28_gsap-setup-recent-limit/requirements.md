# Requisitos — Alta de GSAP y límite a los 3 artículos recientes (feature 28)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-28-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-28-01 package.json SHALL declarar gsap en dependencies con la versión instalada vía pnpm.
REQ-28-02 docs/dependencies.md SHALL registrar la entrada ### gsap con version y scope iguales a los de package.json y con approved y motivo de la autorización humana.
REQ-28-03 La portada SHALL mostrar como máximo los 3 artículos más recientes reutilizando el orden descendente entregado por PostsRepository.
REQ-28-04 WHEN el catálogo contiene menos de 3 artículos, la portada SHALL mostrarlos todos sin error.
REQ-28-05 Cada archivo modificado por la feature SHALL respetar el límite de 100 líneas.
