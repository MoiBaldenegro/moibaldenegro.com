# Análisis — La portada pasa de 3 a 5 «Últimos artículos» (feature 95)

Petición humana 2026-10-15 (literal): «Elevaremos los últimos artículos de 3 a mostrar 5».
Autor: spec_author. Spec: specs/95_home-latest-articles-five/ (requirements.md + design.md).

## 1. Qué es

La sección «Últimos artículos» de la portada (src/components/latest-articles.astro) pinta hoy los
3 artículos más recientes: el frontmatter llama a `latestPosts(await new PostsRepository().getPosts())`
sin límite y el módulo src/domain/latest-posts.ts fija `LATEST_POSTS_LIMIT = 3` (feature 30). Se
quiere que pinte 5. Hay 8 artículos en src/content/posts (verificado: 8 `.md`), así que se verán 5.

Decisión del orquestador: el cambio a 5 es solo para la sección de la portada; el resto de
consumidores conserva su comportamiento actual.

## 2. Consumidores de latestPosts() / LATEST_POSTS_LIMIT

| Consumidor | Uso hoy | Tras la feature |
|------------|---------|-----------------|
| src/components/latest-articles.astro (portada) | `latestPosts(getPosts())`, límite por defecto (3) | 5 (límite por defecto) |
| src/components/site-footer/site-footer.astro (feature 89, todas las páginas) | `latestPosts(getPosts())`, límite por defecto (3) | 3, pasando el límite explícito `FOOTER_LATEST_POSTS_LIMIT` |
| src/components/latest-horizontal/latest-horizontal.ts (features 72-76) | No llama a latestPosts(): cuenta las `.latest-articles__card` del DOM (`n`), requiere `n >= 3` | Sin cambios de código; recibe n = 5 |
| src/domain/latest-horizontal.ts | Geometría pura parametrizada por `count` | Sin cambios |

No hay más consumidores en src/ (grep de `latestPosts`, `LATEST_POSTS_LIMIT`, `latest-posts`).
docs/ y CHECKPOINTS.md no citan el 3.

Diseño del cambio: `LATEST_POSTS_LIMIT` pasa a 5 (es la política de la portada, su nombre y su
comentario lo dicen) y se exporta una constante nueva `FOOTER_LATEST_POSTS_LIMIT = 3` en el mismo
módulo, que el footer pasa como segundo argumento. Así el footer no lleva un número suelto en el
frontmatter y la política de recorte vive en un único módulo de dominio. latest-articles.astro
solo actualiza su comentario («3 más recientes» -> 5); la llamada no cambia, así REQ-30-06 (regex
`latestPosts\(\s*await new PostsRepository\(\)\.getPosts\(\)`) sigue verde.

## 3. Rejilla y presentación con 5 cards

CSS relevante: src/styles/latest-articles.css (`.latest-articles__list { display: grid; gap:
var(--gap-card) }`, sin `grid-template-columns`) y src/styles/latest-horizontal.css (modo
horizontal, solo con la clase `.latest-articles--horizontal` que añade el script a >=1201 px sin
reduced motion). Tokens: `--gap-card: 14px`, `--container-max: 1500px`.

- **375 px**: rejilla de una sola columna (sin columnas declaradas = 1 pista implícita). Sección
  `min(1500px, 95%)` = 356,25 px; padding de card 18px 20px (media <=768). 5 cards apiladas, una
  debajo de otra, misma anchura, gap 14 px. Imposible un hueco de rejilla: no hay columnas.
- **768 px**: igual que 375 (columna única, sección 729,6 px, media <=768 aplica). 5 cards apiladas.
- **1280 px con movimiento**: el script activa el modo horizontal (flex en fila, par visible).
  A 1280×800: W = min((1216 − 14)/2, (800 − 480)·16/9 + 56) = 601 px; inset del par = 32 px. La
  geometría ya está generalizada a n cards (features 73/76): recorrido del track (n − 2)(W + G) =
  3 × 615 = 1845 px de scroll vertical fijado (hoy 615 px con n = 3). Al inicio se ven las cards 1
  y 2; al final, la 4 y la 5. La x propia de la primera y la última card (feature 76) se aplica a
  los índices 0 y n − 1, genérico. focusScrollTarget reparte el foco entre n − 2 = 3 tramos. La
  sección tiene `overflow: clip` y ancho 100%: las cards fuera del par no generan scroll horizontal.
- **1280 px con prefers-reduced-motion** (o sin JS): layout apilado de una columna, como 375/768.

