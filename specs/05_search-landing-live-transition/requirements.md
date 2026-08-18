# Requisitos — Transición dinámica del layout en la Landing (feature 5)

REQ-05-01 WHEN la consulta activa en la portada está vacía, la portada SHALL mostrar las secciones habituales de la Landing Page.
REQ-05-02 WHILE la consulta activa en la portada tiene al menos un carácter, la portada SHALL ocultar las secciones habituales y mostrar el panel de resultados en vivo.
REQ-05-03 WHEN la consulta activa vuelve a estar vacía, la portada SHALL restaurar las secciones habituales de inmediato.
REQ-05-04 El panel de resultados en vivo SHALL presentar las coincidencias con la misma presentación que la vista dedicada /search.
REQ-05-05 WHEN no existen coincidencias para la consulta en vivo, el panel SHALL mostrar el estado vacío con el término actual.
REQ-05-06 WHEN existen más coincidencias que el tamaño de página, el panel en vivo SHALL mostrar los primeros resultados del tamaño de página con un enlace a la vista dedicada.
REQ-05-07 El comportamiento de la transición dinámica SHALL ejecutarse con JavaScript de runtime en el cliente.
