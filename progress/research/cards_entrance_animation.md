# Entrada de las cards desde arriba antes del scroll horizontal (feature 75)

Autor: spec_author, 2026-10-09. Feature: 75 latest-cards-entrance (pending, depends_on [73]).
Spec: specs/75_latest-cards-entrance/requirements.md y design.md.

## 1. Problema (en palabras propias)

Petición humana literal: «se me ocurre que esta parte de las cards, cuando el header se va, tenga
una animación como que sale de encima y se clave aquí donde debe estar para hacer el scroll en
horizontal; o sea, que con el scroll también sale de encima y se clava».

Interpretación del líder, confirmada por el humano («sí, así como dices está bien la animación»):

- mientras el usuario baja hacia «Últimos artículos», las cards empiezan desplazadas hacia arriba
  (y algo más pequeñas o transparentes);
- según baja, descienden o crecen hasta quedar en su posición exacta justo cuando la sección se
  fija (sticky de la 73);
- desde ahí arranca el desplazamiento horizontal ya existente;
- todo ligado al scroll (scrub), no una animación automática.

Alcance: solo el modo horizontal de la 73 (≥1201 px, sin reduced motion, mismo gsap.matchMedia).
Sin JS, en ≤1200 px, con reduced motion o con menos de 3 cards no cambia nada.

## 2. Estado actual (verificado en disco)

- src/components/latest-horizontal/latest-horizontal.ts (81 líneas): `setup()` envuelve la
  sección en `div.latest-articles--horizontal-pin` (alto = sección + recorrido), añade la clase
  `latest-articles--horizontal` y crea un `gsap.to(track, { x })` con ScrollTrigger
  `trigger: wrapper, start: 'top top', end: '+=' + pinScrollLength, scrub: true, ease: 'none'`.
  La limpieza (función devuelta a `mm.add`) desenvuelve la sección; `mm.revert()` quita los
  estilos en línea del track (impl_73: queda `style=""`).
- src/styles/latest-horizontal.css (39 líneas): sección sticky top 0, `min-height: 100vh`,
  `overflow: clip` y `clip-path: inset(0 var(--latest-pair-inset))` (recorte lateral al par).
- src/domain/latest-horizontal.ts (51 líneas): geometría pura del par.
- latest-articles.css: `.latest-articles__card { transition: var(--transition-default) }` y el
  token vale `.28s cubic-bezier(.2,.8,.2,1)`, sin propiedad: **transition-property all**.
- tests/latest-horizontal-compact-sticky.test.mjs exige en la regla de la sección
  `clip-path: inset(0 var(--latest-pair-inset))` y `overflow: clip`, y que TODOS los selectores
  de la hoja contengan `.latest-articles--horizontal`. tests/latest-articles-horizontal-scroll
  exige `ease: 'none'` y `scrub: true` en el módulo.
- Medidas de impl_73 a 1280×800: envoltorio con top de documento 1215 (> innerHeight 800), h2 a
  48 px del borde superior de la sección (padding de latest-articles.css), cards de 629 px de alto
  con bottom 709. Chunk de GSAP 45 059 B gzip (límite 51 200).

## 3. Decisiones

### 3.1 Elemento animado: el track (`.latest-articles__list`)

- Las cards llevan `transition: all .28s`. Si GSAP escribiera transform u opacity en cada card,
  la transición CSS las retrasaría 280 ms respecto al scroll: el scrub dejaría de estar ligado al
  scroll y el estado final llegaría tarde a la unión (salto). El track no tiene transición.
- El track ya recibe la x de la 73. GSAP compone x, y y scale en el mismo transform a partir de su
  caché por elemento, así que dos tweens de propiedades distintas no se pisan.
- Un solo elemento: un solo estado final que comprobar y una sola limpieza.
- Descartado: stagger por card (necesitaría tocar la transición de las cards, que es de la
  feature 36/37, y complica el estado final exacto).
- El h2 NO se anima: conserva tal cual REQ-73-23/24 (constante ±1 px en el tramo fijado y
  monótono al entrar y al salir) y se mide igual que en la 73.

