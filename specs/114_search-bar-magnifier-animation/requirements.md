# Requisitos — Feature 114: search-bar-magnifier-animation

## Requisitos

REQ-114-01 El componente search-bar.astro SHALL renderizar dentro de .search-bar__form y antes del input un icono de lupa en SVG inline con la clase search-bar__icon y los atributos aria-hidden="true" y focusable="false".
REQ-114-02 La lupa SHALL dibujarse con stroke="currentColor" y mostrarse con el color --color-text-secondary mientras el input está vacío y sin foco.
REQ-114-03 WHEN el input recibe el foco, la barra SHALL pintar la lupa y el borde del input con --color-accent sin anular el outline global de foco de layout.css (REQ-37-02).
REQ-114-04 WHILE el input tiene el foco y contiene texto, la lupa SHALL ejecutar en bucle la animación CSS de escaneo search-bar-scan definida en src/styles/search-bar-icon.css.
REQ-114-05 WHILE el input contiene texto y no tiene el foco, la lupa SHALL quedar en --color-accent sin animación.
REQ-114-06 IF el usuario declara prefers-reduced-motion reduce, THEN la hoja search-bar-icon.css SHALL anular la animación y las transiciones de la lupa.
REQ-114-07 El input SHALL reservar un padding izquierdo de 42px para que el placeholder y el texto no se solapen con la lupa.
REQ-114-08 La barra de búsqueda SHALL conservar la búsqueda en vivo, el botón de limpiar, Escape y la re-inicialización con astro:page-load sin cambios en search-bar.ts, search-live ni search-escape.
REQ-114-09 La página SHALL renderizarse sin scroll horizontal y con la barra del header de 65 px de alto, WHERE el viewport mide 375, 768, 969, 970, 1024 o 1280 px.
REQ-114-10 La portada construida dist/client/index.html SHALL pesar menos de 42 000 B.
REQ-114-11 Los estilos de la lupa SHALL usar solo tokens existentes de tokens.css sin colores sueltos ni tokens nuevos y sin dependencias externas.
REQ-114-12 Cada archivo tocado o creado por la feature SHALL tener como máximo 100 líneas.
