# Requisitos — Carcasa de /about, hero profesional y cifras destacadas (feature 82 about-hero-stats)
# Origen: petición humana 2026-10-12 de una página About profesional que presuma experiencia. Análisis: progress/research/about-redesign.md §3 (H1, H2, H6, H8, H9, H10, H11).
# Toca UI: ver design.md en esta carpeta. depends_on [80, 81] (datos y /cv.pdf existente antes de enlazarlo).
# Compatibilidad: tests/about-page.test.mjs (REQ-11-02..05) y tests/single-h1-headings.test.mjs (REQ-39-05/06/08) pasan SIN cambios; la sección con p.about__intro se conserva al final de la página hasta la feature 84.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-82-01/02/03→1, REQ-82-04/05/06/07→2, REQ-82-08/09/10/11→3, REQ-82-12/13→4, REQ-82-14/15/16/17→5, REQ-82-18/19/20→6, REQ-82-21/22/23/24→7.

## Requisitos

REQ-82-01 La página src/pages/about.astro SHALL limitarse a imports y paso de datos en el frontmatter y componer AboutHero y AboutStats dentro de Layout con el título About — moisesbaldenegro.com.
REQ-82-02 La página SHALL obtener el perfil con new HeroProfileRepository().getProfile() y los datos con new AboutRepository().getProfile() y pasar al hero profile.name, profile.username, profile.description y profile.image.
REQ-82-03 La página SHALL conservar la sección final con <p class="about__intro">{SITE_DESCRIPTION}</p> sin cambios, WHERE la feature 84 la traslada a la sección Contenido.
REQ-82-04 El componente src/components/about/about-hero.astro SHALL renderizar el único h1 de la página con el nombre del perfil.
REQ-82-05 El hero SHALL mostrar el handle, el titular, la ubicación, el resumen y la línea de enfoque de hero.json como texto.
REQ-82-06 El hero SHALL mostrar la foto /assets/moises-hero.jpg con alt igual a photoAlt y atributos width 952 y height 960.
REQ-82-07 La foto SHALL recortarse en un cuadrado con object-fit cover y enmarcarse con borde redondeado y un anillo de var(--color-accent) según design.md.
REQ-82-08 El hero SHALL renderizar los enlaces de heroLinks como anclas con el icono del sprite /assets/svg/sprite.svg#<id> marcado aria-hidden y un texto visually-hidden que indica sitio externo.
REQ-82-09 El hero SHALL renderizar el enlace <a href="/cv.pdf" download="moises-baldenegro-cv.pdf"> con el texto Descargar CV.
REQ-82-10 El código de la página y de sus componentes SHALL estar libre de cualquier referencia a /assets/cv/ y de cualquier elemento script.
REQ-82-11 El componente src/components/about/about-stats.astro SHALL renderizar las cuatro cifras de stats como lista con el valor destacado y su etiqueta bajo un h2 visually-hidden Cifras destacadas.
REQ-82-12 La hoja src/styles/about.css SHALL quedar como carcasa de la página y seguir usando var() de --color-background, --color-text, --color-text-secondary, --color-border, --color-surface, --radius-card, --gap-card y --container-max.
REQ-82-13 Cada componente SHALL importar su propia hoja about-hero.css o about-stats.css de src/styles/.
REQ-82-14 Las hojas nuevas SHALL expresar colores, radios, sombras, transiciones y tipografía solo con var() de tokens.css sin hex, rgb() ni rgba().
REQ-82-15 Las hojas nuevas SHALL expresar margin, padding y gap solo con var(--gap-card), calc() sobre var(--gap-card), 0 o auto.
REQ-82-16 La feature SHALL dejar sin cambios src/styles/tokens.css y sin reglas prefers-color-scheme, WHERE el sitio solo define la paleta oscura por tokens.
REQ-82-17 WHILE el usuario prefiere movimiento reducido, las hojas nuevas SHALL anular las transiciones del hero y de las cifras.
REQ-82-18 WHILE el viewport mide 900 px o más, el hero SHALL disponer la foto y el texto en dos columnas y las cifras en cuatro columnas.
REQ-82-19 WHILE el viewport mide 768 px o menos, la página SHALL apilar la foto centrada sobre el texto del hero y distribuir las cifras en dos columnas.
REQ-82-20 WHILE el viewport mide 375 px de ancho, la página SHALL cumplir scrollWidth igual a clientWidth.
REQ-82-21 El texto del hero y de las cifras SHALL alcanzar un contraste de 4.5:1 o más sobre su fondo.
REQ-82-22 El HTML construido de /about SHALL contener un solo h1 y estar libre de correos electrónicos, números de teléfono y de los términos excluidos de REQ-80-16.
REQ-82-23 El test tests/about-hero-stats.test.mjs SHALL escribirse y observarse en rojo antes de crear los componentes y las hojas.
REQ-82-24 Cada archivo creado o modificado SHALL medir 100 líneas o menos con tests/about-page.test.mjs y tests/single-h1-headings.test.mjs en verde sin cambios.
