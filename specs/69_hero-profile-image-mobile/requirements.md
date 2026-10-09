# Requisitos — Imagen de perfil del hero visible en móvil y tablet (feature 69 hero-profile-image-mobile)
# Origen: petición humana («arregla eso de mobile de una vez en la imagen»); medición del líder y del spec_author en Chrome headless + CDP. Análisis: progress/research/hero_mobile_image.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-69-01→1, REQ-69-02→2, REQ-69-03→2, REQ-69-04→2, REQ-69-05→2, REQ-69-06→3, REQ-69-07→3, REQ-69-08→4, REQ-69-09→5, REQ-69-10→6, REQ-69-11→7, REQ-69-12→8, REQ-69-13→9, REQ-69-14→10.

## Requisitos

REQ-69-01 WHILE el viewport mide 1200 px o menos, la hoja profile-card.css SHALL dimensionar .profile-image con un alto que no dependa de un porcentaje del alto de .profile-card.
REQ-69-02 WHEN la portada se renderiza a un ancho de 320 px o 375 px o 768 px o 1024 px, el contenedor .profile-image SHALL medir al menos 240 px de alto.
REQ-69-03 WHEN la portada se renderiza a un ancho de 320 px o 375 px o 768 px o 1024 px, la img de .profile-image SHALL cubrir el ancho y el alto de su contenedor con una tolerancia de 1 px.
REQ-69-04 WHEN la portada se renderiza a un ancho de 320 px o 375 px o 768 px o 1024 px, el bloque .profile-username SHALL quedar dentro del rectángulo de .profile-image sin intersecar el h1 ni el párrafo de .profile-content.
REQ-69-05 WHEN la portada se renderiza a un ancho de 320 px o 375 px o 768 px o 1024 px, el h1 y el párrafo de .profile-content SHALL quedar completos dentro del rectángulo de .profile-card.
REQ-69-06 WHEN la portada se renderiza a un ancho de 320 px o 375 px o 768 px o 1024 px, ninguna .hero-card SHALL intersecar el rectángulo de .profile-card.
REQ-69-07 WHEN la portada se renderiza a un ancho de 320 px o 375 px o 768 px o 1024 px, el elemento visible en el centro del badge verificado SHALL pertenecer a .profile-username.
REQ-69-08 WHEN la portada se renderiza a 1280 px de ancho, la img de .profile-image SHALL medir 502×359 px y su contenedor 493×352 px con una tolerancia de 1 px.
REQ-69-09 WHEN la portada se renderiza a un ancho de 320 px o 375 px o 768 px o 1024 px o 1280 px, cada .hero-card SHALL conservar el ancho y el alto medidos antes del cambio con una tolerancia de 1 px.
REQ-69-10 Las hojas profile-card.css y hero-section.css SHALL usar solo var() de tokens.css para colores, espaciados, radios y sombras nuevos, WHERE docs/architecture.md prohíbe valores sueltos.
REQ-69-11 IF la feature añade un token a tokens.css, THEN cada test de conteo de líneas de tokens.css SHALL fijar el nuevo conteo con nota de ajuste (REQ-17-09, REQ-26-07, REQ-39-09, REQ-40-11, REQ-42-09 y el meta-test REQ-16-09), WHERE el precedente REQ-43-06 regula esos ajustes.
REQ-69-12 WHEN se implemente la feature, el test tests/hero-profile-image-mobile.test.mjs SHALL observarse en rojo antes de modificar las hojas de estilo, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-69-13 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md fija ese máximo.
REQ-69-14 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