Conclusión: la rejilla y el modo horizontal acomodan 5 cards sin cambios de CSS ni de JS; no hay
decisión de diseño (no aparece el dilema 3+2 / fila / carrusel porque no hay rejilla multicolumna y
el carrusel horizontal ya existe y es genérico en n). La feature queda **pending**.

## 4. Riesgos y trabas

- R1 Tests que fijan el 3 (se ajustan con nota, precedente REQ-43-06):
  - tests/home-latest-articles-limit.test.mjs: REQ-30-01 (length 3, ids p-0..p-2, bucle
    [3,4,5,8,20]), REQ-30-02 (slice(0,3) y 3 fechas), REQ-30-03 (4 posts esperando 3: con límite 5
    devolvería los 4; hay que usar >=6 posts), REQ-30-04 (menos de tres -> menos de cinco: 0..4),
    REQ-30-13 (build: 3 cards y 3 hrefs). Su lista REQ-30-09/10 no incluye
    latest-horizontal-compact-sticky ni site-footer, así que las notas en esos tests no la rompen.
  - tests/latest-horizontal-compact-sticky.test.mjs:89-90 (REQ-73-33 exige
    `export const LATEST_POSTS_LIMIT = 3;`; la spec 73 dice que ampliar a 4+ es «decisión futura
    del humano»: la petición de hoy es esa decisión).
  - tests/site-footer.test.mjs:57 solo exige `latestPosts\(`: sigue verde con el segundo argumento.
  - Los tests de geometría (latest-horizontal-geometry, latest-cards-full-bleed, compact-sticky)
    llaman a funciones puras con count = 3 como argumento: no dependen del límite.
- R2 Longitud de página: con 5 cards apiladas la sección crece ~2/3 (a 768 px ≈ 650 px por card;
  a 1280 px reduced motion ≈ 950 px por card). Es el comportamiento apilado de siempre con más
  elementos, no un fallo de rejilla. En el modo horizontal el tramo fijado pasa de ~615 a ~1845 px
  de scroll a 1280×800. Se documenta; si el humano lo encuentra largo, sería otra feature.
- R3 Verificación visual: exigida medida en navegador (design.md §Verificación): sin scroll
  horizontal (`scrollWidth <= clientWidth`) a 375/768/1280, 5 cards en columna con anchura igual y
  gap 14 px a 375/768 (y 1280 reduced motion), y a 1280 con movimiento las cards 4 y 5 completas en
  el par al final del tramo fijado; el footer sigue con 3 artículos.
- R4 Límite de líneas: latest-posts.ts 22 líneas, site-footer.astro 66, latest-articles.astro 39:
  muy lejos de 100.
- No depende de la feature 93 (blocked) ni toca sus archivos (Layout.astro, site-menu.css,
  site-footer.css, mobile-hamburger-menu.test.mjs).

---

# Revisión 2026-10-15 — 4 artículos y entrada/salida lateral (feature 95 de blocked a pending)

Autor: spec_author. Origen: bloqueo del implementer (progress/impl_home-latest-articles-five.md:
REQ-47-06, index.html 38 059 B con 3 cards y 49 289 B con 5; ~2,4 KB por cada transition:name).
Decisión humana (literal): «me pareció exagerado, mejor solo deja 4 y trata de agregar también una
animación de entrada salida lateral». Spec reescrita: specs/95_home-latest-articles-five/
(requirements.md REQ-95-01..31 + design.md). El name sigue siendo `home-latest-articles-five`
(el validador ata specs/95_<name>/ al slug y el test/informe ya usan ese nombre); título y
descripción dicen 4.

## 5. Límite 4 y peso de la portada

- `LATEST_POSTS_LIMIT = 4`, `FOOTER_LATEST_POSTS_LIMIT = 3` (el footer pasa el límite explícito,
  ya hecho en el árbol). Las 4 más recientes: 05-diseno-arquitectonico-vs-diseno-detallado,
  04-ciclo-de-vida-y-arquitectura, 01-procesos-memoria, 00-prueba-os.
- Peso estimado: 38 059 + 2 × 2,4 KB (estilos de view transition de la card 4) + ~0,8 KB de marcado
  + ~1 KB de la hoja nueva (Astro la mete inline por ser pequeña) ≈ 44 KB. Umbral nuevo de REQ-47-06:
  peso medido con el árbol final + 3000 B, redondeado al millar superior (≈ 47 000), con nota
  «Ajuste feature 95 (precedente REQ-43-06)». Tope 48 000: si se pasa, blocked. El propósito se
  mantiene: el índice de búsqueda (dist/client/search-index.json ≈ 39 KB) embebido llevaría la
  portada a ~85 KB y el test seguiría fallando; además la aserción `id="search-index"` no cambia.
