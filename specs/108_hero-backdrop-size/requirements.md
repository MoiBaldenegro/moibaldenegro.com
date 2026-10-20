# Requisitos — feature 108 hero-backdrop-size

# Petición humana (2026-10-20): el tamaño del logo de fondo de las cards del hero se configura desde hero-cards.json; si falta se mantiene la geometría de la feature 105. Sin style inline: enum cerrado de tamaños y data-atributo con una regla CSS por valor.

## Requisitos

### Datos y dominio

REQ-108-01 El archivo src/domain/entities/hero-card.ts SHALL exportar HERO_BACKDROP_SIZES con los valores sm, md y lg y declarar en HeroCard readonly backgroundIconSize?: HeroBackdropSize.
REQ-108-02 WHEN una tarjeta con backgroundIcon declara backgroundIconSize con un valor de HERO_BACKDROP_SIZES, parseHeroCards SHALL entregar ese mismo valor en backgroundIconSize.
REQ-108-03 IF una tarjeta omite backgroundIconSize, THEN parseHeroCards SHALL entregar la tarjeta sin la clave backgroundIconSize.
REQ-108-04 IF una tarjeta declara backgroundIconSize fuera de HERO_BACKDROP_SIZES o sin backgroundIcon, THEN parseHeroCards SHALL lanzar HeroCardsDataError con un mensaje que contiene hero-cards.json, el índice de la tarjeta y backgroundIconSize.
REQ-108-05 El archivo src/data/hero-cards.json SHALL declarar backgroundIconSize md solo en claude-code y en github.

### Marcado

REQ-108-06 IF card.backgroundIconSize está definido, THEN hero-card.astro SHALL pintar data-backdrop-size con ese valor en div.card-backdrop sin atributo style.
REQ-108-07 IF card.backgroundIconSize no está definido, THEN hero-card.astro SHALL pintar div.card-backdrop sin el atributo data-backdrop-size.

### Presentación

REQ-108-08 La regla base de .card-backdrop en hero-card-accents.css SHALL conservar left y right -16px fuera de @media y -10px dentro de @media (max-width: 1200px) como tamaño md.
REQ-108-09 La regla .card-backdrop[data-backdrop-size="sm"] SHALL declarar left y right 16px fuera de @media y 10px dentro de @media (max-width: 1200px).
REQ-108-10 La regla .card-backdrop[data-backdrop-size="lg"] SHALL declarar left y right -56px fuera de @media y -36px dentro de @media (max-width: 1200px).
REQ-108-11 Las reglas de tamaño SHALL dejar bottom 0, z-index 0, la opacidad var(--card-backdrop-opacity) y los aspect-ratio por logo de la feature 105 sin cambios y sin declarar height.
REQ-108-12 WHEN el JSON declara backgroundIconSize md en claude-code y github, el hero SHALL pintar sus logos de fondo con los mismos rectángulos que antes de la feature con una tolerancia de 1 px.

### Calidad y verificación

REQ-108-13 La verificación SHALL anotar en progress/impl_hero-backdrop-size.md las mediciones de Chrome headless con CDP a 375, 800, 1024, 1280 y 1600 px del use de .card-backdrop de CLAUDE CODE y GITHUB con sm, md y lg inyectados con el borde inferior a 2 px o menos del de la card y solape 0 con el título.
REQ-108-14 La verificación SHALL dejar progress/research/hero108/<card>-<tamaño>-<w>.png por card, tamaño y ancho.
REQ-108-15 El test tests/hero-backdrop-size.test.mjs SHALL usar solo node:test y la stdlib con 100 líneas o menos y su salida en rojo y en verde anotada en progress/impl_hero-backdrop-size.md.
REQ-108-16 El git diff de la feature SHALL dejar sin tocar public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, src/styles/hero-card.css y src/styles/tokens.css con cada archivo tocado en 100 líneas o menos y ./init.sh terminando con código 0.
