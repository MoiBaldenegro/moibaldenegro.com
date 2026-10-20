# Requisitos — feature 107 hero-cards-links

# Petición humana (2026-10-20): cada card del hero puede recibir una liga en hero-cards.json; con liga no nula la card entera es clicable y con el hover activo muestra una flecha que apunta a la esquina. Sin liga la card queda idéntica.

## Requisitos

### Datos y dominio

REQ-107-01 La entidad HeroCard y la entidad HeroRichCard de src/domain/entities/hero-card.ts SHALL declarar readonly href: string | null sin cambiar el resto de sus campos.
REQ-107-02 WHEN una tarjeta declara href con una URL que empieza por https:// o una ruta que empieza por una sola barra, parseHeroCards SHALL entregar ese mismo texto en href.
REQ-107-03 IF una tarjeta omite href o lo declara null, THEN parseHeroCards SHALL entregar href null.
REQ-107-04 IF una tarjeta declara href con un valor que no es null ni un texto https:// o una ruta /<ruta> sin doble barra inicial, THEN parseHeroCards SHALL lanzar HeroCardsDataError con un mensaje que contiene hero-cards.json, el índice de la tarjeta y href.
REQ-107-05 El archivo src/data/hero-cards.json SHALL declarar href https://github.com/MoiBaldenegro en github, href https://www.youtube.com/@moibaldenegro en youtube y href null en las otras 13 tarjetas.

### Marcado

REQ-107-06 IF card.href no es null, THEN los componentes hero-card.astro y htb-card.astro SHALL pintar un a.card-link con ese href como último hijo del article.
REQ-107-07 IF card.href es null, THEN los componentes hero-card.astro y htb-card.astro SHALL pintar el article sin a.card-link y con los mismos hijos que antes de la feature.
REQ-107-08 El a.card-link SHALL tener como nombre accesible el título de la card seguido de « (sitio externo)» en un span.visually-hidden cuando href empieza por https:// y solo el título cuando es una ruta interna.
REQ-107-09 IF href empieza por https://, THEN el a.card-link SHALL llevar rel="noopener" sin atributo target.
REQ-107-10 El a.card-link SHALL contener un span.card-link__arrow con aria-hidden="true" y el carácter ↗ sin ningún otro elemento interactivo dentro.
REQ-107-11 El article de cada card SHALL contener como máximo un elemento a y ningún a anidado dentro de otro a, también en la card rica de HACK THE BOX.

### Presentación

REQ-107-12 La hoja src/styles/hero-card-link.css SHALL dar al a.card-link position absolute, inset 0 y z-index 6 para que cubra la card entera por encima de .hero-card__body.
REQ-107-13 WHEN el usuario hace clic en el centro de una card con href, el navegador SHALL navegar al href de esa card.
REQ-107-14 WHILE una card con href no tiene hover ni foco de teclado, hero-card-link.css SHALL dejar el span.card-link__arrow con opacity 0.
REQ-107-15 WHEN el puntero pasa sobre una card con href o su a.card-link recibe :focus-visible, hero-card-link.css SHALL mostrar el span.card-link__arrow con opacity 1 y transform translate(2px, -2px).
REQ-107-16 La hoja hero-card-link.css SHALL colocar el span.card-link__arrow en la esquina superior derecha con top y right 16px fuera de @media y 14px dentro de @media (max-width: 1200px).
REQ-107-17 IF la card tiene cornerIcon y href, THEN hero-card-link.css SHALL colocar el span.card-link__arrow con right 46px fuera de @media y 40px dentro de @media (max-width: 1200px) para no solapar el icono de esquina.
REQ-107-18 IF la card tiene href, THEN hero-card-link.css SHALL reservar en .card-header right 46px fuera de @media y 40px dentro de @media (max-width: 1200px) o right 76px y 66px cuando la card tiene también cornerIcon.
REQ-107-19 WHEN el a.card-link recibe :focus-visible, hero-card-link.css SHALL pintar un outline de 2px con var(--color-accent) y outline-offset negativo visible dentro del overflow hidden de la card.
REQ-107-20 WHILE el usuario prefiere movimiento reducido, hero-card-link.css SHALL dejar el span.card-link__arrow sin transition ni transform.
REQ-107-21 La hoja hero-card-link.css SHALL usar solo tokens de tokens.css para colores y tener 100 líneas o menos importada por hero-card.astro y htb-card.astro.

### Calidad y verificación

REQ-107-22 La verificación SHALL anotar en progress/impl_hero-cards-links.md las mediciones de Chrome headless con CDP a 375, 800, 1024, 1280 y 1600 px con solape 0 entre título y flecha, palabras del título en una sola caja dentro del article, rectángulos de las cards iguales a la línea base con 1 px de tolerancia y 0 errores de consola.
REQ-107-23 La verificación SHALL dejar en progress/research/hero107/ capturas de GITHUB en reposo, con hover y con foco por ancho.
REQ-107-24 El test tests/hero-cards-links.test.mjs SHALL usar solo node:test y la stdlib con 100 líneas o menos y su salida en rojo y en verde anotada en progress/impl_hero-cards-links.md.
REQ-107-25 Cada test existente ajustado por la feature SHALL llevar la nota «Ajuste feature 107 (precedente REQ-43-06)» y conservar la intención de su aserción original.
REQ-107-26 El git diff de la feature SHALL dejar sin tocar public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, src/styles/hero-card.css, src/styles/tokens.css y el dominio del mosaico con ./init.sh terminando con código 0.
