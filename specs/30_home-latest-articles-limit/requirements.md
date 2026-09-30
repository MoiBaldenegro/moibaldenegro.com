# Requisitos — La portada muestra solo los 3 artículos más recientes (feature 30 home-latest-articles-limit)
# Petición: «En la pagina principal queremos que se muestren solo los 3 articulos mas recientes».
# Análisis, decisiones, hallazgos y riesgos: progress/research/home-3-articulos-recientes.md.
# Sin design.md: la feature no toca UI (la rejilla .latest-articles__list no declara número de
# columnas y el marcado de la card no cambia; §6 del análisis). El recorte va en un módulo nuevo
# src/domain/latest-posts.ts porque posts-repository.ts ya está en 100/100 líneas y el frontmatter
# de un .astro solo hace imports y paso de datos (además, REQ-20-07 prohíbe if (/for ( en el
# componente). El orden lo fija el comparador canónico byCreatedDesc del repositorio sobre el campo
# created; el módulo no reordena. Con menos de tres artículos se muestran todos los disponibles.
# Nota de numeración: el id 30 del backlog está libre, pero el espacio REQ-30-xx también lo citarón
# los comentarios de la feature histórica cloudflare-types-install (tests/cloudflare-types-install.test.mjs);
# el solapamiento de ids de REQ entre ciclos ya es precedente del repo (id 20 del backlog es
# related-posts-data mientras tests/latest-articles-restore.test.mjs cita REQ-20-01..07 de la feature
# histórica latest-articles-restore). Trazabilidad REQ → acceptance: REQ-30-01→1, REQ-30-02→2,
# REQ-30-03→3, REQ-30-04→4, REQ-30-05→5, REQ-30-06→6, REQ-30-07→7, REQ-30-08→8, REQ-30-09→9,
# REQ-30-10→10, REQ-30-11 y REQ-30-12→11, REQ-30-13→12, REQ-30-14→13, REQ-30-15→14,
# REQ-30-16→15, REQ-30-17→16 (cierre de la suite).

## Requisitos

REQ-30-01 WHILE la colección de artículos expone tres o más entradas, la sección «Últimos artículos» de la portada SHALL pintar exactamente tres cards de artículo.
REQ-30-02 Los tres artículos pintados en la portada SHALL ser los más recientes por el campo created en orden descendente de fecha, WHERE el orden lo fija el comparador canónico byCreatedDesc del repositorio de artículos.
REQ-30-03 La función de dominio de los últimos artículos SHALL devolver los artículos en el orden en que los entrega el repositorio sin reordenar ni mutar el arreglo recibido.
REQ-30-04 IF la colección de artículos expone menos de tres entradas, THEN la función de dominio de los últimos artículos SHALL devolver todas las entradas disponibles sin lanzar ningún error.
REQ-30-05 IF el límite recibido por la función de dominio de los últimos artículos no es un entero positivo, THEN esa función SHALL devolver un arreglo vacío.
REQ-30-06 El frontmatter de latest-articles.astro SHALL obtener la lista que pinta mediante la función de dominio de los últimos artículos aplicada al resultado de getPosts() sin escribir allí la lógica del recorte.
REQ-30-07 La sección de artículos de la portada SHALL conservar el encabezado «Últimos artículos» y una card por artículo con su enlace /posts/${post.id}, WHERE el recorte no altera el marcado verificado por REQ-20-03 a REQ-20-06 y REQ-37-06.
REQ-30-08 La hoja latest-articles.css SHALL permanecer sin cambios, WHERE la rejilla .latest-articles__list no declara número de columnas y reducir la lista no altera la presentación.
REQ-30-09 Los tests de inspección existentes de latest-articles.astro SHALL seguir pasando sin modificar sus aserciones, WHERE el recorte se aplica en el módulo de dominio y ningún test existente comprueba el número de artículos de la portada.
REQ-30-10 WHEN una aserción existente necesite ajustarse por el recorte de la portada, THEN el test afectado SHALL documentar el motivo y el precedente REQ-43-06 en su encabezado.
REQ-30-11 WHEN se implemente la feature, THEN el test tests/home-latest-articles-limit.test.mjs SHALL observar un fallo antes de existir el módulo de dominio, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-30-12 El test tests/home-latest-articles-limit.test.mjs SHALL cubrir los casos de recorte exacto, orden descendente, ausencia de reordenación, límite no positivo y colección con menos de tres artículos sobre entidades Post de prueba.
REQ-30-13 El test tests/home-latest-articles-limit.test.mjs SHALL verificar sobre el HTML de la portada emitido por un build real que existen exactamente tres cards de artículo cuyos enlaces son los tres artículos más recientes de la colección, WHERE el precedente de about-page.test.mjs ejecuta el build desde el propio test.
REQ-30-14 La implementación SHALL dejar intacto src/domain/repositories/posts-repository.ts, WHERE el archivo ya está en 100 líneas y la función de recorte vive en un módulo nuevo de src/domain/.
REQ-30-15 La sección de artículos de la portada SHALL resolverse en build sin scripts de cliente, WHERE la portada es prerenderizada.
REQ-30-16 El módulo de dominio nuevo y los archivos latest-articles.astro y latest-articles.css SHALL respetar el límite de 100 líneas cada uno.
REQ-30-17 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
