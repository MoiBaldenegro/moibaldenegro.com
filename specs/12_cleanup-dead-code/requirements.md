# Requisitos — cleanup-dead-code

REQ-12-01 El sitio SHALL eliminar el archivo src/config.ts por ser código muerto no importado.
REQ-12-02 El sitio SHALL eliminar la carpeta src/application con sus archivos vacíos.
REQ-12-03 El sitio SHALL eliminar los archivos context.md de las carpetas de dominio.
REQ-12-04 El sitio SHALL eliminar el componente Welcome.astro del starter kit.
REQ-12-05 El sitio SHALL eliminar la carpeta src/ui vacía.
REQ-12-06 El script scripts/audit-design-tokens.mjs SHALL recorrer las hojas de src/styles y fallar ante cualquier valor de color fuera de tokens.css.
REQ-12-07 WHEN la limpieza se completa, el comando build SHALL terminar sin errores.
