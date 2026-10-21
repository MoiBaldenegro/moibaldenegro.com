# Requisitos — feature 106 hero-cards-mobile-visibility

# Petición humana (2026-10-20): en móvil solo se muestran las cards personalizadas o interactivas, con un booleano configurable en hero-cards.json (las de icono en false y HACK THE BOX en true); escritorio y tablet siguen igual. Móvil = @media (max-width: 768px), el tramo de una columna del hero.
# Ajuste del líder (2026-10-20, bloqueo del implementer en progress/impl_hero-cards-mobile-visibility.md): con data-show-on-mobile="true|false" en las 15 cards la portada pasaba de 39 775 B a 40 194 B y rompía REQ-47-06 (< 40 000 B). El atributo se pinta solo en las cards true (≈ +27 B, ≈ 39 802 B) y el CSS oculta las que no lo llevan con :not([data-show-on-mobile]). El JSON sigue declarando showOnMobile explícito en las 15 cards y el parse no cambia.

## Requisitos

### Datos y dominio

REQ-106-01 La entidad HeroCard y la entidad HeroRichCard de src/domain/entities/hero-card.ts SHALL declarar readonly showOnMobile: boolean sin cambiar el resto de sus campos.
REQ-106-02 WHEN una tarjeta de hero-cards.json declara showOnMobile booleano, parseHeroCards SHALL entregar ese mismo valor en showOnMobile.
REQ-106-03 IF una tarjeta de icono omite showOnMobile, THEN parseHeroCards SHALL entregar showOnMobile false.
REQ-106-04 IF una tarjeta rica omite showOnMobile, THEN parseHeroCards SHALL entregar showOnMobile true.
REQ-106-05 IF una tarjeta declara showOnMobile con un valor no booleano, THEN parseHeroCards SHALL lanzar HeroCardsDataError con un mensaje que contiene hero-cards.json, el índice de la tarjeta y showOnMobile.
REQ-106-06 El archivo src/data/hero-cards.json SHALL declarar showOnMobile true en la tarjeta htb y showOnMobile false en cada una de las 14 tarjetas de icono.
REQ-106-07 El parse de hero-cards.json SHALL quedar repartido entre hero-cards-parse.ts y un módulo hermano en src/domain/repositories/ con cada archivo en 100 líneas o menos.

### Marcado

REQ-106-08 WHEN card.showOnMobile es true, los componentes hero-card.astro y htb-card.astro SHALL pintar en su article el atributo data-show-on-mobile="true" sin atributo style ni script.
REQ-106-18 IF card.showOnMobile es false, THEN los componentes hero-card.astro y htb-card.astro SHALL omitir el atributo data-show-on-mobile en su article.

### Presentación

REQ-106-09 WHILE el viewport mide 768 px o menos, src/styles/hero-section.css SHALL aplicar display none a cada .hero-grid > .hero-card:not([data-show-on-mobile]) dentro del @media (max-width: 768px) existente.
REQ-106-10 WHILE el viewport mide 768 px o menos, la cuadrícula del hero SHALL dejar visibles la tarjeta de perfil y las cards con showOnMobile true en una columna con el gap --gap-card entre items consecutivos y sin huecos.
REQ-106-11 WHILE el viewport mide 768 px o menos, el árbol de accesibilidad SHALL omitir las cards con showOnMobile false.
REQ-106-12 WHILE el viewport mide más de 768 px, el hero SHALL mostrar las 15 cards con los mismos rectángulos que antes de la feature con una tolerancia de 1 px.
REQ-106-13 El dominio del mosaico SHALL quedar sin cambios en src/domain/hero-grid-layout.ts y src/domain/hero-grid-template.ts.

### Calidad y verificación

REQ-106-14 La verificación SHALL anotar en progress/impl_hero-cards-mobile-visibility.md las mediciones de Chrome headless con CDP a 375, 800, 1024, 1280 y 1600 px con 0 errores de consola y dejar progress/research/hero106/hero-<w>.png por ancho.
REQ-106-15 El test tests/hero-cards-mobile-visibility.test.mjs SHALL usar solo node:test y la stdlib con 100 líneas o menos y su salida en rojo y en verde anotada en progress/impl_hero-cards-mobile-visibility.md.
REQ-106-16 Cada test existente ajustado por la feature SHALL llevar la nota «Ajuste feature 106 (precedente REQ-43-06)» y conservar la intención de su aserción original.
REQ-106-17 El git diff de la feature SHALL dejar sin tocar public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, src/styles/hero-card.css y src/styles/tokens.css con ./init.sh terminando con código 0.
REQ-106-19 El build de la feature SHALL dejar dist/client/index.html por debajo de 40 000 bytes sin cambiar el umbral de REQ-47-06 en tests/search-index-lazy-load.test.mjs.
