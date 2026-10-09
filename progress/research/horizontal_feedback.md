# Feedback humano de la feature 72 y violación CSP del router (features 73 y 74)

Fecha: 2026-10-09. Autor: spec_author. Fuentes: feedback humano tras probar la 72 en producción,
diagnóstico del líder, progress/impl_72.md, specs/71_* y specs/72_*, código de
src/components/latest-horizontal/, src/styles/latest-horizontal.css,
src/domain/latest-horizontal.ts, node_modules/astro 7.3.8 y dist/ del último build.

## 1. Problema (en palabras propias)

Feedback humano, literal y resumido: «gsap funciona pero las cards tienen un espacio gigante entre
ellas; no queremos que tengan tanto espacio, que se vean corridas, pegaditas. Si es muy poco
contenido al pegarlas podemos subir tal vez a 4 [...] o igual, y si nada más sale la tercera y ya
se queda en el centro, pero corridas, porque hay demasiado espacio. Hay un saltito medio extraño
al llegar también; no se nota si vas rápido, pero yo lo alcanzo a ver en la leyenda "Últimos
artículos".»

Hay tres problemas:

- A. **Espacio.** En la 72 cada card ocupa un slot del ancho de la sección (V). Su
  margin-inline es calc((100% - W) / 2). A 1280×800 (V = 1270, W = 625) quedan unos 645 px
  vacíos entre dos cards.
- B. **Ritmo.** El pin dura (n - 1) × 100vh: 1600 px de rueda para 2540 px de recorrido. Con
  cards juntas el recorrido baja a unos 1278 px. Mantener 100vh por card daría un
  desplazamiento lento y desacoplado de la rueda.
- C. **Salto al llegar.** El encabezado «Últimos artículos» da un salto visible al entrar en el
  pin, con rueda o trackpad reales.

## 2. Diagnóstico

### 2.1 Espacio y geometría nueva (feature 73)

Modelo nuevo:

- Cards contiguas en un track flex con `gap: G`. G = var(--gap-card) = 14 px, el mismo gap que
  separa las cards apiladas en latest-articles.css. El líder sugería ese token o un múltiplo.
  Decisión del spec_author, revisable.
- El track lleva `padding-inline: calc((100% - W) / 2)` (W = --latest-card-width). Con x = 0 la
  card 0 queda centrada.
- Centro de la card i: V/2 + i·(W + G) + x.
- Recorrido: travel = (n - 1)·(W + G). x final = -travel deja centrada la última card.

Cifras (W medido en impl_72: 625 a 1280×800 y 803 a 1440×900; V = clientWidth):

| viewport | V | W | inset (V-W)/2 | card 2 left | parte visible de la card 2 | card 3 left | travel |
|---|---|---|---|---|---|---|---|
| 1280×800 | 1270 | 625 | 322,5 | 961,5 | 308,5 px (~49 %) | 1600,5 (fuera) | 1278 |
| 1440×900 | 1430 | 803 | 313,5 | 1130,5 | 299,5 px (~37 %) | 1947,5 (fuera) | 1634 |

Así la segunda card asoma «a la mitad» por la derecha, como pide el humano. La tercera entra
durante el recorrido y termina centrada.

**3 cards o 4.** Se mantienen 3 (decisión del líder, revisable; el humano lo deja abierto con «o
igual»). Alternativa documentada y NO implementada: subir a 4 posts. Habría que cambiar
LATEST_POSTS_LIMIT = 3 en src/domain/latest-posts.ts (feature 30). Eso afecta también al layout
apilado de móvil y tablet y a los tests de la feature 30, que fijan 3. La geometría nueva es
genérica en n, así que el cambio quedaría acotado a esa constante y sus tests. Si el humano lo
quiere, va en una feature aparte.

### 2.2 Longitud del scroll (feature 73)

Scroll vertical del tramo fijado = travel en px (1:1). Cada píxel de rueda mueve un píxel el
track. A 1280×800 son 1278 px de scroll, menos que los 1600 actuales. Decisión revisable.
pinScrollLength pasa a depender de W, G y n, no de la altura del viewport.

### 2.3 Salto al llegar (feature 73)

