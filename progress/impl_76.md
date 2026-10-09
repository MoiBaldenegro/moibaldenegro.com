# Informe de implementación — feature 76 latest-cards-full-bleed

Implementado por el líder en rol de implementer (autorización humana; subagente implementer no
disponible). Feedback humano: «la idea de las cartas es que se sienta que salen y entran a través
de la página, no que se vean encerradas en su contenedor». Aclaración: «inicialmente sí empiezan
y terminan centradas». Decisión: opción B, con márgenes limpios en reposo («hazlo como la B
primero y luego vemos»); la A, dejar asomar a la vecina, queda como alternativa revisable.

## Ciclo rojo/verde (REQ-76-23)

- Escritos primero:
  - tests/latest-cards-full-bleed.test.mjs (73 líneas);
  - los ajustes de tests/latest-horizontal-compact-sticky.test.mjs (REQ-76-21: sin clip-path en
    la sección);
  - los ajustes de tests/latest-cards-entrance.test.mjs (REQ-76-22: sin clip-path en entering).
  Todos con nota REQ-43-06.
- ROJO: pass 9 / fail 5. Fallaban los 3 tests nuevos de dominio, hoja y efecto, y los 2 ajustados.
- VERDE: suite completa 835/835; ./init.sh en verde.

## Cambios

- src/domain/latest-horizontal.ts (73 líneas), funciones nuevas:
  - restMargin(inset, gap) = max(0, inset − gap);
  - edgeOffsets(p, n, inset, gap) = [−Δ·p, 0…, Δ·(1 − p)], con +0 en los extremos y [] si n < 3.
- src/components/latest-horizontal/latest-horizontal.ts (95 líneas): el desplazamiento del track
  pasa a una gsap.timeline con el mismo ScrollTrigger (único start 'top top', end
  pinScrollLength, scrub true, invalidateOnRefresh, ease none). En la misma línea de tiempo y en
  la posición 0 hay un fromTo de x para la primera y la última card, de edgeOffsets(0) a
  edgeOffsets(1), con inset = pairInset(V, W, G). La entrada de la 75 sigue animando solo el
  track.
- src/components/latest-horizontal/track-dom.ts: clearTrack limpia también los estilos en línea
  de las cards (clearInline).
- src/styles/latest-horizontal.css (51 líneas):
  - sin clip-path; el recorte lateral lo hace el overflow: clip de la sección, que mide el ancho
    de la ventana;
  - entering solo con overflow-y: visible;
  - card con transition-property: border-color, box-shadow, para que la x propia no transicione;
  - comentario desactualizado corregido.

## Verificación real: Chrome headless + CDP sobre astro preview

### Geometría (REQ-76-14..18), con sondas xL = inset/2 y xR = V − inset/2 a la altura de la card 2

| viewport | inset | Δ | p | cards [left, right] | x propia (1, 2, 3) | sonda izq./der. en card | sin scroll horizontal |
|---|---|---|---|---|---|---|---|
| 1280×800 | 31,75 | 17,75 | 0 | [31.8, 628] [642, 1238.3] [**1270**, 1866.3] | 0, 0, 17.75 | no / no | sí |
| 1280×800 | | | 0,5 | [−282.3, 314] [336.9, 933.1] [956, 1552.3] | −8.88, 0, 8.88 | **sí / sí** | sí |
| 1280×800 | | | 1 | [−596.3, **0**] [31.8, 628] [642, 1238.3] | −17.75, 0, 0 | no / no | sí |
| 1440×900 | 35,75 | 21,75 | 0 / 0,5 / 1 | card 3 left **1430** = V · cruzando · card 1 right **0** | ±21.75 | no·no / sí·sí / no·no | sí |
| 1600×700 | 340,89 | 326,89 | 0 / 0,5 / 1 | card 3 left **1590** = V · cruzando · card 1 right **0** | ±326.89 | no·no / sí·sí / no·no | sí |

- El par queda en las posiciones de la 73 al inicio (1-2) y al final (2-3).
- El recorrido sigue siendo 1:1: 610, 686 y 461 px.
- scrollWidth es igual a clientWidth en todos los puntos medidos: antes de la sección, con la
  entrada en 0,25 y 0,5, con el horizontal en 0, 0,5 y 1, y después del tramo fijado.

### Entrada de la 75 con la card 3 frente a V (REQ-76-26), 1280×800

| entrada | track y / scale | card 3 left (V = 1270) | x propia de la card 3 |
|---|---|---|---|
| 0 | −320 / 0,9 | 1206,5 (opacity 0: invisible) | 17,75 |
| 0,5 | −40 / 0,9875 | 1262,1 (asoma 7,9 px) | 17,75 |
| 1 | 0 / 1 | **1270** | 17,75 |

Durante la entrada, el scale del track (centrado) acerca la card 3 hasta 7,9 px al borde a mitad
de la entrada. Lo anticipó el spec_author; en reposo, al inicio del tramo fijado, el margen está
limpio. No hay scroll horizontal en ningún punto.

### Rueda real (REQ-76-19), 1280×800

296 frames (81 en el tramo fijado) con ráfagas de deltaY 40, 100 y 240, bajando y subiendo:
- translateY del track igual a entranceState: 0 desajustes;
- h2 fijo en el tramo fijado: 0 frames fuera;
- retrocesos del h2: 0;
- retrocesos del left de cualquier card en el sentido del scroll: **0**.

### Regresión de la 73 y la 75 (REQ-76-12/13/20)

- Apilado a 1024, a 375 y con reduced motion: sin estilos en el track ni en las cards, sin
  envoltorio y con las mismas medidas que sin JS.
- Reversión al redimensionar a 1024 y en astro:before-swap: ni el track ni las cards llevan
  atributo style.
- Teclado: las 6 comprobaciones dejan la card completa, con y = 0 y opacity 1.
- Ida y vuelta: 815 → 815 (y −40 = esperado) y 1825 → 1825.
- Búsqueda en vivo: el envoltorio queda en 1215 / 1410, igual que una carga limpia.
- CSP: 0 violaciones.
- Peso: 45565 B gzip.

### Capturas y peso

- progress/research/gsap76/: h76-{1280x800,1440x900,1600x700}-p{0,0.5,1}.png y
  h76-1280x800-entrance0.5.png. Con p 0,5 las cards se cortan en los bordes de la ventana.
- Peso: chunk de 117263 B y 45565 B gzip (≤ 51 200; test de build de la 72 en verde).

## Notas para el humano

- A mitad del recorrido el hueco entre cards crece Δ/2: unos 9 px a 1280×800, pero unos 163 px a
  1600×700, donde la card está limitada por alto y el margen es grande.
- La opción A (dejar asomar la vecina) es revertir las x propias; queda documentada como
  alternativa.
