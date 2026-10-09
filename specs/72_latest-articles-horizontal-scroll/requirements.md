# Requisitos — Scroll horizontal fijado de las 3 cards de «Últimos artículos» en escritorio con GSAP (feature 72 latest-articles-horizontal-scroll)
# Petición humana 2026-10-09: «Debe llegar tal cual como ahora la card en el centro, pero las demás ya no están abajo: estarán esperando hacia la derecha y luego atravesarán la screen hacia la izquierda; la última se queda en el centro y continúa el scroll de página». Solo escritorio; en móvil scroll normal con las cards apiladas. Aceptado por el humano: con prefers-reduced-motion o sin JS las cards quedan apiladas (mejora progresiva); scrub ligado al scroll con unos 100vh de scroll por card que pasa. «Probemos y si funciona bien lo dejamos.»
# Análisis y decisiones: progress/research/gsap_backlog.md. Base técnica: progress/research/gsap_horizontal_scroll.md. Toca UI: ver design.md.
# Depende de la 70 (dependencia gsap) y de la 71 (geometría pura src/domain/latest-horizontal.ts).
# Corte de escritorio: min-width 1201px, el corte de escritorio ya usado por el hero (≤1200 es el diseño de tablet, features 51 y 69). Decisión del spec_author revisable por el humano (alternativa 1025px en el análisis).
# Hallazgo para el humano (REQ-72-08): hoy la card mide más que el viewport en escritorio (imagen 1149×646 a 1280 px, impl_65.md); fijada no se leería entera, así que en modo horizontal solo su ancho se reduce hasta que quepa; el aspecto (marcado, colores, tipografía, imagen 16:9) no cambia.
# latest-articles.astro y latest-articles.css no se tocan (REQ-30-08 y REQ-30-15 siguen vigentes): la mejora vive en un componente hermano montado solo en la portada.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-72-01 y REQ-72-02→1, REQ-72-03 y REQ-72-04 y REQ-72-05 y REQ-72-09 y REQ-72-19→2, REQ-72-17 y REQ-72-18→3, REQ-72-15 y REQ-72-27→4, REQ-72-06 y REQ-72-07 y REQ-72-08 y REQ-72-10 y REQ-72-11 y REQ-72-12 y REQ-72-13 y REQ-72-14→5, REQ-72-06 y REQ-72-29→6, REQ-72-16→7, REQ-72-18 y REQ-72-20→8, REQ-72-21→9, REQ-72-28→10, REQ-72-22 y REQ-72-23 y REQ-72-24→11, REQ-72-25 y REQ-72-26→12, REQ-72-29→13, REQ-72-30→14, REQ-72-31→15, REQ-72-32→16.

## Requisitos

