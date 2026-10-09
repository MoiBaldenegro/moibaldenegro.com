# Requisitos — Anunciar los resultados de búsqueda a lectores de pantalla con una región aria-live (feature 36 search-status-announcements)
# Origen: audit_a11y.md A1 (y parte de M6). Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-36-01→1, REQ-36-02→2, REQ-36-03→3, REQ-36-04→4, REQ-36-05→5, REQ-36-06→6, REQ-36-07→7, REQ-36-08→8, REQ-36-09→9, REQ-36-10→10, REQ-36-11→11.

## Requisitos

REQ-36-01 La vista de resultados de /search y de /<término> SHALL contener un único nodo con role="status" y aria-live="polite" marcado con data-search-status.
REQ-36-02 El panel de búsqueda en vivo de la portada SHALL contener un único nodo con role="status" y aria-live="polite" marcado con data-search-status.
REQ-36-03 La función pura statusMessage SHALL devolver «N resultados para "<término>"» cuando hay más de un resultado y «1 resultado para "<término>"» cuando hay uno.
REQ-36-04 IF la búsqueda no tiene resultados, THEN la función statusMessage SHALL devolver «Sin resultados para "<término>"».
REQ-36-05 WHEN la búsqueda tiene más de una página, la función statusMessage SHALL añadir «Página X de Y» al mensaje.
REQ-36-06 WHEN el controlador de resultados renderiza una búsqueda o cambia de página, el controlador SHALL escribir en el nodo de estado el mensaje de statusMessage.
REQ-36-07 WHEN el usuario escribe en el buscador de la portada, el panel en vivo SHALL actualizar el nodo de estado una sola vez tras 300 ms sin nuevas pulsaciones.
REQ-36-08 La clase utilitaria .visually-hidden de layout.css SHALL ocultar visualmente el nodo de estado y mantenerlo en el árbol de accesibilidad.
REQ-36-09 WHEN se implemente la feature, el test tests/search-status-announcements.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-36-10 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-36-11 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
