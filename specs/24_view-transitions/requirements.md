# Requisitos — view-transitions

REQ-24-01 El layout único SHALL habilitar las transiciones de vista, WHERE la cabecera incluye el componente ClientRouter de astro:transitions.
REQ-24-02 El mecanismo de transiciones SHALL quedar canalizado por esta feature, WHERE ninguna edición manual fuera del arnés lo modifica.
REQ-24-03 El componente LatestArticles SHALL llevar los atributos de transición de sus elementos, WHERE el design de esta feature define los pares transition:name de cada card.
REQ-24-04 La excepción de JavaScript de runtime SHALL documentarse en el design de esta feature, WHERE la regla "Estático por defecto" exige justificación aprobada.
REQ-24-05 El test de esta feature SHALL verificar el estado final del mecanismo, WHERE el layout importa ClientRouter y los atributos del componente se comprueban por inspección.