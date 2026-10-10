# Informe de implementación — feature 79 mobile-hamburger-menu

Implementado por el líder en rol de implementer (autorización humana; subagente implementer no
disponible). Petición humana: header móvil «saturadísimo» → menú hamburguesa; buscador dentro del
panel; header limpio para que la foto del hero sea la protagonista al entrar. Escritorio sin
cambios.

## Ciclo rojo/verde (REQ-79-34)

- tests/mobile-hamburger-menu.test.mjs (63 líneas) escrito primero. ROJO: pass 0 / fail 4.
- VERDE: 4/4. Suite completa 849/849; ./init.sh en verde. Los tests de estructura del nav y del
  buscador (REQ-79-35) pasan sin tocarlos.

## Cambios

- src/layouts/Layout.astro (71 líneas), en `<nav>` sin atributos:
  - el logo;
  - `<button type="button" class="site-menu__toggle" data-site-menu-toggle aria-controls="site-menu" aria-expanded="false" aria-label="Abrir menú">`, sin texto;
  - `<div class="site-menu" id="site-menu" data-site-menu>` con About, Arquitectura,
    @moibaldenegro y `<SearchBar />`, sin cambios en sus atributos;
  - `<SiteMenu />` tras el header.
- src/components/site-menu/site-menu.astro: importa site-menu.css y tiene un script que llama a
  initSiteMenu() al evaluarse y en cada astro:after-swap.
- src/styles/site-menu.css (65 líneas):
  - fuera de media queries, `.site-menu { display: contents }` y
    `.site-menu__toggle { display: none }`, así que el escritorio queda idéntico;
  - modo hamburguesa en `@media (max-width: 768px) and (scripting: enabled)`:
    - nav en una sola fila de 64 px sin padding vertical;
    - logo en block;
    - botón de 2,75 rem (44 px) con ::before ☰/✕ según aria-expanded;
    - panel con display none si está cerrado. Abierto: flex en columna, absoluto bajo el header
      (top 100 %), a todo el ancho, fondo var(--color-background), max-height
      calc(100dvh − var(--header-height)), overflow-y auto, enlaces de 2,75 rem y buscador a
      todo el ancho;
    - `:root { scroll-padding-top: var(--header-height) }`;
  - con max-height 500 px, `header.site-navbar { position: relative }`;
  - solo tokens, sin transiciones ni animaciones;
  - tokens.css (97), layout.css (99) y search-bar.css sin cambios.

## Verificación real: Chrome headless + CDP sobre astro preview (focus emulado)

| escenario | 375×812 | 768×1024 |
|---|---|---|
| header cerrado / abierto (REQ-79-09) | 65 / 65 | 65 / 65 |
| una fila; centro del logo y del botón respecto al nav (10/11) | sí; 0 / 0 | sí; 0 / 0 |
| botón (12) | 44×44, a 19 px del borde; ☰ → ✕ | 44×44; ☰ → ✕ |
| panel cerrado (13) | display none | display none |
| panel abierto (14/15) | top 64 (bajo el header), ancho 365 = viewport, fondo rgb(7, 7, 22), max-height 748 px (812 − 64), overflow auto, 3 enlaces de 44 px en columna, input de 337 px | ídem: ancho 758 y max-height 960 |
| clic real / Enter / Espacio (19) | alterna, con data-menu, aria-expanded y aria-label sincronizados | ídem |
| foco al abrir (20) | About | About |
| Escape (21) | cierra; foco en el BUTTON | ídem |
| Tab desde el botón cerrado (22) | sale del header (primera card) | ídem |
| scroll-padding-top (17) | 64px | 64px |

375×812:
- Clic fuera, en el main (REQ-79-23): cierra sin enfocar el botón.
- Navegación desde About del panel (REQ-79-24): llega a /about/ con data-menu closed,
  aria-expanded false y header de 65 px. El máximo del header medido por frame durante la
  navegación es 65.
- Resize (REQ-79-25): abierto a 375 y redimensionado a 1280 queda closed con el header de 65 px;
  al volver a 375 sigue closed.
- Búsqueda en el panel (REQ-79-26/27):
  - «solid» → menú abierto, portada oculta y 2 resultados en vivo;
  - 1.er Escape → término limpio, secciones restauradas, menú abierto y foco en el INPUT;
  - 2.º Escape → menú cerrado y foco en site-menu__toggle.

Anclas (REQ-79-28):
- #contenido: top 64 frente al bottom del header 65, a 375 y a 768 (dentro de la tolerancia de
  1 px del borde).
- Encabezado de post: top 64 (header fuera de la vista).

Escritorio 1280×800 (REQ-79-29): header [0, 0, 1270, 65], logo [32, 20, 72, 25], enlaces en
146/229/354 e input [998, 11, 240, 42]. IDÉNTICO a la línea base medida con el Layout previo,
restaurado temporalmente de git y luego devuelto. El botón queda con display none.

Sin JS a 375×812 (REQ-79-30, Emulation.setScriptExecutionDisabled y DOM.getBoxModel): header de
365×165 (como antes), About 37×18 e input de 347×42 visibles, y el botón sin caja.

CSP (REQ-79-31): recorrido con el ClientRouter portada → /about/ → /arquitectura/ → post →
/search → portada, abriendo y cerrando el menú en cada paso, con 0 violaciones
(securitypolicyviolation y log).

CLS en frío con la caché deshabilitada a 375×812 (REQ-79-32): [0, 0, 0], igual que la línea base
[0, 0, 0].

Capturas (REQ-79-33): progress/research/hamburger79/:
- h79-375-closed y h79-375-open;
- h79-768-closed y h79-768-open;
- h79-375-search, h79-375-nojs y h79-1280.

Nota: a 768 la primera medición cargó con el scroll restaurado de la prueba anterior (Chrome
conserva el scroll al recargar la misma URL) y el clic no acertó. Se repitió con scrollTo(0, 0) y
todo quedó correcto.

## Ronda 2 (CHANGES_REQUESTED en review_79.md)

1. Radio del botón: `var(--radius-pill)` (D4 del design), antes `--radius-thumb`. Computado:
   999px (píldora).
2. Padding del panel: `var(--gap-card) 2.5%` (D4). Medido con el panel abierto:

   | viewport | left del logo | left de los enlaces | left del input |
   |---|---|---|---|
   | 375 | 9 | 9, 9, 9 | 9 |
   | 768 | 19 | 19, 19, 19 | 19 |

   El contenido del panel queda alineado exacto con el logo, cuando antes estaba en 14.
3. Evidencia añadida:
   - REQ-79-13, con Accessibility.getFullAXTree a 375 y a 768: con el menú cerrado no hay ningún
     nodo «About» ni «Buscar…» en el árbol; con el menú abierto «About» sí aparece.
   - REQ-79-21, Escape:
     - con el foco en About (tras abrir), el menú queda closed y el foco en site-menu__toggle;
     - con el foco en el botón y el menú abierto, el menú queda closed y el foco en
       site-menu__toggle;
     - ambos casos a 375 y a 768.
- Capturas h79-{375,768}-{open,closed}.png regeneradas con el botón en píldora y el panel
  alineado.
- tests/mobile-hamburger-menu.test.mjs sigue en verde; suite y ./init.sh en verde.
