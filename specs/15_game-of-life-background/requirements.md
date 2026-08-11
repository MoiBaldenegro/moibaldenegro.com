# Requisitos — game-of-life-background

REQ-15-01 El componente GameOfLifeBackground SHALL renderizar un lienzo canvas fijo de fondo, WHERE el canvas se coloca detrás del contenido con un índice z inferior.
REQ-15-02 El componente GameOfLifeBackground SHALL animar el lienzo con JavaScript vanilla del navegador, WHERE no se añaden dependencias externas.
REQ-15-03 El componente GameOfLifeBackground SHALL dibujar las celdas vivas con el color del token --color-accent, WHERE el color se lee de la custom property del diseño.
REQ-15-04 El lienzo del fondo SHALL mostrar el patrón con una opacidad inferior a 0.25, WHERE la opacidad se aplica desde el token --opacity-gol.
REQ-15-05 WHEN el usuario prefiere movimiento reducido, el fondo SHALL dibujar un único fotograma estático sin animación.
REQ-15-06 WHILE el documento está oculto, la animación del lienzo SHALL permanecer pausada.
REQ-15-07 El patrón inicial SHALL sembrar celdas vivas con densidad baja, WHERE la densidad no supera 0.15.
REQ-15-08 La cuadrícula SHALL ajustarse a las dimensiones del viewport, WHERE cada celda usa el tamaño del token --size-gol-cell.
REQ-15-09 El layout único SHALL incluir el componente una sola vez, WHERE el fondo aparece en todas las páginas del sitio.
REQ-15-10 El lienzo SHALL permitir la interacción con el contenido, WHERE el lienzo no captura eventos de puntero.
REQ-15-11 El archivo src/styles/tokens.css SHALL definir los tokens --opacity-gol y --size-gol-cell siguiendo el patrón --grupo-nombre.
REQ-15-12 El componente SHALL importar sus estilos desde src/styles/game-of-life.css, WHERE la hoja solo consume tokens del diseño.