### 3.2 Tramo de entrada

- ScrollTrigger propio: `trigger: wrapper, start: 'top bottom', end: 'top top'`. Empieza cuando
  el borde superior de la sección asoma por abajo y termina exactamente donde empieza el tramo
  fijado de la 73 (`'top top'` del mismo envoltorio). Longitud = innerHeight.
- Progreso puro: `entranceProgress(scrollY, wrapperTop, vh) = clamp01((scrollY − wrapperTop + vh)/vh)`.
- Sin `clamp()` en el start: si el envoltorio quedara a menos de un viewport del inicio del
  documento (viewports muy altos), la entrada arrancaría ya avanzada, lo que refleja la posición
  real. A 1280×800 el envoltorio está en 1215 > 800; el implementer debe medirlo también a
  1440×900 y anotarlo.

### 3.3 Propiedades y valores

| Propiedad | Inicio (p = 0) | Final (p = 1) | Justificación |
|---|---|---|---|
| translateY | −0,4 × innerHeight (−320 a 800, −360 a 900) | 0 | Con 0,4·vh las cards arrancan visiblemente «encima» de su sitio (una altura de h2 + gap ≈ 62 px se queda corta; 1·vh las haría cruzar todo el hero). |
| scale | 0,9 | 1 | «Algo más pequeñas»: 10 % se percibe sin descolocar el par; el origen por defecto (50 % 50 %) del track (ancho V) mantiene el par centrado. |
| opacity | 0 | 1 | Aparecen al bajar y no tapan el final del hero al empezar, cuando están más arriba. |

- Fórmulas puras (src/domain/latest-entrance.ts, nuevo):
  - `entranceEase(p) = 1 − (1 − p)³` con p acotado a [0, 1] (equivale a power2.out de GSAP).
  - `entranceDistance(vh) = vh × 4 / 10` (exacto en coma flotante para 800 y 900).
  - `entranceState(p, vh) = { y: 0 − D·(1 − e), scale: 1 − 0,1·(1 − e), opacity: e }`, e = ease(p).
  - Con p = 1: y = 0 (positivo, no −0), scale 1 y opacity 1 exactos.
  - Entradas no finitas o vh ≤ 0 → estado final (contenido visible, fail-safe).
- Valores de test: vh 800 → p 0: (−320, 0,9, 0); p 0,25: y −135; p 0,5: (−40, 0,9875, 0,875);
  p 1: (0, 1, 1). vh 900 → p 0: y −360; p 0,5: y −45.
- El efecto usa `gsap.fromTo(track, from, to)` con from = `entranceState(0, innerHeight)` en
  funciones (invalidateOnRefresh) y `ease: entranceEase` (la MISMA función pura, para que dominio
  y runtime coincidan).

### 3.4 «Que se clave»: ease de aterrizaje suave, sin rebote

- `scrub: true` (no numérico): un scrub con suavizado (p. ej. 0,5) dejaría la entrada por detrás
  del scroll y en `'top top'` aún no estaría en el estado final: habría salto al empezar el
  horizontal.
- Ease cúbica de salida: la velocidad relativa de las cards respecto a la sección tiende a 0 en
  p = 1. Justo antes de fijarse, las cards ya se mueven solidarias con la sección y al fijarse se
  detienen con ella: se «clavan» sin un tirón visible en la unión. Con `ease: 'none'` las cards
  aún descenderían a 0,4 px por px de scroll en el momento de fijarse y se notaría el frenazo.
- Sin back/elastic: el rebote haría la y no monótona y sobrepasaría 0 (cards por debajo de su
  sitio). Se exige entranceEase no decreciente y dentro de [0, 1].

### 3.5 Recorte y orden de pintado durante la entrada

- Con la hoja de la 73 las cards desplazadas hacia arriba se cortarían en el borde superior de la
  sección (overflow: clip y clip-path con top 0): parecería un corte de un fallo.
