# Investigación: Rendimiento / Jank en sitio Astro estático con view transitions (ciclo 35)

Fecha: 2026-08-14
Repo: moibaldenegro.com — Astro ^7.2.0, @astrojs/cloudflare ^14.2.1 (output server + prerender workerd, imageService 'cloudflare'), ClientRouter en Layout.astro.

## Resumen ejecutivo (5 líneas)

1. La causa más probable del lag al hacer scroll es el `backdrop-filter: blur(18px)` de la navbar sticky: con scroll, el contenido de atrás cambia cada frame y el blur (captura + gaussiano + re-composite de todo el ancho de pantalla) se recalcula continuamente; es un coste documentado que puede triplicar la carga del compositor.
2. El segundo foco son las transiciones hover de las cards: `box-shadow` + `filter: contrast(1.4)` + `transform` animados en 280 ms fuerzan paint por frame (solo transform/opacity son baratos); si el cursor pasa sobre una card mientras se scrollea, se pierden frames.
3. El "lag" al navegar entre páginas viene sobre todo del snapshot de página completa (grupo `root` del crossfade) que rasteriza la página nueva con sus efectos caros (blur, sombras de 80 px, glows radiales de 640/900 px) + el morph de la imagen del post que aún no está descargada (rectángulo vacío + pop); se arregla con `transition:animate="none"` en `<html>` (mantiene los morphs de imagen/título) y preload de la imagen del detalle.
4. Las imágenes `<img>` planas tienen `aspect-ratio` CSS, lo que ya evita CLS; el riesgo real es parpadeo por `loading="lazy"` + `transition:name` (el snapshot se toma antes de decodificar) y en Firefox el ClientRouter rompe el lazy (carga eager, issue #14135).
5. Inter **no está cargada en absoluto** (ni @fontsource ni Google Fonts): el sitio ya usa system-ui; si se quiere Inter real, la vía recomendada en Astro 7 es el Fonts API (fontsource self-host, preload opcional), no Google Fonts CDN.

---

## Contexto verificado en el repo

- `package.json`: `astro ^7.2.0`, `@astrojs/cloudflare ^14.2.1`, `wrangler`. `astro.config.mjs`: `output: 'server'`, `prerenderEnvironment: 'workerd'`, `imageService: 'cloudflare'`, `vite.optimizeDeps.include: ['astro/assets/services/noop']`.
- `src/layouts/Layout.astro`: `<ClientRouter />` en head. El ClientRouter **activa prefetch de todos los links por defecto** (`init({ prefetchAll: true })` — código fuente de `ClientRouter.astro`), así que el HTML de la página destino ya suele estar descargado al hacer clic: el lag al navegar no es de red, es de rasterización/render.
- `layout.css`: `.site-navbar { position: sticky; backdrop-filter: blur(18px); background: var(--color-navbar) (= rgba(8,8,18,.75)); }` — navbar full-width sticky.
- `post-header.css` (detalle de post): panel `.post__hero` con `box-shadow: var(--shadow-card) = 0 25px 80px rgba(0,0,0,.35)`, `background: linear-gradient(160deg,...)` + `radial-gradient(circle at 78% 0%, ...)`, `::before` de 640×640 px con `radial-gradient(circle, var(--color-glow), transparent 70%)`, imagen 4:3 con `box-shadow: 0 0 48px var(--color-glow)`, título con `text-shadow: 0 0 32px var(--color-glow)`, `::after` con linear-gradient.
- `hero-section.css` (home): `.hero-background` con 2 radial-gradients (grano + degradado), `.hero-gradient` 900×900 px radial con `animation: float 10s ease-in-out infinite` (solo transform → OK).
- `hero-card.css`: `:hover { transform: translateY(-4px); box-shadow: var(--shadow-card-hover); filter: contrast(1.4); }` con `transition: var(--transition-default) = .28s cubic-bezier(.2,.8,.2,1)` — anima transform + box-shadow + filter.
- `latest-articles.css`: card `:hover { border-color; box-shadow: var(--shadow-card-hover); }` con la misma transición de 0.28 s — anima box-shadow.
- `latest-articles.astro`: `<img>` plano, `loading="lazy"`, `transition:name={img-${id}}`, sin width/height (CSS: `aspect-ratio: 16/9`, `object-fit: cover`).
- `posts/[id].astro`: `<img>` plano sin lazy, `transition:name`, sin width/height (CSS `aspect-ratio: 4/3` en hero, 16/9 base), y `<h1 transition:name>` con text-shadow.
- `tokens.css`: `--font-sans: Inter, ui-sans-serif, system-ui, sans-serif`; **no hay ningún `@font-face`, `@import` de Google Fonts ni paquete @fontsource en el proyecto** (grep verificado). Inter solo se usa si el usuario la tiene instalada localmente; en la práctica el sitio renderiza con system-ui.
- Imágenes: `/assets/content/*.webp` (~112 KB) servidas desde `public/` → **las imágenes de `public/` nunca se optimizan** (documentado por Astro).

---

## Hallazgos por pregunta

### 1. View transitions y jank: qué animar y cómo

- **Regla de oro**: animar solo `transform` y `opacity`; cualquier otra propiedad (width, height, aspect-ratio, top/left, border-radius, filter, box-shadow, background) dispara layout y/o paint por frame y rompe 60 fps. Fuente: https://web.dev/articles/animations-guide y https://web.dev/articles/animations-and-performance ("Where you can, you should avoid animating properties that trigger layout or paint... limiting animations to opacity or transform").
- Las propiedades de geometría (width, aspect-ratio, height) causan **reflow (layout)** de toda la página afectada; las de paint (border-radius, filter, box-shadow, backgrounds) no hacen layout pero obligan a **repintar** el área cada frame — y paint suele ser la fase más cara del pipeline. Fuentes: https://web.dev/articles/rendering-performance , https://web.dev/articles/simplify-paint-complexity-and-reduce-paint-areas .
- Blur/filtros animados: "Animating a blur is not really an option as it is very slow" — el blur es una convolución que se paga por frame en GPU. Fuente: https://developer.chrome.com/blog/animated-blur .
- **En las view transitions el navegador anima snapshots rasterizados** (imágenes), así que el morph de un elemento con `transition:name` es compositing barato. El coste real está en (a) rasterizar el **snapshot de página completa** (grupo `root`): si la página nueva es cara de pintar (blur, sombras, glows), esa rasterización puede exceder los 16 ms y se ve jank al navegar; y (b) elementos nombrados cuya imagen aún no está cargada (snapshot vacío → flash blanco + pop). Fuentes: https://github.com/withastro/astro/issues/10241 (cómo desactivar el fade del root con `::view-transition-group(root) { animation: none }` o `transition:animate="none"` en `<html>`), https://chromakode.com/post/astro-view-transitions/ ("Image loading is a source of jank... if the image displayed on the destination page isn't cached, it won't be loaded in the transition, causing jank. The departing image fades into a white rectangle, and the image pops in afterward").
- Práctica recomendada (docs oficiales + práctica de campo): duraciones cortas (~200–400 ms; "keep motion short"), easing suave, **no animar el full-page snapshot**: dejar animar solo los elementos compartidos (imagen/título) y silenciar el grupo `root`, o usar `transition:animate="none"` en `<html>` del layout. Fuentes: https://docs.astro.build/en/guides/view-transitions/ (directivas `transition:*`, fallback, prefers-reduced-motion), https://pkglog.com/en/blog/astro-view-transitions-advanced-guide/ (performance: transform/opacity, 200–400 ms, no siempre `will-change`).
- Parpadeo de imágenes en morph: fix oficial de Astro con `mix-blend-mode: plus-lighter` (ya en el core). https://github.com/withastro/astro/pull/12046 (fixes issue #12045).
- Fallback: el `ClientRouter` simula animaciones en navegadores sin View Transitions API (`fallback: 'animate'` por defecto); en Firefox además el router rompe `loading="lazy"` (carga eager). https://github.com/withastro/astro/issues/14135 .

### 2. backdrop-filter: coste real en sticky/scroll

- `backdrop-filter: blur()` fuerza al navegador a: capturar el contenido detrás → moverlo a un buffer aparte → aplicar el blur (convolución, la parte cara) → recomponer. **Con scroll, el contenido de atrás cambia cada frame → el blur se recalcula por frame**: "If that header covers the full width of the screen, the browser is re-calculating that blur for millions of pixels on every scroll event" y "you've just handed your user's GPU a mathematical nightmare that can triple the compositor's workload and turn a smooth 60fps scroll into a jittery mess". Fuente: https://loke.dev/blog/css-filter-blur-performance-bottlenecks .
- Confirmado en la práctica con blur pequeño (3px): un elemento con `backdrop-filter` y contenido animado dentro dispara 20% CPU / 17% GPU en el proceso GPU de Chrome; el blur se re-calcula aunque el fondo sea estático. Fuente: https://stackoverflow.com/questions/79218159/why-is-backdrop-filter-expensive-on-elements-containing-an-animation .
- En Chrome además hay un problema de edge-handling que hace que 1 px de scroll cambie el color del blur (flickering). Fuente: https://jameshfisher.com/2024/04/23/backdrop-blur-without-the-flickering/ .
- Bugs de lag por backdrop-filter en Firefox (muchos elementos; sin aceleración GPU). Fuentes: https://bugzilla.mozilla.org/show_bug.cgi?id=1718471 , https://bugzilla.mozilla.org/show_bug.cgi?id=1988728 .
- Referencia de la propiedad (efecto, stacking context, `@supports` para fallback con imagen): https://web.dev/articles/backdrop-filter y https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter .
- **Conclusión aplicable**: blur(18px) en una navbar sticky full-width es un caso de libro de jank de scroll. Alternativas documentadas: fondo sólido semitransparente sin blur (subir el alpha de `--color-navbar`), blur más pequeño, o `@supports` para degradar. `will-change` no "arregla" el blur en scroll (el blur se sigue re-aplicando); solo promueve a capa y cuesta memoria. Fuentes: https://web.dev/articles/backdrop-filter , https://web.dev/articles/animations-and-performance (will-change con moderación), https://loke.dev/blog/css-filter-blur-performance-bottlenecks (no abusar de will-change).

### 3. Sombras y glows: box-shadow grandes + radial/linear gradients

- `box-shadow` y los gradients **se rasterizan una vez** (no se repintan solos en scroll); el coste es de **paint inicial** y de **cada repaint** de esa área (transiciones de página, hover, scroll del contenido que pasa por debajo del navbar con blur, etc.). Fuentes: https://web.dev/articles/css-paint-times (drop-shadow = multi-pass con splines; combinaciones como box-shadow + border-radius cuestan más que la suma de las partes) y https://developer.chrome.com/blog/profiling-long-paint-times-with-devtools-continuous-painting-mode ("turning either one of the CSS styles box-shadow or border-radius off reduces the painting time by a big amount. Using both box-shadow and border-radius on an element leads to very expensive painting operations... Avoid using them in areas with lots of repaints").
- "Anything that involves a blur (like a shadow) is going to take longer to paint than, say, drawing a red box". https://web.dev/articles/simplify-paint-complexity-and-reduce-paint-areas .
- **Lo que sí es jank por frame es ANIMAR box-shadow/filter** (hover): cada frame de la transición repinta. https://web.dev/articles/animations-guide ("Avoid any property that triggers layout or paint unless it's absolutely necessary").
- Aplicación al repo: `--shadow-card: 0 25px 80px` + `border-radius: 22px` es exactamente la combinación carísima documentada; los `radial-gradient` de 640×640 px (`post__hero::before`) y 900×900 px (`hero-gradient`) con alfa se rasterizan una vez (paint inicial caro y snapshot de transición caro), pero no causan jank de scroll por sí solos. El `hero-gradient` se anima solo con `transform` (float) → OK, compositing.
- Técnica alternativa para glows: un elemento `::before` con `filter: blur()` + `transform: scale()` (el glow difuminado se rasteriza una vez y se mueve/composita barato), o simplemente reducir el radio de la sombra. https://loke.dev/blog/css-filter-blur-performance-bottlenecks (blur a baja resolución escalado con transform), https://developer.chrome.com/blog/animated-blur (pre-rasterizar y cross-fade con opacity).

### 4. Imágenes: CLS, lazy + view transitions, <Image /> vs <img> plano, preload

- **CLS**: la causa es el `<img>` sin dimensiones; se evita con `width`/`height` attributes o `aspect-ratio` CSS (que es lo que ya tiene el repo en `.latest-articles__image` (16/9) y `.post__image` (16/9, 4/3 en hero)) → el espacio queda reservado y no hay shift al cargar. Fuentes: https://web.dev/articles/optimize-cls ("Always include width and height size attributes on your images... Alternatively, reserve the required space with CSS aspect-ratio"), https://web.dev/articles/browser-level-image-lazy-loading ("To let the browser reserve enough space... we recommend adding width and height attributes... If you can't specify your images' dimensions, lazy loading them increases their impact on CLS"), https://jakearchibald.com/2022/img-aspect-ratio/ (aspect-ratio vs width/height: ambos válidos, matices con picture/Firefox).
- Ojo con un edge case de lazy sin dimensiones: con todas las imágenes a 0×0 el navegador puede decidir que todas caben en el viewport y cargarlas todas (pierde el beneficio). El repo tiene aspect-ratio, así que este caso no aplica. https://web.dev/articles/browser-level-image-lazy-loading .
- **Lazy en cards + view transitions**: sí, hay parpadeo posible. El snapshot del morph se toma con la imagen destino sin descargar/decodificar → rectángulo vacío que hace "pop" al cargar. Con `loading="lazy"` la thumbnail puede no estar decodificada cuando se toma el snapshot (sobre todo al volver atrás). Documentado: https://chromakode.com/post/astro-view-transitions/ y PR oficial https://github.com/withastro/astro/pull/12046 . Además, en Firefox el ClientRouter ignora `loading="lazy"` en el swap (carga eager) → no es jank pero sí comportamiento distinto. https://github.com/withastro/astro/issues/14135 .
- **`<Image />` de Astro** (astro:assets): optimiza en build (webp/avif), genera `srcset`/`sizes` con `layout`, infiere `width`/`height` (evita CLS), añade `loading`/`decoding`, y con `priority` maneja `fetchpriority`. **Las imágenes de `public/` nunca se optimizan** (el repo sirve desde `/assets/content/` = public → hoy pasan de largo por astro:assets). Fuentes: https://docs.astro.build/en/guides/images/ ("Images in your public/ folder are never optimized"; "The Image component optimizes your image and infers width and height... to avoid CLS. It is the preferred way to use images in .astro files"), https://astro.build/blog/images/ (CLS prevention, width/height siempre incluidos).
- **Con el adapter Cloudflare + workerd**: sharp no corre en workerd; `imageService: 'cloudflare'` resuelve la optimización en el edge de Cloudflare (URLs `/cdn-cgi/image/`); la incompatibilidad beta del adapter se resolvió en GA (el componente <Image/> funciona con el adapter Cloudflare). El `optimizeDeps.include: ['astro/assets/services/noop']` del repo sugiere que en dev ya se usa el service noop. Fuentes: https://docs.astro.build/en/guides/images/ (noop service: sin transformación pero con CLS prevention y alt enforcement), https://graham-wright.com/posts/images/ (historia del bug con workerd + nota de que se resolvió en GA).
- **Preload del detalle**: sí conviene. La imagen del post es el elemento LCP del detalle y no está en caché al navegar: `<link rel="preload" as="image" href="..." fetchpriority="high">` en el head (o `<Image priority />`) para que la descarga empiece antes del swap y el morph tenga imagen que mostrar. Fuente: https://web.dev/learn/images/performance-issues (fetchpriority high para el LCP; nunca lazy en above-the-fold), https://docs.astro.build/en/reference/modules/astro-assets/ (propiedad `priority`: "Allows you to automatically set loading, decoding, and fetchpriority attributes to their optimal values for above-the-fold images").

### 5. Astro estático: prácticas de rendimiento de Astro 7 (documentación oficial)

- **Imágenes**: usar `<Image />`/`<Picture />` de `astro:assets` (ver punto 4). Fuente: https://docs.astro.build/en/guides/images/ .
- **Fuentes**: Fonts API oficial (`fonts` en astro.config + `<Font cssVariable="..." preload />` de `astro:assets`): descarga/cachea los woff2 en `/_astro/fonts` (mismo origen, caché de un año), preload selectivo (solo el weight del above-the-fold), fallbacks optimizados (evita CLS por fuentes), subsets. **No** Google Fonts CDN (DNS+TLS+CSS+font = cadena render-blocking; caso real: FCP 6.1 s). Fuentes: https://docs.astro.build/en/guides/fonts/ , https://docs.astro.build/en/reference/modules/astro-assets/ (Font), https://acecore.net/en/blog/astro-performance-tuning/ .
- **CSS**: `build.inlineStylesheets` (default `'auto'`): CSS pequeño (~<20 KiB) inline en el HTML (menos requests render-blocking); CSS grande externo con caché immutable (`/_astro/* → Cache-Control: public, max-age=31536000, immutable`). Fuentes: https://docs.astro.build/en/reference/configuration-reference/ (build.inlineStylesheets), https://acecore.net/en/blog/astro-performance-tuning/ (umbral ~20 KiB, caché immutable en Cloudflare).
- **Preconnect**: solo hace falta si hay orígenes externos (Google Fonts, analytics…). Este sitio no carga nada externo (salvo el link a x.com que es un href normal): no se necesita preconnect. Fuente: https://docs.astro.build/en/guides/fonts/ (self-host elimina terceros), https://web.dev/articles/font-best-practices .
- **Zero JS**: mantener la regla del proyecto (todo estático, sin `client:*`); el único JS es el ClientRouter + prefetch. El prefetch del ClientRouter ya precarga el HTML de los links (hover + viewport) → la navegación no espera red, solo render. Fuentes: https://docs.astro.build/en/guides/prefetch/ ("When you use Astro's <ClientRouter /> on a page, prefetching will also be enabled by default. It sets a default configuration of { prefetchAll: true }"), https://github.com/withastro/astro/blob/main/packages/astro/components/ClientRouter.astro (`init({ prefetchAll: true })`).

### 6. CLS / layout shift al volver de una página

- El hero del detalle tiene dimensiones reservadas (grid `1fr 1fr` + `aspect-ratio` en la imagen y título con tamaño clamp), así que **no hay layout shift estructural al volver**: el espacio ya está reservado. La sensación de "salto" al volver suele ser el flash del crossfade + el morph de la imagen sin decodificar, no un shift de layout. Fuentes: https://web.dev/articles/optimize-cls (reservar espacio con aspect-ratio elimina el shift; los shifts en interacciones ≤500 ms no cuentan para CLS), https://chromakode.com/post/astro-view-transitions/ .
- El ClientRouter restaura el scroll position en navegación atrás (behavior del router); con imágenes ya en caché (bfcache/memory cache) no hay re-render con shift. https://docs.astro.build/en/guides/view-transitions/ (router events/scroll restoration), https://web.dev/articles/optimize-cls (bfcache evita shifts repetidos al volver).
- Riesgo real de shift al volver: solo si alguna imagen del listado no está en caché y su contenedor colapsa — no ocurre aquí porque `aspect-ratio` reserva el espacio siempre.

---

## Causas más probables del lag EN ESTE sitio (priorizadas)

1. **Navbar sticky con `backdrop-filter: blur(18px)` (layout.css)** — jank de scroll. Justificación: navbar full-width sticky; en cada frame de scroll el contenido de atrás cambia y el blur(18px) se recalcula (captura + convolución + composite) sobre millones de píxeles; es el patrón exacto documentado como "jittery mess" (loke.dev) y el único elemento del sitio que se repinta continuamente durante scroll. Además el resto del scroll es barato (todo estático), así que este es el sospechoso nº 1 del "lagueo al hacer scroll".
2. **Hover de cards con `box-shadow` + `filter: contrast(1.4)` + `transform` (hero-card.css, latest-articles.css)** — jank de paint en interacción. Justificación: `transition: .28s` anima propiedades de paint (box-shadow, filter) → repaint por frame durante 280 ms; `filter` repinta la card + su SVG gigante (icon-scale 5 → ~750 px). Al scrollear con el cursor sobre cards (típico en un grid), el hover se dispara en mitad del scroll y se pierden frames. `box-shadow` + `border-radius` es la combinación de paint más cara documentada (Chrome blog).
3. **View transitions: snapshot de página completa + morph de imagen sin caché** — jank/flash al navegar. Justificación: al navegar index→post, el grupo `root` rasteriza la página nueva completa (navbar con blur, panel con sombra de 80 px, glows de 640 px, texto con text-shadow) para el crossfade; y la imagen del post (112 KB, sin lazy pero recién descargada) puede no estar decodificada al tomar el snapshot del morph → rectángulo vacío + pop (chromakode, issue #12045). El prefetch ya elimina el coste de red; lo que se nota es la rasterización.
4. **Paint inicial caro del detalle: `box-shadow: 0 25px 80px` + `border-radius: 22px` + radial 640 px + text-shadow 32 px (post-header.css)** — agrava todo lo anterior (primer paint, snapshots de transición, repaints del área durante el crossfade), aunque por sí solo no causa jank de scroll continuo.
5. **`loading="lazy"` + `transition:name` en las thumbnails** — parpadeo posible en el morph (especialmente al volver al index) y comportamiento divergente en Firefox (lazy roto por el ClientRouter). No causa CLS (aspect-ratio lo cubre).
6. **No hay CLS estructural ni problemas de fuentes**: Inter no se carga (system-ui real), así que no hay FOUT/FOIT; las imágenes tienen aspect-ratio → CLS bajo. El lag NO viene de ahí.

---

## Recomendaciones concretas y aplicables

**A. Navbar (layout.css) — acción de mayor impacto para el scroll:**
- Opción 1 (recomendada, mantiene estética): quitar `backdrop-filter` y subir el alpha del fondo: `background: rgba(8,8,18,.92)` (ajustar `--color-navbar` en tokens.css). Con el borde inferior existente, el navbar se ve casi igual y el scroll queda en puro compositing.
- Opción 2 (blur reducido): `backdrop-filter: blur(8px)` + `background: rgba(8,8,18,.85)` — coste mucho menor (la convolución escala con el radio), aún así es paint por frame en scroll.
- Opción 3: mantener blur(18px) solo ≥1024 px con buena GPU y degradar en móvil con `@supports` — no recomendado; el blur no aporta legibilidad aquí (el fondo ya tiene alpha alto).
- No usar `will-change: backdrop-filter` (no resuelve el re-blur y gasta memoria).

**B. Hovers de cards (hero-card.css, latest-articles.css):**
- `.hero-card:hover`: dejar **solo** `transform: translateY(-4px)` y `border-color: var(--color-accent)`; **quitar `filter: contrast(1.4)` y `box-shadow` del hover** (o dejar la sombra fija en estado base, sin transicionarla).
- `.latest-articles__card:hover`: `border-color: var(--color-accent)` + `transform: translateY(-2px)`; quitar `box-shadow: var(--shadow-card-hover)`.
- Si se quiere conservar el efecto de sombra al hover, alternativa barata: un `::after` con `filter: blur()` pre-rasterizado animado solo con opacity (técnica Chrome: cross-fade de capas ya borrosas, https://developer.chrome.com/blog/animated-blur).
- Acortar `--transition-default` a `~.18s` para hovers (menos frames de paint si queda alguno).

**C. View transitions (Layout.astro):**
- En el `<html>` del layout: `<html transition:animate="none">` — elimina el crossfade del snapshot de página completa (grupo `root`) y conserva los morphs de los elementos con `transition:name` (imagen + título del post), que es exactamente el efecto deseado. Alternativa equivalente en CSS global: `::view-transition-group(root), ::view-transition-old(root), ::view-transition-new(root) { animation: none; }` (fuente: issue #10241).
- Si se prefiere mantener un fade suave de página: acotar la duración del grupo `root` a ~150–200 ms con easing ease-out (nunca animar propiedades de paint en los keyframes; solo opacity/transform).
- Verificar `prefers-reduced-motion` (Astro lo respeta automáticamente).

**D. Imagen del detalle (posts/[id].astro):**
- Preload del LCP: en el `<head>` del detalle `<link rel="preload" as="image" href={`/assets/content/${img}`} fetchpriority="high" />` (vía prop del Layout o un slot en head) — la descarga empieza antes del swap y el morph tiene imagen decodificada.
- Añadir `width`/`height` reales a los `<img>` (leer las dimensiones de los webp; p.ej. 1600×900) además del `aspect-ratio` — redundante pero barato y mejora el reservado en todos los navegadores (Jake Archibald: width/height + CSS `height: auto` es la vía más robusta).
- En las cards (latest-articles.astro): mantener `loading="lazy"` (están fuera del viewport inicial salvo la primera) pero **quitar lazy de la primera card** si entra en el viewport inicial (web.dev: lazy solo below-the-fold; retrasa LCP). Documentar que en Firefox el ClientRouter las carga eager (issue #14135).

**E. Migración a astro:assets (a medio plazo, si se aprueba):**
- Mover las imágenes de `public/assets/content/` a `src/assets/` (o usar el servicio `cloudflare` del adapter) y usar `<Image layout="constrained" ... />` en cards y detalle: gana width/height inferidos (CLS), srcset/sizes, webp/avif y `priority` para el LCP. Nota: con `public/` las imágenes nunca se optimizan (docs oficiales); con `imageService: 'cloudflare'` la transformación ocurre en el edge (primer request con coste de TTFB, luego caché).

**F. Fuentes (decisión de producto):**
- Inter hoy NO se carga → el sitio usa system-ui (cero descarga, cero jank por fuentes). Si el humano quiere Inter real: Fonts API de Astro 7 (`fontProviders.fontsource()`, weights 400/500/600/700, subsets latin, `<Font cssVariable="--font-inter" preload />` solo para el weight principal). No usar Google Fonts CDN (render-blocking multi-origen documentado). La var `--font-sans` queda igual (`Inter, ui-sans-serif, system-ui, sans-serif`).

**G. Verificación con DevTools/Lighthouse (antes y después):**
- Rendering tab → **Paint Flashing** (verde = repaints): confirmar si el navbar repinta en cada scroll; **Scrolling Performance Issues** (teal) y Layers panel → Paint Profiler para el coste de las sombras. Fuentes: https://developer.chrome.com/docs/devtools/rendering/performance , https://developer.chrome.com/docs/devtools/layers .
- Performance panel: grabar scroll y navegación; medir frames >16 ms y tareas de paint (paint profiler con advanced instrumentation).
- Lighthouse: auditorías "Image elements have explicit width and height" y CLS; los hovers/shifts post-load >500 ms no cuentan para CLS pero el jank sí se percibe.

---

## Pendientes anotados (no investigados en esta sesión)

- Medir con Lighthouse/CrUX el estado actual del sitio (LCP/CLS/INP) para cuantificar el cambio — requiere correr la herramienta sobre el deploy, no es investigación documental.
- Evaluar si `build.inlineStylesheets: 'auto'` ya está produciendo CSS inline razonable con el CSS total actual del sitio (~10 archivos) — requiere inspeccionar el build de producción.
- El grid de 12 columnas del hero con `grid-auto-rows: 95px` y 12 cards: verificar en móvil si el reflow de breakpoints (1200/768 px) añade coste — probablemente irrelevante (cambio de layout puntual, no por frame).

## Fuentes principales

- Astro docs — View transitions: https://docs.astro.build/en/guides/view-transitions/
- Astro docs — Images (astro:assets, <Image/>, public/ no se optimiza, noop): https://docs.astro.build/en/guides/images/
- Astro docs — Fonts (Fonts API, preload, fallbacks): https://docs.astro.build/en/guides/fonts/
- Astro docs — Prefetch (ClientRouter habilita prefetchAll por defecto): https://docs.astro.build/en/guides/prefetch/
- Astro issue #10241 (desactivar fade del root): https://github.com/withastro/astro/issues/10241
- Astro PR #12046 / issue #12045 (flicker de imágenes en morph): https://github.com/withastro/astro/pull/12046
- Astro issue #14135 (ClientRouter rompe lazy en Firefox): https://github.com/withastro/astro/issues/14135
- web.dev — Animations guide: https://web.dev/articles/animations-guide
- web.dev — Animations and performance: https://web.dev/articles/animations-and-performance
- web.dev — Rendering performance: https://web.dev/articles/rendering-performance
- web.dev — Simplify paint complexity: https://web.dev/articles/simplify-paint-complexity-and-reduce-paint-areas
- web.dev — CSS paint times: https://web.dev/articles/css-paint-times
- web.dev — backdrop-filter: https://web.dev/articles/backdrop-filter
- web.dev — Optimize CLS: https://web.dev/articles/optimize-cls
- web.dev — Browser-level image lazy loading: https://web.dev/articles/browser-level-image-lazy-loading
- web.dev — CSS for Web Vitals: https://web.dev/articles/css-web-vitals
- web.dev — Learn images / performance issues: https://web.dev/learn/images/performance-issues
- MDN — backdrop-filter: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- Chrome Developers — Animating a blur: https://developer.chrome.com/blog/animated-blur
- Chrome Developers — Profiling long paint times: https://developer.chrome.com/blog/profiling-long-paint-times-with-devtools-continuous-painting-mode
- Chrome DevTools — Rendering performance: https://developer.chrome.com/docs/devtools/rendering/performance
- Chrome DevTools — Layers panel: https://developer.chrome.com/docs/devtools/layers
- loke.dev — CSS filter/blur performance bottlenecks: https://loke.dev/blog/css-filter-blur-performance-bottlenecks
- Jameshfisher — backdrop-blur flickering en Chrome: https://jameshfisher.com/2024/04/23/backdrop-blur-without-the-flickering/
- Stack Overflow — backdrop-filter expensive: https://stackoverflow.com/questions/79218159/why-is-backdrop-filter-expensive-on-elements-containing-an-animation
- Mozilla Bugzilla #1718471 y #1988728 (backdrop-filter laggy): https://bugzilla.mozilla.org/show_bug.cgi?id=1718471 , https://bugzilla.mozilla.org/show_bug.cgi?id=1988728
- chromakode — Astro view transitions (jank de imágenes): https://chromakode.com/post/astro-view-transitions/
- pkglog — Astro view transitions advanced (performance): https://pkglog.com/en/blog/astro-view-transitions-advanced-guide/
- Jake Archibald — aspect-ratio vs width/height: https://jakearchibald.com/2022/img-aspect-ratio/
- Astro blog — Better Images in Astro (CLS prevention): https://astro.build/blog/images/
- acecore — Astro performance tuning (fonts, inline CSS, caché): https://acecore.net/en/blog/astro-performance-tuning/
- graham-wright — images en Astro + Cloudflare workerd (contexto del adapter): https://graham-wright.com/posts/images/
- Astro source — ClientRouter.astro (prefetchAll: true): https://github.com/withastro/astro/blob/main/packages/astro/components/ClientRouter.astro