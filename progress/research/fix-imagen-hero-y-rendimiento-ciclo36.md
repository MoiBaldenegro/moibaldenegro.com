# Análisis: fix imagen del hero perdida al volver + rendimiento/jank (ciclo 36)

> Fecha: 2026-08-14 · Rol: spec_author · Entrada: petición del humano tras el
> rediseño del header de posts: "tenemos problemas de rendimiento, se nota un
> lagueo... y al regresar de la página del detalle se pierde la imagen del hero".
> El sitio "quedó muy bonito": los cambios son de rendimiento y del bug, no
> visuales. Basado en los informes de explorer del ciclo 35
> (`view-transitions-imagen-perdida.md` y `rendimiento-jank-ciclo35.md`) y en
> verificación directa de archivos y del código fuente de Astro 7.2.0.

## 1. El problema reafirmado y su alcance

1. **Bug (imagen perdida en back)**: al navegar del detalle `/posts/[id]` de
   vuelta a la portada `/`, el `<img>` del hero de la portada se ve sin imagen
   (o en blanco durante la transición). Log del dev server: `GET
   http://localhost:4321/posts/assets/moises-hero.jpg 404`. Causa raíz
   verificada: `src/data/hero.json` declara `"image": "assets/moises-hero.jpg"`
   (ruta RELATIVA sin `/` inicial): en `/` resuelve a `/assets/moises-hero.jpg`
   (OK); pero el `<ClientRouter />` re-fetchea y re-parsea la portada con
   DOMParser en cada navegación y la imagen nueva nace en un documento inerte;
   al montar la capa viva `::view-transition-new(root)` ANTES de que cambie la
   URL, la ruta relativa resuelve contra `/posts/` → 404 → el hero llega sin
   imagen (bug agravado por el Chromium 331926174/#10595: áreas en blanco en
   páginas largas con muchas imágenes). El archivo real existe:
   `public/assets/moises-hero.jpg` (~152 KB).
2. **Rendimiento (lagueo)**: dos frentes priorizados por el explorer:
   (a) jank de scroll por `backdrop-filter: blur(18px)` en la navbar sticky
   full-width (blur recalculado por frame — sospechoso nº 1) y hovers de cards
   con `box-shadow` + `filter: contrast(1.4)` + `transform` (paint por frame);
   (b) jank al navegar por el snapshot de página completa del crossfade
   (grupo `root`: rasteriza blur/sombras 80px/glows 640px) + morph de la imagen
   del post sin decodificar (rectángulo vacío + pop).
3. **Alcance acotado**: NO hay cambios visuales pedidos. Se conserva el morph
   de imágenes y títulos (parte de "quedó muy bonito"); solo se arregla la ruta,
   se persiste el hero, se pre-cargan imágenes, se elimina el blur de scroll, se
   aligeran los hovers y se desactiva el crossfade del snapshot de página.

## 2. Qué toca (capas, datos, rutas)

| Archivo | Feature 43 (bug hero) | Feature 44 (rendimiento) |
|---|---|---|
| `src/data/hero.json` | `"image"` → `"/assets/moises-hero.jpg"` (absoluta) | — |
| `src/layouts/Layout.astro` | preload del hero en `<head>` (vía `HeroProfileRepository`) | `<html transition:animate="none">` + `<slot name="head" />` |
| `src/components/new-hero/new-hero.astro` | `transition:persist="hero-profile"` en el `<img>` del hero | — |
| `src/pages/posts/[id].astro` | copia oculta del hero con `transition:persist="hero-profile"` (dentro de `.post__hero`, después de `img.post__image` y de `.post__hero-copy`; sin `transition:name`) + import de `HeroProfileRepository` | `<link slot="head" rel="preload" as="image" fetchpriority="high">` con la imagen del post |
| `src/styles/layout.css` | regla `.post__hero [data-astro-transition-persist="hero-profile"] { display: none }` | quitar `backdrop-filter` + fondo `color-mix(in srgb, var(--color-background) 92%, transparent)` |
| `src/styles/hero-card.css` | — | hover: solo `transform` + `border-color` (sin box-shadow/filter) |
| `src/styles/latest-articles.css` | — | hover: `border-color` + `transform` (sin box-shadow) |
| `tests/hero-profile-repository.test.mjs` | **cambio autorizado**: `EXPECTED_PROFILE.image` → valor absoluto (ver §6) | — |
| `tests/hero-back-navigation.test.mjs` | **nuevo** (test-first, REQ-43) | — |
| `tests/performance-jank-cycle36.test.mjs` | — | **nuevo** (test-first, REQ-44) |

