# Requisitos — feature 103 hero-cards-extra-logos

## Datos y dominio

REQ-103-01 La interfaz HeroCard de src/domain/entities/hero-card.ts SHALL declarar los campos opcionales readonly cornerIcon y backgroundIcon de tipo string, sin cambiar los campos existentes ni la interfaz HeroRichCard.
REQ-103-02 WHEN una tarjeta de icono de hero-cards.json omite cornerIcon o backgroundIcon, parseHeroCards SHALL entregar esa tarjeta sin la clave omitida (ni siquiera con valor undefined).
REQ-103-03 IF una tarjeta de icono declara un cornerIcon o un backgroundIcon que no es un texto con el prefijo /assets/svg/sprite.svg# seguido de un id no vacío, THEN parseHeroCards SHALL lanzar HeroCardsDataError con un mensaje que nombra hero-cards.json, el índice de la tarjeta y el campo culpable.
REQ-103-04 WHEN una tarjeta de icono declara un cornerIcon o un backgroundIcon válido, parseHeroCards SHALL entregarlo con el mismo texto del JSON.
REQ-103-05 Cada cornerIcon y cada backgroundIcon de src/data/hero-cards.json SHALL referenciar un symbol cuyo id existe en public/assets/svg/sprite.svg.
REQ-103-06 La tarjeta claude-code de hero-cards.json SHALL declarar cornerIcon /assets/svg/sprite.svg#claude y backgroundIcon /assets/svg/sprite.svg#anthropic-wordmark con su icon y el resto de campos sin cambios.
REQ-103-07 La tarjeta github de hero-cards.json SHALL declarar backgroundIcon /assets/svg/sprite.svg#github-wordmark sin cornerIcon y con el resto de campos sin cambios.
REQ-103-08 Las tarjetas de hero-cards.json distintas de claude-code y github SHALL omitir cornerIcon y backgroundIcon.

## Render

REQ-103-09 WHEN una tarjeta de icono declara backgroundIcon, hero-card.astro SHALL renderizar entre header.card-header y div.card-icon un div.card-backdrop con un svg aria-hidden="true" focusable="false" cuyo use apunta a backgroundIcon.
REQ-103-10 WHEN una tarjeta de icono declara cornerIcon, hero-card.astro SHALL renderizar tras div.card-icon un div.card-corner con un svg aria-hidden="true" focusable="false" cuyo use apunta a cornerIcon.
REQ-103-11 IF una tarjeta de icono omite cornerIcon y backgroundIcon, THEN su article.hero-card del HTML construido SHALL contener solo header.card-header y div.card-icon como hijos, con las mismas clases y atributos que antes de la feature.
REQ-103-12 hero-card.astro SHALL leer cornerIcon y backgroundIcon solo de la prop card de tipo HeroCard, sin atributo style, sin etiqueta script y sin leer hero-cards.json.

## Estilos

