# Requisitos — htb-stadistics-section

REQ-22-01 El sitio SHALL mostrar la sección de estadísticas de Hack The Box, WHERE el componente htb-stadistics.astro se renderiza con server:defer y un slot de fallback en la portada.
REQ-22-02 El repositorio HtbProfileRepository SHALL entregar los datos del perfil solicitados a la API, WHERE el constructor acepta un fetch inyectable.
REQ-22-03 IF la respuesta de la API no es válida, THEN el repositorio SHALL lanzar un error HtbProfileDataError.
REQ-22-04 IF el fetch falla, THEN el repositorio SHALL lanzar un error HtbProfileDataError.
REQ-22-05 El componente SHALL importar sus estilos desde src/styles/htb-stadistics.css, WHERE la hoja consume únicamente tokens existentes y no supera 100 líneas.
REQ-22-06 El componente SHALL no exponer secretos en la salida ni en la consola, WHERE el token y el identificador solo se usan en la cabecera de autorización.
REQ-22-07 IF las variables de entorno del token o del identificador no están definidas, THEN la sección SHALL mostrar el estado de fallback sin romper la página.
REQ-22-08 El esquema de astro.config.mjs SHALL declarar las variables de entorno de la sección, WHERE HTB_API_TOKEN es secreta y de contexto server.