- Tests a reajustar (ya estaban a 5 en el árbol): home-latest-articles-limit (REQ-30-01/02/03/04/13;
  REQ-30-03 ya tiene 6 entradas, basta con esperar a..d), latest-horizontal-compact-sticky
  (REQ-73-33 = 4) y el test nuevo home-latest-articles-five (reescribir a 4 + CSS).

## 6. Animación lateral: qué existe y cómo encaja

- Feature 75 (src/domain/latest-entrance.ts + latest-horizontal.ts): solo en modo horizontal
  (>=1201 px, sin reduced motion). El track baja desde arriba con scale/opacity por GSAP con scrub
  entre «top bottom» y «top top» del envoltorio. No actúa en el layout apilado.
- Features 73/76: el track se mueve en X por transform dentro de la sección sticky; la primera y la
  última card llevan un `x` propio en línea (GSAP).
- latest-horizontal.ts mide 95/100 líneas: no admite un tween más sin pasarse. Con la preferencia
  «solo CSS» se usa una animación scroll-driven `animation-timeline: view()` por card.
- Conflictos y cómo se resuelven:
  1. Una animación CSS de `transform` gana al `transform` en línea: en modo horizontal rompería los
     edge offsets de la 76. Por eso `.latest-articles--horizontal .latest-articles__card { animation: none }`.
  2. `view()` mide la posición de layout y no ve el desplazamiento del track por transform: en el
     pin no puede seguir el recorrido horizontal. En escritorio el «desliz lateral» ya lo da el
     propio track (entra por la derecha, sale por la izquierda) y se conserva la entrada de la 75.
     Como el apilado y el horizontal son excluyentes, las dos animaciones no coinciden: no hay que fusionarlas.
  3. Desliz de 56 px con la sección casi a ancho completo (95 %) → scroll horizontal. Se recorta con
     `overflow-x: clip` en `.home__landing` (ancho completo), no en la sección (cortaría la card y
     la sombra de hover). `clip` no crea contenedor de scroll: el sticky de la 73 sigue funcionando y
     overflow-y queda visible para la entrada de la 75.
  4. reduced motion: todo dentro de `@media (prefers-reduced-motion: no-preference)`; la red de
     seguridad de layout.css solo acorta duraciones y con una timeline de scroll no sirve.
  5. `animation` (shorthand) reinicia `animation-timeline` a auto: se declara después.
- Archivos congelados que obligan a una hoja nueva: latest-articles.astro, latest-articles.css y
  latest-horizontal.css (REQ-87-06 en tests/geist-pixel-extend.test.mjs y el número de líneas en
  REQ-72-01/02). tokens.css está fijado a 99 líneas por 4 tests, así que la distancia es una
  propiedad local `--latest-slide-distance: calc(4 * var(--gap-card))`. La hoja nueva
  src/styles/latest-cards-slide.css la importa latest-horizontal.astro: REQ-72-01/02 solo exige su
  import actual y un `<script>`.
- CLS: solo transform/opacity, así que no hay desplazamientos de layout (se mide de todas formas).
  Fallback sin `animation-timeline` (Firefox estable): cards quietas.

## 7. Valores por defecto elegidos (pendientes de validación humana, no bloquean)

- Dirección: entra desde la derecha y sale hacia la izquierda (mismo sentido que el horizontal).
- Distancia: calc(4 * var(--gap-card)) = 56 px. Rangos: entry 0 % → 40 % y exit 60 % → 100 % de view().
- Se aplica también en móvil (375) y en tablet (768/1024).
- Escritorio >=1201 px con movimiento: sin animación lateral nueva (seguiría la 75 + el horizontal).
  Si el humano la quiere ahí, haría falta JS nuevo: otra feature.

## 8. Riesgos

- R5 Chrome headless: ya hay scripts CDP de sesiones previas en el scratchpad (cdpbase.mjs,
  cdp93*.mjs) que sirven de base; Node 24 trae WebSocket nativo. Sin playwright.
- R6 Cards más altas que el viewport (768 px): entry 40 % se alcanza con ~40 % de la card visible.
  Revisar en las capturas que no haya cards a medio fundido mientras se leen.
- R7 El comentario de latest-articles.astro («3 más recientes») se queda desfasado: el archivo está
  congelado (REQ-87-06).
- R8 ./init.sh está en ROJO mientras el árbol tenga el intento a 5 (REQ-47-06: 49 289 B). Se pondrá
  en verde con la implementación (límite 4 + umbral ajustado).
