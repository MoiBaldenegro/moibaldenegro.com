# Informe de implementación — feature 75 latest-cards-entrance

Implementado por el líder en rol de implementer (autorización humana; subagente implementer no
disponible). Petición humana: que las cards «salgan de encima y se claven» donde empieza el
scroll horizontal, ligado al scroll. El humano confirmó la interpretación del líder.

## Ciclo rojo/verde (REQ-75-27)

- Test nuevo tests/latest-cards-entrance.test.mjs (72 líneas) escrito primero.
  ROJO: pass 0 / fail 5.
- VERDE: 5/5. Suite completa 831/831; ./init.sh en verde. Los tests de las features 71, 72 y 73
  siguen en verde sin modificarse (REQ-75-28).

## Cambios

- src/domain/latest-entrance.ts (35 líneas), funciones puras:
  - entranceEase = 1 − (1 − p)³ (cúbica de salida, sin rebote);
  - entranceDistance = 0,4 · vh;
  - entranceState = { y: −d·(1 − e), scale: 1 − 0,1·(1 − e), opacity: e }, exactamente
    { +0, 1, 1 } con p ≥ 1;
  - entranceProgress;
  - con entradas inválidas devuelven el estado final.
- src/components/latest-horizontal/latest-horizontal.ts (91 líneas), en setup tras el tween de x:
  - gsap.fromTo(track) de entranceState(0, innerHeight) a { y: 0, scale: 1, opacity: 1 },
    con ease entranceEase y ScrollTrigger sobre el envoltorio: start 'top bottom',
    end 'top top', scrub true, invalidateOnRefresh y
    toggleClass latest-articles--entering en la sección. Sin pin.
- Corrección hallada en la verificación: el ancho de card se medía con el track escalado al 0,9
  por la entrada, así que el recorrido salía de 551 px en vez de 610 y la card 3 no llegaba a su
  sitio. cardWidth = getBoundingClientRect().width / gsap.getProperty(track, 'scale').
- src/components/latest-horizontal/track-dom.ts (nuevo, 20 líneas), separado para no pasar de
  100 líneas:
  - restoreScroll (movido de la 73);
  - clearTrack (REQ-75-20): los tweens revertidos dejaban `transform: translate(0px, 0px)` en
    línea; se limpia en destroy y en la limpieza de matchMedia (queueMicrotask), salvo si el
    efecto se ha recreado.
- src/styles/latest-horizontal.css (52 líneas): con .latest-articles--horizontal.latest-articles--entering,
  la sección lleva overflow-y visible y clip-path inset(-100vh var(--latest-pair-inset) 0), y el
  h2 lleva position relative y z-index 1.

## Verificación real: Chrome headless + CDP sobre astro preview

### Estados de la entrada (REQ-75-12/13/22), scroll = wrapperTop − vh + p·vh

| viewport | p | y | scale | opacity | clase entering | h2 top |
|---|---|---|---|---|---|---|
| 1280×800 | 0 | −320 | 0,9 | 0 | no (aún antes del start) | 848 |
| 1280×800 | 0,25 | −135 | 0,9578 | 0,5781 | sí | 648 |
| 1280×800 | 0,5 | −40 | 0,9875 | 0,875 | sí | 448 |
| 1280×800 | 1 = inicio del tramo fijado | 0 | 1 | 1 | no | 48 |
| 1440×900 | 0 / 0,25 / 0,5 / 1 | −360 / −151,88 / −45 / 0 | 0,9 / 0,9578 / 0,9875 / 1 | 0 / 0,5781 / 0,875 / 1 | — | 948 / 723 / 498 / 48 |

- En el inicio del tramo fijado x = 0, y = 0, scale 1 y opacity 1 exactos, así que el
  horizontal arranca sin salto.
- Con el horizontal en 0 y en 1, las cards quedan en el par 1-2 (31.8-628 | 642-1238.3) y en el
  par 2-3, con un recorrido de 610 a 1280×800 y 686 a 1440×900 (iguales a la 73).

