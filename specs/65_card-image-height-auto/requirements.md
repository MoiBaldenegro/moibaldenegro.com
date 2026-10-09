# Requisitos — Alto automático en las imágenes de cards con atributos width/height (feature 65 card-image-height-auto)
# Origen: regresión de la feature 48 (progress/impl_48.md) medida por el líder en Chrome headless. Análisis: progress/research/cards_domain_backlog.md.
# Toca UI/presentación: ver design.md en esta carpeta.
# Estado pending.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-65-01→1, REQ-65-02→1, REQ-65-03→1, REQ-65-04→1, REQ-65-05→2, REQ-65-06→3, REQ-65-07→4, REQ-65-08→5, REQ-65-09→6, REQ-65-10→7.

## Requisitos

REQ-65-01 La regla CSS que dimensiona .post__image SHALL declarar height: auto, WHERE la regla puede residir en post.css o en .post__hero .post__image de post-header.css.
REQ-65-02 La regla .latest-articles__image de latest-articles.css SHALL declarar height: auto.
REQ-65-03 La regla .post__related-thumb de post-next.css SHALL declarar height: auto.
REQ-65-04 La regla .search-results__thumb de search-results.css SHALL declarar height: auto.
REQ-65-05 Cada img de portada y miniatura SHALL conservar los atributos width="1376" y height="768", WHERE REQ-48-01 los exige para reservar espacio y evitar CLS.
REQ-65-06 WHEN un img de los archivos de la feature 48 declara atributo height y una clase propia, la regla CSS de esa clase SHALL declarar height: auto o un height explícito.
REQ-65-07 WHEN la página se renderiza a 1280 o 375 px de ancho, cada imagen de card visible SHALL medir un alto igual a su ancho dividido entre su aspect-ratio con tolerancia de 1 px.
REQ-65-08 WHEN se implemente la feature, el test tests/card-image-height-auto.test.mjs SHALL observarse en rojo antes de modificar las hojas de estilo, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-65-09 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-65-10 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