Medición del líder: con scrollTo programático, píxel a píxel alrededor del inicio del pin, el h2
queda clavado en top = 48 (CDP), sin salto. Por tanto el salto viene del scroll real con rueda o
trackpad. Causa: el scroll de la página lo hace el compositor de forma asíncrona, y el pin de
ScrollTrigger pasa la sección a position: fixed desde JS, un frame después. Durante ese frame la
sección ya se ha desplazado con la página y luego vuelve a su sitio. anticipatePin: 1 lo agrava,
porque fija antes de tiempo con una estimación de velocidad.

Solución: quitar el pin de ScrollTrigger y fijar con CSS, que el compositor resuelve en el mismo
frame que el scroll:

- latest-horizontal.ts inserta un envoltorio (clase `latest-articles--horizontal-pin`) en la
  posición de la sección y mete la sección dentro. Es el mismo patrón de nodo insertado por JS que
  code-copy; no se toca el marcado de latest-articles.astro (REQ-30-15).
- Alto del envoltorio = alto de la sección + pinScrollLength. Se recalcula en cada refresh (resize
  o búsqueda en vivo) antes de que ScrollTrigger mida (evento refreshInit o equivalente).
- La sección lleva `position: sticky; top: 0` con la clase de modo horizontal.
- Se mantiene `min-height: 100vh` en la sección (hallazgo de la 72: sin él el final no era
  alcanzable cuando no hay contenido detrás). Con sección ≥ viewport, el tramo sticky dura
  exactamente alto envoltorio − alto sección = pinScrollLength.
- ScrollTrigger se usa solo como scrub de x: trigger el envoltorio, start 'top top',
  end '+=' + pinScrollLength (equivale a 'bottom bottom' cuando la sección mide un viewport),
  scrub true, ease none, invalidateOnRefresh, sin pin ni anticipatePin.
- Al revertir (astro:before-swap o salida de la media query), la limpieza vuelve a colocar la
  sección en el lugar del envoltorio y lo elimina. El DOM queda como sin JS.

Comprobaciones sobre sticky:

- Ningún ancestro de la sección (.home__landing, main, body) tiene overflow distinto de visible.
  Las reglas de overflow del repo están en hero, article, post y profile, no en ancestros.
  `overflow: clip` en la propia sección no crea contenedor de scroll.
- Con `html, body { height: 100% }` (layout.css:6) el header solo es sticky en el primer viewport
  (impl_61). Esto no afecta: la restricción de sticky la da el padre (el envoltorio), y la sección
  se pega al viewport, que es el contenedor de scroll.

Verificación exigida: scroll real con eventos de rueda por CDP (Input.dispatchMouseEvent con
type mouseWheel y deltaY variados: 40, 100, 240 y ráfagas rápidas, en ambos sentidos). Durante el
scroll, un registro por requestAnimationFrame del getBoundingClientRect().top del h2. Mientras
está fijado debe ser constante (±1 px). Al entrar y salir no debe haber retrocesos: la serie es
monótona en el sentido del scroll. A esto se suman las mediciones de la 72 que siguen aplicando:
centrado ±2 px de la primera y la última card, apilado sin cambios en ≤1200 px, reduced motion y
sin JS, teclado, ida y vuelta con ClientRouter, búsqueda en vivo, clic, CSP y peso.

### 2.4 Qué toca la 73

- src/domain/latest-horizontal.ts (feature 71): nuevas firmas puras: trackTravel(W, G, n),
  pinScrollLength(W, G, n) = travel, centeringInset(V, W), trackOffset(p, W, G, n),
  cardCenterX(i, V, W, G, x). focusScrollTarget sigue igual: con paso uniforme, la card i queda
  centrada en p = i/(n-1). Tests de la 71 ajustados con el precedente REQ-43-06.
- src/components/latest-horizontal/latest-horizontal.ts: envoltorio sticky, sin pin ni
  anticipatePin, W y G medidos del DOM (offsetWidth de la card y column-gap calculado del track).
  Si se acerca a 100 líneas, se separa en un módulo hermano (p. ej. sticky-wrapper.ts).
- src/styles/latest-horizontal.css: gap var(--gap-card), padding-inline de centrado, sin
  margin-inline por card, position sticky y top 0, regla del envoltorio. Todos los selectores
  siguen conteniendo `.latest-articles--horizontal` (REQ-72-27).
