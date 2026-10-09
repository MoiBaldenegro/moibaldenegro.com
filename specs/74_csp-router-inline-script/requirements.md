# Requisitos — Navegaciones del ClientRouter sin violación de CSP por el script data: del router (feature 74 csp-router-inline-script)
# Prioridad baja por decisión humana («ponla hasta el final, no es importante»); depends_on [73] para quedar al final del backlog.
# Causa (progress/research/horizontal_feedback.md §3): node_modules/astro/dist/transitions/router.js:110 inserta <script type="module" src="data:application/javascript,"> cuando el último script module del documento nuevo es inline; la CSP obligatoria de REQ-64-11 no permite data: en script-src. Hoy lo provocan los posts, cuyo último script es code-copy inlineado por Astro al medir menos de 4096 B.
# Sin impacto funcional hoy (page-load se dispara y Copiar funciona), pero ensucia la consola y los informes de CSP.
# Opción recomendada: vite.build.assetsInlineLimit como función en astro.config.mjs que devuelve false para los chunks de script de componentes Astro (ruta con astro_type_script) y undefined para el resto; la CSP de REQ-64-11 no cambia. Alternativa si el humano no quiere tocar el build: script-src-elem con data: además de los orígenes de script-src (cambiaría REQ-64-11 y dos tests).
# No toca UI: sin design.md.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-74-01 y REQ-74-02→1, REQ-74-03 y REQ-74-04→2, REQ-74-05→3, REQ-74-06→4, REQ-74-07→5, REQ-74-08→6, REQ-74-09→7.

## Requisitos

REQ-74-01 El archivo astro.config.mjs SHALL declarar vite.build.assetsInlineLimit como función que devuelve false para los chunks de script de componentes Astro y undefined para el resto de assets.
REQ-74-02 WHEN se construye el sitio, el último elemento script de tipo module de cada HTML del build SHALL tener atributo src.
REQ-74-03 La política Content-Security-Policy de src/domain/http/security-headers.ts y public/_headers SHALL conservar sin cambios el valor vigente de REQ-64-11.
REQ-74-04 WHEN se construye el sitio, los HTML de los posts SHALL referenciar el script de code-copy como chunk externo bajo /_astro/ en lugar de un script module inline.
REQ-74-05 WHEN el usuario navega con el ClientRouter mediante clics reales por portada y post con bloque de código y portada y /about y /search y post sobre astro preview con la CSP vigente, el navegador SHALL registrar cero violaciones de CSP en cada paso.
REQ-74-06 WHEN el ClientRouter termina de navegar a un post con bloque de código, la página SHALL disparar astro:page-load y mostrar el botón Copiar funcional.
REQ-74-07 IF la opción del build no elimina la violación o rompe la carga de algún script, THEN el implementer SHALL detener la feature y registrar el hallazgo en progress/current.md para que el humano decida la alternativa con script-src-elem.
REQ-74-08 La verificación real con Chrome headless y CDP SHALL registrar en progress/impl_74.md las violaciones de CSP de cada paso de navegación antes y después del cambio.
REQ-74-09 WHEN se implemente la feature, el test nuevo tests/csp-router-inline-script.test.mjs SHALL observarse en rojo antes de modificar astro.config.mjs, WHERE la suite completa y ./init.sh terminan en verde al cierre con cada archivo tocado dentro de 100 líneas.