REQ-103-13 Los estilos de .card-corner y .card-backdrop SHALL vivir en src/styles/hero-card-accents.css, importada por hero-card.astro, con hero-card.css y tokens.css sin cambios.
REQ-103-14 Cada selector de hero-card-accents.css SHALL contener .card-corner o .card-backdrop (incluido .hero-card:has(> .card-corner) .card-header), de modo que ninguna regla aplique a una tarjeta sin logos extra.
REQ-103-15 hero-card-accents.css SHALL tener 100 líneas o menos y ningún color suelto (hex, rgb, rgba, hsl ni hsla).
REQ-103-16 El svg de .card-corner SHALL medir 22px por 22px a top 16px y right 16px de la tarjeta, WHERE el viewport mide 1201 px o más.
REQ-103-17 El svg de .card-corner SHALL medir 18px por 18px a top 14px y right 14px de la tarjeta, WHERE el viewport mide 1200 px o menos.
REQ-103-18 La regla .hero-card:has(> .card-corner) .card-header SHALL fijar right en 46px en viewports de 1201 px o más y en 40px en viewports de 1200 px o menos.
REQ-103-19 .card-backdrop SHALL ocupar una franja absoluta con left y right de 22px (14px en 1200 px o menos), bottom var(--gap-card) y alto de 40px (28px en 1200 px o menos), con su svg al 100 % de ancho y alto de la franja.
REQ-103-20 La regla .card-backdrop SHALL declarar --card-backdrop-opacity con valor 0.1 y aplicar opacity var(--card-backdrop-opacity).
REQ-103-21 .card-corner y .card-backdrop SHALL declarar pointer-events none y user-select none y quedar con un z-index menor que el 4 de .card-header.
REQ-103-31 La regla .card-backdrop SHALL declarar z-index 2, mayor que el de .card-icon (que no declara z-index en hero-card.css) y menor que el 3 de .card-corner, para pintar el logo de fondo por encima del icono principal como marca de agua.
REQ-103-22 WHEN el usuario pasa el puntero sobre una tarjeta con logos extra, hero-card-accents.css SHALL dejar sin transform ni transition propios a .card-corner y .card-backdrop, con el hover de hero-card.css (translateY -4px, sombra hover, contrast 1.4 y el icono principal a rotate 2deg y escala x1.12) sin cambios.

## Verificación en navegador

REQ-103-23 La medición con Chrome headless y CDP SHALL registrar a 375, 800, 1024, 1280 y 1600 px un solape de 0 px entre el rectángulo de .card-title y el del svg de .card-corner en CLAUDE CODE.
REQ-103-24 La medición con Chrome headless y CDP SHALL registrar a 375, 800, 1024, 1280 y 1600 px un solape de 0 px entre el rectángulo de .card-title y el del svg de .card-backdrop en CLAUDE CODE y GITHUB (ajuste por el CHANGES_REQUESTED de la revisión 1).
REQ-103-32 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos, en CLAUDE CODE y GITHUB, el svg de .card-backdrop como capa superior (frente al svg de .card-icon, .card-title y el svg de .card-corner) en al menos el 60 % de los puntos de una rejilla de 20 x 5 sobre el rectángulo de su use recortado a la tarjeta.
REQ-103-33 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos, en CLAUDE CODE y GITHUB, un contraste del título de 4,5:1 o más frente al color compuesto del fondo de marca con el logo de fondo a --card-backdrop-opacity.
REQ-103-25 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos los rectángulos de las 15 article.hero-card iguales (±1 px) a la línea base capturada antes de implementar.
REQ-103-26 La medición con Chrome headless y CDP SHALL registrar a los cinco anchos el hero sin scroll horizontal (scrollWidth igual o menor que clientWidth) y 0 errores de consola y de red, con capturas de CLAUDE CODE y GITHUB regeneradas tras el ajuste de la revisión 1 en progress/research/hero103/.

## Tests y alcance

REQ-103-27 tests/hero-cards-polish.test.mjs SHALL comparar en REQ-101-17 hero-cards.json sin cornerIcon ni backgroundIcon contra su versión del commit 0c786e4, con la nota «Ajuste feature 103 (precedente REQ-43-06)», el diff vacío de hero-grid-layout.ts y hero-grid-template.ts y 100 líneas o menos.
REQ-103-28 El test nuevo tests/hero-cards-extra-logos.test.mjs SHALL usar solo node:test y la stdlib, tener 100 líneas o menos y dejar su salida en rojo (antes de implementar) y en verde en progress/impl_hero-cards-extra-logos.md.
REQ-103-29 La feature SHALL dejar sin cambios public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, src/domain/hero-grid-layout.ts, src/domain/hero-grid-template.ts, src/styles/hero-card.css y src/styles/tokens.css, con ./init.sh terminando con código 0.
REQ-103-30 Cada archivo de src/ que toca la feature SHALL tener 100 líneas o menos, WHERE hero-cards-parse.ts puede compactarse o partirse en un módulo hermano para cumplirlo.
