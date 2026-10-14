# Requisitos — Card de Hack The Box en el grid del hero (feature 92 htb-hero-card)
# Origen: petición humana 2026-10-14 (el componente de Hack The Box con las stats pasa a ser una card del grid, integrada como una más y con funcionalidad). Análisis: progress/research/hero-extensible-cards.md.
# Toca UI/presentación: ver design.md en esta carpeta. Depende de las features 90 y 91.
# Valores por defecto propuestos y reversibles (anotados en progress/current.md): celda 9 / span 4 x 9 / span 2, stats Nivel, Puntos y Owns, tokens de marca HTB.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-92-01→1, REQ-92-02→1, REQ-92-03→1, REQ-92-04→2, REQ-92-05→2, REQ-92-06→2, REQ-92-07→3, REQ-92-08→3, REQ-92-09→3, REQ-92-10→4, REQ-92-11→5, REQ-92-12→5, REQ-92-13→5, REQ-92-14→6, REQ-92-15→7, REQ-92-16→7.

## Requisitos

REQ-92-01 El archivo src/data/hero-cards.json SHALL incluir tras twitch-bottom la tarjeta con id htb, kind htb, title HACK THE BOX, colorToken htb, gridColumn 9 / span 4 y gridRow 9 / span 2.
REQ-92-02 La hoja src/styles/tokens.css SHALL declarar los tokens --color-marca-htb y --color-marca-htb-accent sin superar 100 líneas.
REQ-92-03 La regla [data-color-token="htb"] de src/styles/hero-card.css SHALL fijar --card-bg a var(--color-marca-htb) y la celda 9 / span 4 por 9 / span 2.
REQ-92-04 El componente src/components/hero-cards/htb-card.astro SHALL pintar un article con las clases hero-card y hero-card--rich y data-color-token={card.colorToken} con el título en p.card-title.
REQ-92-05 El componente htb-card.astro SHALL montar HtbStadistics con server:defer y un slot fallback con el texto Cargando estadísticas de HTB... dentro del article.
REQ-92-06 El registro del frontmatter de hero-grid-card.astro SHALL asociar el kind htb con htb-card.astro.
REQ-92-07 El componente src/components/htb-stadistics.astro SHALL conservar el fallback de credenciales ENV || env y getProfileOrNull() y la cabecera Cache-Control con HTB_ISLAND_CACHE_CONTROL.
REQ-92-08 WHEN la isla recibe un perfil, htb-stadistics.astro SHALL pintar una lista con Nivel y Puntos y Owns en formato user / root con N/D para cada valor nulo.
REQ-92-09 IF getProfileOrNull devuelve null, THEN htb-stadistics.astro SHALL pintar el texto Estadísticas no disponibles dentro de la card.
REQ-92-10 El archivo src/pages/index.astro SHALL dejar de importar y de renderizar HtbStadistics.
REQ-92-11 La card HTB SHALL heredar de .hero-card el radio y el borde y la sombra y el hover y la anulación del desplazamiento con prefers-reduced-motion.
REQ-92-12 WHILE el viewport mide 1200 px o menos, la card HTB SHALL seguir las reglas responsive de .hero-card sin contenido recortado ni scroll horizontal.
REQ-92-13 Las hojas src/styles/htb-card.css y src/styles/htb-stadistics.css SHALL declarar colores y espaciados solo con var() de tokens.css y sin hex ni rgb/rgba.
REQ-92-14 Los tests heredados de la sección suelta SHALL reapuntar sus aserciones de index.astro y de geometría de sección a htb-card.astro y a la lista compacta, WHERE la petición humana 2026-10-14 retira la sección de la portada.
REQ-92-15 WHEN se implemente la feature, el test tests/htb-hero-card.test.mjs SHALL observarse en rojo antes de escribir los componentes o las hojas.
REQ-92-16 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature.
