# Requisitos — Alta de la dependencia gsap aprobada por el humano (feature 70 gsap-dependency-approval)
# Petición humana 2026-10-09: «Se acaba de autorizar el uso de la librería GSAP para ponerle scroll en X a las 3 cards de los 3 posts más recientes en la página principal».
# Análisis: progress/research/gsap_backlog.md. Investigación técnica (versión, licencia, tamaño, CSP): progress/research/gsap_horizontal_scroll.md §1-§2.
# No toca UI: sin design.md. Solo package.json, pnpm-lock.yaml y docs/dependencies.md; ningún archivo de src/ usa gsap todavía (lo hace la feature 72).
# Licencia de gsap: Standard 'no charge' license de Webflow (https://gsap.com/standard-license). NO es una licencia OSI: propietaria y gratuita, uso comercial permitido, prohíbe quitar los avisos de copyright y su uso en herramientas no-code que compitan con Webflow, revocable y modificable por Webflow. Se registra como dato explícito para el humano.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-70-01 y REQ-70-02→1, REQ-70-03→2, REQ-70-04 y REQ-70-05→3, REQ-70-06→4, REQ-70-07→5, REQ-70-08 y REQ-70-09→6, REQ-70-10→7, REQ-70-11→8.

## Requisitos

REQ-70-01 El archivo package.json SHALL declarar gsap en dependencies con una versión exacta sin prefijo ^ ni ~ igual a la última estable publicada en npm el día de la implementación, WHERE el informe progress/research/gsap_horizontal_scroll.md registró 3.15.0 como última estable.
REQ-70-02 El archivo pnpm-lock.yaml SHALL resolver gsap en el importer raíz a la misma versión que declara package.json.
REQ-70-03 El registro docs/dependencies.md SHALL contener la entrada ### gsap con version igual a la de package.json y scope dependencies y approved 2026-10-09 y un motivo que cita el scroll horizontal de las cards de la portada.
REQ-70-04 La entrada ### gsap de docs/dependencies.md SHALL declarar una línea licencia con el texto Standard 'no charge' license de Webflow y la URL https://gsap.com/standard-license y la indicación explícita NO OSI.
REQ-70-05 La entrada ### gsap de docs/dependencies.md SHALL declarar una línea alcance que limita el uso a la portada con gsap y el plugin ScrollTrigger incluido en el mismo paquete.
REQ-70-06 La sección Aprobaciones de cambio de versión de docs/dependencies.md SHALL registrar una nota fechada 2026-10-09 con la autorización humana literal y el estado APLICADA en la feature 70.
REQ-70-07 El repositorio SHALL carecer de un archivo .npmrc que apunte al registro npm.greensock.com.
REQ-70-08 El alta SHALL limitarse al paquete gsap, WHERE dependencies y devDependencies de package.json conservan astro, @astrojs/cloudflare, wrangler y @cloudflare/workers-types con sus versiones actuales y sin otras entradas nuevas.
REQ-70-09 Ningún archivo de src/ SHALL importar gsap en esta feature, WHERE el primer uso lo introduce la feature 72.
REQ-70-10 WHEN se implemente la feature, el test tests/gsap-dependency-approval.test.mjs SHALL observarse en rojo antes de modificar package.json y docs/dependencies.md, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-70-11 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature con el validador de dependencias sin errores y cada archivo creado dentro del límite de 100 líneas.
