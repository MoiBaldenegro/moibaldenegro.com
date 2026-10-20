# Requisitos — Los tests de últimos artículos derivan lo esperado del contenido real (feature 102 latest-posts-tests-from-content)
# Origen: tras el ajuste autorizado de los posts de systems-design (2026-10-19) el más reciente es /posts/00-systems-design-template y REQ-95-06/07/12, REQ-30-13 y REQ-96-04/05 fallan porque fijan los slugs a mano. Análisis: progress/research/latest-posts-tests-from-content.md.
# No toca UI: sin design.md. Sin cambios en src/. Ampliación 2026-10-19 (decisión del líder): la guarda REQ-93-04/21/22 de tests/system-design-nav-link.test.mjs entra en alcance (REQ-102-12) y la suite completa debe quedar en verde.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-102-01→1, REQ-102-02→1, REQ-102-03→2, REQ-102-04→3, REQ-102-05→3, REQ-102-06→3, REQ-102-07→4, REQ-102-08→4, REQ-102-09→5, REQ-102-10→6, REQ-102-11→6, REQ-102-12→7.

## Requisitos

REQ-102-01 El módulo tests/helpers/latest-real-posts.mjs SHALL exportar una función que lee el frontmatter (slug y created) de cada archivo .md bajo src/content/posts/ y devuelve los ids de los primeros limit artículos ordenados con PostsRepository.getPosts() y latestPosts() del dominio.
REQ-102-02 La función del helper SHALL aceptar como parámetro opcional la carpeta raíz del contenido para ejecutarse sobre fixtures fuera del repositorio.
REQ-102-03 IF dos de los limit + 1 primeros artículos ordenados comparten el mismo created, THEN la función del helper SHALL lanzar un error que nombra los slugs empatados.
REQ-102-04 El test REQ-95-06/07/12 de tests/home-latest-articles-five.test.mjs SHALL comparar los href de la sección latest-articles del build con /posts/<id> de los ids que devuelve el helper con LATEST_POSTS_LIMIT.
REQ-102-05 El test REQ-30-13 de tests/home-latest-articles-limit.test.mjs SHALL comparar los href de la sección latest-articles del build con /posts/<id> de los ids que devuelve el helper con LATEST_POSTS_LIMIT.
REQ-102-06 El test REQ-96-04/05 de tests/latest-cards-gsap-motion.test.mjs SHALL comparar los href de la sección latest-articles del build con /posts/<id> de los ids que devuelve el helper con LATEST_POSTS_LIMIT.
REQ-102-07 Los tres tests ajustados SHALL conservar las aserciones de 3 cards, 6 data-astro-transition-scope y 3 enlaces site-footer__post y añadir que la lista derivada del helper tiene exactamente 3 ids.
REQ-102-08 Cada línea ajustada de los tres tests SHALL llevar la nota «Ajuste feature 102 (precedente REQ-43-06)» y conservar las notas «Ajuste feature 96 (precedente REQ-43-06)» existentes.
REQ-102-09 El comentario de REAL_SLUGS_BY_NEWEST en tests/home-latest-articles-limit.test.mjs SHALL indicar que es un fixture de la feature 30 inyectado al repositorio y no la lista del contenido actual, sin cambiar las aserciones de REQ-30-01/02.
REQ-102-10 El archivo tests/latest-real-posts.test.mjs SHALL cubrir REQ-102-01 a REQ-102-03 con fixtures en os.tmpdir() usando solo node:test y la stdlib de Node y pasar en verde dentro de la suite completa.
REQ-102-11 Los cambios de la feature SHALL limitarse a tests/helpers/latest-real-posts.mjs, tests/latest-real-posts.test.mjs, los tres tests ajustados, tests/system-design-nav-link.test.mjs y su informe, sin tocar src/ ni el contenido de los posts, con tests/latest-cards-gsap-motion.test.mjs en 100 líneas o menos y con ./init.sh terminando con código 0.
REQ-102-12 El test REQ-93-04/21/22 de tests/system-design-nav-link.test.mjs SHALL comprobar con git diff entre 268e9ad^ y 268e9ad que en src/content/posts el commit 268e9ad solo cambió el post 05-diseno-arquitectonico-vs-diseno-detallado.md y solo en su línea tags añadiendo #diseno-de-sistemas, sin consultar git diff HEAD ni el árbol de trabajo.