- Solución: clase modificadora `latest-articles--entering` en la sección SOLO mientras la entrada
  está activa, puesta con `toggleClass` del ScrollTrigger de entrada. Regla
  `.latest-articles--horizontal.latest-articles--entering`:
  - `overflow-y: visible` (overflow-x sigue en clip: con `overflow: visible` el track, más ancho
    que V, añadiría scroll horizontal al documento; clip-path no recorta el área desplazable);
  - `clip-path: inset(-100vh var(--latest-pair-inset) 0)`: libera el borde superior y mantiene
    el recorte lateral del par.
- Encabezado por encima del track mientras tanto:
  `.latest-articles--horizontal.latest-articles--entering .latest-articles__heading { position:
  relative; z-index: 1; }`. Sin desplazamiento: no cambia su caja ni su top.
- Fuera de la entrada (antes o en el tramo fijado) rige la regla de la 73 sin cambios, y sus tests
  siguen en verde sin tocarse. En la unión el track está en y 0, así que quitar la clase no
  cambia nada visible.
- El header del sitio (sticky, z-index 100) queda por encima; la sección es un contexto de
  apilamiento (sticky) que pinta sobre el final del hero mientras las cards están arriba con
  opacidad baja. Se verifica en capturas.
- Literales nuevos no cromáticos: `-100vh`, `1` (z-index), `relative`, `visible`. Sin tokens
  nuevos.

### 3.6 Teclado

- El `focusin` de la 73 ya lleva la ventana a `focusScrollTarget(i, n, start, end)` del
  ScrollTrigger horizontal, que está en el tramo fijado o más abajo: allí la entrada vale 1.
  Decisión: no se añade lógica; si el foco cae antes o durante la entrada, el salto al tramo
  fijado deja la card con y 0, scale 1 y opacity 1. Se verifica con Tab real desde arriba.

### 3.7 Lo que no se rompe (verificación)

- h2 sin saltos con rueda real (REQ-73-23/24), par 1-2 → 2-3, recorrido 1:1, ida y vuelta con
  ClientRouter (un envoltorio, scrollY = history.state), búsqueda en vivo (start/end de los DOS
  ScrollTriggers iguales a carga limpia), limpieza (`mm.revert()` revierte también el fromTo y el
  toggleClass: el track sin transform ni opacity en línea y la sección sin `--entering`), peso
  (≤ 51 200 B gzip, sin dependencias nuevas) y CSP (cero violaciones).
- Rueda real: por frame se registran scrollY, top del h2, matriz del track (f = translateY,
  a = scale, e = x) y opacity. Esperado: translateY no decreciente al bajar (no creciente al
  subir), ≤ 0, igual a entranceState de la posición de scroll de ese frame o del anterior (±1 px;
  el ticker de GSAP puede ir un frame por detrás de la lectura), 0 ±1 px en todo el tramo fijado y
  sin cambios bruscos en la unión.

## 4. Archivos

| Archivo | Cambio | Líneas |
|---|---|---|
| src/domain/latest-entrance.ts | nuevo: entranceEase, entranceDistance, entranceState, entranceProgress | ≤ 100 (≈ 35) |
| src/components/latest-horizontal/latest-horizontal.ts | fromTo de entrada en `setup()` | 81 → ≈ 92; si pasa de 100, módulo hermano `entrance.ts` |
| src/styles/latest-horizontal.css | dos reglas `--entering` | 39 → ≈ 50 |
| tests/latest-cards-entrance.test.mjs | nuevo, rojo primero | ≤ 100 |

Sin cambios: latest-horizontal.ts del dominio, latest-articles.*, el .astro, index.astro, tests de
71/72/73.

## 5. Riesgos

- Solapamiento con el final del hero durante la primera parte de la entrada (cards arriba, poco
  opacas). Aceptado; capturas a p 0,25 y 0,5.
- Viewports muy altos (envoltorio a menos de un viewport del inicio): la entrada arranca avanzada
  en la carga. Aceptado y medido.
- Lectura un frame por detrás del ticker de GSAP en la medición por frame: tolerancia «frame
  actual o anterior».
- Que `toggleClass` no se quite al revertir: lo cubre la verificación de limpieza.

## 6. Feature creada

- 75 latest-cards-entrance (pending, depends_on [73]).
