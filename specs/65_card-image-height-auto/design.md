# Diseño — Alto automático en las imágenes de cards (feature 65 card-image-height-auto)

## Contexto visual

- Portada (latest-articles), cabecera del post (post__image), recomendados del post (post__related-thumb) y resultados de /search (search-results__thumb).
- Estado actual (Chrome headless, 1280 px): .latest-articles__image 1149×768, .post__image 554×768, .post__related-thumb 112×768, .search-results__thumb 112×768. Cards estrechas y muy altas: el atributo height="768" gana porque el CSS fija width y aspect-ratio pero deja height sin declarar, y aspect-ratio solo actúa si una dimensión es auto.
- Estado deseado: .latest-articles__image, .post__related-thumb y .search-results__thumb en 16/9; .post__image en 4/3 por encima de 768 px y 16/9 en ≤768 px (post-header.css:48 y :96). La miniatura de recomendados sigue oculta en ≤768 px.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| (ninguno nuevo) | - | height: auto es una palabra clave, no un valor de diseño |

## Decisiones y constraints

- Decisión 1: height: auto en las cuatro reglas conservando los atributos width/height; el navegador sigue usando la proporción de los atributos para reservar el hueco antes de cargar (CLS, REQ-48-01).
- Decisión 2: post.css está en 100/100 líneas: height: auto va en .post__hero .post__image de post-header.css (99/100; .post__image solo aparece dentro de .post__hero) o en la misma línea que width: 100% de post.css. Decide el implementer sin superar 100 líneas.
- Decisión 3: post-next.css y search-results.css usan reglas de una línea: la declaración se añade en la misma línea.
- Decisión 4: latest-articles.css tiene su conteo fijado a 98 en tests/home-latest-articles-limit.test.mjs:255; si la línea se añade aparte, ese test se actualiza con nota (precedente REQ-43-06).
- Decisión 5: el test REQ-48-05 (tests/image-loading-hints.test.mjs) aceptaba aspect-ratio sin height: auto; se endurece dentro de esta feature (precedente REQ-43-06).
- Restricciones: sin dependencias, ≤100 líneas por archivo, estilos separados de la UI, estático.

## Verificación visual

- Chrome headless + CDP a 1280 y 375 px sobre /, un post con recomendados y /search?q=solid: para cada imagen de card visible, getBoundingClientRect().height ≈ width / ratio (±1 px). Hero .profile-image sin cambios. Resultados en progress/impl_65.md.

## Alternativa descartada

- Alternativa considerada: quitar los atributos width/height de los img.
- Motivo del descarte: reintroduce el salto de layout (CLS) que corrigió la feature 48.
