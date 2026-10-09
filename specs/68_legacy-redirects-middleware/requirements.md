# Requisitos — Redirecciones 301 de slugs antiguos en el middleware del Worker en lugar de _redirects (feature 68 legacy-redirects-middleware)
# Origen: bug crítico de deploy (Cloudflare API code 100324, «Invalid _redirects configuration: Expected exactly 2 or 3 whitespace-separated tokens. Got 4»). Análisis: progress/research/deploy_redirects_bug.md.
# Sustituye el mecanismo de REQ-45-04 (redirects en astro.config.mjs) conservando su comportamiento: 301 desde las tres URLs antiguas, con y sin barra final.
# Sin design.md: la feature no toca UI ni presentación.
# Notas: REQ-45-05 amplía su exclusión a tests/legacy-redirects.test.mjs; tests/security-headers.test.mjs llama onRequest({}, next) (de ahí REQ-68-09); Location relativa con new Response (Response.redirect exige URL absoluta).
# Estado pending. Prioridad: se implementa antes que 64, 65, 66 y 67 (todas declaran depends_on [68]).
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-68-01→1, REQ-68-02→2, REQ-68-03→2, REQ-68-04→3, REQ-68-05→3, REQ-68-06→4, REQ-68-07→5, REQ-68-08→5, REQ-68-09→6, REQ-68-10→7, REQ-68-11→8, REQ-68-12→9, REQ-68-13→10, REQ-68-14→11, REQ-68-15→11.

## Requisitos

REQ-68-01 El archivo astro.config.mjs SHALL omitir la clave redirects.
REQ-68-02 El módulo src/domain/http/legacy-redirects.ts SHALL exportar una función pura legacyRedirect(pathname) que devuelve el pathname destino o null.
REQ-68-03 WHEN legacyRedirect recibe /posts/03-principios%20solid o /posts/01-dise%C3%B1o-detallado o /posts/02-ciclo-de-vida-y-arquitectura en forma codificada o decodificada, legacyRedirect SHALL devolver /posts/03-principios-solid o /posts/01-diseno-detallado o /posts/04-ciclo-de-vida-y-arquitectura respectivamente.
REQ-68-04 WHEN el pathname antiguo termina en una barra final, legacyRedirect SHALL devolver el mismo destino que sin la barra.
REQ-68-05 WHEN el pathname decodificado contiene la ñ en forma descompuesta (n seguida de U+0303), legacyRedirect SHALL devolver el mismo destino que con la forma compuesta tras normalizar a NFC.
REQ-68-06 IF el pathname contiene una secuencia de escape inválida o no corresponde a ningún slug antiguo, THEN legacyRedirect SHALL devolver null sin lanzar excepción.
REQ-68-07 WHEN legacyRedirect devuelve un destino para la petición, el middleware src/middleware.ts SHALL responder con estado 301 y cabecera Location igual al destino concatenado con la query string original.
REQ-68-08 La respuesta 301 del middleware SHALL llevar las cabeceras de seguridad de withSecurityHeaders.
REQ-68-09 IF el contexto del middleware carece de url, THEN el middleware SHALL delegar en next() sin redirigir.
REQ-68-10 WHEN se ejecuta el build real, el archivo dist/client/_redirects SHALL estar ausente o contener solo líneas de 2 o 3 tokens separados por espacios y sin caracteres no ASCII.
REQ-68-11 WHEN se sirve el build con astro preview, cada URL antigua codificada con y sin barra final SHALL responder 301 con Location al slug nuevo.
REQ-68-12 WHEN el test REQ-45-04 de tests/ascii-post-slugs.test.mjs inspecciona astro.config.mjs, el test SHALL actualizarse para verificar legacyRedirect documentando el ajuste con el precedente REQ-43-06.
REQ-68-13 WHEN se implemente la feature, el test tests/legacy-redirects.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-68-14 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-68-15 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
