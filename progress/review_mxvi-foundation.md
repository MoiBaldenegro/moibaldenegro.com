# Revisión — feature 10 `mxvi-foundation`

Veredicto: **APPROVED**.

| REQ | Verificación | Resultado |
|-----|--------------|-----------|
| REQ-10-01 | `src/styles/mxvi/` con `components.css`, `components/` y `manifest.json` (test) | ✔ |
| REQ-10-02 | Script ejecutado contra GitHub (commit `5fd0c29`) y contra una carpeta local de prueba (test) | ✔ |
| REQ-10-03 | `manifest.json` con origen y sha256 por archivo (test) | ✔ |
| REQ-10-04/05 | sha256 de cada hoja y conjunto de hojas igual al manifiesto (tests) | ✔ |
| REQ-10-06/07 | Todas las hojas ≤ 100 líneas y sin colores literales (test) | ✔ |
| REQ-10-08 | Toda custom property leída está definida en `tokens.css` o en las hojas (test) | ✔ |
| REQ-10-09 | Orden de imports en `Layout.astro` (test) | ✔ |
| REQ-10-10 | El script solo importa `node:*` (test) | ✔ |
| REQ-10-11 | 15 capturas antes/después: 0.000 % de diferencia | ✔ |

Reglas del proyecto: ≤ 100 líneas en archivos tocados, estilos separados, sin
dependencias, sin JS de runtime, `./init.sh` en verde.
