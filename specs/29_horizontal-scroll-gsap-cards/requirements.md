# Requisitos — Animación horizontal gobernada por el scroll con GSAP ScrollTrigger (feature 29)

## Requisitos

REQ-29-01 La sección de artículos recientes de la portada SHALL trasladar su pista horizontalmente gobernada por el desplazamiento vertical mediante ScrollTrigger con fijado y progreso vinculado.
REQ-29-02 El módulo cliente de la pista SHALL importar gsap y ScrollTrigger desde el paquete gsap registrado en la feature 28.
REQ-29-03 El módulo cliente de la pista SHALL registrar la animación como listener del evento astro:page-load.
REQ-29-04 WHEN la sección entra en la vista, el módulo cliente SHALL fijar la sección y vincular el progreso horizontal al desplazamiento vertical.
REQ-29-05 WHILE la preferencia de movimiento reducido está activa, el módulo cliente SHALL omitir la animación y mostrar el contenido estático.
REQ-29-06 IF JavaScript está deshabilitado, THEN la portada SHALL mostrar las 3 cards visibles sin animación.
REQ-29-07 Las cards de la pista SHALL conservar los pares de transición de título e imagen por identificador de artículo.
REQ-29-08 WHILE la consulta de búsqueda está activa, la portada SHALL ocultar la sección animada y mostrar el panel de resultados.
REQ-29-09 La hoja de estilos de la pista SHALL usar solo tokens de tokens.css.
REQ-29-10 Cada archivo modificado por la feature SHALL respetar el límite de 100 líneas.