`tokens.css` NO se toca (87 líneas: REQ-26-07/40-11/42-09): el alfa del navbar
se sube con `color-mix` en `layout.css` (precedente del repo en
post-header.css), sin cambiar `--color-navbar`.

## 3. Mecánica del persist verificada en el source de Astro 7.2.0

`node_modules/astro/dist/transitions/swap-functions.js` (`swapBodyElement`):

1. Para cada elemento viejo con `data-astro-transition-persist` se busca el
   emparejado en el documento nuevo (`querySelector` por id): si no existe en
   AMBAS páginas, no se persiste nada (requisito ya documentado en el research
   del ciclo 35).
2. El nodo viejo se desmonta del body viejo y, tras `body.replaceWith(newBody)`,
   se reinserta **en la posición del nodo nuevo**, y el nodo nuevo se elimina:
   `newTarget.replaceWith(el)` (o `moveBefore` en Chromium). **El nodo que
   sobrevive es el VIEJO, con todos sus atributos (clase, alt, persist attr).**

Consecuencia de diseño (Decisión 3 de la spec 43): la ocultación de la copia
persistida en el detalle NO puede depender de una clase del nodo (al volver a la
portada, el nodo superviviente sería el de la portada → visible, pero al ir al
detalle el superviviente es el hero de la portada, SIN la clase ocultadora → la
copia aparecería visible en el detalle). El ocultamiento debe:
- seguir al **atributo** `data-astro-transition-persist="hero-profile"` (viaja
  con el nodo), y
- estar **acotado a la estructura del detalle** (`.post__hero` solo existe en
  `/posts/[id]`), de modo que el selector no aplique en la portada.

Por eso: `.post__hero [data-astro-transition-persist="hero-profile"] { display:
none }` en `layout.css` (hoja compartida; el selector es estructural y solo
matchea en el detalle). Direcciones verificadas: detalle→portada (el nodo viejo
= copia oculta llega al hero de la portada, sin `.post__hero` → visible) y
portada→detalle (el nodo viejo = hero visible llega a la posición de la copia,
dentro de `.post__hero` → `display: none` → oculto). Sin `hidden` ni
`aria-hidden` en la copia (viajarían con el nodo y romperían el hero o la
accesibilidad).

## 4. Decisiones de descomposición (2 features, ids 43 y 44)

Separar en dos features permite reviews independientes y una implementación
secuencial limpia (el arnés implementa de menor a mayor id): 43 corrige el bug
de navegación con base en datos (hero.json) y 44 optimiza rendimiento de
scroll/hover/navegación. Solapan archivos (Layout.astro, [id].astro,
layout.css), pero el arnés garantiza que la 43 cierra antes de la 44: la 43
introduce el preload del hero y el persist; la 44 añade `transition:animate`,
el slot de head y el preload del post sobre los mismos archivos ya estables.
Alternativa descartada: una sola feature (mezclaría dos problemas distintos y
bloquearía el review independiente del bug, que es urgente).

## 5. Decisión sobre el morph de imágenes (riesgo visual mínimo)

- Se CONSERVA `transition:name={`img-${post.id}`}` en cards y
  `img-${entry.id}` en el detalle (REQ-24-03/05, REQ-39-05, REQ-42-08) y los
  títulos: el humano aprobó el morph ("quedó muy bonito") y no pidió quitarlo.
- Mitigación del jank/flash del morph: preload de la imagen del post
  (`fetchpriority="high"`) + preload del hero + persist + `transition:animate="none"`.
