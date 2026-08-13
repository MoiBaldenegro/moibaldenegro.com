# Requisitos — htb-api-graceful-degradation

REQ-27-01 El repositorio HtbProfileRepository SHALL exponer un método getProfileOrNull, WHERE el método devuelve el perfil solicitado cuando los datos están disponibles y null cuando no lo están.
REQ-27-02 IF el token o el identificador no están definidos, THEN el método getProfileOrNull SHALL devolver null.
REQ-27-03 IF el fetch no puede contactar la API, THEN el método getProfileOrNull SHALL devolver null.
REQ-27-04 IF la API responde con un estado HTTP no válido, THEN el método getProfileOrNull SHALL devolver null.
REQ-27-05 IF la respuesta de la API no es un JSON válido, THEN el método getProfileOrNull SHALL devolver null.
REQ-27-06 IF la respuesta de la API no trae un perfil válido, THEN el método getProfileOrNull SHALL devolver null.
REQ-27-07 El componente htb-stadistics.astro SHALL obtener el perfil con el método getProfileOrNull, WHERE el frontmatter solo importa y llama al repositorio.
REQ-27-08 IF el perfil obtenido es null, THEN la sección de estadísticas SHALL no renderizarse, WHERE la portada permanece operativa sin errores.
REQ-27-09 El método getProfile SHALL conservar el contrato de lanzar HtbProfileDataError, WHERE los datos no están disponibles.
REQ-27-10 WHEN la API de Hack The Box no está disponible, el endpoint de la isla de la sección SHALL responder sin el estado 500.
