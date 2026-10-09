# Requisitos — Dominio real moisesbaldenegro.com en la configuración, la marca y las URLs absolutas (feature 66 site-domain-moisesbaldenegro)
# Origen: confirmación del humano (moibaldenegro.com da NXDOMAIN; https://moisesbaldenegro.com responde vía Cloudflare). Análisis y clasificación URL/marca/handle: progress/research/cards_domain_backlog.md.
# Toca UI/presentación (texto visible del título, alt del logo y manifest): ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-66-01→1, REQ-66-02→2, REQ-66-03→3, REQ-66-04→4, REQ-66-05→5, REQ-66-06→6, REQ-66-07→7, REQ-66-08→8, REQ-66-09→9, REQ-66-10→10.

## Requisitos

REQ-66-01 El archivo astro.config.mjs SHALL declarar site con el valor https://moisesbaldenegro.com.
REQ-66-02 La constante BRAND de src/domain/seo/head.ts SHALL valer moisesbaldenegro.com, WHERE la marca visible coincide con el nombre de dominio por decisión revisable del humano.
REQ-66-03 El título de about.astro y el alt del logo de Layout.astro SHALL nombrar moisesbaldenegro.com en lugar de moibaldenegro.com.
REQ-66-04 El archivo public/site.webmanifest SHALL declarar name y short_name con el valor moisesbaldenegro.com.
REQ-66-05 La cabecera User-Agent de htb-profile-repository.ts SHALL valer moisesbaldenegro.com.
REQ-66-06 WHEN se construye el sitio, cada canonical y og:url y og:image y cada loc del sitemap y la línea Sitemap de robots.txt y cada url del JSON-LD SHALL comenzar por https://moisesbaldenegro.com/.
REQ-66-07 Los archivos de src/ y public/ y astro.config.mjs y README.md SHALL quedar sin ninguna aparición de la cadena moibaldenegro.com.
REQ-66-08 Los identificadores de cuenta @moibaldenegro y x.com/moibaldenegro y el nombre del Worker moibaldenegro-web SHALL conservarse sin cambios, WHERE no son nombres de dominio.
REQ-66-09 WHEN se implemente la feature, el test tests/site-domain-moisesbaldenegro.test.mjs SHALL observarse en rojo antes de modificar la configuración y el código, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-66-10 La suite completa del arnés y el script ./init.sh SHALL terminar en verde con los tests que fijaban el dominio viejo actualizados y cada archivo modificado dentro de 100 líneas, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
