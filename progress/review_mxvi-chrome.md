# Revisión — feature 11 `mxvi-chrome`

Veredicto: **APPROVED**.

| REQ | Verificación | Resultado |
|-----|--------------|-----------|
| REQ-11-01 | `base.css` en la copia y en el manifiesto (test) | ✔ |
| REQ-11-02 | `Layout.astro` importa `mxvi/base.css` y no `layout.css` (test) | ✔ |
| REQ-11-03/04 | Header y enlace de salto con clases `mx-*` (test) | ✔ |
| REQ-11-05 | Búsqueda con `mx-search` (test) | ✔ |
| REQ-11-06 | Footer con `mx-footer` y sus piezas (test) | ✔ |
| REQ-11-07/09 | Sin clases antiguas del chrome en `src` (test) | ✔ |
| REQ-11-08 | Las cinco hojas antiguas no existen (test) | ✔ |
| REQ-11-10 | `site-menu.ts` localiza `.mx-navbar` y conserva los data-* (test + navegador) | ✔ |
| REQ-11-11 | `typography.css` sin selectores del header ni de la búsqueda (test) | ✔ |
| REQ-11-12 | 15 capturas: alturas iguales, peor diferencia 0.044 % (logo, proporción real) | ✔ |

Reglas del proyecto: ≤ 100 líneas en archivos tocados (Layout 81, footer 65), estilos
separados, sin dependencias, sin JS de runtime nuevo, `./init.sh` en verde.
