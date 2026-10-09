# Diseño — Cards de borde a borde del viewport en el horizontal de «Últimos artículos» (feature 76 latest-cards-full-bleed)

> Feedback humano (2026-10-09, tras probar 73-75): «la idea de las cartas es que se sienta que
> salen y entran a través de la página, no que se vean encerradas en su contenedor».
> Enmienda B (2026-10-09): «inicialmente sí empiezan y terminan centradas, ojo» y «la idea
> principal era como la A, pero hazlo como la B primero, se escucha interesante, y luego vemos».
> Análisis: progress/research/cards_full_bleed.md (§7).

## Contexto visual

- Pantalla: portada, sección `.latest-articles` en el modo horizontal de la 73 (≥1201 px, sin
  reduced motion, ≥3 cards), incluida la entrada de la 75.
- Estado actual: `clip-path: inset(0 var(--latest-pair-inset))` (REQ-73-15) y, durante la
  entrada, `clip-path: inset(-100vh var(--latest-pair-inset) 0)` (REQ-75-15) recortan el track
  en los bordes del par: las cards aparecen y desaparecen a ~32-36 px del borde de la ventana.
- Estado deseado (opción B):
  - **Reposo inicial (p = 0):** par 1-2 centrado exactamente como en la 73, márgenes laterales
    limpios; la card 3 está entera fuera de la ventana, pegada a su borde derecho.
  - **Recorrido (0 < p < 1):** la card 1 se aleja hacia la izquierda algo más rápido que el track
    y cruza el borde izquierdo de la ventana; la card 3 entra cruzando el borde derecho. Las cards
    se cortan en los bordes de la ventana, no en los del par.
  - **Reposo final (p = 1):** par 2-3 centrado como en la 73, márgenes limpios; la card 1 entera
    fuera, pegada al borde izquierdo.

## Geometría (no cambia el track ni el recorrido de la 73)

- `travel = (n − 2)(W + G)`, scroll 1:1 (`pinScrollLength`), `inset = pairInset(V, W, G)`.
- Margen de reposo `Δ = restMargin(inset, G) = max(0, inset − G)`.
- x propia de cada card (además de la x del track), `edgeOffsets(p, n, inset, G)`:
  card 1 → `−Δ·p`; card n → `+Δ·(1 − p)`; intermedias → `0`.
- Comprobación n = 3:
  - p = 0: card 3 `left = inset + 2(W + G) + Δ = V` → margen derecho limpio; par 1-2 intacto.
  - p = 1: track en `−(W + G)`; card 2 en `inset`, card 3 en `inset + W + G` (par 2-3 intacto);
    card 1 `right = inset − G − Δ = 0` → margen izquierdo limpio.
  - p = 0,5: la separación entre card 1 y card 2 (y entre 2 y 3) es `G + Δ/2`; es inherente a B.

