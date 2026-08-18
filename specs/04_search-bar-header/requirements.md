# Requisitos — Barra de búsqueda en el header (feature 4)

REQ-04-01 El header del layout SHALL incluir la barra de búsqueda con un input de texto.
REQ-04-02 WHEN el input de búsqueda recibe texto, la barra SHALL actualizar la consulta activa en el cliente.
REQ-04-03 WHEN la consulta activa no está vacía, la barra SHALL mostrar el botón de limpieza con el símbolo X.
REQ-04-04 WHEN el usuario activa el botón de limpieza, la barra SHALL vaciar la consulta y devolver el foco al input.
REQ-04-05 WHEN el usuario presiona Enter con una consulta no vacía, la barra SHALL navegar a la ruta /search con el parámetro q igual a la consulta.
REQ-04-06 IF la consulta está vacía cuando el usuario presiona Enter, THEN la barra SHALL omitir la navegación.
REQ-04-07 WHEN la consulta activa cambia, la barra SHALL emitir un evento de cambio de consulta para la portada.
REQ-04-08 El input de la barra de búsqueda SHALL declarar una etiqueta accesible mediante aria-label.