- tests/latest-articles-horizontal-scroll.test.mjs: hoy exige 'pin:' y 'anticipatePin'. Se
  ajusta (REQ-43-06) y se crea un test nuevo para la 73.

### 2.5 Riesgos

- Restauración del scroll al volver atrás: el envoltorio cambia el alto del documento igual que
  el pin-spacer. Se mantiene restoreScroll y se verifica con dos ciclos.
- Refresh en bucle: si el alto del envoltorio se cambia dentro de onRefresh, se dispara otro
  refresh. Hay que cambiarlo en refreshInit (antes de medir) o con un ResizeObserver, nunca en
  onRefresh.
- transition:name de las cards con transform del track: igual que en la 72.
- Safari y sticky con transform en el hijo: el transform va en el track, no en el elemento
  sticky, así que no hay problema.

## 3. Violación CSP del router (feature 74, prioridad baja)

### 3.1 Causa

node_modules/astro/dist/transitions/router.js:104-110 (runScripts): tras un swap, si el ÚLTIMO
`<script type="module">` no ejecutado del documento nuevo es inline (sin src), el router añade
`<script type="module" src="data:application/javascript,">` para esperar a que se ejecuten los
módulos inline. La CSP vigente (REQ-64-11, `script-src 'self' 'unsafe-inline'
https://static.cloudflareinsights.com`) no permite `data:` y el navegador registra la violación.
No tiene impacto funcional: onerror resuelve la espera, page-load se dispara y Copiar funciona.

Qué páginas la provocan (dist/client del último build, último script module de cada HTML):

- Los posts terminan en un `<script type="module">` inline: code-copy.astro, que Astro inlinea
  por medir menos de 4096 B (plugin-scripts.js, shouldInlineScriptChunk + shouldInlineAsset con
  build.assetsInlineLimit).
- La portada, /search, /about y la 404 terminan en un script externo. La portada tiene el
  cargador inline de la server island HTB (`data-astro-rerun`), pero no es el último.

### 3.2 Opciones

1. **Añadir `data:` a la CSP.** Para no ampliar worker-src (que hereda de script-src), en una
   directiva script-src-elem: `script-src-elem 'self' 'unsafe-inline'
   https://static.cloudflareinsights.com data:`. Como 'unsafe-inline' ya permite cualquier
   script inline inyectado, el riesgo extra es pequeño. Aun así, abre una vía nueva y explícita
   de script desde URL data: (inyecciones que filtren `<script>` inline pero no src=data:), y
   obliga a cambiar REQ-64-11 y las constantes de dos tests. No es la recomendada.
2. **Que ningún HTML termine en un script module inline (recomendada).** Configurar
   `vite.build.assetsInlineLimit` como función en astro.config.mjs. Devuelve false para los
   chunks de script de componentes Astro (ruta con `astro_type_script`) y undefined para el
   resto, de modo que los demás assets siguen con el límite por defecto de 4096 B. Astro 7.3.8
   respeta la función (core/build/plugins/util.js shouldInlineAsset). code-copy pasa a ser un
   chunk externo `/_astro/code-copy...js`, que 'self' ya permite. El router deja de insertar el
   script data: y la CSP no cambia. Coste: una petición HTTP más, pequeña y cacheable, en los
   posts. Riesgo residual: si la server island quedara como último script de una página, el
   router volvería a insertar el data:. Se cubre con un test de build que comprueba que el último
   `<script type="module">` de cada HTML tiene src.
3. **CSP nativa de Astro (`security.csp`, hashes).** Descartada: la documentación de Astro dice
   que no admite `<ClientRouter />` ni los estilos inline de Shiki (ya anotado en
   security-headers.ts), y además no autoriza un `src=data:`.
4. **Nonce o hash.** No aplica: un hash o nonce autoriza scripts inline, no una URL data:.
5. **Quitar server:defer de HTB o el ClientRouter.** Fuera de alcance; cambia la arquitectura de
   las features previas.

Recomendación: la opción 2. Si el humano prefiere no tocar el build, la alternativa es la 1 con
script-src-elem.

### 3.3 Verificación exigida

Con Chrome headless + CDP sobre astro preview con la CSP vigente se navega con el ClientRouter
(clics reales en enlaces, no cargas directas): portada → post con bloque de código → portada →
/about → /search → post. En cada paso se registran las violaciones de CSP
(Log.entryAdded/Runtime.consoleAPICalled o el evento securitypolicyviolation) y debe haber cero.
También se comprueba que Copiar aparece y funciona tras navegar a un post y que astro:page-load
se dispara en cada destino. Si es posible, se repite en producción tras el deploy (lo hace el
humano).

