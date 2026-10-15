# Implementación — feature 94 sticky-footer

> implementer, 2026-10-14. Spec: specs/94_sticky-footer/ (REQ-94-01..13). Análisis: progress/research/sticky-footer.md.
> Estado: `in_progress`, a la espera del reviewer (ronda 3).

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/styles/layout.css` | `html, body` sin `height: 100%` (REQ-94-04); `body` con `display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh;` (REQ-94-01/02) y `background`/`color`/`font-family` en una sola línea; nueva regla `body > main { flex: 1 0 auto; }` (REQ-94-03). Sigue midiendo **99 líneas** (REQ-94-05), así que `tests/mobile-hamburger-menu.test.mjs` (`=== 99`) no se toca. |
| `tests/sticky-footer.test.mjs` (nuevo, 65 líneas) | 8 tests: REQ-94-01, 02, 03, 04, 05, 10 (site-footer.css igual que HEAD y sin `position: fixed`), 11 (site-menu.css igual que HEAD) y solo tokens de color en layout.css. |
| `tests/geist-pixel-extend.test.mjs` | `src/styles/layout.css` sale de `UNCHANGED` con la nota «Ajuste feature 94 (REQ-94-01..05, precedente REQ-43-06)». site-menu.css sigue en la lista. |
| `feature_list.json` | Feature 94 de `pending` a `in_progress`. |

No se tocaron `Layout.astro`, `site-footer.css`, `site-menu.css`, `tests/mobile-hamburger-menu.test.mjs` ni ningún archivo de la feature 93 (REQ-94-10/11).

**Aviso para el líder y el reviewer:** mientras trabajaba, el humano commiteó todo el árbol en `268e9ad` («feat: Implement sticky footer (feature 94) and system design nav link (feature 93)»). Ese commit junta los cambios de la 94 (ya en verde) con los de la 93, que sigue blocked. Yo no hice ningún commit. Por eso el diff de la 94 ya no se puede aislar en el árbol; los archivos de la 94 son exactamente los cuatro de la tabla. Este informe y la nota en progress/current.md están sin commitear.

## Ciclo rojo/verde

**Rojo (REQ-94-12)**: `node --test tests/sticky-footer.test.mjs` antes de editar layout.css:

```
✖ REQ-94-01: body es una columna flex
✖ REQ-94-02: body declara min-height 100vh seguido de 100dvh
✖ REQ-94-03: body > main crece con flex 1 0 auto   (layout.css debe tener la regla body > main)
✖ REQ-94-04: el reset html, body no declara height (' margin: 0; width: 100%; height: 100%; ')
✔ REQ-94-05: layout.css mide exactamente 99 líneas
✔ REQ-94-10: site-footer.css sin cambios y sin position fixed
✔ REQ-94-11: site-menu.css sin cambios frente a HEAD
✔ REQ-94-01..05: layout.css sigue usando solo tokens para colores
ℹ pass 4
ℹ fail 4
```

(Los 4 que pasan en rojo son guardas: deben seguir siendo ciertos después del cambio.)

**Verde (REQ-94-13)**: después de editar:

```
node --test tests/sticky-footer.test.mjs  ->  ℹ pass 8  ℹ fail 0
pnpm test                                 ->  ℹ tests 983  ℹ pass 983  ℹ fail 0
./init.sh -> ✔ formato · ✔ tests al 100% (node:test) · ✔ build de producción (pnpm build)
            ✔ El entorno está perfecto. Podemos empezar a trabajar.
