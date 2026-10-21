# Requisitos — feature 110 hero-cards-links-new-tab

# Petición humana (2026-10-20): «las cards cuando hacen la navegacion debe ser un BLANK, que le habra en una nueva pestaña.» Las cards con href (feature 107) abren su liga en una pestaña nueva con aviso accesible.

## Requisitos

### Marcado

REQ-110-01 WHEN card.href no es null, hero-card.astro SHALL pintar el a.card-link con target="_blank" y rel="noopener noreferrer".
REQ-110-02 WHEN card.href no es null, htb-card.astro SHALL pintar el a.card-link con target="_blank" y rel="noopener noreferrer".
REQ-110-03 IF card.href empieza por https://, THEN el span.visually-hidden del a.card-link SHALL contener el título seguido de « (sitio externo) (se abre en una pestaña nueva)».
REQ-110-04 IF card.href es una ruta interna, THEN el span.visually-hidden del a.card-link SHALL contener el título seguido solo de « (se abre en una pestaña nueva)».
REQ-110-05 IF card.href es null, THEN el article SHALL quedar sin a.card-link y sin atributo target.
REQ-110-06 El a.card-link SHALL conservar la clase card-link, el último lugar entre los hijos del article, el span.card-link__arrow aria-hidden con ↗ y la ausencia de enlaces anidados de la feature 107.

### Comportamiento

REQ-110-07 WHEN el usuario hace clic en GITHUB o YOUTUBE, el navegador SHALL abrir el href del JSON en una pestaña nueva y dejar la portada cargada en la pestaña original.

### Calidad y verificación

REQ-110-08 La verificación SHALL anotar en progress/impl_hero-cards-links-new-tab.md las mediciones de Chrome headless con CDP a 375, 800, 1024, 1280 y 1600 px con el Target.targetCreated del clic, la URL de la portada intacta y 0 errores de consola.
REQ-110-09 La verificación SHALL dejar progress/research/hero110/<card>-<w>.png por card con href y ancho.
REQ-110-10 El test tests/hero-cards-links-new-tab.test.mjs SHALL usar solo node:test y la stdlib con 100 líneas o menos y su salida en rojo y en verde anotada en progress/impl_hero-cards-links-new-tab.md.
REQ-110-11 IF un test existente fija rel="noopener" sin target o el texto «(sitio externo)» como final del enlace de la card, THEN el implementer SHALL ajustarlo con el comentario «Ajuste feature 110 (precedente REQ-43-06)».
REQ-110-12 El git diff de la feature SHALL dejar sin tocar public/assets/svg/sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, about-hero.astro, about-projects.astro y site-footer.astro con cada archivo tocado en 100 líneas o menos y ./init.sh terminando con código 0.
REQ-110-13 El build de la feature SHALL dejar dist/client/index.html por debajo del umbral de REQ-47-06 con el peso medido antes y después anotado en progress/impl_hero-cards-links-new-tab.md.
REQ-110-14 IF dist/client/index.html no cabe por debajo de 40 000 bytes, THEN el implementer SHALL subir el umbral de REQ-47-06 a 42 000 bytes con el comentario «Ajuste feature 110 (precedente REQ-43-06)» y la justificación de la decisión humana del 2026-10-20.
