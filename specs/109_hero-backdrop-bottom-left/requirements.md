# Requisitos — feature 109 hero-backdrop-bottom-left

# Petición humana (2026-10-20): «EL icono del background ponerle una alineacion estatica de la esquina inferior izquierda, abajo y a la izquierda, por que cuando hay logos pequeños que no desbordan se estan centrando.» El logo de fondo (.card-backdrop, features 103/105/108) se ancla siempre abajo a la izquierda.

## Requisitos

### Presentación

REQ-109-01 La regla base de .card-backdrop en hero-card-accents.css SHALL declarar left -16px, right auto y width calc(100% + 32px) fuera de @media y left -10px con width calc(100% + 20px) dentro de @media (max-width: 1200px) como tamaño md.
REQ-109-02 La regla .card-backdrop[data-backdrop-size="lg"] SHALL declarar left -56px con width calc(100% + 112px) fuera de @media y left -36px con width calc(100% + 72px) dentro de @media (max-width: 1200px).
REQ-109-03 La regla .card-backdrop[data-backdrop-size="sm"] SHALL declarar left 16px con width 60% fuera de @media y left 10px con width 60% dentro de @media (max-width: 1200px).
REQ-109-04 Ninguna regla de .card-backdrop en hero-card-accents.css SHALL declarar un valor de right distinto de auto.
REQ-109-05 La hoja hero-card-accents.css SHALL declarar para .card-backdrop:has(use[href$="#cloudflare"]) svg el aspect-ratio 512 / 76 del viewBox del symbol cloudflare.
REQ-109-06 Las reglas de .card-backdrop SHALL conservar bottom 0, z-index 0, la opacidad var(--card-backdrop-opacity) de 0.06, los aspect-ratio de anthropic-wordmark y github-wordmark y el margin-bottom de anthropic-wordmark de las features 105 y 108 sin declarar height ni transform.
REQ-109-07 WHEN la página se carga con el JSON real, el hero SHALL pintar el use de .card-backdrop de CLAUDE CODE y de GITHUB con los mismos rectángulos que antes de la feature con una tolerancia de 1 px.
REQ-109-08 WHEN data-backdrop-size sm se inyecta en una card con logo de fondo, el hero SHALL pintar el borde izquierdo del use a 16 px (10 px en 1200 px o menos) del de la card con una tolerancia de 1 px y un hueco derecho mayor que el izquierdo.
REQ-109-09 WHEN la página se carga, el hero SHALL pintar el borde inferior del use de .card-backdrop de cada card con logo de fondo a 2 px o menos del borde inferior de su card en los tamaños sm, md y lg.
REQ-109-10 WHILE el hero está visible, el use de .card-backdrop SHALL mantener solape 0 con el rectángulo del título de su card.

### Calidad y verificación

REQ-109-11 La verificación SHALL anotar en progress/impl_hero-backdrop-bottom-left.md las mediciones de Chrome headless con CDP a 375, 800, 1024, 1280 y 1600 px de CLOUDFLARE, CLAUDE CODE y GITHUB con sm, md y lg inyectados y 0 errores de consola.
REQ-109-12 La verificación SHALL dejar progress/research/hero109/<card>-<tamaño>-<w>.png por card, tamaño y ancho.
REQ-109-13 El test tests/hero-backdrop-bottom-left.test.mjs SHALL usar solo node:test y la stdlib con 100 líneas o menos y su salida en rojo y en verde anotada en progress/impl_hero-backdrop-bottom-left.md.
REQ-109-14 IF un test existente fija left/right simétricos del fondo, THEN el implementer SHALL ajustarlo con el comentario «Ajuste feature 109 (precedente REQ-43-06)».
REQ-109-15 El git diff de la feature SHALL dejar sin tocar public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, src/data/hero-cards.json, src/components/hero-card.astro, src/styles/hero-card.css y src/styles/tokens.css con cada archivo tocado en 100 líneas o menos y ./init.sh terminando con código 0.
REQ-109-16 El build de la feature SHALL dejar dist/client/index.html por debajo de 40 000 bytes medido antes y después en progress/impl_hero-backdrop-bottom-left.md sin cambiar el umbral de REQ-47-06.
