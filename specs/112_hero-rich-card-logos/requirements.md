# Requisitos — feature 112 hero-rich-card-logos

# Petición humana (2026-10-20): las cards personalizadas del hero (hoy HTB) conservan su contenido propio encima y llevan debajo, como fondo tenue, el mismo logo con el efecto de hover de las cards normales (#htb en el icono principal) y además el logo con letras (#htb-wordmark) como logo de fondo.

## Requisitos

### Datos

REQ-112-01 La entidad HeroRichCard SHALL declarar los campos opcionales y readonly icon, backgroundIcon y backgroundIconSize con los mismos tipos que HeroCard.
REQ-112-02 WHEN una tarjeta rica de hero-cards.json declara icon o backgroundIcon con el formato /assets/svg/sprite.svg#<id>, parseRichCard SHALL devolver el valor en el campo del mismo nombre.
REQ-112-03 WHEN una tarjeta rica declara backgroundIconSize con un valor de HERO_BACKDROP_SIZES, parseRichCard SHALL devolver ese valor en backgroundIconSize.
REQ-112-04 IF una tarjeta rica omite icon o backgroundIcon o backgroundIconSize, THEN parseRichCard SHALL devolver la tarjeta sin esa clave.
REQ-112-05 IF una tarjeta rica declara icon o backgroundIcon fuera del formato /assets/svg/sprite.svg#<id> o backgroundIconSize fuera de HERO_BACKDROP_SIZES, THEN parseRichCard SHALL lanzar HeroCardsDataError nombrando hero-cards.json, el índice y el campo.
REQ-112-06 La tarjeta htb de src/data/hero-cards.json SHALL declarar icon /assets/svg/sprite.svg#htb, backgroundIcon /assets/svg/sprite.svg#htb-wordmark y backgroundIconSize sm conservando el resto de sus campos.
REQ-112-07 Los symbol referenciados por icon y backgroundIcon de toda tarjeta rica SHALL existir en public/assets/svg/sprite.svg.

### Presentación

REQ-112-08 El componente src/components/hero-card-art.astro SHALL pintar .card-backdrop con data-backdrop-size cuando recibe backgroundIcon y .card-icon cuando recibe icon con el mismo marcado que hoy pinta hero-card.astro.
REQ-112-09 Los componentes hero-card.astro y hero-cards/htb-card.astro SHALL pintar el logo de fondo y el icono principal solo a través de hero-card-art.astro.
REQ-112-10 WHEN se construye la portada, el HTML de cada card de icono SHALL quedar byte a byte igual al previo a la feature.
REQ-112-11 La card htb-card.astro SHALL colocar hero-card-art.astro antes de .hero-card__body y de a.card-link dentro del article.
REQ-112-12 IF una tarjeta rica no declara icon ni backgroundIcon, THEN htb-card.astro SHALL pintar el article sin .card-icon ni .card-backdrop.
REQ-112-13 La hoja src/styles/htb-card.css SHALL declarar para .hero-card--rich .card-icon opacity 0.16 y pointer-events none.
REQ-112-14 La hoja src/styles/htb-card.css SHALL declarar para la card rica de token htb --icon-width 150px con --icon-rotation -8deg y --icon-scale 6 fuera de @media y --icon-scale 3 dentro de @media (max-width: 1200px).
REQ-112-15 La hoja src/styles/hero-card-accents.css SHALL declarar para .card-backdrop:has(use[href$="#htb-wordmark"]) svg el aspect-ratio 300 / 58.8 del viewBox del symbol.
REQ-112-16 WHEN el puntero pasa sobre la card HTB, el hero SHALL aplicar al svg de su .card-icon la transformación de hover de las cards de icono de hero-card.css sin regla de hover nueva.
REQ-112-17 WHILE la card HTB está visible, el hero SHALL pintar .hero-card__body por encima de .card-icon y .card-backdrop y a.card-link por encima de .hero-card__body.
REQ-112-18 WHILE la card HTB está visible en reposo o en hover, cada texto de su header y de su cuerpo SHALL tener contraste de 4.5:1 o más con el color compuesto bajo él.
REQ-112-19 WHILE la card HTB está visible, el use de su .card-backdrop SHALL tener el borde inferior a 2 px o menos del de la card y solape 0 con el título.
REQ-112-20 WHILE el viewport mide 768 px o menos, la card HTB SHALL mostrarse con el cubo y el wordmark recortados dentro de la card y sin desbordamiento horizontal de la página.

### Calidad y verificación

REQ-112-21 La verificación SHALL anotar en progress/impl_hero-rich-card-logos.md las mediciones de Chrome headless con CDP a 375, 800, 1024, 1280 y 1600 px de la card HTB en reposo y en hover con 0 errores de consola.
REQ-112-22 La verificación SHALL dejar progress/research/hero112/htb-<estado>-<w>.png por estado (rest y hover) y ancho.
REQ-112-23 El test tests/hero-rich-card-logos.test.mjs SHALL usar solo node:test y la stdlib con 100 líneas o menos y su salida en rojo y en verde anotada en progress/impl_hero-rich-card-logos.md.
REQ-112-24 IF un test existente fija el marcado de htb-card.astro o hero-card.astro o el shape de la tarjeta rica o la card htb del JSON o el umbral de peso, THEN el implementer SHALL ajustarlo con el comentario «Ajuste feature 112 (precedente REQ-43-06)».
REQ-112-25 IF el build deja dist/client/index.html en 40 000 bytes o más, THEN el implementer SHALL fijar el umbral de REQ-47-06 en 42 000 bytes con la nota «Ajuste feature 112 (precedente REQ-43-06)» y la aprobación humana de 2026-10-20 y dejar la feature en blocked si el peso alcanza 42 000 bytes.
REQ-112-26 El git diff de la feature SHALL dejar sin tocar public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, src/styles/hero-card.css y src/styles/tokens.css con cada archivo tocado en 100 líneas o menos, el peso antes y después anotado en progress/impl_hero-rich-card-logos.md y ./init.sh terminando con código 0.
