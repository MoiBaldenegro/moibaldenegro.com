# Requisitos — feature 111 hero-cards-data-rebaseline

# Contexto (2026-10-20): tras la 108 el humano editó src/data/hero-cards.json (fuente de verdad): CLOUDFLARE pasa a icon y cornerIcon #cloudflare-cloud, backgroundIcon #cloudflare (sin backgroundIconSize: md por defecto), scale 8, iconWidth 270px; CLAUDE CODE declara backgroundIconSize lg. Además el svg de .card-icon de hero-card.astro mide 28px (antes 32px) sin spec que lo recoja. Fallan 8 tests de features cerradas (lista en progress/impl_hero-backdrop-bottom-left.md) y bloquean el cierre de la 109. Esta feature re-basa esos tests y alinea el CSS sin tocar el JSON. Análisis: progress/research/hero-cards-data-rebaseline.md.
# Verificado en solo lectura: public/assets/svg/sprite.svg contiene symbol cloudflare (viewBox 0 0 512 76), cloudflare-cloud (viewBox 0 0 256 116), claude, anthropic-wordmark y github-wordmark.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-111-01→1, REQ-111-02→1, REQ-111-03→2, REQ-111-04→3, REQ-111-05→3, REQ-111-06→4, REQ-111-07→5, REQ-111-08→6, REQ-111-09→7, REQ-111-10→7, REQ-111-11→8, REQ-111-12→9, REQ-111-13→9, REQ-111-14→10, REQ-111-15→10.

## Requisitos

### Datos (solo lectura)

REQ-111-01 La feature 111 SHALL dejar src/data/hero-cards.json byte a byte igual al del árbol al inicio de la sesión.
REQ-111-02 WHEN se ejecute parseHeroCards sobre src/data/hero-cards.json, el repositorio SHALL entregar las 15 tarjetas sin lanzar HeroCardsDataError.

### Tests re-basados (nota «Ajuste feature 111 (precedente REQ-43-06)»)

REQ-111-03 El test REQ-108-05 SHALL derivar del JSON el conjunto de pares id/backgroundIconSize y comprobar que cada valor pertenece a sm|md|lg y que solo lo declaran tarjetas con backgroundIcon.
REQ-111-04 El test REQ-108-06/07/17 SHALL comprobar en el build que cada card con backgroundIconSize en el JSON lleva data-backdrop-size con ese valor y que cada card con backgroundIcon sin backgroundIconSize no lleva el atributo data-backdrop-size.
REQ-111-05 El test REQ-103-05/06/07/08 SHALL derivar del JSON la lista de tarjetas con cornerIcon o backgroundIcon y comprobar que cada símbolo referenciado existe en public/assets/svg/sprite.svg.
REQ-111-06 El test REQ-103-09/10/11 SHALL tomar como marcado esperado del svg de .card-icon el width y height 28px presentes en src/components/hero-card.astro y mantener la comprobación del orden de capas header → backdrop → icon → corner.
REQ-111-07 El test REQ-107-30/31/35 SHALL calcular el número esperado de elementos use href como la suma de icon, cornerIcon y backgroundIcon de las tarjetas de icono del JSON y exigir 0 apariciones de xlink:href.
REQ-111-08 Los tests REQ-101-17 y REQ-98-01/02/05 SHALL conservar su instantánea congelada con la entrada cloudflare actualizada a los valores actuales del JSON de modo que un cambio posterior no anunciado del JSON siga haciéndolos fallar.

### Presentación (el CSS sigue a los datos)

REQ-111-09 La regla base [data-color-token="cloudflare"] de src/styles/hero-card.css SHALL declarar --icon-width 270px y --icon-rotation 0deg fuera de @media.
REQ-111-10 El test REQ-97-20 / REQ-98-35 SHALL seguir comparando el iconWidth y el rotate de cada tarjeta de icono del JSON con su regla base o de tablet de hero-card.css sin excluir ninguna tarjeta.
REQ-111-11 WHILE el viewport mide 375 o 800 o 1024 o 1280 o 1600 px de ancho, la parte visible del icono #cloudflare-cloud de la card CLOUDFLARE SHALL tener intersección de área 0 con los rectángulos de las palabras del título y al menos el 90 % del área del símbolo dentro del article.

### Verificación y alcance

REQ-111-12 WHEN se edite hero-card.css, la medida CDP de REQ-111-11 SHALL observarse en rojo a 1280 px sobre el árbol previo al ajuste.
REQ-111-13 La feature 111 SHALL guardar en progress/research/hero111/ las capturas CDP de la card CLOUDFLARE a 375, 800, 1024, 1280 y 1600 px de ancho.
REQ-111-14 La feature 111 SHALL dejar sin modificar public/assets/svg/sprite.svg, src/content/posts/systems-design/*.md y tests/hack-the-box-sprite.test.mjs.
REQ-111-15 WHEN termine la feature 111, ./init.sh SHALL terminar con código 0 y 0 tests fallidos.
