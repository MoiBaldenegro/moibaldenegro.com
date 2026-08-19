# Requisitos — Re-inicialización de los controladores de búsqueda en cada navegación (feature 10)

REQ-10-01 WHEN el documento completa una navegación con transición de vista, el controlador de resultados SHALL re-ejecutar el filtrado del índice para el término del pathname o del parámetro q.
REQ-10-02 WHEN el documento completa una navegación con transición de vista, el controlador de la barra SHALL re-ejecutar la conexión de eventos del input y del botón de limpieza de la página nueva.
REQ-10-03 WHEN el documento completa una navegación con transición de vista, el controlador del panel en vivo SHALL re-ejecutar la inicialización con las referencias del DOM de la página nueva.
REQ-10-04 WHEN el documento completa una navegación con transición de vista, el controlador de Escape SHALL re-ejecutar el registro del manejador de teclado sobre el documento.
REQ-10-05 El arranque de los cuatro controladores SHALL cubrir la carga inicial del documento y cada navegación suave con un único listener del evento astro:page-load.
REQ-10-06 WHEN el evento astro:page-load se dispara de nuevo, el controlador del panel en vivo SHALL sustituir el listener del evento de cambio de consulta sin acumular manejadores.
REQ-10-07 WHEN una página no contiene el DOM del controlador, la re-inicialización SHALL no ejecutar acciones ni lanzar errores.
REQ-10-08 Los tests de inspección del arranque de los componentes SHALL verificar la re-inicialización con el listener del evento astro:page-load en lugar de la llamada directa, WHERE los ajustes de aserciones quedan justificados en progress/research/client-init-on-navigation.md.
REQ-10-09 El comentario de cabecera de search-escape.ts SHALL declarar la ejecución única de los módulos empaquetados y la re-inicialización con el evento astro:page-load.