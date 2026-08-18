# Requisitos — Enlace Arquitectura en el navbar (feature 8)

REQ-08-01 El navbar del Layout SHALL incluir un enlace con el texto Arquitectura que apunta a /arquitectura.
REQ-08-02 WHEN la ruta activa es /arquitectura o /arquitectura/, el enlace Arquitectura SHALL declarar el atributo aria-current con valor page.
REQ-08-03 WHEN la ruta activa no es /arquitectura ni /arquitectura/, el enlace Arquitectura SHALL omitir el atributo aria-current.
REQ-08-04 La adición del enlace Arquitectura SHALL conservar los enlaces Home, About y @moibaldenegro y la barra de búsqueda del navbar.
REQ-08-05 El enlace Arquitectura SHALL heredar los estilos del navbar existente, WHERE el sitio reutiliza el Layout en todas las páginas.