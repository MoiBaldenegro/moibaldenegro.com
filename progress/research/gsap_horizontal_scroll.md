# Investigación — GSAP + ScrollTrigger: scroll horizontal fijado en «Últimos artículos»

Fecha: 2026-10-09 · Rol: explorer · Feature: aún sin id (la dará spec_author).
Pedido del líder: pin de `src/components/latest-articles.astro` (3 cards), la 1 centrada,
2 y 3 esperando a la derecha fuera de la vista; el scroll vertical las desplaza a la izquierda
hasta centrar la 3 y luego se libera el pin.

## 0. Estado real del repo (verificado en disco)

- `package.json`: astro ^7.3.8 (instalado 7.3.8), @astrojs/cloudflare ^14.3.4, wrangler. **gsap NO
  está instalado aún** (ni en package.json ni en pnpm-lock.yaml). Hay que añadirlo también a
  `docs/dependencies.md` (formato `### gsap` + version/scope/approved/motivo), si no
  `scripts/validate-dependencies.mjs` deja `./init.sh` en rojo.
- `src/pages/index.astro`: `.home__landing[data-landing-sections]` > `NewHero`, `LatestArticles`,
  `HtbStadistics server:defer`. Ningún ancestro de la sección tiene `transform`/`will-change`/`contain`
  (eso rompería el `position: fixed` del pin, ver §3).
- `src/styles/search-live.css:14`: `.home__landing[hidden] { display: none; }`: la búsqueda en vivo
  oculta toda la portada. Si se oculta y se vuelve a mostrar, las medidas de ScrollTrigger quedan mal
  y hay que llamar a `ScrollTrigger.refresh()` (§4).
- `src/styles/layout.css`: `html, body { height: 100% }`, header `position: sticky` (74 px; 170 px en
  móvil), `scroll-padding-top`. No hay `scroll-behavior: smooth` (bien: GSAP lo desaconseja, §3).
  impl_61.md ya señaló que, con `body { height: 100% }`, el header solo es sticky durante el primer
  viewport. Hay que medir con CDP si el header tapa la sección pinneada (afecta a `start`).
- Patrón de init: `code-copy.astro` → `<script>` empaquetado + `document.addEventListener('astro:page-load', …)`.
- La CSP real (`src/domain/http/security-headers.ts`) incluye **`style-src 'self' 'unsafe-inline'`**
  y `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com` (sin `'unsafe-eval'`).
- Tests: node:test sobre `.mjs`; los tests ya importan `.ts` directamente (type stripping de Node
  24.21.0, p. ej. `tests/code-copy-button.test.mjs`).
- Astro 7.3.8 `swapBodyElement` **sustituye el `<body>` entero** (`oldElement.replaceWith(newElement)`,
  `node_modules/astro/dist/transitions/swap-functions.js:141`) y pone `history.scrollRestoration = "manual"`
  (restaura el scroll desde `history.state.scrollY`, `router.js:46-58, 170`).

## 1. Paquete, versión, licencia, tamaño

- **Paquete**: `gsap` en npm. **Última estable: 3.15.0** (publicada el 2026-04-13; `dist-tags`:
  `latest: 3.15.0`). ScrollTrigger viene **dentro** del mismo paquete (`gsap/ScrollTrigger`), no hay
  que instalar nada más. Fuente: https://registry.npmjs.org/gsap
- Desde 3.13 todos los plugins están en el npm público; si existe un `.npmrc` que apunte a
  `npm.greensock.com` hay que quitarlo. Fuente: https://gsap.com/docs/v3/Installation
- **Licencia**: campo `license` = `Standard 'no charge' license: https://gsap.com/standard-license`.
  **No es OSI/MIT**: es propietaria y gratuita, de Webflow. Lo que dice:
  - «free for everyone»; «All of GSAP including the plugins that were formerly "members-only"» se
    puede usar en proyectos comerciales sin coste (incluye ScrollTrigger).
  - Permitted Uses: usarlo en cualquier web, web app o interfaz digital, por «any person or
    entity». **Sitio personal y comercial: permitido.**
  - Prohibited Use: meterlo en herramientas *no-code* de animación visual que compitan con Webflow
    (exige consentimiento escrito). No aplica a este sitio.
  - No se pueden quitar los avisos de copyright o marca (los banners `@license` de los .js).
  - Webflow puede revocarla si se incumplen los términos, y puede modificarla. Si alguien no acepta
    una revisión, puede seguir usando las versiones publicadas antes de su fecha de vigencia.
  - Fuente: https://gsap.com/standard-license (no es asesoría legal).
  - Consecuencia: si el humano quiere solo licencias OSI, hay que hablarlo. Conviene anotar en
    `docs/dependencies.md` que es «licencia propietaria gratuita».