| viewport | V | W | inset | Δ | card 3 left p=0 | card 1 right p=1 | p=0,5: card 1 / card 3 |
|---|---|---|---|---|---|---|---|
| 1280×800 | 1270 | 596,25 | 31,75 | 17,75 | 1270 | 0 | −282,25…314 / 956…1552,25 |
| 1440×900 | 1430 | 672,25 | 35,75 | 21,75 | 1430 | 0 | cruza borde izq. / cruza borde der. |
| 1600×700 | 1590 | 447,11 | 340,89 | 326,89 | 1590 | 0 | −53,11…394 / 1196…1643,11 |

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--gap-card` | 14px | gap del track (sin cambios); G de Δ, leído con getComputedStyle como en la 73 |
| `--latest-card-width` / `--latest-pair-inset` (locales de la 73) | W / (V − 2W − G)/2 | posición del par (sin cambios); dejan de usarse en el recorte |

No se añaden tokens ni literales nuevos. `transition-property` usa nombres de propiedad, no valores.

## Decisiones y constraints

- **Hoja `latest-horizontal.css`:**
  - Regla base de la sección: se borra `clip-path`; se conservan `width: 100%` y `overflow: clip`
    (recorte en los bordes de la ventana, sin contenedor de scroll ni scroll horizontal).
  - Regla de entrada: se borra el `clip-path`; queda `overflow-y: visible` (computa
    `overflow-x: clip; overflow-y: visible`). El encabezado conserva `position: relative;
    z-index: 1`.
  - Regla de la card en horizontal: `transition-property: border-color, box-shadow;`. La card
    lleva `transition: var(--transition-default)` (all, 280 ms) en latest-articles.css; sin esta
    regla el transform que pone el scrub iría con retraso. Se conservan los efectos de hover.
- **Dominio (`src/domain/latest-horizontal.ts`, hoy 51 líneas):** se añaden `restMargin(inset,
  gap)` y `edgeOffsets(progress, count, inset, gap)`, puras, con las guardas del módulo
  (count entero ≥ 3, tamaños finitos, progress acotado con `clamp01`) y `0 − Δ·p` para no
  devolver −0.
- **Efecto (`latest-horizontal.ts`, hoy 91 líneas):** el tween del track pasa a una línea de
  tiempo (o equivalente) con el MISMO ScrollTrigger del horizontal (trigger envoltorio, start
  'top top', end `() => '+=' + pinScrollLength(...)`, `scrub: true`, `invalidateOnRefresh: true`,
  `ease: 'none'`) que anima a la vez `x` del track (trackOffset) y `x` de la primera y la última
  card desde `edgeOffsets(0, …)` hasta `edgeOffsets(1, …)` con valores función (se recalculan en
  cada refresh). `inset = pairInset(section.clientWidth, cardWidth(), gap())`, con el ancho de card
  corregido por la escala de la entrada como hoy. Ninguna otra fuente de verdad (ni listener de
  scroll ni segundo ScrollTrigger). Con `fromTo` (immediateRender) la card n queda en `+Δ` desde la
  carga, también durante la entrada. Si el archivo supera 100 líneas, la parte de las cards va a un
  módulo hermano llamado desde `setup` (p. ej. `card-edges.ts`). Deben seguir pasando las
  inspecciones de la 72/73 (`x: () =>`, `ease: 'none'`, `end: () => … pinScrollLength`, sin `pin:`
  ni `onRefresh`) y la de la 75 (ningún `gsap.to/fromTo` con el selector `latest-articles__card`:
  se usan las referencias `cards[0]` y `cards[n − 1]`).
- **Entrada (75):** sigue animando solo el track (REQ-75-11).
- **Limpieza:** `clearTrack` (track-dom.ts) se extiende —o se añade una utilidad hermana— para
  quitar `transform`/`translate` y el `style` vacío de cada card tras revertir.
- **Teclado:** sin cambios; focusScrollTarget lleva a p = 0 o p = 1 (n = 3), donde el par está
  intacto y la card enfocada completa.
- Restricciones: estilos solo en `src/styles/latest-horizontal.css` con `.latest-articles--horizontal`
  en todos los selectores; latest-articles.css no se toca (su test fija 98 líneas); sin
  dependencias; ≤100 líneas por archivo.

## Punto a vigilar: la entrada de la 75

Durante la entrada el track está escalado (scale 0,9 → 1) con origen en su centro (V/2). Con la
card n en `left = V`, al escalar su borde queda en `V/2 + s·V/2`, es decir, puede asomar hasta
`(1 − s)·V/2` (≈ 63 px a 1280 con s 0,9, pero con opacity 0; ≈ 8 px con la entrada en 0,5 y opacity
0,875). En el reposo inicial (inicio del tramo fijado, s = 1) el margen ya queda limpio. La
verificación registra el left de la card n frente a V con la entrada en 0, 0,5 y 1; si el humano
quiere el margen limpio también durante la entrada, se abre una feature aparte (no se improvisa).

## Verificación visual (Chrome headless + CDP sobre astro preview)

- 1280×800, 1440×900 y 1600×700, progreso horizontal 0, 0,5 y 1:
  - p = 0: card n con `left ≥ V − 0,5`; par 1-2 en REQ-73-12 (±2 px); sondas xL y xR fuera de card.
  - p = 1: card 1 con `right ≤ 0,5`; par 2-3 en REQ-73-14 (±2 px); sondas fuera de card.
  - p = 0,5: alguna card con `left < inset` o `right > V − inset`; sondas xL y xR en card.
- `scrollWidth === clientWidth` antes de la sección, en la entrada, en el tramo fijado y después.
- Rueda real (Input.dispatchMouseEvent mouseWheel): h2 constante en el tramo fijado, left de cada
  card monótono, sin saltos en la unión entrada → horizontal.
- Entrada de la 75 intacta (REQ-75-12/13 y la serie de rueda).
- Capturas en progress/research/gsap76/.

## Alternativa A (revisable, no se implementa ahora)

- Quitar solo el recorte lateral sin x propia de las cards: en reposo asoma la card vecina en el
  margen (17,75 px a 1280×800, 21,75 px a 1440×900, 326,89 px a 1600×700). Era «la idea
  principal» del humano; se probará después de ver la B. Pasar de B a A = eliminar las x de las
  cards (restMargin/edgeOffsets dejan de usarse) y conservar el CSS sin clip-path.

## Alternativas descartadas

- `clip-path: inset(-100vh 0 0)` en entering: equivalente, pero `overflow-x: clip` ya lo resuelve.
  Plan B solo si la verificación mostrara scroll horizontal (se para y se enmienda REQ-76-01).
- `overflow: visible` completo durante la entrada: añadiría scroll horizontal al documento.
- Ensanchar el par o cambiar el recorrido: cambiaría las posiciones de la 73.
- Un segundo ScrollTrigger o un listener de scroll para las cards: dos fuentes de verdad y
  riesgo de desfase de un frame con rueda real.
