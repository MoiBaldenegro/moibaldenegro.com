# Requisitos — Soporte de teclado Escape (feature 6)

REQ-06-01 WHEN el usuario presiona Escape con la búsqueda activa en la portada, la portada SHALL vaciar la consulta y restaurar las secciones habituales.
REQ-06-02 WHEN el usuario presiona Escape con una consulta activa en la vista /search, la vista SHALL limpiar la consulta y mostrar el estado inicial.
REQ-06-03 IF la consulta activa está vacía cuando el usuario presiona Escape, THEN el manejador SHALL omitir cualquier acción.
REQ-06-04 WHEN el usuario presiona Escape, el manejador SHALL ejecutar la limpieza sin propagar el evento al resto de la página.