## 4. Features

- 73 latest-horizontal-compact-sticky: cards contiguas, scroll 1:1, sticky CSS y geometría
  ajustada. Toca UI: lleva design.md.
- 74 csp-router-inline-script: sin `<script type="module">` inline final en el build; CSP
  intacta. depends_on [73], prioridad baja, al final del backlog.

## 5. Enmienda de la 73 (2026-10-09): par de cards a todo el ancho

Se aplica antes de implementar; la 73 sigue pending. Instrucción humana, literal y resumida:
«Lo de empezar con la primera card en el centro era porque una card ocupaba todo el ancho; ahora
las metiste un poco más pequeñas y me gustan, pero creo que podemos meter 2 para que ocupen todo el
ancho, y que al final del scroll queden las últimas 2, que serían la 2 y la 3. Ahorita solo se
renderizan las últimas 3, pero igual después podemos ver si lo ampliamos; de momento enfócate en
que todo funcione bien.»

Esta enmienda sustituye el modelo de §2.1, §2.2 y §2.4 («primera card centrada y la segunda
asomando», recorrido (n − 1)(W + G), centeringInset y cardCenterX). El diagnóstico y la solución
del salto (§2.3) y los riesgos (§2.5) siguen vigentes.

### 5.1 Geometría nueva

- V = ancho de la sección (clientWidth).
- C = min(var(--container-max), 95%) de V: el contenedor del encabezado.
- G = var(--gap-card) = 14 px.
- L = límite por alto de la 72: (100vh − 30rem)·16/9 + 3.5rem.
- W = min((C − G)/2, L): dos cards y un gap llenan C, salvo que el alto obligue a reducirlas.
- inset = (V − 2W − G)/2.
  - Si el par llena C, coincide con el margen del contenedor: card 1 alineada con el h2.
  - Si L recorta W, el par queda centrado en la sección y el h2 toma el ancho del par (2W + G)
    para seguir alineado con la card 1.
- Borde izquierdo de la card i: inset + i·(W + G) + x.
- Recorrido = scroll del tramo (1:1) = (n − 2)·(W + G).
  - Al inicio se ven las cards 1 y 2; al final, las n − 1 y n (la 2 y la 3).
  - Con n ≤ 2 no hay recorrido: el efecto no se activa y queda el apilado actual.

| viewport | V | C | L | W | inset | recorrido (n = 3) |
|---|---|---|---|---|---|---|
| 1280×800 | 1270 | 1206,5 | 624,9 | 596,25 | 31,75 | 610,25 |
| 1440×900 | 1430 | 1358,5 | 802,7 | 672,25 | 35,75 | 686,25 |
| 1920×900 | 1910 | 1500 | 802,7 | 743 | 205 | 757 |
| 1600×700 | 1590 | 1500 | 447,1 | 447,1 | 340,9 | 461,1 |

A 1280×800 la card pasa de 625 (la 72, el tamaño que le gustó al humano) a 596,25. La reducción
es pequeña y el par llena el contenedor. 1600×700 es el caso de REQ-73-13 (par centrado y más
estrecho que el contenedor).

### 5.2 Decisiones del spec_author (revisables)

- **Recorte en los bordes del par.** Sin recorte, la card 3 asomaría unos 18 px por el margen
  derecho a 1280×800 (left 1252,25 frente a un viewport de 1270), y lo mismo la card 1 por la
  izquierda al final. Parecería un fallo. La sección lleva `clip-path: inset(0
  var(--latest-pair-inset))`. Coste: la sombra de hover se recorta en los laterales del par.
- **Todos los % contra V.** El track no lleva padding. Si lo llevara, el % del ancho de las cards
  se resolvería contra un ancho distinto. Por eso el inset va como margin-inline-start de la
  primera card. Las custom properties `--latest-card-width` y `--latest-pair-inset` se declaran
  en la sección y se resuelven donde se usan, siempre contra V. El final del track no necesita
  relleno: x se fija con el recorrido calculado.
