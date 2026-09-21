# Análisis — Animación horizontal gobernada por el scroll con GSAP ScrollTrigger (main page)

> Requerimiento bruto del humano: "se acaba de autorizar el uso de la libreria GSAP
> para la pagina principal y hacerla mas atractiva las cards de los articulos en la
> main page se limitara a mostrar solo las 3 mas recientes y se le pondra scroll en
> Horizontal con GSAP". Decisiones humanas asumidas como contrato: GSAP autorizada
> solo para `src/pages/index.astro` (materializar en `docs/dependencies.md` + instalar
> vía pnpm en la primera feature); la main page muestra SOLO los 3 artículos más
> recientes en orden descendente por fecha reutilizando el orden del dominio;
> animación horizontal con GSAP para esas cards.
>
> CORRECCIÓN DE RUMBO del humano (2026-09-21, verbatim): "No es un carrusel atento
> como tal, es animacion pero con el scroll ojo con eso es IMPORTANTE por que es muy
> diferente la experiencia del usuario". Interpretación obligatoria: la feature 29 NO
> es un carrusel con scroll-snap ni una animación de entrada. Es una animación
> horizontal GOBERNADA POR EL SCROLL: el scroll vertical del usuario conduce la
> traslación horizontal de la pista de las 3 cards recientes con GSAP ScrollTrigger
> (patrón pin + scrub). Experiencia scroll-driven, no carrusel navegable.

## Qué es y alcance

- Convertir la sección "Últimos artículos" de la portada (`LatestArticles`, renderizada
  en `src/pages/index.astro`) en una sección fijada cuya pista de las 3 cards más
  recientes se traslada horizontalmente gobernada por el scroll vertical (pin + scrub
  de ScrollTrigger), haciéndolas más atractivas.
- Fuera de alcance: resto de páginas (`/search`, `/posts/[id]`, `/<término>`), resaltado
  del término, toggle grid/lista, cambios en el dominio de búsqueda (features 2-7).

## Qué toca

- Capas y archivos:
  - `package.json` + `docs/dependencies.md`: alta de `gsap` (scope `dependencies`,
    ya cerrada en la feature 28 — `### gsap`, `^3.15.0`). ScrollTrigger vive DENTRO
    del paquete `gsap` (`gsap/ScrollTrigger`): sin dependencia nueva, sin cambio al
    registro.
  - `src/components/latest-articles.astro` (34/100 líneas): limitar a 3 posts (ya
    hecho en la 28 con `.slice(0, 3)`) y marcado de sección fijable + pista;
    frontmatter solo imports + paso de datos (regla 8).
  - `src/styles/latest-articles.css` (97/100 líneas — margen de 3 líneas): disposición
    de pista horizontal para el recorrido del scrub, solo tokens. Compactar reglas
    existentes antes de pedir `blocked`.
  - Módulo cliente `.ts` nuevo (p. ej. `src/components/latest-articles-scroll.ts` o
    en `src/domain/` según decida el implementer): importa `gsap` + `ScrollTrigger`,
    crea el tween horizontal con pin + scrub, respeta `prefers-reduced-motion`,
    registra en `astro:page-load` con limpieza de triggers previos.
  - `src/domain/repositories/posts-repository.ts` (100/100 líneas — SIN margen): NO se
    toca; el orden descendente `byCreatedDesc` se reutiliza tal cual.
- Rutas: solo `/` (`src/pages/index.astro`, 36/100 líneas). `index.astro` ya embebe el
  índice de búsqueda y monta `SearchLive`; la sección animada convive dentro de
  `data-landing-sections` (el live search la oculta/muestra — sin cambios a ese contrato).
- Contratos a conservar: pares de transición `title-<id>` / `img-<id>` (REQ-24-03/05,
  feature 36), init en `astro:page-load` (feature 10, ClientRouter), `aria-current` del
  navbar y `scrollbar-gutter` (features 13-15, 8, 14) intactos.

## Investigación mínima (GSAP ScrollTrigger + Astro)

- GSAP 3.x (`gsap`, core) es una librería de animación por JS con licencia gratuita;
  `ScrollTrigger` es un plugin del MISMO paquete (`gsap/ScrollTrigger`), sin dependencia
  extra: se importa desde el `gsap` ya instalado en la feature 28. No requiere framework
  ni build especial: Astro/Vite lo empaqueta desde npm.
