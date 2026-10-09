# Informe de implementación — feature 72 latest-articles-horizontal-scroll

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). Petición humana: scroll en X de las 3 cards de últimos artículos con GSAP,
solo en escritorio («probemos y si funciona bien lo dejamos»).

## Ciclo rojo/verde (REQ-72-31)

- Test nuevo tests/latest-articles-horizontal-scroll.test.mjs (100 líneas) escrito primero.
- ROJO: pass 0 / fail 6 (no existían componente, módulo ni hoja).
- VERDE: 6/6. Suite completa 818/818; ./init.sh en verde.
- Segundo rojo (REQ-72-24): el test de copyright daba un falso positivo, porque «GreenSock» y
  «gsap.com» también aparecen en el código. Se endureció para exigir el texto
  «@license Copyright …, GreenSock» → ROJO (el minificador borraba el aviso). Tras el ajuste
  del build, VERDE.

## Cambios

- src/components/latest-horizontal/latest-horizontal.ts (77 líneas):
  - gsap.registerPlugin(ScrollTrigger) a nivel de módulo.
  - init() llama a destroy() y crea gsap.matchMedia con
    '(min-width: 1201px) and (prefers-reduced-motion: no-preference)'.
  - Con menos de 2 cards no hace nada.
  - En el handler: añade latest-articles--horizontal y crea gsap.to(track) con
    x: () => trackOffset(1, section.clientWidth, n), ease 'none' y un scrollTrigger con
    trigger section, pin true, start 'top top', end () => '+=' + pinScrollLength(innerHeight, n),
    scrub true, invalidateOnRefresh true y anticipatePin 1.
  - focusin en el track → scrollTo(focusScrollTarget(...), behavior 'instant').
  - MutationObserver sobre [data-landing-sections][hidden] → ScrollTrigger.refresh().
  - ScrollTrigger.refresh() y reaplicación de history.state.scrollY.
  - La limpieza quita el listener, el observer y la clase. destroy() hace mm.revert().
- src/components/latest-horizontal/latest-horizontal.astro (11 líneas): importa la hoja y tiene
  un único script con astro:page-load → init() y astro:before-swap → destroy(). Sin marcado
  propio: mejora la sección .latest-articles existente.
- src/styles/latest-horizontal.css (32 líneas), todo bajo .latest-articles--horizontal:
  - Sección: width 100%, min-height 100vh y overflow clip.
  - Encabezado alineado al contenedor.
  - Track flex sin gap.
  - Cada card ocupa un slot del ancho de la sección: margin-inline calc((100% - W) / 2).
  - W = min(container, 95%, (100vh - 30rem) * 16/9 + 3.5rem): solo se reduce el ancho
    (REQ-72-08).
- src/pages/index.astro: importa y monta LatestHorizontal tras LatestArticles.
  latest-articles.astro y latest-articles.css sin cambios.
- astro.config.mjs: vite.build.rolldownOptions.output.comments.legal = true. Conserva los
  avisos @license de GSAP, que su licencia prohíbe retirar (REQ-72-24); afecta a todos los
  chunks del build y solo añade comentarios legales.
- Tests legacy (precedente REQ-43-06):
  - tests/reduced-motion.test.mjs (REQ-56-04): exime a latest-horizontal.ts, que consulta la
    preferencia para NO animar.
  - tests/gsap-dependency-approval.test.mjs (REQ-70-09): el único import de gsap es
    latest-horizontal.ts.
- Nota sobre REQ-72-01: latest-articles.astro mide 40 líneas con el conteo del arnés
  (split por salto de línea). La cifra 39 de la spec sale de wc -l porque el archivo no termina
  en salto de línea; el archivo no cambia.

### Hallazgo durante la verificación (corregido)

Al principio el final del recorrido no era alcanzable: x = -2523 en vez de -2540. La sección
fijada medía 789 px, menos que el viewport, y detrás no había contenido con alto: en local la
isla HTB no pinta nada y no hay footer. Con min-height 100vh en modo horizontal el documento
siempre llega a end.

## Verificación real: Chrome headless + CDP sobre astro preview

### Escritorio (REQ-72-07..13), con start = 1215

