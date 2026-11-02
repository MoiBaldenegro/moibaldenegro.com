# Requisitos — promo-tiles-section

## Requisitos

REQ-04-01 La fuente src/data/promo-tiles.json SHALL declarar exactamente cuatro cuadros en el orden youtube-kernel, mfinance, new-relic y tomatesoft con las imágenes /assets/pic01.webp, /assets/pic02.webp, /assets/pic03.webp y /assets/pic04.webp respectivamente.
REQ-04-02 Cada cuadro de promo-tiles.json SHALL declarar los textos, el tono y los dos enlaces exactos de la tabla de contenido de specs/04_promo-tiles-section/design.md.
REQ-04-03 La entidad PromoTile de src/domain/entities/promo-tile.ts SHALL exponer como campos readonly id, title, subtitle, image, imageAlt, tone, primary y secondary, con primary y secondary formados por label y href.
REQ-04-04 El repositorio PromoTilesRepository de src/domain/repositories/promo-tiles-repository.ts SHALL ser la única vía de lectura de promo-tiles.json y entregar las entidades PromoTile en el orden del JSON con un loader inyectable () => string.
REQ-04-05 IF el contenido de promo-tiles.json no es un JSON válido o no contiene un array "tiles" de exactamente cuatro cuadros, THEN el repositorio SHALL lanzar PromoTilesDataError con un mensaje que nombra promo-tiles.json.
REQ-04-06 IF un cuadro omite un campo obligatorio o lo declara con un tipo distinto de texto, THEN el repositorio SHALL lanzar PromoTilesDataError con un mensaje que nombra promo-tiles.json, el índice del cuadro y el campo.
REQ-04-07 IF un href no empieza por "/" ni por "https://", THEN el repositorio SHALL lanzar PromoTilesDataError con un mensaje que nombra promo-tiles.json y el índice del cuadro.
REQ-04-08 La página src/pages/home.astro SHALL renderizar el componente PromoTiles dentro de .home__landing inmediatamente después de LatestHorizontal.
REQ-04-09 La sección de cuadros SHALL incluir un encabezado h2 "Proyectos y contenido" con la clase visually-hidden y referenciado por aria-labelledby.
REQ-04-10 Cada cuadro SHALL mostrar en este orden y centrados el título en un h3, el subtítulo en un párrafo, el grupo de dos enlaces en forma de píldora y la imagen del cuadro.
REQ-04-11 El enlace primario de cada cuadro SHALL tener fondo relleno var(--color-promo-cta) con texto var(--color-text) y forma de píldora con var(--radius-pill).
REQ-04-12 El enlace secundario de cada cuadro SHALL tener fondo transparente con borde de 1 px en var(--color-promo-link), texto en var(--color-promo-link) y forma de píldora con var(--radius-pill).
REQ-04-13 WHEN el href de un enlace empieza por "https://", el componente SHALL emitir el enlace con target="_blank" y rel="noopener noreferrer".
REQ-04-14 Cada imagen de cuadro SHALL declarar el alt del JSON, width="1920", height="1920", loading="lazy" y decoding="async".
REQ-04-15 Cada cuadro SHALL usar como fondo el token var(--color-promo-<tone>) definido en tokens.css para su tono.
REQ-04-16 La cuadrícula de cuadros SHALL mostrar dos columnas con separación var(--gap-promo) y cuadros sin radio de borde, WHERE el viewport mide más de 768 px.
REQ-04-17 La cuadrícula de cuadros SHALL mostrar una sola columna, WHERE el viewport mide 768 px o menos.
REQ-04-18 Los estilos de la sección SHALL vivir en src/styles/promo-tiles.css importada por el componente y tomar todos sus colores de tokens.css.
REQ-04-19 El componente PromoTiles SHALL renderizarse sin etiquetas script ni style.
REQ-04-20 Cada archivo nuevo o modificado por la feature SHALL tener 100 líneas o menos, incluido src/styles/tokens.css.
REQ-04-21 La regresión visual de la home SHALL mostrar los cuatro cuadros completos sin desbordamiento horizontal ni solapamientos y sin errores en la consola, WHERE el viewport mide 375 px, 768 px o 1280 px.