- Patrón pin + scrub: al entrar la sección en vista se fija (`pin: true`) durante un
  recorrido de scroll vertical y el progreso de ese recorrido se mapea 1:1 a la
  traslación horizontal de la pista (`scrub: true`); al agotarse el recorrido la sección
  se libera y la página continúa. El usuario conduce la animación con su scroll: si no
  hace scroll, no hay movimiento.
- Re-init con ClientRouter: cada navegación re-ejecuta el listener `astro:page-load`
  (feature 10); el módulo debe matar los triggers previos (`ScrollTrigger.getAll()` +
  `kill()`) antes de recrearlos para no duplicar pins entre visitas.

## Decisiones

- D1 (npm, no CDN): GSAP se instala vía `pnpm add gsap` y se importa desde el módulo
  cliente (cerrado en la feature 28). Descartado el `<script src="cdn">`: no queda
  registrado en `package.json`, el validador `validate-dependencies.mjs` no lo audita,
  rompe el build offline y la política "sin dependencias externas sin registro".
- D2 (CORREGIDA 2026-09-21 — ScrollTrigger es el núcleo): la decisión anterior ("core
  sin ScrollTrigger, carrusel con snap") queda INVERTIDA por la corrección verbatim del
  humano. La base funcional es el pin + scrub de ScrollTrigger: el scroll vertical
  conduce la pista horizontal. El carrusel navegable con scroll-snap + animación de
  entrada pasa a ser la alternativa descartada (ver design.md de la 29). Sin JS la
  sección degrada a las 3 cards visibles en disposición estática: ScrollTrigger solo
  mejora, nunca es requisito para ver el contenido.
- D3 (excepción a estático por defecto): el JS de runtime queda justificado y
  documentado en la spec (precedentes features 4/5/24): animación scroll-driven no
  trivial + degradado declarado.
- D4 (movimiento reducido): con `prefers-reduced-motion: reduce` el módulo omite la
  animación ScrollTrigger y muestra el contenido estático visible (accesibilidad).
- D5 (degradado sin JS): sin JavaScript la portada muestra las 3 cards visibles sin
  animación; ScrollTrigger solo mejora, nunca es requisito para ver el contenido.
- D6 (límite a 3 en presentación, no en dominio): `PostsRepository.getPosts()` ya ordena
  descendente por fecha española (`byCreatedDesc`); la selección de los 3 primeros vive
  en la capa de presentación (componente + helper `.ts` si hace falta), sin tocar el
  repositorio (100/100) ni el esquema.
- D7 (sin design.md en la feature 28): la 28 es alta de dependencia + selección de
  datos (no cambia estilos ni layout); el `design.md` vive solo en la 29, que sí toca
  presentación.
- D8 (re-init en navegación): el script de la sección se registra en
  `astro:page-load` (precedente feature 10), no con init directo, por el ClientRouter;
  incluye limpieza de triggers previos para no acumular pins entre visitas.
- D9 (convivencia live-search): la sección animada vive dentro de `data-landing-sections`;
  con consulta activa el panel `SearchLive` la oculta (modo resultados intacto, contrato
  features 5/10 sin cambios); al vaciar la consulta se restaura y el trigger se refresca
  (`ScrollTrigger.refresh()`) en el re-init. La sección animada nunca rompe el modo
  resultados.
- D10 (mobile ≤768px): el gesto vertical sigue conduciendo la pista (touch); la pista
  conserva el responsive existente y ningún overlay bloquea el scroll vertical. Con
  movimiento reducido o viewport que no admita el recorrido, contenido estático visible.

## Riesgos y trabas

- R1 (presupuesto de líneas): `latest-articles.css` está en 97/100 y
  `posts-repository.ts` en 100/100. El implementer compacta reglas existentes antes de
  pedir `blocked`; el repositorio NO se toca en este ciclo. Si la pista no cabe en
  ≤100 líneas, la feature pasa a `blocked` con justificación (regla 12).
- R2 (live search): el panel `SearchLive` oculta `data-landing-sections` al buscar; el
  trigger debe refrescarse al restaurar (listener `astro:page-load` + `refresh()`; no se
  cambia el contrato de la feature 10). La sección animada no rompe el modo resultados.
- R3 (validador de dependencias): `check-format.mjs` falla si `package.json` declara
  `gsap` sin entrada `### gsap` aprobada; resuelto en la feature 28 (done): la 29 no
  añade dependencias porque ScrollTrigger es parte del paquete `gsap`.
- R4 (mobile ≤768px): el recorrido del pin debe medirse sin bloquear el scroll vertical
  táctil; sin overlay que capture el gesto. Con `prefers-reduced-motion`, estático.
- R5 (pins duplicados con ClientRouter): sin limpieza de triggers previos, cada visita
  a `/` acumularía un pin; el módulo mata los triggers existentes antes de recrearlos.

## Descomposición (complejidad media → 2 features)

- Feature 28 `gsap-setup-recent-limit` (base, depende de nada, DONE): entrada `### gsap`
  en `docs/dependencies.md` + `pnpm add gsap` + portada limitada a los 3 más recientes.
- Feature 29 `horizontal-scroll-gsap-cards` (UI, `depends_on: [28]`, PENDING
  re-especificada 2026-09-21): sección fijada con pista horizontal conducida por el
  scroll vertical vía gsap + ScrollTrigger (pin + scrub) + `prefers-reduced-motion` +
  degradado sin JS (3 cards visibles) + pares de transición + convivencia live-search +
  re-init `astro:page-load` con limpieza de triggers. NO es carrusel navegable ni
  animación de entrada.

## Decisión full-bleed (2026-09-21, reporte UX del humano)

> Reporte verbatim: "si esta funcionando el scroll pero esta raro porque funciona
> dentro del contenedor, tiene que verse la experiencia fluida porque se ve el hero
> que se va y se queda pegado en contenedor y el scroll dentro del contenedor. La
> experiencia debe ser que las cards atraviesan la web completa, tienen que estar
> fuera de ese container, de un lado al otro van".

- Diagnóstico: la animación de la feature 29 (done) funciona pero quedó encerrada en
  la columna de contenido (`.latest-articles { width: min(var(--container-max), 95%) }`):
  el hero se va con el scroll normal, la sección fijada queda "pegada" dentro de la
  caja y `distance() = track.scrollWidth - section.clientWidth` mide el recorrido
  contra el ancho de la columna, no del viewport. Sensación resultante de scroll
  interno en lugar de travesía fluida de lado a lado.
- D11 (full-bleed, técnica de salida del container): la sección fijada rompe la
  columna sin moverla de `index.astro` — solo CSS: `width: 100vw` (o `100dvw` donde
  aplique) con `margin-inline: calc(50% - 50vw)` y `max-width: none`, de modo que
  ocupa todo el ancho del viewport de borde a borde. El hero y el resto de secciones
  conservan su columna y su desplazamiento normal; solo la sección del pin sale del
  container. Sin mover marcado entre componentes y sin tocar `index.astro`.
- D12 (recorrido de lado a lado): la pista se dimensiona contra el viewport y las 3
  cards recientes la atraviesan completa de un lado al otro conducidas por el scroll
  vertical. El mecanismo scroll-driven se conserva intacto (ScrollTrigger pin + scrub,
  `ease: none`, `invalidateOnRefresh`, `ScrollTrigger.refresh()`); el único ajuste de
  JS permitido es recalcular `distance()` contra el ancho del viewport en vez del
  `clientWidth` de la sección. Sin JS nuevo: sin plugins, sin dependencias, sin
  listeners adicionales.
- D13 (hero con scroll normal): el hero (`NewHero`) no se fija ni se envuelve en el
  pin; se desplaza con el flujo normal de la página y queda atrás al entrar la sección
  fijada, que al agotar su recorrido libera y deja continuar la página. Nunca contenido
  dentro de una caja con scroll interno.
- D14 (mobile ≤768px y movimiento reducido): en ≤768px el gesto vertical sigue
  conduciendo la pista full-bleed sin overlays que capturen el gesto; con
  `prefers-reduced-motion: reduce` se omite la animación y el contenido queda estático
  y visible; sin JS las 3 cards quedan visibles en disposición estática full-bleed.
  Pares de transición `title-<id>` / `img-<id>` y convivencia live-search
  (`data-landing-sections`, `ScrollTrigger.refresh()` al restaurar) intactos.
- D15 (restricciones): solo tokens de `tokens.css`; ≤100 líneas por archivo
  (`latest-articles.css` tiene margen: 83/100; `latest-articles-scroll.ts` 65/100;
  compactar antes de pedir `blocked`); `posts-repository.ts` (100/100) no se toca;
  estilos fuera del `.astro`; lógica en el módulo `.ts` existente.

## Descomposición (feature 30, cambio solo de layout)

- Feature 30 `full-bleed-scroll-cards` (`depends_on: [29]`, pending): la sección
  fijada sale del container y ocupa todo el ancho del viewport; la pista recorre de
  lado a lado conducida por el scroll vertical; hero con desplazamiento normal;
  3 cards, transiciones, live-search, reduced-motion y degradado sin JS intactos.

## Decisión timing del pin + centrado vertical (2026-09-21, reporte UX del humano)

> Reporte verbatim: "va bien, pero se quedan super abajo las cards cuando
> empiezan a hacer el scroll, y lo demas sigue haciendo el scroll en Y entonces
> quedan abajo y se ve como el hero se va y queda la pagina en blanco, vamos a
> arreglar eso".

- Diagnóstico: el pin full-bleed de la feature 30 (done) conserva el mecanismo
  scroll-driven (ScrollTrigger pin + scrub, `ease: none`, `invalidateOnRefresh`,
  `refresh()`, registro en `astro:page-load` con limpieza) pero engancha
  DEMASIADO ABAJO: `start: 'top center'` fija la sección cuando su borde
  superior alcanza el centro del viewport, de modo que al empezar el recorrido
  horizontal la pista ocupa la mitad inferior (cards abajo, casi fuera de vista)
  mientras el resto sigue en scroll Y. Entre la salida del hero y el enganche
  tardío queda un HUECO EN BLANCO: el hero ya se fue y la pista aún no es
  visible/protagonista. Lo verificado en disco: `latest-articles-scroll.ts`
  (línea 62, `start: 'top center'`) y `latest-articles.css` (sección full-bleed
  sin altura ni centrado vertical durante el pin).
- D16 (enganche temprano, solo timing): el trigger adelanta su `start` a un
  punto anterior al actual (`'top center'` → enganche temprano, p. ej. la
  entrada de la sección por el borde inferior del viewport) de modo que el pin
  se activa ANTES, con la pista ya visible al empezar el recorrido; el `end`
  se recalcula en coherencia (`+=distance()`, sin alargar ni acortar el
  recorrido de lado a lado). El mecanismo pin + scrub, `ease: none`,
  `invalidateOnRefresh`, `refresh()`, registro en `astro:page-load` con
  limpieza y `distance()` contra el viewport (feature 30) se conservan; el
  único JS que cambia es el `start`/`end` del trigger. Sin plugins, sin
  dependencias, sin listeners nuevos.
- D17 (pista centrada durante el pin, solo posicionamiento): la sección fijada
  centra la pista verticalmente en el viewport durante todo el pin (p. ej.
  altura de viewport con flex + centrado y contenido justificado al centro),
  de modo que las cards quedan CENTRADAS y visibles de principio a fin del
  recorrido horizontal, nunca abajo ni fuera de vista. La salida full-bleed
  (`100vw` + `margin-inline: calc(50% - 50vw)`, feature 30) se conserva; el
  cambio es solo vertical (altura + alineado), con tokens de `tokens.css`.
- D18 (sin hueco en blanco): con el enganche temprano + la pista centrada, la
  transición hero → pin no deja página en blanco: al irse el hero la sección
  ya está fijada y protagonista, y al agotarse el recorrido libera y la página
  continúa. El hero conserva su desplazamiento normal (no se fija, no entra en
  el pin, D13 intacta); la sección sigue dentro de `data-landing-sections`
  (convivencia live-search intacta, `refresh()` al restaurar).
- D19 (contratos intactos y restricciones): recorrido de lado a lado full-bleed
  con `distance()` contra el viewport, 3 cards, pares `title-<id>`/`img-<id>`,
  live-search, `prefers-reduced-motion` (estático visible) y degradado sin JS
  (3 cards visibles) intactos. Solo tokens; ≤100 líneas por archivo
  (`latest-articles.css` 86/100, `latest-articles-scroll.ts` 70/100: compactar
  antes de pedir `blocked`); `posts-repository.ts` (100/100) no se toca;
  estilos fuera del `.astro`; lógica en el módulo `.ts` existente. Valores
  exactos de `start`/`end` y de altura/alineado los fija el implementer en el
  ciclo rojo/verde contra la spec (test-first); esta decisión fija el QUÉ
  (temprano + centrado + sin hueco) y el PORQUÉ, no los literales.

## Descomposición (feature 31, ajuste de timing/posicionamiento del pin)

- Feature 31 `pin-timing-center` (`depends_on: [30]`, pending): el pin engancha
  temprano con la pista visible y centrada en el viewport; sin hueco en blanco
  entre el hero y la sección; recorrido lado a lado, full-bleed, pares,
  live-search, reduced-motion y degradado sin JS intactos.

## Regresión de la feature 31 (2026-09-21, reporte del humano)

> Reporte verbatim: "solo quedó ahora un espacio gigante sin contenido y el
> scroll dejó de funcionar".

- Síntoma: tras la feature 31 (done, `start: 'top bottom'` + sección fijada con
  `min-height: 100vh` + flex column centrado), la portada muestra un hueco
  gigante vacío y el scroll vertical deja de funcionar. La suite node:test
  sigue en verde: los tests existentes son de INSPECCIÓN (regex sobre el
  fuente: asercionan los literales `start: 'top bottom'`, `pin: true`,
  `scrub`, `min-height: 100vh`, `refresh()`) y UNITARIOS sobre funciones puras
  (`trackShift`, `viewportDistance`, `shouldBuildTrigger`, `landingHidden`).
  Ningún test mide layout en runtime (ni `scrollWidth` real, ni altura del
  pin-spacer insertado por ScrollTrigger, ni continuidad del scroll vertical),
  de modo que la suite no puede capturar este fallo de runtime: de hecho los
  tests de la 31 FIJAN como correctos los valores que causan la regresión
  (`pin-timing-center.test.mjs` exige `start: 'top bottom'` y prohíbe
  `'top center'`).
- Causa raíz (combinada, verificada en disco):
  - (a) VERIFICADA como causa primaria — `start: 'top bottom'` + sección de
    `min-height: 100vh` + `pinSpacing` por defecto: `latest-articles-scroll.ts`
    línea 64 (`start: 'top bottom'`) con `pin: true` línea 66 SIN declarar
    `pinSpacing`, y `latest-articles.css` líneas 31-37 (`.latest-articles--scroll`
    con `min-height: 100vh` + flex column centrado). Con pin, ScrollTrigger
    inserta un pin-spacer cuya altura = altura de la sección (ya 100vh) +
    recorrido `end` (`+=distance()`, línea 65, donde `distance()` =
    `track.scrollWidth - window.innerWidth` con 3 cards a `flex: 0 0 78%`,
    es decir, ~2 anchos de viewport). Resultado: un spacer de ~100vh +
    recorrido completo que se recorre con la sección ya fijada ANTES de que
    haya contenido visible (el pin engancha cuando el borde superior toca el
    borde inferior del viewport, con la sección aún fuera de vista) → el
    "espacio gigante sin contenido" reportado.
  - (b) VERIFICADA como causa contributiva — valores funcionales en `x`/`end`
    + `invalidateOnRefresh` + imágenes lazy desestabilizan `distance()`:
    líneas 57-68 (`x: () => -distance()`, `end: () => \`+=${distance()}\``,
    `invalidateOnRefresh: true`) + `ScrollTrigger.refresh()` incondicional
    línea 71 + `loading="lazy"` en `latest-articles.astro` línea 19. Cada
    carga diferida de imagen cambia `track.scrollWidth` → con
    `invalidateOnRefresh` cada refresh recalcula `distance()` y la altura del
    pin-spacer → saltos de layout y cadena de refreshes que degrada/congela el
    scroll vertical. Los tests solo asercionan que `refresh()` EXISTE, nunca
    que esté acotado o vigilado.
  - (c) DESCARTADA como causa raíz, confirmada como agravante — `overflow:
    hidden` + pin: línea 32 del CSS (`.latest-articles--scroll` con
    `overflow: hidden`). No genera el spacer (lo genera el pin), pero recorta
    la pista durante la traslación y hace que el hueco se perciba vacío: la
    sección fijada no muestra contenido útil mientras se atraviesa el spacer.
    El test REQ-31-02/04 solo prohíbe `overflow: auto/scroll` (scroll interno),
    nunca valida la compatibilidad de `hidden` con el pin.
  - (d) VERIFICADA como causa contributiva — medición de `track.scrollWidth`
    antes del layout definitivo: `distance()` (línea 56) lee `track.scrollWidth`
    en vivo en cada invocación, pero `initLatestScroll` corre en
    `astro:page-load` (`latest-articles.astro` línea 38) con imágenes lazy y
    fuentes aún sin asentar; la primera medición fija un `end` y un spacer que
    luego `invalidateOnRefresh` corrige a otro valor → el spacer salta y el
    scroll se percibe roto. No existe ninguna función pura que acote
    (`clamp`) el espaciado: `viewportDistance` solo hace `Math.max(0, ...)`
    sin cota superior ligada al recorrido real.
- Dirección del fix (feature 32, bugfix sobre la 31): acotar el espaciado del
  pin al recorrido real (configuración del pin + `end` calculado contra el
  viewport, sin spacer gigante), estabilizar `distance()` con funciones puras
  que calculen/acoten start/end/distancia testeables en node:test, evitar
  bucles de refresh (refresco vigilado, no incondicional), conservar el
  recorrido lado a lado, el enganche temprano visible, el centrado vertical,
  los pares `title-<id>`/`img-<id>`, el live-search, el reduced-motion y el
  degradado sin JS.

## Persistencia de la regresión tras la feature 32 (2026-09-21, reporte del humano)

> Reporte verbatim: "NO, se vio absolutamente ningún cambio, sigue
> completamente roto todo" (tras la feature 32, que acotó el spacer y vigiló
> el refresh).