- **W medida con getBoundingClientRect().width.** offsetWidth redondea 596,25 a 596 y acumula
  error en el recorrido.
- **focusScrollTarget.** Con el track desplazado k·(W + G) se ven las cards k y k+1. Para la card
  i se toma k = clamp(i − 1, 0, n − 2):
  - las dos primeras llevan al inicio y la última al final;
  - la card enfocada siempre queda completa en el par.
- **Tramo corto.** Con 3 posts y scroll 1:1, el tramo fijado dura unos 610 px de rueda a
  1280×800 (unas 6 muescas). Es lo que pide el modelo; si al humano le resulta corto, se revisa.

### 5.3 Funciones puras (feature 71, tests ajustados con REQ-43-06)

- pairCardWidth(C, G, maxW) = min((C − G)/2, maxW).
- pairInset(V, W, G) = max(0, (V − 2W − G)/2).
- trackTravel(W, G, n) = (n − 2)(W + G) con n entero ≥ 3.
- pinScrollLength(W, G, n) = trackTravel.
- trackOffset(p, W, G, n) = −clamp(p)·trackTravel.
- cardLeftX(i, V, W, G, x) = pairInset + i(W + G) + x. Sustituye a cardCenterX.
- focusScrollTarget(i, n, start, end) con k = clamp(i − 1, 0, n − 2).
- Guardas: con datos inválidos todas devuelven 0 sin lanzar, y focusScrollTarget devuelve start.
  El efecto exige al menos 3 cards. El test de la 72 que pedía «al menos dos» se ajusta.

### 5.4 Qué se mantiene

- Del plan anterior de la 73: sticky CSS en un envoltorio creado por JS en lugar del pin de
  ScrollTrigger, sin anticipatePin. El alto del envoltorio se recalcula en refreshInit, nunca en
  onRefresh. ScrollTrigger se usa solo como scrub de x, y la limpieza desenvuelve y restaura el
  DOM.
- La verificación con eventos mouseWheel reales por CDP: top del h2 por frame, ±1 px durante el
  tramo y sin retrocesos al entrar ni al salir.
- De la 72:
  - layout apilado idéntico en ≤1200 px, con reduced motion y sin JS;
  - teclado, ida y vuelta con ClientRouter, búsqueda en vivo y clic;
  - CSP, y GSAP solo en la portada (≤51200 B gzip);
  - capturas a 1280×800 y 1440×900 con p 0, 0,5 y 1, más 1600×700 con p 0.

### 5.5 Fuera de alcance

- **Ampliar a 4 o más posts** («igual después podemos ver si lo ampliamos») es una decisión
  futura del humano y no se implementa. LATEST_POSTS_LIMIT sigue en 3 (REQ-73-33). La geometría
  es genérica en n, así que bastaría con cambiar la constante y sus tests en una feature aparte.
- La 74 no cambia.

Artefactos: specs/73_latest-horizontal-compact-sticky/requirements.md (REQ-73-01..34 reescritos),
design.md, y la entrada 73 de feature_list.json (title, description, acceptance y nota_retomar).

## 6. Enmienda de la 74 (2026-10-09): data: solo en script-src-elem (opción A)

### 6.1 Hallazgo que la motiva

Con assetsInlineLimit (REQ-74-01/02/04, implementado y en verde) la violación desaparece al
entrar en los posts: code-copy pasa a ser un chunk `/_astro/` y Copiar funciona. Pero al VOLVER
a la portada con el ClientRouter sigue apareciendo `script-src-elem data`. El router (runScripts)
salta los scripts ya ejecutados en la sesión, así que el último módulo PENDIENTE del documento
nuevo es el cargador inline de la server island de HTB, que Astro genera siempre inline. El
router inserta `<script type="module" src="data:application/javascript,">`. El test de build
(último script module con src) no lo detecta porque se trata de un estado de runtime. La 74
quedó blocked (REQ-74-07).

Decisión humana: «sobre la 74 vamos a permitirlo, opción A».

### 6.2 Política nueva (REQ-74-03, sustituye a REQ-64-11 como vigente)

Valor completo y exacto, en este orden (script-src-elem justo detrás de script-src):

```
default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; script-src-elem 'self' 'unsafe-inline' https://static.cloudflareinsights.com data:; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'
```

