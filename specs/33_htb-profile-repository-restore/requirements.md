# Requisitos — Restauración del contrato del repositorio HTB (feature 33)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-33-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-33-01 El repositorio HtbProfileRepository SHALL aceptar una función fetch inyectable como tercer argumento del constructor, WHERE el default es el fetch global del runtime.
REQ-33-02 WHEN el constructor recibe token e identificador, el repositorio SHALL invocar el fetch inyectable con la URL del endpoint y el identificador del usuario.
REQ-33-03 WHEN el repositorio realiza la petición, THEN el token SHALL viajar únicamente en la cabecera Authorization.
REQ-33-04 IF la petición falla o la respuesta no es válida o no trae un perfil, THEN el repositorio SHALL lanzar HtbProfileDataError.
REQ-33-05 El archivo htb-profile-repository.ts SHALL no registrar nada en consola.
REQ-33-06 El archivo htb-profile-repository.ts SHALL no superar las 100 líneas.
REQ-33-07 El repositorio SHALL conservar getProfileOrNull como vía degradada que resuelve a null ante cualquier modo de fallo.
REQ-33-08 IF el token o el identificador están ausentes, THEN el repositorio SHALL lanzar HtbProfileDataError sin contactar la red.