- Veredicto: diagnóstico del líder CONFIRMADO con evidencia en disco. La
  feature 32 no podía cambiar nada visible porque conservó intacta la causa
  raíz primaria: el `start` que esconde el contenido.
- Evidencia (verificada en disco):
  - `src/components/latest-articles-scroll.ts` línea 75 conserva
    `start: 'top bottom'` con `pin: true` (línea 77). Con pin, ScrollTrigger
    fija la sección en la posición que ocupa al enganchar: con 'top bottom'
    el borde superior de la sección toca el borde inferior del viewport, es
    decir, la sección queda FIJADA FUERA DE VISTA (bajo el pliegue) durante
    TODO el recorrido del pin. El scrub mueve la pista horizontalmente pero
    INVISIBLE: el usuario atraviesa el recorrido completo de scroll en blanco
    y percibe "espacio gigante sin contenido + scroll roto".
  - La feature 32 solo tocó lo secundario: `clampPinDistance` (líneas 37-40),
    `distance()` acotada (línea 67) y refresco vigilado (líneas 83-84, sin
    `invalidateOnRefresh`). Ninguno de esos cambios mueve el punto de
    enganche: el pin sigue activándose con la sección fuera de vista, de modo
    que acotar el spacer y vigilar el refresh no altera ni un píxel visible.
    Por eso "no se vio ningún cambio".
  - El CSS conserva `min-height: 100vh` + flex column centrado
    (`src/styles/latest-articles.css` líneas 31-37): con el enganche fuera de
    vista, ese viewport de altura se recorre a ciegas igualmente.
  - Consecuencia: la premisa de la feature 31 ("enganche temprano =
    'top bottom'", D16) estaba INVERTIDA: temprano pero invisible. Sus tests
    (`tests/pin-timing-center.test.mjs` líneas 64-80) FIJAN 'top bottom' y
    prohíben 'top center'; `tests/pin-spacer-scroll-fix.test.mjs` línea 128
    también fija 'top bottom' (REQ-32-03). Ambos deben actualizarse con
    justificación en el encabezado (precedente REQ-43-06: los tests siguen a
    la presentación real).
- Dirección del fix (feature 33, bugfix sobre la 32): receta estándar del
  UX — `start: 'top top'` con sección de `min-height: 100vh`: al enganchar,
  la sección llena el viewport y el recorrido horizontal es visible; antes,
  el hero se va con scroll normal y la sección entra en vista con scroll
  normal. Sin blancos. Se conservan el recorrido lado a lado full-bleed, el
  centrado vertical, las 3 cards, los pares `title-<id>`/`img-<id>`, el
  live-search, el reduced-motion y el degradado sin JS; el espaciado acotado
  y el refresco vigilado de la 32 se conservan.
- Nota de verificación (no es feature): el dev server corre en
  http://localhost:4321 con HMR; el humano debe recargar duro (Ctrl+Shift+R)
  tras el fix para descartar caché.

## Por qué el horizontal no se mueve aunque el spacer se fue (2026-09-21)

> Reporte verbatim: "ya se fue el espacio pero el scroll horizontal no funciona".

- Estado verificado en disco: `src/components/latest-articles-scroll.ts`
  líneas 67-76 (`distance()` vía `clampPinDistance(track.scrollWidth,
  innerWidth)`, `x: () => -distance()`, `end: () => '+='+distance()`,
  `start: 'top top'`, `pin: true`, `scrub: true`, sin
  `invalidateOnRefresh` por la 32). Suite verde: fallo de runtime,
  invisible a node:test (los tests son de inspección/unitarios, no miden
  layout real).
- Verificación de hipótesis del líder (con evidencia, sin asumir):
  - (a) CONFIRMADA como causa primaria — `distance()` vale 0 al construir
    el tween. Firma exacta del síntoma: con `end: '+=0'` el pin queda de
    longitud cero → sin spacer (coincide con "se fue el espacio") y el
    scrub no tiene recorrido → `x` congelado en `-0` (coincide con "no
    funciona"). Ninguna otra hipótesis explica AMBOS síntomas a la vez.
    El código permite el 0: medición única al crear (la clase
    `latest-articles--scroll` se añade en la línea 64 justo antes de
    medir, con el layout aún sin asentar: fuentes, imágenes lazy y
    estilos recién aplicados), sin guarda contra el 0 y sin
    `invalidateOnRefresh` (quitado en la 32 por los bucles de refresh).
    Un 0 inicial queda congelado para siempre aunque el layout asiente
    después: la 32 quitó el refresh incondicional y el péndulo quedó en
    el otro extremo (sin re-medición vigilada no hay corrección).
  - (b) CONFIRMADA como mecanismo de persistencia — sin
    `invalidateOnRefresh` los valores funcionales del tween (`x`) se
    evalúan una sola vez en la creación y nunca se corrigen; el
    `refresh()` vigilado al `load` (líneas 83-84) recalcula posiciones
    pero no re-invoca el `x` del tween. Posible split-brain: `end`
    corregido al asentar + `x` congelado en el 0 inicial.
  - (c) DESCARTADA como causa general — retorno temprano por
    `landingHidden`/`prefersReduced`: la sección vive dentro de
    `[data-landing-sections]` (`src/pages/index.astro` líneas 27-29)
    pero el HTML estático NO declara `hidden`; el atributo solo aparece
    con consulta activa (`search-live.ts` líneas 52-53). Con `/` plano
    el guarda deja construir. Se conserva como guarda válido.
  - (d) DESCARTADA — nodo equivocado o scrub sin progreso: selectores
    verificados en disco (`data-latest-scroll` en
    `latest-articles.astro` línea 9, `data-latest-track` línea 11), el
    tween apunta al track y `scrub: true` está declarado (línea 78).
- Límite honesto: node:test no mide `scrollWidth`/`innerWidth` reales;
  el valor exacto en el navegador del humano no es verificable desde
  disco. Por eso la feature 34 exige observabilidad (atributo con la
  distancia + marca en consola) además del fix.
- Cómo observarlo en runtime (el humano puede abrir consola/DevTools):
  1. Abrir `/` con la consola abierta y recarga dura (Ctrl+Shift+R).
  2. Leer `data-pin-distance` en `section[data-latest-scroll]`: es la
     distancia medida que usan `x` y `end`. Si vale `0`, causa (a)
     confirmada en ese navegador.
  3. Consola: marca `[latest-scroll]` al construir y al re-medir tras
     asentar el layout (distancia inicial vs. final).
  4. Elements: comprobar el `.pin-spacer` envolviendo la sección (su
     altura es el recorrido del pin) y el `transform: translateX` del
     track cambiando al avanzar el scroll vertical.
- Dirección del fix (feature 34, bugfix sobre la 33): medir tras asentar
  el layout, NUNCA construir un pin de longitud cero (si la distancia
  es 0 se difiere y se reintenta de forma vigilada, sin bucles),
  sincronizar `x` con el `end` medido (`end > 0` ligado a la distancia),
  exponer la distancia como observable. Se conservan 29/30/31/33
  (scroll-driven, full-bleed lado a lado, enganche visible `top top`,
  centrado vertical), espaciado acotado + refresco vigilado de la 32,
  3 cards, pares `title-<id>`/`img-<id>`, live-search, reduced-motion
  y degradado sin JS.
