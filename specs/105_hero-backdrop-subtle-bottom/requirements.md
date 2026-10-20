# Requisitos — feature 105 hero-backdrop-subtle-bottom

# Petición humana (2026-10-20): el logo de fondo de las cards del hero (.card-backdrop, feature 103) puede ser más grande y desbordar, más sutil y siempre por debajo del icono principal. Esta feature reemplaza los requisitos 19 (franja), 20 (opacidad 0.1), 31 (z-index 2) y 32 (fondo encima, al menos 60 %) de la spec 103; el resto de la 103 sigue vigente.

## Requisitos

### Capa y opacidad

REQ-105-01 La regla .card-backdrop de src/styles/hero-card-accents.css SHALL declarar z-index 0 fuera de @media y no redefinirlo dentro de @media, con .card-backdrop antes de .card-icon en el DOM, para que el icono principal se pinte por encima del logo de fondo dentro del contexto de apilamiento de .hero-card.
REQ-105-02 La regla .card-backdrop SHALL declarar --card-backdrop-opacity con valor 0.06 y aplicar opacity var(--card-backdrop-opacity).
REQ-105-03 WHEN el usuario pasa el puntero sobre una card con logo de fondo, hero-card-accents.css SHALL dejar a .card-backdrop sin transform, transition ni :hover propios y el hover de hero-card.css sin cambios.

### Tamaño, desborde y anclaje inferior

REQ-105-04 La regla .card-backdrop SHALL declarar left y right de -16px y bottom 0 fuera de @media y left y right de -10px dentro de @media (max-width: 1200px), sin declarar height en ninguno de los dos rangos.
REQ-105-05 La regla .card-backdrop svg SHALL declarar display block, width 100%, height auto y un aspect-ratio de respaldo de 4 / 1.
REQ-105-06 Por cada backgroundIcon de src/data/hero-cards.json la hoja hero-card-accents.css SHALL tener una regla .card-backdrop:has(use[href$="#<id>"]) svg cuyo aspect-ratio coincide con ancho / alto del viewBox del symbol <id> de public/assets/svg/sprite.svg.
REQ-105-07 La medición con Chrome headless y CDP SHALL registrar a 375, 800, 1024, 1280 y 1600 px, en CLAUDE CODE y GITHUB, el borde inferior del rectángulo del use de .card-backdrop a 2 px o menos del borde inferior de la card y un ancho del use mayor que el ancho interior de la card.

### Por debajo del icono principal

REQ-105-08 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos, en CLAUDE CODE y GITHUB, 0 puntos de una rejilla 20 x 5 sobre el rectángulo del use de .card-backdrop recortado a la card en los que document.elementsFromPoint (con pointer-events auto inyectado solo para medir) da el svg de .card-backdrop antes que el svg de .card-icon.
REQ-105-09 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos una opacidad calculada de 0.06 y un z-index calculado de 0 en .card-backdrop de CLAUDE CODE y GITHUB.

### Se mantiene

REQ-105-10 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos un solape de 0 px entre .card-title y el svg de .card-backdrop y entre .card-title y el svg de .card-corner en CLAUDE CODE y GITHUB.
REQ-105-11 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos un contraste del título de 4,5:1 o más frente al color compuesto del fondo de marca con el logo de fondo a 0.06.
REQ-105-12 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos los rectángulos de las 15 article.hero-card iguales (±1 px) a la línea base previa a la feature, scrollWidth <= clientWidth del hero y 0 errores de consola y de red, con capturas de CLAUDE CODE y GITHUB por ancho en progress/research/hero105/.
REQ-105-13 El marcado de dist/client/index.html SHALL conservar para las 12 cards sin logos extra exactamente header.card-header y div.card-icon y para CLAUDE CODE y GITHUB el orden de hijos de REQ-103-09.
REQ-105-14 Las reglas de .card-corner y de .hero-card:has(> .card-corner) .card-header SHALL conservar los valores de REQ-103-16/17/18.

### Tests y alcance

REQ-105-15 El archivo tests/hero-cards-extra-logos.test.mjs SHALL comprobar los valores de esta feature en lugar del z-index 2, la franja de 22px / 40px y la opacidad 0.1 de .card-backdrop y llevar la nota «Ajuste feature 105 (precedente REQ-43-06)».
REQ-105-16 El test tests/hero-backdrop-subtle-bottom.test.mjs SHALL usar solo node:test y la stdlib, tener 100 líneas o menos y dejar su salida en rojo (antes de tocar el CSS) y en verde en progress/impl_hero-backdrop-subtle-bottom.md.
REQ-105-17 El git diff de la feature SHALL dejar sin cambios public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, src/styles/hero-card.css, src/styles/tokens.css, src/data/hero-cards.json y el dominio del mosaico, con cada archivo tocado en 100 líneas o menos y ./init.sh en verde.

