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
REQ-10-10 IF la página tras una navegación suave no contiene el contenedor de resultados, THEN el controlador de resultados SHALL conservar el document.title de la página y no pedir el índice de búsqueda.
REQ-10-11 IF la página tras una navegación suave no contiene el panel en vivo, THEN el controlador del panel en vivo SHALL retirar el listener del evento de cambio de consulta registrado en la visita anterior.
REQ-10-12 WHEN el usuario vuelve con el ClientRouter desde otra página a /arquitectura o /diseno-de-sistemas o /search?q=<término> en la 2.ª visita o posteriores, la vista de resultados SHALL pintar los items que corresponden al término.
REQ-10-13 WHILE la sesión acumula varias navegaciones suaves, los controladores del panel en vivo y de la barra y de Escape SHALL responder en la página actual.
REQ-10-14 WHEN el usuario vuelve N veces a la portada con el ClientRouter, un evento de cambio de consulta SHALL disparar el manejador del panel en vivo una sola vez.
REQ-10-15 La verificación en navegador del cierre SHALL registrar 0 errores de consola y guardar sus capturas y su script en progress/research/client-init10/.