| viewport | p | scrollY | x del track (esperado) | top sección | card centrada (cx respecto al centro) | card (w×h, bottom) |
|---|---|---|---|---|---|---|
| 1280×800 | 0 | 1215 | 0 (0) | 0 | card 1 cx=0; cards 2/3 left=1593/2862 ≥ 1270 | 625×629, bottom 725 |
| 1280×800 | 0,5 | 2015 | -1270 (-1270) | 0 | card 2 cx=0 | |
| 1280×800 | 1 | 2815 | -2540 (-2540) | 0 | card 3 cx=0 | |
| 1440×900 | 0 | 1215 | 0 (0) | 0 | card 1 cx=0; cards 2/3 left=1744/3174 | 803×676, bottom 772 |
| 1440×900 | 0,5 | 2115 | -1430 (-1430) | 0 | card 2 cx=0 | |
| 1440×900 | 1 | 3015 | -2860 (-2860) | 0 | card 3 cx=0 | |

Hay un único .pin-spacer, la clase está presente y el encabezado queda en top=48. La card cabe
entera (bottom 725 < 800 y 772 < 900). Cero violaciones CSP en la portada (REQ-72-25).
tests/csp-enforce.test.mjs REQ-64-05/06 en verde sin modificar (REQ-72-26).

### Entrada y salida del pin sin saltos (REQ-72-14), 1280×800

Se añadió un relleno de 1200 px tras la sección y se avanzó en pasos de 10 px alrededor de start
y de end. La sección baja 10 px por paso hasta start, queda en top 0 durante el pin y sube
10 px por paso tras end. El relleno avanza 10 px en cada paso. Salto máximo extra: 0 px.

### Apilado (REQ-72-06), comparado con la misma página sin JavaScript

| caso | clase | pin-spacer | cards (w×h@left) | igual que sin JS |
|---|---|---|---|---|
| 1024×800 | no | 0 | 963×767, 963×767, 963×742 @25 | sí |
| 375×800 | no | 0 | 347×562, 347×562, 347×476 @9 | sí |
| 1280×800 con reduced motion | no | 0 | 1207×904, 1207×904, 1207×879 @32 | sí |

### Teclado (REQ-72-16), 1280×800

Con Tab real (Input.dispatchKeyEvent) desde el inicio, cada enlace de card enfocado deja su card
completa dentro del viewport: card 1, 2 y 3 en left 323/323/322, right 947, top 96, bottom 725.

### Ida y vuelta con ClientRouter (REQ-72-18/20), 1280×800, dos ciclos

Portada con scroll por debajo de la sección → About (navbar) → history.back():

| ciclo | scrollY antes | tras volver | history.state.scrollY | pin-spacer | modo horizontal |
|---|---|---|---|---|---|
| 1 | 2815 | 2815 | 2815 | 1 | sí |
| 2 | 2415 | 2415 | 2415 | 1 | sí |

### Búsqueda en vivo (REQ-72-21)

Al escribir «solid», la portada se oculta (hidden = true). Al vaciar la búsqueda, el pin-spacer
vuelve a top 1215 y alto 2400, idénticos a una carga limpia. Hay un solo pin-spacer.

### Clic en la tercera card con el pin activo (REQ-72-28)

Con el pin en p=1, un clic real (Input.dispatchMouseEvent) en la card 3 navega a
/posts/01-procesos-memoria/. En el post no queda ningún .pin-spacer.
Error de consola PREEXISTENTE, no causado por esta feature:
«Loading the script 'data:application/javascript,' violates ... script-src». Lo provoca el
router de Astro (node_modules/astro/dist/transitions/router.js:110), que inserta un script
module con src data: vacío para esperar a los scripts inline del destino. Se reproduce igual:
- a 1024 px, sin el efecto activo;
- EN PRODUCCIÓN, que tiene la CSP de la feature 64 pero no esta feature (portada → post).
No tiene impacto funcional: tras navegar a un post con código, astro:page-load se dispara y el
botón Copiar aparece (local y producción). Viene de la CSP obligatoria (64), cuya verificación
cargaba las páginas directamente y no por navegación del ClientRouter. Se propone al humano como
feature aparte.

### Peso y carga solo en la portada (REQ-72-22/23/24)

- Chunk latest-horizontal.astro_astro_type_script_index_0_lang.*.js: 115 327 B, 44 928 B gzip
  (límite 51 200). Incluye gsap, ScrollTrigger y el módulo.
- El test de build confirma que lo referencia solo index.html (posts, /search, /about y la 404
  no). Conserva los 3 avisos «@license Copyright 2008-2026, GreenSock».

### Capturas

progress/research/gsap72/: h72-1280-p0/p0.5/p1, h72-1440-p0/p0.5/p1, h72-stacked-1024,
h72-stacked-375, h72-stacked-1280-rm, h72-focus-1/2/3 y h72-click-post (.png).
