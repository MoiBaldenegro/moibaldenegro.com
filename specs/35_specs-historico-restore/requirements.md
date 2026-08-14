# Requisitos — Restauración de specs históricas 21 y 24 (feature 35)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-35-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-35-01 El arnés SHALL restaurar specs/21_ssr-cloudflare-align/requirements.md con los requerimientos REQ-21-01..06.
REQ-35-02 El arnés SHALL restaurar specs/24_view-transitions/requirements.md y design.md con los requerimientos REQ-24-01..05.
REQ-35-03 WHEN la suite ejecuta tests/ssr-cloudflare-align.test.mjs, THEN la verificación de la excepción REQ-21-06 SHALL leer la spec restaurada y el registro de dependencias, WHERE el backlog del ciclo nuevo no contiene la feature 21.
REQ-35-04 La suite completa SHALL pasar al 100 por ciento con las specs restauradas.
REQ-35-05 Las specs restauradas SHALL conservar el formato EARS y las convenciones de specs/.
