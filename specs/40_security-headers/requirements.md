# Requisitos — Cabeceras de seguridad en assets estáticos (public/_headers) y respuestas del Worker (middleware) (feature 40 security-headers)
# Origen: audit_perf_security.md A2. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-40-01→1, REQ-40-02→2, REQ-40-03→3, REQ-40-04→4, REQ-40-05→5, REQ-40-06→6, REQ-40-07→7, REQ-40-08→8, REQ-40-09→9.

## Requisitos

REQ-40-01 El módulo src/domain/http/security-headers.ts SHALL exportar como objeto inmutable las cabeceras X-Content-Type-Options y Referrer-Policy y Permissions-Policy y X-Frame-Options y Content-Security-Policy-Report-Only con los valores de esta spec.
REQ-40-02 El archivo public/_headers SHALL declarar para la regla /* exactamente las mismas cabeceras y valores que exporta security-headers.ts.
REQ-40-03 El middleware src/middleware.ts SHALL añadir las cabeceras de security-headers.ts a cada respuesta generada por el Worker.
REQ-40-04 IF una respuesta ya trae una de esas cabeceras, THEN el middleware SHALL conservar el valor existente sin duplicarla.
REQ-40-05 El archivo dist/client/_headers generado por el build SHALL contener la regla /* de seguridad y la regla /_astro/* de caché inmutable del adapter.
REQ-40-06 La cabecera Content-Security-Policy-Report-Only SHALL valer default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'.
REQ-40-07 WHEN se implemente la feature, el test tests/security-headers.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-40-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-40-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