- Bug de Chromium 331926174/#10595 (áreas en blanco con muchas imágenes,
  agravado con DevTools abiertas): es UPSTREAM sin fix general (confirmado por
  martrapp en withastro/astro#10595). Mitigaciones aplicadas en este repo:
  persist del hero (el nodo nunca se re-crea desde DOMParser), preload de
  imagen del hero y del post (reduce la ventana sin decodificar), aspect-ratio
  ya presente (sin CLS) y sin morph en el hero. Riesgo residual documentado: en
  páginas largas con DevTools abiertas puede persistir distorsión puntual en la
  transición; no hay fix CSS/JS local sin cambiar el diseño.
- Firefox (#14135, wontfix): el ClientRouter ignora `loading="lazy"` en el
  swap (las cards cargan eager al navegar) — comportamiento aceptado, sin
  cambio visual, documentado como pendiente.

## 6. Cambios de tests existentes autorizados (y por qué)

1. **`tests/hero-profile-repository.test.mjs` — REQ-31-04**: el test
   `assert.deepEqual(repository.getProfile(), EXPECTED_PROFILE)` fija el perfil
   REAL de `src/data/hero.json`; al cambiar la canonical del dato (ruta
   relativa → absoluta), el fixture `EXPECTED_PROFILE.image` pasa de
   `'assets/moises-hero.jpg'` a `'/assets/moises-hero.jpg'`. Es el ÚNICO test
   existente que cambia. Justificación: el test verifica que el repo entrega
   los datos reales; el fixture sigue al dato, no al revés. El resto del test
   (REQ-05-01/02, REQ-31-01/03/06/08 y el loader inyectado) no se toca.

2. **NO se modifican**: `view-transitions.test.mjs` (REQ-24-03/05: los pares
   img/title se conservan; el primer `<img>` de [id].astro sigue siendo
   `img.post__image` porque la copia persistida va después),
   `post-header-horizontal.test.mjs` (REQ-42-01/08: mismo argumento),
   `layout-refactor.test.mjs` (REQ-08-01 `/<html\s+lang="es"/` sigue
   matcheando con `<html lang="es" transition:animate="none">`; REQ-08-06: el
   `color-mix` con `var(--color-background)` y la regla `display:none` no
   rompen el guard de tokens ni el ≤100 líneas),
   `articles-ui-refactor.test.mjs` (REQ-10-03 exige `var(--transition-default)`
   en latest-articles.css: se conserva en la transición base de la card),
   `visual-polish-refactor.test.mjs` (REQ-37-03/04/08: navbar, focus y ≤100
   líneas intactos), `hero-cards-styles.test.mjs` (REQ-04-02/03: tokens de
   marca y var() intactos; el hover no está asertado), `design-tokens.test.mjs`
   (tokens.css intacto), `post-readability.test.mjs` REQ-40-11 y
   `post-page-styles.test.mjs` REQ-26-07 (87 líneas intactas), y el resto de la
   suite (258 tests).

## 7. Riesgos y trabas

- **Riesgo visual (aceptado)**: navbar sin blur, más opaca (alpha ~92%):
  cambio imperceptible con el borde inferior existente (research §A: opción 1
  recomendada). Hovers: pierden sombra/filtro pero conservan elevación y borde
  de acento.
- **`transition:animate="none"` en `<html>`**: elimina el crossfade root y
  conserva los morphs nombrados (verificado en research ciclo 35, issue
  #10241); en navegadores sin View Transitions API el fallback queda en swap
  simple (sin animación simulada).
- **Slot `name="head"`**: patrón documentado de Astro; el `<link>` del post
  viaja en el head del detalle. En navegación ClientRouter los links del
  documento nuevo se procesan tras el swap (fetch de la imagen arranca al
  montar el head) — ventana mínima, mitigada por el preload del HTML del
  prefetch.
- **Persist + DOMParser**: el persist del hero NO evita el re-fetch del HTML;
  evita el re-parseo del `<img>` (el nodo se mueve). La ruta absoluta elimina
  el 404; el preload cubre la ventana de caché fría.
- **`[id].astro` sigue ≤100 líneas** (~60 con los cambios de 43+44) y
  `layout.css` ~74 líneas: sin riesgo para REQ-24-05/37-08/08-06.
- **Trabas**: ninguna bloqueante; el bug de Chromium 331926174 es upstream
  (mitigado, no eliminable).

## 8. Trazabilidad con la investigación previa

- `view-transitions-imagen-perdida.md` §4.3/§6: persist en ambas páginas (1-2),
  preload en head (3), morph conservado con preload (4), verificación manual
  (5). Se adopta la opción de MENOR riesgo visual (conservar morph de imagen).
- `rendimiento-jank-ciclo35.md` §"Recomendaciones A-D": navbar (A opción 1),
  hovers (B), `transition:animate="none"` (C), preload del detalle (D). Se
  descartan: migración astro:assets (E, cambio de arquitectura de imágenes no
  pedido), fuentes (F, system-ui real sin problema) y `--transition-default`
  más corto (tocaría tokens.css sin necesidad).