- Al declararse, script-src-elem SUSTITUYE a script-src para los elementos `<script>` (no se
  combinan): por eso repite 'self', 'unsafe-inline' y el origen del beacon de Web Analytics.
  Si se omitiera el beacon, la CSP bloquearía Web Analytics otra vez (REQ-64-11/12).
- script-src no cambia (REQ-74-07): sigue rigiendo los atributos de evento (script-src-attr no
  se declara y hereda de script-src), eval (sin 'unsafe-eval') y worker-src (hereda de script-src,
  así que los workers no reciben data:). Por eso data: va en script-src-elem y no en script-src.
- data: queda limitado a img-src y script-src-elem (REQ-74-10).

### 6.3 Riesgo residual

Bajo. La política ya concede 'unsafe-inline' a los elementos script: quien consiga inyectar un
`<script>` en el HTML ya puede ejecutar código inline. data: solo añade la variante `src=data:`,
útil para saltar filtros que bloquean el contenido inline pero no el atributo src. El sitio es
estático, sin entrada de usuario renderizada en servidor (la búsqueda escapa en cliente). La
mitigación real de XSS (quitar 'unsafe-inline' con hashes o nonces) es inviable hoy: la CSP nativa
de Astro no admite el ClientRouter ni los estilos de Shiki (§3.2).

Navegadores sin script-src-elem (Chrome < 75, Firefox < 108, Safari < 15.4) aplican script-src:
verán la violación sin impacto funcional, como hasta ahora.

### 6.4 script-src-attr

No hace falta declararlo. Sin script-src-attr, los atributos de evento heredan de script-src, que
no cambia, así que la enmienda no amplía nada en atributos. Endurecerlo (`script-src-attr 'none'`)
cerraría los manejadores inline, pero exige auditar Astro, Shiki y los componentes (atributos
onload/onerror). Queda fuera de alcance; el humano puede pedirlo como feature aparte.

### 6.5 Qué se mantiene y qué cambia

- Se mantiene: assetsInlineLimit en astro.config.mjs y su test (REQ-74-01, 02 y 04). Sigue
  evitando el data: en la mayoría de navegaciones y reduce la dependencia de la excepción.
- Cambia: REQ-74-03 (antes «CSP sin cambios») pasa a ser el valor nuevo. REQ-74-07 deja de ser
  la condición de parada y pasa a ser el invariante de script-src. REQ-74-10..15 son nuevos.
- Archivos de producción: src/domain/http/security-headers.ts y public/_headers.

### 6.6 Tests afectados (precedente REQ-43-06)

- Constantes CSP de tests/csp-enforce.test.mjs, tests/security-headers.test.mjs y
  tests/csp-router-inline-script.test.mjs: pasan al valor de REQ-74-03 con nota de ajuste de la
  74. El test REQ-74-03 de csp-router-inline-script deja de exigir la CSP de REQ-64-11.
- Test de build REQ-64-05 (csp-enforce): `allowed` clasifica por `${kind}-src`, es decir, los
  scripts por script-src. Pasa a usar script-src-elem para los scripts (REQ-74-13). Los orígenes
  coinciden, pero así refleja la directiva que de verdad aplica el navegador. data: sigue
  rechazado en los src de script del HTML del build: el data: solo lo inserta el router en
  runtime. REQ-64-12 (beacon) se valida con esa clasificación (REQ-74-11).
- tests/csp-enforce.test.mjs mide 100 líneas: el ajuste no puede añadir líneas netas.
- REQ-64-11 (test que pide el beacon en script-src) sigue siendo cierto y no cambia.

### 6.7 Verificación

- Preview (implementer): Chrome headless + CDP sobre astro preview, con clics reales del
  ClientRouter: portada → post con código → portada → /about → /search → post con vídeo. Cero
  violaciones en cada paso, incluida la vuelta a la portada. Copiar funciona, astro:page-load se
  dispara y la isla HTB carga. Se registran en impl_74.md el antes (REQ-64-11) y el después.
- Producción (humano, tras el deploy): la misma navegación con cero violaciones y el beacon de
  Web Analytics respondiendo 200, sin bloqueo del POST a /cdn-cgi/rum (REQ-74-14).

Artefactos: specs/74_csp-router-inline-script/requirements.md (REQ-74-01..15) y la entrada 74 de
feature_list.json (description, 12 acceptance, status pending, sin blocked_reason).