```

./init.sh volvió a dar verde después del commit `268e9ad` del humano.

## Verificación en navegador (Chrome headless + CDP, DPR 1, fuentes cargadas, dev server :4321)

«antes» = el mismo build con una hoja inyectada que restaura el CSS anterior (`html,body{height:100%}`, `body{display:block;min-height:0}`, `body>main{flex:none}`); «después» = el CSS de la feature.

### REQ-94-06: páginas cortas, el borde inferior del footer coincide con innerHeight

Con 375×667, 800×800 y 1280×800, /search, /search?q=zzzz y /404 **no son cortas**: el footer mide unos 985 px a 375, unos 760 a 800 y unos 410 a 1280, y main + margen + footer ya supera el viewport. Ahí no hay hueco y no cambia nada (el footer queda tras main, a 70 px, igual que antes). Para tener una página más baja que el viewport medí con viewports más altos en esos tres anchos:

| Viewport | Ruta | footer.bottom antes | footer.bottom después | Δ con innerHeight después | Scroll vertical extra después |
|----------|------|--------------------:|----------------------:|----------------------:|-----------------------:|
| 375×1700 | /search | 1440.6 (hueco de 259 px) | 1700 | 0 | 0 |
| 375×1700 | /search?q=zzzz | 1404.4 (hueco de 296) | 1700 | 0 | 0 |
| 375×1700 | /404 | 1438.4 (hueco de 262) | 1700 | 0 | 0 |
| 800×1400 | /search | 1200.5 (hueco de 200) | 1400 | 0 | 0 |
| 800×1400 | /search?q=zzzz | 1187.9 (hueco de 212) | 1400 | 0 | 0 |
| 800×1400 | /404 | 1158.9 (hueco de 241) | 1400 | 0 | 0 |
| 1280×1000 | /search | 823.9 (hueco de 176) | 1000 | 0 | 0 |
| 1280×1000 | /search?q=zzzz | 836.1 (hueco de 164) | 1000 | 0 | 0 |
| 1280×1000 | /404 | 807.1 (hueco de 193) | 1000 | 0 | 0 |
| 1280×1200 | /search | 823.9 (hueco de 376) | 1200 | 0 | 0 |
| 1280×1200 | /search?q=zzzz | 836.1 (hueco de 364) | 1200 | 0 | 0 |
| 1280×1200 | /404 | 807.1 (hueco de 393) | 1200 | 0 | 0 |

En las páginas que no son cortas (375×667, 800×800 y 1280×800), `scrollHeight` es el mismo antes y después: el cambio no añade scroll vertical.

ClientRouter: a 1280×800, desde / con scroll a 3000 px, clic en el enlace a /search. Resultado: pathname /search, footer.bottom 823.9 y scrollHeight 824, igual que con la carga directa.

### REQ-94-07: páginas largas, el footer va tras main sin hueco ni solape

| Ancho | Ruta | main.bottom → footer.top (antes / después) | scrollHeight (antes / después) |
|------:|------|-------------------------------:|-------------------------------:|
| 375 | / | 70 / 70 | 6248 / 6248 |
| 375 | /posts/04-ciclo-de-vida-y-arquitectura | 70 / 70 | 6972 / 6972 |
| 800 | / | 70 / 70 | 4205 / 4205 |
| 800 | /posts/04-… | 70 / 70 | 5091 / 5091 |
| 1280 | / | 70 / 70 | 3095 / 3095 |
| 1280 | /posts/04-… | 70 / 70 | 4345 / 4345 |

Los 70 px son el `margin-top` de site-footer.css (`--gap-card * 5`). No hay solape y no cambia ningún píxel.

### REQ-94-08: header

| Ancho | Alto al cargar | Alto tras scrollTo(0, 2·innerHeight) | top tras scroll |
|------:|------:|------:|------:|
| 800 | 65 | 65 | 0 |
| 1000 | 65 | 65 | 0 |
| 1280 | 65 | 65 | 0 |

(Post largo /posts/04-ciclo-de-vida-y-arquitectura, scrollY 1600.)

### Hero, pin horizontal y menú móvil (REQ-94-09)

- Hero a 1280×800: 1140 px antes y después. Hero a 375×667: 3349 px antes y después.
- Sección horizontal a 1280×800: el envoltorio mide 1410 px y la sección 800 px, antes y después. Bajando 0/150/300/450/600 px dentro del envoltorio: la sección queda con top 0 (pin) y el track avanza 0/−150/−300/−450/−600 px, **idéntico** antes y después.
- Menú móvil a 375 px en /search: aria-expanded pasa de false a true y vuelve a false. scrollWidth 365 ≤ clientWidth 375 en los tres estados, sin scroll horizontal.

### Observación ajena a la 94

A 800 px de ancho, `scrollWidth` 838 > `clientWidth` 800 en todas las rutas, **antes y después** del cambio. Es el desborde del header ya documentado en la feature 93 (blocked, REQ-93-13/14), que ahora está en HEAD. La 94 no lo crea ni lo cambia.

## Ronda 2: regresión del header sticky

> implementer, 2026-10-14. Regresión reportada por el humano (literal): «oye pero rompiste el header ya no se va nunca se queda pegado».
> Resultado: **reproducida y causada por la 94**, pero en la dirección **contraria** a la del encargo. Feature 94 pasa a **blocked**. **No cambié código ni tests.**

### Qué medí

Usé Chrome headless + CDP contra el dev server :4321 con el árbol en HEAD (268e9ad), viewport de 800 px de alto, DPR 1 y las fuentes cargadas. «Antes» (HEAD~1) es la misma página con una hoja inyectada que deja las reglas de layout.css como estaban antes de la 94: `html,body{height:100%}`, `body{display:block;min-height:0}` y `body>main{flex:none}`. Es lo único que la 94 cambió en HEAD~1→HEAD. Medí `header.getBoundingClientRect().top` después de `scrollTo(0, 500)` y de `scrollTo(0, 2000)`, junto con la altura del `body`.

| Ruta | Ancho | top tras 500 (antes / después) | top tras 2000 (antes / después) | alto del body (antes / después) |
|------|------:|---:|---:|---:|
| / | 375 | 0 / 0 | **−1265 / 0** | 800 / 6274 |
| / | 800 | 0 / 0 | **−1265 / 0** | 800 / 4205 |
| / | 1280 | 0 / 0 | **−1265 / 0** | 800 / 3095 |
| /posts/04-ciclo-de-vida-y-arquitectura | 375 | 0 / 0 | **−1265 / 0** | 800 / 6890 |
| /posts/04-… | 800 | 0 / 0 | **−1265 / 0** | 800 / 5091 |
| /posts/04-… | 1280 | 0 / 0 | **−1265 / 0** | 800 / 4345 |
| /search | 375 | 0 / 0 | 0 / 0 (scroll máx. 641) | 800 / 1441 |
| /search | 800 | 0 / 0 (máx. 400) | 0 / 0 | 800 / 1200 |
| /search | 1280 | 0 / 0 (máx. 24) | 0 / 0 | 800 / 824 |
| /diseno-de-sistemas | 375 | 0 / 0 | 0 / 0 (máx. 633) | 800 / 1433 |
| /diseno-de-sistemas | 800 | 0 / 0 (máx. 418) | 0 / 0 | 800 / 1218 |
| /diseno-de-sistemas | 1280 | 0 / 0 (máx. 66) | 0 / 0 | 800 / 866 |

`position` calculado: `sticky` en todos los casos.

### Causa raíz

Un elemento `position: sticky` solo puede quedarse pegado dentro de su bloque contenedor, que para `.site-navbar` es el `body`.

- **Antes (HEAD~1):** `html, body { height: 100% }` fijaba el `body` a la altura del viewport (800 px). El contenido se salía del body, pero la caja seguía midiendo 800. Por eso el header solo se quedaba pegado hasta `scrollY = 800 − 65 = 735`. A partir de ahí **se iba** con el scroll: tras 2000 px, top = −(2000 − 735) = −1265.
- **Después (HEAD, feature 94):** REQ-94-04 quita `height` y REQ-94-02 pone `min-height: 100vh/100dvh`, así que el `body` crece con el contenido (6274 px en la home a 375). El header queda pegado durante **todo** el documento y **ya no se va nunca**. Es literalmente lo que reporta el humano.

En las páginas cortas (/search, /diseno-de-sistemas) el scroll máximo es menor que 735, así que no cambia nada.

**El encargo de la ronda interpretó el reporte al revés** («ya no se queda pegado arriba»). Las mediciones muestran que el header nunca deja de estar pegado. Lo que cambió es que **antes se iba** tras un viewport y **ahora no se va**.

### Otras dependencias revisadas (sin efecto)

- Pin horizontal del hero (`src/components/latest-horizontal/latest-horizontal.ts`, GSAP ScrollTrigger con scroller `window`): en la ronda 1 lo medí idéntico antes y después. No depende de la altura del `body`.
- `track-dom.ts` restaura `history.state.scrollY` con `window.scrollTo`, y `scrollHeight` del documento es igual antes y después en todas las rutas medidas (6274/4205/3095/6890/5091/4345/1441/1200/824/1433/1218/866). No le afecta.
- No hay `overflow` en `body`/`main` ni otros scroll listeners en `src/` que lean la altura de `html`/`body`.

### Arreglo verificado (no aplicado)

Recupero `height: 100%` en el reset `html, body` y mantengo el resto de la 94 (body flex column + min-height, `body > main { flex: 1 0 auto }`). Así el `body` vuelve a medir un viewport: el header recupera el comportamiento previo y main sigue rellenando el hueco en las páginas cortas. Como los ítems flex tienen `flex-shrink: 0`, en las páginas largas desbordan el body igual que antes. Es un cambio de una sola línea y layout.css sigue en 99 líneas. Lo verifiqué inyectando `html,body{height:100%}` sobre HEAD:

| Caso | Resultado con el arreglo |
|------|--------------------------|
| Header tras 500 / 2000 px en / y /posts/04-… a 375, 800 y 1280 | 0 / **−1265** (igual que HEAD~1) |
| Header en /search y /diseno-de-sistemas a 375, 800 y 1280 | 0 / 0 (igual que HEAD~1 y HEAD) |
| Hueco main→footer en las páginas largas | 70 px (el margin-top del footer, igual que antes) |
| scrollHeight en todas las rutas | idéntico a HEAD~1 y HEAD |
| Sticky footer: footer.bottom en /search, /search?q=zzzz y /404 a 375×1700, 800×1400 y 1280×1000 | 1700 / 1400 / 1000 = innerHeight (Δ 0) y scrollHeight = innerHeight |
| Páginas de altura parecida al viewport a 800 px de alto (/search a 800 y 1280, /diseno-de-sistemas a 800 y 1280) | footer.bottom 799.9–800.5 con el scroll al máximo, pegado abajo |

### Por qué queda blocked y no lo apliqué

El arreglo **contradice la spec en vigor** de la 94:
- **REQ-94-04** («El reset global de html y body SHALL omitir la declaración height») exige precisamente lo que causa la regresión, y el test `REQ-94-04` de tests/sticky-footer.test.mjs lo comprueba.
- **REQ-94-08** («el header SHALL [...] permanecer en top 0 tras desplazarse dos viewports en un post largo») fija como requisito el comportamiento que el humano reporta como roto. Antes de la 94 ese top era −1265, no 0.

El implementer no puede reescribir requisitos ni dejar un test que contradiga la spec, y además el encargo pide la dirección contraria. Hace falta:
1. **Decisión humana:** ¿el header debe volver exactamente al comportamiento anterior (pegado durante el primer viewport y luego se va con el scroll, que es lo que da el arreglo de arriba) o debe no ser sticky en absoluto?
2. **spec_author:** reescribir REQ-94-04 (el reset conserva `height: 100%`) y REQ-94-08 (header en top 0 tras 500 px y top < 0 tras 2000 px en un post largo, igual que en HEAD~1), y actualizar el acceptance de feature_list.json.
3. Con la spec corregida, el implementer: test primero en tests/sticky-footer.test.mjs (REQ-94-04 invertido: el reset declara `height: 100%`, hoy en rojo) → cambio de una línea en layout.css → ./init.sh en verde.

Ciclo rojo/verde de esta ronda: **no aplica**, porque no se ha modificado código ni tests. El árbol queda como en 268e9ad, más este informe, progress/current.md y feature_list.json (94 → blocked).

## Ronda 3: spec corregida (REQ-94-04 y REQ-94-08 reescritos, REQ-94-14 nuevo)

> implementer, 2026-10-14. La feature 94 vuelve a `in_progress`. No lancé subagentes ni hice commits, y no toqué nada de la feature 93.

### Cambios

| Archivo | Cambio |
|---------|--------|
| `tests/sticky-footer.test.mjs` | Invertí el test de REQ-94-04: ahora el reset `html, body` **debe** declarar `height: 100%` (`/(^\|[;\s])height:\s*100%\s*;/`). La cabecera cita REQ-94-01..14. Sigue con 8 tests. |
| `src/styles/layout.css` | Línea 6: `html, body { margin: 0; width: 100%; height: 100%; }`. Cambié el comentario a «height: 100% limita el header sticky a un viewport (REQ-94-04)». Sigue midiendo **99 líneas** (`wc -l` = 99). |
| `feature_list.json` | Feature 94 de `pending` a `in_progress`. |

No toqué Layout.astro, site-footer.css, site-menu.css, tests/mobile-hamburger-menu.test.mjs ni tests/geist-pixel-extend.test.mjs (REQ-94-10/11).

### Rojo (REQ-94-12): `node --test tests/sticky-footer.test.mjs` antes de editar layout.css

```
✔ REQ-94-01: body es una columna flex
✔ REQ-94-02: body declara min-height 100vh seguido de 100dvh
✔ REQ-94-03: body > main crece con flex 1 0 auto
✖ REQ-94-04: el reset html, body declara height 100%
✔ REQ-94-05: layout.css mide exactamente 99 líneas
✔ REQ-94-10: site-footer.css sin cambios y sin position fixed
✔ REQ-94-11: site-menu.css sin cambios frente a HEAD
✔ REQ-94-01..05: layout.css sigue usando solo tokens para colores
ℹ pass 7
ℹ fail 1
    actual: ' margin: 0; width: 100%; ',
    expected: /(^|[;\s])height:\s*100%\s*;/,
