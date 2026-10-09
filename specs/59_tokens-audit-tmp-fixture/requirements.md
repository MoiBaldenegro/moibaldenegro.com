# Requisitos — El test del guardián de tokens usa un fixture fuera de src/ (feature 59)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-59-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-59-01 WHEN scripts/audit-design-tokens.mjs recibe una ruta de directorio como primer argumento, el script SHALL auditar las hojas .css de ese directorio en lugar de src/styles.
REQ-59-02 WHEN scripts/audit-design-tokens.mjs se ejecuta sin argumentos, el script SHALL auditar src/styles con el mismo veredicto y la misma salida que antes del cambio.
REQ-59-03 IF el directorio recibido contiene una hoja distinta de tokens.css con un color suelto, THEN el script SHALL terminar con código de salida distinto de 0.
REQ-59-04 El test REQ-12-06 de tests/cleanup-dead-code.test.mjs SHALL crear la hoja con color suelto dentro de un directorio temporal obtenido de node:os tmpdir mediante mkdtempSync.
REQ-59-05 WHEN el test REQ-12-06 termina en verde o en rojo, el test SHALL borrar el directorio temporal en un bloque finally.
REQ-59-06 Ningún archivo de tests/ SHALL escribir ni borrar archivos dentro de src/.
REQ-59-07 WHEN pnpm test se ejecuta cinco veces seguidas, la suite SHALL terminar en verde en las cinco corridas sin errores ENOENT sobre src/.
REQ-59-08 scripts/audit-design-tokens.mjs SHALL respetar el límite de 100 líneas y usar solo la stdlib de Node tras el cambio.
REQ-59-09 WHEN se ejecuta ./init.sh al cierre de la feature, el arnés SHALL terminar en verde sin errores de formato ni tests fallidos.