- **Tamaño** (medido por mí con el tarball 3.15.0 y gzip -9):
  | Archivo | minificado | gzip |
  |---|---|---|
  | `dist/gsap.min.js` (core + CSSPlugin) | 72 927 B | 28 268 B |
  | `dist/ScrollTrigger.min.js` | 44 575 B | 17 998 B |
  | Bundle ESM (esbuild, `import {gsap} from 'gsap'` + `ScrollTrigger` + `registerPlugin`) | 115 009 B | **45 073 B** |
  | Igual, pero con `gsap-core` + `CSSPlugin` | 114 962 B | 45 044 B |
- **ESM / tree-shaking**: `package.json` tiene `"module": "index.js"`, `exports` con
  `import`/`require` y `"sideEffects": false`. Es ESM, pero el tree-shaking apenas ahorra: el core es
  monolítico (la variante `gsap-core` + `CSSPlugin` pesa casi lo mismo). Calcula **~45 KB gzip** de JS
  de runtime, cargado solo en la portada (Astro empaqueta el `<script>` del componente, con imports
  npm y dedupe: https://docs.astro.build/en/guides/client-side-scripts/). GSAP recomienda llamar
  siempre a `gsap.registerPlugin(ScrollTrigger)` para que el bundler no elimine el plugin, y registrarlo
  dos veces «doesn't help anything, nor does it hurt» (https://gsap.com/docs/v3/Installation).
- El `package.json` de gsap **no** declara `"type": "module"`. Si un test de Node importa
  `gsap/index.js`, Node 24 avisa «Reparsing as ES module…», aunque funciona: lo comprobé importando gsap
  y ScrollTrigger en Node sin DOM, sin errores. Es otra razón para que los tests no importen GSAP (§6).

## 2. CSP

- **Sin `eval` ni `new Function`.** Busqué `new Function`, `eval(` y `Function(` en `gsap-core.js`,
  `CSSPlugin.js`, `ScrollTrigger.js` y en los `.min.js` de 3.15.0: 0 coincidencias (solo aparece el
  helper `_isFunction`). Encaja con `script-src` sin `'unsafe-eval'`.
- **No inyecta `<script>` ni `<style>`.** Solo crea `<div>` (`createElement("div")`: 1 en el core, 3 en
  ScrollTrigger: el `pin-spacer`, el div de 100vh para medir y los markers de depuración). No usa
  `insertRule`, `adoptedStyleSheets` ni `innerHTML`.
- **Estilos inline**: casi todo va por propiedades CSSOM (`el.style.x = …`), pero ScrollTrigger
  **también asigna `style.cssText`** (`ScrollTrigger.js:345, 415, 817, 831`: guardar y restaurar
  estilos del pin) y CSSPlugin hace `_tempDiv.style.cssText = …` y `style.cssText = ""`.
  - MDN: las propiedades de `element.style` «will not be blocked». En cambio pone `setAttribute('style')`
    **y `style.cssText`** como ejemplos de lo que bloquea un `style-src` sin `'unsafe-inline'`. En otra
    parte dice que el spec ligaba los setters `cssText` a `'unsafe-eval'` pero que «no browser
    currently blocks these methods». La página se contradice en `cssText`.
    Fuente: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src
  - **En este repo el tema no aplica**, porque `style-src` ya incluye `'unsafe-inline'`, que permite
    estilos inline y el atributo `style` (misma fuente). Es un **riesgo futuro**: si algún día se quita
    `'unsafe-inline'` de `style-src`, el pin habría que volver a verificarlo en el navegador.
- Las restricciones de `script-src` no afectan al bundle de Vite (`'self'`).

## 3. Patrón recomendado (pin + scrub horizontal)

Fuentes base:
- Docs de ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Ejemplo oficial de 3.8: `gsap.to('.container', { xPercent: -100 * (sections.length - 1), ease: 'none',
  scrollTrigger: { trigger: '.container', start: 'top top', end: '+=3000', pin: true, scrub: 0.5 } })`.
  El comentario dice `ease: 'none' // <-- IMPORTANT!`. Fuente: https://gsap.com/blog/3-8/

Reglas que salen de esas fuentes:
- **No animar el elemento pinneado**, porque «that will throw off the measurements». Se fija la
  `<section>` y se anima un **track** interior (`.latest-articles__list`). (docs ScrollTrigger)
- `pinSpacing` añade padding para que el contenido que sigue «espere». Ojo: si el elemento pinneado es
  `display:flex`, `pinSpacing` vale `false` por defecto. Por eso conviene **pinnear la sección**, no
  el track flex. (docs ScrollTrigger)
- `scrub: true` liga el avance directamente a la barra de scroll. Un número (p. ej. 0.5) añade un
  retardo de «catch up». Para alargar el recorrido se mueve `end`; subir `duration` no hace nada.
  (docs + https://gsap.com/resources/st-mistakes/)
- **Valores en función + `invalidateOnRefresh: true`**: lo que dependa del viewport (x, end) debe ir
  en funciones; si no, al redimensionar quedan valores viejos. Ya está en las fuentes citadas arriba.
  Desde 3.12 se puede usar `clamp()` en start/end.
- `anticipatePin: 1` «is typically fine»: evita un parpadeo al entrar al pin con scroll rápido.
- Hay que crear los ScrollTriggers **en orden de página** (o usar `refreshPriority`). Aquí solo habrá uno.
- `content-visibility: auto|hidden` rompe las medidas. El repo no lo usa.
- `pinReparent` solo hace falta si un ancestro tiene transform/will-change. Aquí no; dejarlo en `false`.
- `containerAnimation` **no hace falta**: sirve para disparar animaciones *dentro* del track
  horizontal, y no admite pin ni snap.
- Desactivar con matchMedia: `gsap.matchMedia()` ejecuta el handler cuando la query coincide y
  **revierte automáticamente** todas las animaciones y ScrollTriggers creados dentro cuando deja de
  coincidir. Por dentro crea un `gsap.context()` («redundant… to use both»). El handler puede devolver
  una función de limpieza para cosas propias (p. ej. quitar una clase), sin llamar a `revert()`, que
  ya es automático. `mm.revert()` lo deshace todo. Los listeners añadidos después (p. ej. `focusin`)
  solo se recogen si se registran con `context.add()`.
  Fuente: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/

**Geometría para centrar la 1 y la 3** (propuesta mía, derivada del ejemplo `xPercent` de 3.8):
- Cada card ocupa un «slot» del ancho del área visible `V` (el ancho de la sección pinneada, que debe
  ser el **ancho completo del viewport** para que las cards entren desde el borde de la pantalla y no
  desde el borde del contenedor de 95%). Card de ancho `W` (el actual: `min(var(--container-max), 95%)`)
  con `margin-inline: calc((V - W) / 2)` (o slot `flex: 0 0 100%` y card centrada dentro).
- Así el centro de la card *i* queda en `i·V + V/2`. Con `x = 0`, la card 1 está centrada y las cards
  2 y 3 empiezan en `V + (V-W)/2`, es decir, **fuera de la vista a la derecha**. Eso exige separación
  ≥ `(V-W)/2`, que el slot ya da.
- `x` final = `-(n-1)·V` → card 3 centrada. Recorrido de scroll `end: () => '+=' + (n-1)·V`, o ese valor
  por un factor si se quiere más lento.
- Lógica pura testeable: `slideDistance(viewportWidth, count) = (count - 1) * viewportWidth`, más un
  `cardCenterX(i, V)` para los asserts.

Boceto (≤100 líneas, lógica en `.ts`, el `.astro` solo hace import + listeners). Nombres orientativos;
las APIs (`gsap.matchMedia`, `mm.add`, `mm.revert`, opciones de `scrollTrigger`) son las de las fuentes:

```ts
// src/components/latest-articles/horizontal-scroll.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { slideDistance } from './horizontal-offsets.ts';   // puro, sin gsap
gsap.registerPlugin(ScrollTrigger);
const QUERY = '(min-width: 769px) and (prefers-reduced-motion: no-preference)';
let mm: gsap.MatchMedia | null = null;
export function initLatestHorizontal(root = document.querySelector<HTMLElement>('[data-latest-horizontal]')) {
  destroyLatestHorizontal();
  if (!root) return;
  const track = root.querySelector<HTMLElement>('[data-latest-track]')!;
  const count = track.children.length;
  mm = gsap.matchMedia();
  mm.add(QUERY, () => {
    root.classList.add('latest-articles--horizontal');      // la clase ANTES de medir
    gsap.to(track, {
      x: () => -slideDistance(root.clientWidth, count), ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: () => '+=' + slideDistance(root.clientWidth, count),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true },
    });
    return () => root.classList.remove('latest-articles--horizontal');
  });
}
export function destroyLatestHorizontal() { mm?.revert(); mm = null; }
```

## 4. Integración con ClientRouter / View Transitions

- **Ciclo de vida** (https://docs.astro.build/en/guides/view-transitions/): `astro:before-preparation` →
  `after-preparation` → `before-swap` → `after-swap` (ya con historial y scroll restaurados) →
  `page-load` (página visible). Los scripts empaquetados «are only ever executed once». El init va en
  `astro:page-load`, que también salta en la carga inicial (patrón ya usado en code-copy).
- **Registro**: `gsap.registerPlugin(ScrollTrigger)` a nivel de módulo; como el módulo se ejecuta una
  sola vez, el plugin también se registra una vez. Así lo hace el admin de GSAP en el hilo de Astro:
  https://gsap.com/community/forums/topic/40708-problem-with-scollsmoother-and-astro-view-transitions/
- **Limpieza**: `mm.revert()` en **`astro:before-swap`**, mientras el DOM viejo sigue en el documento.
  Así se desenvuelve el `pin-spacer`, se restauran los estilos inline y se quitan los listeners de
  scroll sobre nodos vivos. Recomendación de GSAP para SPAs: «SPAs don't automatically destroy and
  re-create your ScrollTriggers… kill on unmount, recreate on mount, `ScrollTrigger.refresh()` when
  needed» (https://gsap.com/resources/st-mistakes/). `context.revert()`: las animaciones y
  ScrollTriggers «get reverted and killed» (https://gsap.com/docs/v3/GSAP/gsap.context()/).
  `ScrollTrigger.kill()` (instancia) desfija y restaura los cambios del pin; `ScrollTrigger.killAll()`
  mata todos (docs ScrollTrigger). Con matchMedia basta `mm.revert()`. Además, `init` llama primero a
  `destroy`, para que la función sea idempotente como `initCodeCopy`.
- **Reemplazo de `<body>`**: Astro 7 sustituye el body (§0). ScrollTrigger 3.15 lo tiene previsto: en
  `_refreshAll` vuelve a leer `_docEl` y `_body` con el comentario «some frameworks like Astro may cache
  the `<body>` and replace it during routing» (`ScrollTrigger.js:479-482`). Un refresh tras crear el
  trigger (ScrollTrigger lo encola solo con `requestAnimationFrame`, `ScrollTrigger.js:457-464`)
  corrige la referencia. El hilo del foro 40708 trata de ScrollSmoother (estilos en el body que Astro
  borra) y nunca se resolvió del todo. **No usar ScrollSmoother.**
- **Refresh automático**: ScrollTrigger refresca en `DOMContentLoaded`, `load`, `resize` y
  `visibilitychange` (`ScrollTrigger.js:2136-2146`). En navegación suave **no hay `load`**. Si algo
  cambia de alto después del init (imágenes sin dimensiones, o mostrar/ocultar `.home__landing[hidden]`
  por la búsqueda en vivo), llama a `ScrollTrigger.refresh()` (st-mistakes: «call
  `ScrollTrigger.refresh()` in the loading callback»). Las imágenes de las cards ya tienen
  `width`/`height` y `aspect-ratio`, así que su carga lazy no cambia el layout. Falta revisar las del hero.
- **Restauración de scroll (riesgo, verificar con CDP)**: Astro restaura `scrollY` en `after-swap`,
  *antes* del `page-load` en el que se crea el pin. Si el usuario vuelve con «atrás» a la portada
  estando por debajo de la sección, el `pin-spacer` (que añade alto) todavía no existe y el navegador
  puede recortar el `scrollY` restaurado. Mitigación probable (hipótesis, sin fuente oficial): tras crear
  el trigger, `ScrollTrigger.refresh()` y, si `history.state?.scrollY` difiere de `scrollY`, volver a hacer
  `scrollTo(0, history.state.scrollY)`. ScrollTrigger guarda el valor original de
  `history.scrollRestoration` y lo cambia solo si se llama a `ScrollTrigger.clearScrollMemory(valor)`
  (`ScrollTrigger.js:446-452`). No usar esa llamada, para no pisar el `"manual"` de Astro.
- `transition:name` en imagen y título de la card: el morph de la view transition lee la posición final
  ya transformada. No encontré documentación sobre conflictos; verificarlo a mano (hacer clic en la card 3
  con el pin activo).
- No encontré issues oficiales de Astro sobre `pin-spacer`. La recomendación de matar en `before-swap`
  viene de la guía de SPAs de GSAP más el análisis del swap en el código de Astro.

## 5. Accesibilidad y mejora progresiva

- **Mejora progresiva**: el HTML y CSS actuales (grid vertical) siguen siendo el estado base. La clase
  `latest-articles--horizontal`, que activa `display:flex` en el track, el slot y el `overflow: clip` de
  la sección, **solo la añade JS** dentro del handler de matchMedia y se quita al revertir. Sin JS, con
  reduce-motion o en móvil se ve el layout actual.
- **prefers-reduced-motion**: WCAG 2.3.3 «Animation from Interactions» (AAA) pone el scroll que mueve
  elementos como ejemplo de movimiento no esencial, y la técnica C39 recomienda `prefers-reduced-motion`
  (https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). La query de matchMedia
  lo cubre y además es coherente con la feature 56. matchMedia reacciona en vivo si el usuario cambia
  la preferencia (se re-ejecuta o revierte).
- **Foco por teclado en cards fuera de vista**:
  - WCAG 2.4.11 Focus Not Obscured (Minimum), **AA**: el componente con foco no debe quedar
    «entirely hidden due to author-created content»
    (https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
  - Con `overflow: hidden`, al tabular el navegador **sí hace scroll programático** del contenedor
    («tabbing to hidden focusable elements»), lo que descuadraría el layout. Con **`overflow: clip`** no
    es un scroll container y «programmatic scrolling is not possible»
    (https://developer.mozilla.org/en-US/docs/Web/CSS/overflow). Recomiendo `overflow: clip` en la
    sección cuando está en modo horizontal.
  - Para que la card con foco se vea: listener `focusin` en el track, registrado vía `context.add()` o
    quitado en la limpieza. Calcula el índice *i* de la card y hace
    `window.scrollTo({ top: st.start + (i/(n-1))·(st.end - st.start), behavior: 'instant' })`, de modo
    que el scrub la lleve al centro. Un admin de GSAP propone algo parecido ante foco tapado por una
    animación ScrollTrigger: usar `compareDocumentPosition` o ids o data para «scroll the document so
    the animation reverses»
    (https://gsap.com/community/forums/topic/45452-keyboard-focus-remains-hidden-behind-scrolltrigger-animated-element/).
    El cálculo `i/(n-1)` es mío; testearlo como función pura.
  - **No** usar `inert` ni `tabindex=-1` en las cards fuera de vista: sacaría enlaces reales del orden de tabulación.
- **Táctil/móvil**: desactivar en ≤768 px (el breakpoint del repo) con la query de matchMedia, y mantener
  ahí el layout vertical. Motivos: en móviles solo táctiles ScrollTrigger activa por defecto
  `ignoreMobileResize` (`_ignoreMobileResize = Observer.isTouch === 1`, `ScrollTrigger.js:2038`; opción
  `ScrollTrigger.config({ ignoreMobileResize })` en `types/scroll-trigger.d.ts`) porque la barra de
  direcciones cambia el alto. Además el header móvil mide 170 px. Esta recomendación es criterio propio;
  no encontré una regla oficial de GSAP que diga «no pinnear en móvil». **No usar
  `ScrollTrigger.normalizeScroll()`**: mueve el scroll al hilo de JS. En pantallas táctiles de >768 px
  (tablets) el pin funciona con el scroll nativo.

## 6. Testing

**Unit (node:test, sin navegador)**:
- Separar `src/components/latest-articles/horizontal-offsets.ts` (o `src/domain/…`), puro y **sin
  importar gsap**, con: `slideDistance(V, n)`, `cardOffsetX(i, V)` / `isCentered`, `focusScrollTarget(i, n,
  start, end)`. Los tests lo importan directamente (type stripping, como `code-copy-button.test.mjs`).
  Casos: n=3 → distancia `2V`; x=0 centra la 1 y la 2 queda fuera (`left ≥ V`); x=-2V centra la 3; n=1
  → 0 (sin pin); `focusScrollTarget` en 0, la mitad y el final.
- El `.ts` que llama a GSAP se verifica con asserts estáticos sobre el texto, al estilo del repo:
  `registerPlugin` a nivel de módulo, la query con `prefers-reduced-motion: no-preference` y
  `min-width: 769px`, `invalidateOnRefresh: true`, `ease: 'none'`, `astro:page-load` y `astro:before-swap`
  en el `.astro`, sin `<style>` y ≤100 líneas. Importarlo en Node funciona (lo comprobé) pero no tiene DOM;
  no merece la pena.
- CSS: asserts sobre `latest-articles.css` (la clase de modo horizontal, `overflow: clip`, solo tokens).

**Verificación real (Chrome headless + CDP)**, el método ya usado en impl_61.md y hero_mobile_image.md
sobre `astro preview`. Métodos (del protocolo oficial,
https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/browser_protocol.json):
- `Emulation.setDeviceMetricsOverride { width, height, deviceScaleFactor, mobile }` → 1280×800 y 375×812.
- `Emulation.setEmulatedMedia { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }` →
  comprobar que no hay `.pin-spacer` y que el layout es el vertical.
- Scroll: `Input.dispatchMouseEvent { type: 'mouseWheel', x, y, deltaX, deltaY }` (rueda real), o
  `Runtime.evaluate('scrollTo(0, Y)')` con Y = `st.start + p·(st.end-st.start)` para p = 0, 0.5 y 1.
  `Input.synthesizeScrollGesture` es experimental.
- Lecturas con `Runtime.evaluate`: `getComputedStyle(track).transform` (matriz → `m41` = x),
  `getBoundingClientRect()` de cada card (centro ≈ `innerWidth/2` en p=0 para la 1 y en p=1 para la 3;
  card 2 y 3 con `left ≥ innerWidth` en p=0), `ScrollTrigger.getAll().length` (exponerlo solo en debug, o
  contar `.pin-spacer` en el DOM), y el `top` de la sección durante el pin (constante) y después (sube).
- Navegación: clic a un post → atrás (`Page.navigateToHistoryEntry`) → comprobar que hay **un solo**
  `.pin-spacer` y que el `scrollY` restaurado coincide (riesgo de §4).
- Teclado: `Input.dispatchKeyEvent` Tab hasta el enlace de la card 3 → su rect debe quedar dentro del viewport.
- Node 24 trae `WebSocket` global (comprobado: `typeof WebSocket === 'function'`), así que el cliente CDP
  no necesita dependencias.

## Pendientes (fuera de alcance, no investigados a fondo)

1. Si el header sticky tapa la sección pinneada (`start: 'top top'` frente a `top top+=<header>`):
   depende del hallazgo de impl_61 (`body {height:100%}`). Medir con CDP.
2. Mitigación de la restauración de scroll al volver atrás (§4): es una hipótesis; validarla con CDP.
3. Cómo se comporta el morph `transition:name` desde una card transformada.
4. Si el humano acepta una licencia no OSI (Standard «no charge» de Webflow) en `docs/dependencies.md`.
5. Si `style-src` dejara algún día `'unsafe-inline'`, revisar `style.cssText` en ScrollTrigger (§2).