REQ-72-01 El componente src/components/latest-horizontal/latest-horizontal.astro SHALL importar src/styles/latest-horizontal.css y contener un único script empaquetado que importa ./latest-horizontal.ts sin bloque style ni lógica en el frontmatter.
REQ-72-02 La página src/pages/index.astro SHALL montar el componente latest-horizontal como única página del sitio que lo usa, WHERE latest-articles.astro y latest-articles.css permanecen sin cambios.
REQ-72-03 El módulo src/components/latest-horizontal/latest-horizontal.ts SHALL registrar ScrollTrigger con gsap.registerPlugin a nivel de módulo y obtener las cifras de desplazamiento y recorrido de las funciones de src/domain/latest-horizontal.ts.
REQ-72-04 El módulo latest-horizontal.ts SHALL activar el efecto solo dentro de gsap.matchMedia con la consulta (min-width: 1201px) and (prefers-reduced-motion: no-preference).
REQ-72-05 IF la sección .latest-articles contiene menos de dos cards, THEN el módulo latest-horizontal.ts SHALL omitir el pin y dejar el layout apilado actual.
REQ-72-06 WHILE la consulta de escritorio no coincide o JavaScript no se ejecuta, la sección .latest-articles SHALL mostrar las cards apiladas como hoy sin la clase latest-articles--horizontal y sin elemento .pin-spacer.
REQ-72-07 WHEN la consulta de escritorio coincide, el módulo latest-horizontal.ts SHALL añadir la clase latest-articles--horizontal a la sección antes de crear el ScrollTrigger y retirarla al revertir.
REQ-72-08 WHILE el modo horizontal está activo, la card completa y el encabezado de la sección SHALL caber entre el borde inferior del header visible y el borde inferior del viewport, WHERE la card conserva marcado, colores, borde, tipografía e imagen 16:9 y solo su ancho puede reducirse.
REQ-72-09 El ScrollTrigger del efecto SHALL fijar la sección .latest-articles con pin y animar solo el track .latest-articles__list con ease none, scrub true, invalidateOnRefresh true, anticipatePin 1 y valores de x y end calculados en funciones.
REQ-72-10 WHEN el progreso del ScrollTrigger vale 0, la sección SHALL mostrar la primera card centrada en el viewport con las cards segunda y tercera completamente fuera de la vista a la derecha.
REQ-72-11 WHILE la sección está fijada, el desplazamiento x del track SHALL coincidir con trackOffset del progreso actual con una tolerancia de 2 px.
REQ-72-12 WHILE la sección está fijada, el borde superior de la sección SHALL permanecer constante en el viewport con una tolerancia de 2 px.
REQ-72-13 WHEN el progreso del ScrollTrigger llega a 1, la sección SHALL mostrar la tercera card centrada en el viewport y liberar el pin para que el scroll vertical continúe hacia la sección siguiente.
REQ-72-14 WHEN el scroll entra o sale del pin, la posición vertical de la sección y de la sección siguiente SHALL variar sin saltos mayores de 2 px respecto al paso de scroll aplicado.
REQ-72-15 WHILE el modo horizontal está activo, la sección SHALL declarar overflow clip para no crear un contenedor de scroll programático.
REQ-72-16 WHEN un enlace de card recibe el foco con el modo horizontal activo, el módulo latest-horizontal.ts SHALL desplazar la ventana al valor de focusScrollTarget para esa card con comportamiento instantáneo y dejar la card dentro del viewport.
REQ-72-17 WHEN se dispara astro:before-swap, el componente latest-horizontal SHALL revertir el matchMedia para quitar el pin-spacer, los estilos en línea, la clase de modo horizontal y el listener de foco.
REQ-72-18 WHEN se dispara astro:page-load, el componente latest-horizontal SHALL inicializar el efecto de forma idempotente revirtiendo antes cualquier instancia previa.
REQ-72-19 El módulo latest-horizontal.ts SHALL prescindir de ScrollSmoother, ScrollTrigger.normalizeScroll, ScrollTrigger.clearScrollMemory y markers.
REQ-72-20 WHEN el usuario vuelve a la portada con el botón atrás desde un post con una posición guardada por debajo de la sección, la portada SHALL terminar con un único .pin-spacer y un scrollY igual al de history.state con tolerancia de 2 px.
REQ-72-21 WHEN la portada reaparece tras vaciar la búsqueda en vivo que la ocultó, el ScrollTrigger SHALL recalcular inicio y fin con los mismos valores que una carga limpia con tolerancia de 2 px.
REQ-72-22 El build SHALL cargar el código de GSAP solo en la portada, WHERE los HTML de un post, /search, /about y la 404 no referencian ningún chunk JavaScript que contenga GSAP.
REQ-72-23 El JavaScript que GSAP y el módulo del efecto añaden a la portada SHALL ocupar como máximo 51200 bytes en gzip, WHERE el peso real medido se registra en progress/impl_72.md.
REQ-72-24 El chunk de GSAP del build SHALL conservar el aviso de copyright de GSAP, WHERE la licencia Standard no charge prohíbe retirarlo.
REQ-72-25 WHEN se carga la portada sobre astro preview con la CSP obligatoria vigente de REQ-64-11, el navegador SHALL registrar cero violaciones de CSP.
REQ-72-26 El test REQ-64-05/06 de tests/csp-enforce.test.mjs SHALL seguir en verde sin modificaciones con los bundles que incluyen GSAP.
REQ-72-27 La hoja src/styles/latest-horizontal.css SHALL usar solo custom properties de tokens.css para colores, espaciados, radios y sombras y limitar sus selectores al modificador .latest-articles--horizontal.
REQ-72-28 WHEN el usuario hace clic en la tercera card con el pin activo, el sitio SHALL navegar al post correspondiente sin errores en la consola.
REQ-72-29 La verificación real con Chrome headless y CDP sobre astro preview SHALL registrar en progress/impl_72.md mediciones y capturas a 1280 y 1440 px con progreso 0 y 0,5 y 1 y a 1024 y 375 px y con prefers-reduced-motion reduce emulado.
REQ-72-30 WHEN una aserción existente necesite ajustarse por esta feature, THEN el test afectado SHALL documentar el motivo con el precedente REQ-43-06 en su encabezado.
REQ-72-31 WHEN se implemente la feature, el test tests/latest-articles-horizontal-scroll.test.mjs SHALL observarse en rojo antes de crear el componente y el módulo del efecto, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-72-32 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature con cada archivo creado o modificado dentro del límite de 100 líneas.
