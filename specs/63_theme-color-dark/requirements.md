# Requisitos — Color de tema oscuro en site.webmanifest y meta theme-color (feature 63 theme-color-dark)
# Origen: observación al cerrar la auditoría (theme_color y background_color = #ffffff con el tema oscuro). Análisis: progress/research/post_audit_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-63-01→1, REQ-63-02→1, REQ-63-03→2, REQ-63-04→3, REQ-63-05→4, REQ-63-06→5, REQ-63-07→6, REQ-63-08→7.

## Requisitos

REQ-63-01 El módulo src/domain/seo/theme.ts SHALL exportar la constante THEME_COLOR con el mismo valor hexadecimal que el token --color-background de tokens.css.
REQ-63-02 El archivo public/site.webmanifest SHALL declarar theme_color y background_color con el valor de THEME_COLOR.
REQ-63-03 El layout Layout.astro SHALL emitir en el head una única etiqueta meta name="theme-color" cuyo content procede de THEME_COLOR.
REQ-63-04 El layout Layout.astro SHALL obtener el color de tema importando THEME_COLOR sin escribir un literal hexadecimal en el componente.
REQ-63-05 WHEN se construye el sitio, cada página HTML del build SHALL contener meta name="theme-color" con el valor de THEME_COLOR.
REQ-63-06 WHEN se implemente la feature, el test tests/theme-color-dark.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-63-07 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-63-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