```

### Verde (REQ-94-13)

```
node --test tests/sticky-footer.test.mjs  ->  ℹ pass 8  ℹ fail 0
pnpm test                                 ->  ℹ tests 983  ℹ pass 983  ℹ fail 0
./init.sh -> ✔ formato · ✔ tests al 100% (node:test) · ✔ build de producción (pnpm build)
            ✔ El entorno está perfecto. Podemos empezar a trabajar.
```

### Mediciones (Chrome headless 154 + CDP, DPR 1, fuentes cargadas)

Medí contra el dev server que ya estaba corriendo en :4321 (pid 34400). No lo arranqué yo, así que lo dejé corriendo. Todas las mediciones son con el CSS final de la feature, sin hojas inyectadas.

**REQ-94-08: header con 800 px de alto** (`position` calculado: `sticky` en todos los casos; alto del body: 800)

| Ruta | Ancho | top tras scrollTo(0, 500) | top tras scrollTo(0, 2000) |
|------|------:|---:|---:|
| / | 375 | 0 | −1265 |
| / | 800 | 0 | −1265 |
| / | 1280 | 0 | −1265 |
| /posts/04-ciclo-de-vida-y-arquitectura | 375 | 0 | −1265 |
| /posts/04-… | 800 | 0 | −1265 |
| /posts/04-… | 1280 | 0 | −1265 |

Coincide exactamente con HEAD~1 de 268e9ad (tabla de la Ronda 2): el header se queda pegado durante el primer viewport y luego se va con la página.

**REQ-94-06: footer en páginas cortas.** Δ = footer.bottom − innerHeight.

| Viewport | Ruta | Δ al cargar | Δ con el scroll al máximo | scrollHeight |
|----------|------|---:|---:|---:|
| 375×1700 | /search · /search?q=zzzz · /404 | 0 · 0 · 0 | 0 · 0 · 0 | 1700 (sin scroll) |
| 800×1400 | /search · /search?q=zzzz · /404 | 0 · 0 · 0 | 0 · 0 · 0 | 1400 (sin scroll) |
| 1280×1000 | /search · /search?q=zzzz · /404 | 0 · 0 · 0 | 0 · 0 · 0 | 1000 (sin scroll) |
| 375×800 | /search · /search?q=zzzz · /404 | (no cabe) | −0.4 · 0.4 · 0.4 | 1441 · 1404 · 1438 |
| 800×800 | /search · /search?q=zzzz · /404 | (no cabe) | 0.5 · −0.1 · −0.1 | 1200 · 1188 · 1159 |
| 1280×800 | /search · /search?q=zzzz · /404 | 23.9 · 36.1 · 7.1 | −0.1 · 0.1 · 0.1 | 824 · 836 · 807 |

Con 800 px de alto estas rutas **no son más bajas que el viewport**: main + margen + footer ya ocupa entre 807 y 1441 px. REQ-94-06 no aplica ahí. El footer queda tras el contenido y, con el scroll al máximo, toca el borde inferior (Δ ≤ 0.5 px), sin hueco debajo. En las páginas que sí son cortas (viewports altos), Δ es 0 y no aparece scroll extra.

**REQ-94-07: footer en páginas largas** (800 px de alto)

| Ruta | 375 | 800 | 1280 |
|------|---:|---:|---:|
| / (main.bottom → footer.top / scrollHeight) | 70 / 6248 | 70 / 4205 | 70 / 3095 |
| /posts/04-… | 70 / 6972 | 70 / 5091 | 70 / 4345 |

Los 70 px son el `margin-top` del footer. No hay solape y los valores de scrollHeight son los mismos que antes de la 94 (Ronda 1).

**REQ-94-14: alto del header** en /posts/04-…: 65 px a 800, 65 a 1000 y 65 a 1280.

**REQ-94-09: menú móvil a 375×800 en /search** (`.site-menu__toggle`): aria-expanded pasa de false a true y vuelve a false. En los tres estados, scrollWidth 365 ≤ clientWidth 375, sin scroll horizontal.
