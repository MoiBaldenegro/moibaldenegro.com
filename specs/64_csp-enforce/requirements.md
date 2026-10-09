# Requisitos — CSP en modo obligatorio verificada contra los recursos reales del build (feature 64 csp-enforce)
# Origen: feature 40 (CSP desplegada en Report-Only) y audit_perf_security.md (despliegue gradual). Análisis e inventario del build: progress/research/post_audit_backlog.md.
# No toca UI: sin design.md.
# Estado pending (enmendada 2026-10-09; antes blocked por REQ-64-07).
# Enmienda 2026-10-09 (decisión humana «permite las web analitics», opción (a) de progress/research/csp_production_review.md, sección «Enmienda»):
#   REQ-64-11 sustituye el valor de REQ-40-06 como política vigente: añade https://static.cloudflareinsights.com a script-src y la directiva connect-src 'self' https://cloudflareinsights.com.
#   REQ-64-07 queda resuelto: el único origen no permitido hallado en producción (Cloudflare Web Analytics) se permite por decisión humana.
#   REQ-64-12..15 añaden la verificación del beacon, el ajuste de las constantes CSP de los tests (precedente REQ-43-06) y la verificación en Chrome sobre preview y producción.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-64-01→1, REQ-64-02→2, REQ-64-03→3, REQ-64-04→4, REQ-64-05→5, REQ-64-06→6, REQ-64-07→7, REQ-64-08→8, REQ-64-09→9, REQ-64-10→10, REQ-64-11→11, REQ-64-12→12, REQ-64-13→13, REQ-64-14→14, REQ-64-15→15.

## Requisitos

REQ-64-01 El módulo src/domain/http/security-headers.ts SHALL exportar la cabecera Content-Security-Policy con el valor de la política vigente de REQ-64-11 y sin la clave Content-Security-Policy-Report-Only.
REQ-64-02 La regla /* de public/_headers SHALL declarar Content-Security-Policy con el mismo valor que el módulo y sin la línea Content-Security-Policy-Report-Only.
REQ-64-03 WHEN el middleware procesa una respuesta del Worker, el middleware SHALL añadir la cabecera Content-Security-Policy con el valor del módulo.
REQ-64-04 Ningún archivo de src/ ni de public/ SHALL contener la cadena Content-Security-Policy-Report-Only.
REQ-64-05 WHEN se construye el sitio, cada recurso externo referenciado por los HTML del build SHALL pertenecer a un origen permitido por la directiva de la política que le corresponde.
REQ-64-06 WHEN se construye el sitio, los bundles JavaScript del build SHALL carecer de eval y new Function porque la política no concede unsafe-eval.
REQ-64-07 IF el HTML del sitio en producción contiene un script o recurso de un origen externo no permitido por la política vigente de REQ-64-11, THEN el implementer SHALL detener la feature y registrar el origen en progress/current.md.
REQ-64-08 WHEN se cargan con la cabecera obligatoria la home y about y search y una página de término y un post con código y el post con vídeo y la 404, el navegador SHALL registrar cero violaciones de CSP y conservar el funcionamiento de la isla HTB y del botón de copiar y del iframe de YouTube.
REQ-64-09 WHEN se implemente la feature, el test tests/csp-enforce.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-64-10 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature con todos los archivos dentro del límite de 100 líneas, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
REQ-64-11 La política vigente que sustituye a REQ-40-06 SHALL valer default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'.
REQ-64-12 WHEN el test de la política evalúa la URL del beacon inyectado por Cloudflare https://static.cloudflareinsights.com/beacon.min.js/v4bc70e2c01a94c73b74392e4234840661791215815920 como script, el test SHALL clasificarla como permitida por script-src y clasificar un script de otro origen externo como no permitido.
REQ-64-13 WHEN las constantes CSP de tests/csp-enforce.test.mjs y tests/security-headers.test.mjs citan el valor anterior de la política, cada test SHALL actualizarse al valor de REQ-64-11 documentando el ajuste con el precedente REQ-43-06.
REQ-64-14 WHEN se cargan sobre astro preview en local las siete páginas de REQ-64-08 en Chrome headless con CDP, el navegador SHALL registrar cero violaciones de CSP con la cabecera de REQ-64-11.
REQ-64-15 WHEN el humano verifica producción tras el deploy de la política de REQ-64-11 con Chrome headless y CDP sobre las siete páginas de REQ-64-08, el navegador SHALL registrar cero violaciones de CSP y la respuesta 200 del script beacon.min.js de https://static.cloudflareinsights.com.