### Rueda real (REQ-75-16/17/18/29), 1280×800

- Eventos mouseWheel con deltaY 40, 100 y 240 en ráfagas, bajando desde 900 px antes del
  envoltorio hasta pasar el tramo fijado y subiendo hasta scrollY 0. Registro por
  requestAnimationFrame: 294 frames, 64 de ellos dentro de la entrada.
- y nunca > 0 y siempre igual a la curva de su scroll o del scroll del frame anterior (±1 px):
  **0 desajustes**.
- Monotonía en el sentido del scroll: **0 rupturas**.
- Durante el tramo fijado, y = 0, scale = 1 y opacity = 1: **0 frames fuera**. El h2 queda en
  top 48 (±1 px) en todo el tramo fijado, con 0 retrocesos al entrar y al salir.
- Al subir hasta arriba el track vuelve a y = −320 (entranceState(0)).

### Otros escenarios

- Apilado (REQ-75-19): a 1024, a 375 y a 1280 con reduced motion el track no tiene atributo
  style, no hay clase entering ni envoltorio, y las cards son iguales que sin JS.
- Reversión (REQ-75-20): al redimensionar de 1280 a 1024 y en astro:before-swap el track no
  tiene atributo style, la sección no lleva la clase entering y no queda envoltorio.
- Durante la entrada (REQ-75-14/30), corregido en la ronda 2: la afirmación de la ronda 1 de
  que el header no se veía era errónea. Medición CDP con la entrada en p 0,05, 0,1 y 0,25
  (1280×800: scrollY 455, 495 y 615; 1440×900: 360, 405 y 540). En todos los casos:
  - la clase latest-articles--entering está presente y el header está a la vista (top 0,
    bottom 75);
  - elementFromPoint en el centro de .site-navbar devuelve el header;
  - un barrido cada 60 px a lo largo de la fila del header no encuentra ningún punto fuera del
    header;
  - el track ni siquiera llega a la zona del header (top ≥ 574 a 1280 y ≥ 632 a 1440).
  REQ-75-30 se cumple. elementFromPoint sobre el texto del h2 a mitad de la entrada devuelve el
  h2. Capturas: h75-header-{1280,1440}-p{0.05,0.1,0.25}.png.
- Teclado (REQ-75-21), con foco emulado: desde 900 y 400 px antes del envoltorio, el focus de
  cada una de las 3 cards lleva al tramo fijado. Card completa, y = 0 y opacity 1 en los 6 casos.
- Ida y vuelta (REQ-75-23): desde la mitad de la entrada, 815 → 815, history 815 e
  y = −40 = esperado. Desde debajo de la sección, 1825 → 1825 e y = 0. Un envoltorio en ambos
  casos.
- Búsqueda en vivo (REQ-75-24): el envoltorio queda en top 1215 y alto 1410, igual que una
  carga limpia.
- CSP y peso (REQ-75-25): 0 violaciones en la portada. Chunk de 116 733 B y 45 353 B gzip
  (≤ 51 200), sin dependencias nuevas.

### Capturas

progress/research/gsap75/: h75-{1280x800,1440x900}-e0 / e0.25 / e0.5 / e1 y -pinstart (.png).

## Ronda 2 (CHANGES_REQUESTED en review_75.md)

1. REQ-75-30: medición del header visible durante la entrada añadida arriba (sin cambios de
   código, porque el requisito se cumple).
2. Observaciones no bloqueantes atendidas:
   - doble línea en blanco eliminada en latest-horizontal.ts (91 líneas);
   - el test REQ-75-09/10/11 ahora exige scrub, invalidateOnRefresh, start, end y ease DENTRO
     del bloque gsap.fromTo(track …), para distinguirlo del tween de x de la 73;
   - REQ-75-27 incluye track-dom.ts;
   - cifras de líneas corregidas.
3. Suite y ./init.sh en verde tras los cambios.
