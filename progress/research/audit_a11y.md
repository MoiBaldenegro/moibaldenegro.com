# Auditoría de accesibilidad (WCAG 2.2 AA) y UX — moibaldenegro.com

- Fecha: 2026-10-08 · Agente: explorer · Feature ligada: ninguna (auditoría transversal)
- Stack verificado en el repo: `astro` 7.2.0 (`node_modules/astro/package.json`), `@astrojs/cloudflare` ^14.2.1, salida `server` con páginas prerender (`astro.config.mjs`).
- Alcance: `src/layouts`, `src/components`, `src/pages`, `src/styles/*.css`, `src/styles/tokens.css` y el HTML generado en `dist/client/` (build del 2026-10-08 12:39).

## 0. Limitación importante: producción no accesible

`https://moibaldenegro.com` y `https://www.moibaldenegro.com` **no resuelven**: `getaddrinfo ENOTFOUND` desde WebFetch y curl, y
`https://dns.google/resolve?name=moibaldenegro.com&type=A` devuelve `{"Status":3}` (NXDOMAIN, el dominio no existe en la zona `.com`)
a fecha 2026-10-08. Por eso **no se pudo revisar el sitio en vivo**. Como sustituto se auditó el HTML ya compilado en
`dist/client/index.html`, `dist/client/search/index.html` y `dist/client/posts/03-principios solid/index.html`, junto con el código fuente.
Los puntos que dependen del render real (desbordes en móvil, contraste sobre degradados) están marcados como **«verificar en navegador»**.

> **Hallazgo operativo (Alta, no es WCAG):** el dominio está caído o sin registrar (NXDOMAIN). Revisa el registro y el DNS del dominio
> y el custom domain del Worker `moibaldenegro-web` (`wrangler.jsonc`).

## 1. Contraste de los tokens (calculado con la fórmula de luminancia relativa de WCAG)

| Par (texto / fondo) | Ratio | Resultado |
|---|---|---|
| `--color-text` #fff / `--color-background` #070716 · `--color-surface` #101018 | 19.98 · 18.93 | OK |
| `--color-text-secondary` #b8b8c5 / background · surface · navbar | 10.18 · 9.65 · 10.15 | OK |
| `--color-accent` #7d68ff / background · surface · navbar | 5.04 · 4.77 · 5.02 | OK (AA texto normal) |
| `--color-accent-hover` #9a89ff / surface | 6.67 | OK |
| `--color-accent` / `--color-hero-top` #25144f | 4.10 | **Falla** en texto normal |
| Kicker `.post__kicker` (accent sobre accent 12 % + hero-top) | ~3.54 | **Falla** (texto de 0.8rem) |
| `--color-username-text` #5fd6ff / #081a28 | 10.56 | OK |
| Blanco / colores de marca de las tarjetas del hero (12 tokens) | 5.15–18.71 | OK |
| Blanco / `--color-verified` #17b8ff (insignia ✓) | 2.25 | **Falla** (1.4.3 y 1.4.11) |
| Icono de copiar (text-secondary con opacity .7) / surface | 5.26 | OK |
| Borde del input `--color-border` (.08) / navbar | 1.28 | Bajo (1.4.11) |
| Cambio de borde al enfocar el input (.08 → .15) | 1.26 | **Falla** como indicador de foco |
| Anillo de foco `--color-accent` / background | 5.04 | OK |
| Tokens Shiki github-dark sobre surface (#E1E4E8, #F97583, #B392F0, #9ECBFF, #79B8FF) | 7.1–14.8 | OK; el comentario #6A737D da **3.93** (hoy no aparece en ningún post) |

Fuente del criterio: https://www.w3.org/TR/WCAG22/#contrast-minimum y https://www.w3.org/TR/WCAG22/#non-text-contrast

## 2. Hallazgos priorizados

### Alta

**A1. Los resultados de búsqueda no se anuncian a lectores de pantalla (no hay `aria-live`)**
- Evidencia: `src/components/search-live/search-live.astro:6-12` y `src/components/search-results/search-results.astro:5-23`. No hay ningún `aria-live` ni `role="status"` en `src/` (grep vacío). `search-live.ts:66` y `search-results-controller.ts:60` reescriben la lista con `innerHTML`, y el estado vacío solo se cambia con `hidden`.
- WCAG: 4.1.3 Status Messages (AA) — https://www.w3.org/TR/WCAG22/#status-messages
- Recomendación: añade un único nodo `<p class="visually-hidden" role="status" aria-live="polite" data-search-status></p>` en cada vista y rellénalo desde el controlador con «N resultados para "x"» o «Sin resultados para "x"». Aplica debounce (~300 ms) en la portada para no anunciar cada tecla. Tampoco hay ningún contador visible de resultados; mostrarlo también ayuda a la UX.

**A2. El input del buscador del header no tiene un indicador de foco visible**
- Evidencia: `src/styles/search-bar.css:27-30` (`outline: none` y el borde pasa de rgba .08 a .15, con un cambio de contraste de 1.26:1).
- WCAG: 2.4.7 Focus Visible (AA) y 1.4.11 Non-text Contrast (AA) — https://www.w3.org/TR/WCAG22/#focus-visible
- Recomendación: usa `.search-bar__input:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`, igual que `layout.css:62-65`. Mejor aún, generaliza la regla de foco de `layout.css:62` a `:where(a, button, input, [tabindex]):focus-visible`.

**A3. El botón «Limpiar búsqueda» del estado vacío de /search no hace nada (selector colisionado)**
- Evidencia: `search-results-controller.ts:78` usa `document.querySelector('[data-search-clear]')`, que devuelve el **primer** elemento del documento. En el HTML compilado (`dist/client/search/index.html`) ese primer elemento es el × del header (`search-bar.astro:12`), no `.search-results__clear` (`search-results.astro:15`). El botón visible del estado vacío se queda sin manejador, y el × del header recibe un manejador ajeno.
- WCAG: no es un fallo directo de un criterio, pero rompe la operabilidad del control (relacionado con 2.1.1 y 4.1.2). Es un bug de UX grave.
- Recomendación: cambia el atributo del botón de resultados (p. ej. `data-search-results-clear`) o busca dentro de la raíz `.search-results`. Añade un test que compruebe que el botón del estado vacío restaura la guía.

**A4. No hay enlace «saltar al contenido» y el `<main>` de la portada solo envuelve el hero**
- Evidencia: `src/layouts/Layout.astro:33-45` no tiene skip link. En la portada, `<main class="hero-grid">` está dentro de `<section class="new-hero">` (`new-hero.astro:15-22`). «Últimos artículos», HTB y los resultados en vivo (`index.astro:29-35`) quedan **fuera** de `main`. Además, un `main` descendiente de `section` no es «hierarchically correct» según HTML.
- WCAG: 2.4.1 Bypass Blocks (A) y 1.3.1 Info and Relationships (A) — https://www.w3.org/TR/WCAG22/#bypass-blocks
- Recomendación: mueve `<main id="contenido">` al Layout envolviendo el `<slot />` y cambia los `main` de las páginas y del hero por `div` o `section`. Añade como primer hijo de `body` el enlace `<a class="skip-link" href="#contenido">Saltar al contenido</a>`, visible al recibir foco (CSS en `layout.css` y solo con tokens).

### Media

**M1. La cabecera sticky puede tapar el foco y las anclas; en móvil se desborda**
- Evidencia: `layout.css:20-31` (`position: sticky` y `height: 74px` fijos) junto con `search-bar.css:63-74` (`flex-wrap: wrap` y buscador al 100 %). Con altura fija y dos o más líneas de flex, el buscador queda fuera de la caja del header (con 320 px, el logo, los 3 enlaces y los gaps de 24 px ya superan el ancho y generan 3 líneas). Tampoco hay `scroll-padding-top`, así que las anclas de los h2 (`#principio-...`) quedan bajo la barra. **Verificar en navegador a 320 px y con zoom al 400 %.**
- WCAG: 2.4.11 Focus Not Obscured (Minimum) (AA) y 1.4.10 Reflow (AA) — https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum
- Recomendación: en móvil usa `height: auto; min-height: 74px` con padding vertical. Añade `html { scroll-padding-top: <alto del header> }` (como token). Valora que el header no sea sticky en viewports bajos (`@media (max-height: 500px)`).

**M2. El objetivo táctil del × del buscador es demasiado pequeño**
- Evidencia: `search-bar.css:34-51` (`padding: 0` y `font-size: 1rem`, unos 9×16 px, dentro del input). El círculo de 24 px se solapa con el input, que es otro objetivo, así que no aplica la excepción de espaciado.
- WCAG: 2.5.8 Target Size (Minimum) (AA) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Recomendación: botón de `width/height: 32px` con el glifo centrado, y padding derecho del input en consonancia. Añade también un estilo `:focus-visible`.

**M3. La insignia «✓ verificado» no tiene texto accesible y su contraste es de 2.25:1**
- Evidencia: `new-hero.astro:35-39` y `profile-card.css:42-49`.
- WCAG: 1.1.1 Non-text Content (A), 1.4.3 / 1.4.11 (AA).
- Recomendación: `<span class="verified"><span aria-hidden="true">✓</span><span class="visually-hidden">Verificado</span></span>`. Oscurece el fondo (crea un token nuevo, p. ej. `--color-verified` con ≥3:1 contra el blanco, como #0b7fb3) o usa texto oscuro.

**M4. El kicker del artículo tiene un contraste insuficiente sobre el degradado**
- Evidencia: `post-header.css:60-72` (accent sobre accent 12 % y `--color-hero-top`, unos 3.54:1; texto de 0.8rem/700, que no cuenta como texto grande). **Verificar en navegador**, porque el fondo es un degradado con glow.
- WCAG: 1.4.3 Contrast (Minimum) (AA).
- Recomendación: usa `--color-accent-hover` (#9a89ff, unos 5.5:1 sobre hero-top) como color del texto del kicker.

**M5. El botón «Copiar código» no confirma el copiado de forma fiable ni avisa del fallo**
- Evidencia: `code-copy.ts:39-44` solo cambia el `aria-label` a «¡Copiado!»; muchos lectores no anuncian el cambio de nombre de un botón ya enfocado. Si falla (`code-copy.ts:38`, `return`), no hay ningún feedback. Visualmente solo cambia el color del icono. El botón está posicionado en absoluto dentro del `pre` con `overflow-x: auto` (`code-copy.css:5-12`, `post.css:86-93`), así que se desplaza con el scroll horizontal.
- WCAG: 4.1.3 Status Messages (AA).
- Lo que está bien: es un `<button type="button">` con `aria-label`, el SVG tiene `aria-hidden`, el foco visible es de 2 px accent y el objetivo de 30×30 px cumple 2.5.8.
- Recomendación: añade una región `role="status"` compartida, visualmente oculta, con «Código copiado» o «No se pudo copiar». Incluye un texto visible breve junto al icono. Para que el botón no se desplace, envuelve el `pre` en un contenedor `position: relative`; esto requiere tocar el DOM del markdown desde `code-copy.ts`.

**M6. La paginación de /search acumula listeners y pierde el foco**
- Evidencia: `search-results-controller.ts:66-75`. Cada `renderSearch` añade un nuevo `addEventListener('click')` a Anterior y Siguiente sin quitar los anteriores, así que un clic dispara varios renders de páginas obsoletas. Al llegar al límite, el botón enfocado pasa a `disabled` y el foco cae a `body`. Con `PAGE_SIZE = 6` (`src/domain/search/search.ts:13`) y 8 posts, ya hay 2 páginas en búsquedas amplias.
- WCAG: 2.4.3 Focus Order (A) y 4.1.3 (la etiqueta «Página X de Y» no se anuncia).
- Recomendación: registra los listeners una sola vez fuera de `renderSearch` y guarda la página actual en una variable. Tras cambiar de página, mueve el foco al encabezado de resultados (`tabindex="-1"`) o anúncialo en la región de estado de A1.

**M7. Las imágenes con alt duplicado hacen que el título se lea dos veces**
- Evidencia: `latest-articles.astro:17-25`: el enlace contiene `img alt={title}` y `h2 {title}`, así que su nombre accesible es «Título Título». También pasa en `item-html.ts:12` (miniatura con alt = título junto al enlace del título), `posts/[id].astro:47` (alt = h1) y `posts/[id].astro:71`.
- WCAG: 1.1.1 Non-text Content (A) y la técnica H2 (combinar imagen y texto en un solo enlace): https://www.w3.org/WAI/WCAG22/Techniques/html/H2
- Recomendación: pon `alt=""` en las miniaturas y portadas que acompañan al título, o un alt que describa la imagen en vez de repetir el título.

### Baja

- **B1. Jerarquía de encabezados.** En la portada hay un h1 seguido de 12 `h3` de las tarjetas del hero sin h2 previo (`hero-card.astro:14`). Los títulos de las cards son `h2` al mismo nivel que «Últimos artículos» (`latest-articles.astro:13` y `:25`). `/about` tiene **dos h1** (`about.astro:15` y `:20`). Criterio: 1.3.1 (buena práctica). Recomendación: tarjetas del hero como lista `ul/li` sin encabezado, títulos de las cards como `h3` y el segundo h1 de about como `p` o `h2`.
- **B2. Iconos SVG de las tarjetas sin `aria-hidden="true"`** (`hero-card.astro:18-20`). Además, las tarjetas tienen hover con elevación (`hero-card.css:17-21`) pero no son enlaces, lo que confunde: o se enlazan (YouTube, Twitch, GitHub) o se quita el efecto de affordance. Hay tarjetas repetidas (NODE JS, GITHUB ACTIONS, YOUTUBE y TWITCH aparecen 2 veces en `dist/client/index.html`).
- **B3. Animación infinita del glow del hero** (`hero-section.css:28`, `float 10s infinite`) y transforms en hover (`hero-card.css:17-21`, `profile-card.css:17`) sin `@media (prefers-reduced-motion: reduce)`. No hay ninguna regla de reduced-motion en `src/` (grep vacío). Es decorativo y de 6 px, así que el riesgo es bajo. Criterios relacionados: 2.2.2 Pause, Stop, Hide (A) y 2.3.3 (AAA). Recomendación: un bloque global en `layout.css` que desactive `animation` y `transition` con `reduce`.
- **B4. View transitions: correcto.** `<ClientRouter />` desactiva todas sus animaciones con `prefers-reduced-motion` (confirmado en el CSS generado: `@media (prefers-reduced-motion){::view-transition-group(*){animation:none!important}...` en `dist/client/index.html`) e incluye un route announcer `aria-live="assertive"` que lee el `<title>` (`node_modules/astro/dist/transitions/router.js:11-27`). Fuente: https://docs.astro.build/en/guides/view-transitions/ (secciones «prefers-reduced-motion» y «Route announcement»). Como consecuencia, conviene que cada `<title>` sea descriptivo. Hoy los posts usan solo el título del artículo (`posts/[id].astro:44`); usa «Título — moibaldenegro.com» por consistencia con `/about`.
- **B5. El buscador no está marcado como búsqueda ni funciona sin JS.** Es un `<input type="text">` suelto dentro de `<nav>` (`search-bar.astro:5-15`), sin `form`, sin botón de envío y solo con Enter (`search-bar.ts:55-57`). Recomendación: `<search><form action="/search" method="get" role="search">` con `<input type="search" name="q" enterkeyhint="search">`, que funciona sin JS (mejora progresiva) y crea un landmark de búsqueda. El `aria-label` actual sí cumple 1.3.1, 3.3.2 y 4.1.2.
- **B6. Comportamiento de Escape.** Correcto en general: Escape limpia y devuelve el foco al input en la portada (`search-escape.ts:59-66` → `search-bar.ts:39-45`). Detalles de UX: en `/search` el input del header no muestra el término `q` activo, así que el usuario no ve qué buscó ni puede editarlo. El listener está en `document` y actúa aunque el foco esté fuera del buscador. Recomendación: precargar el input con `q` en `/search` y limitar Escape a cuando el foco esté en el input o en la región de resultados.
- **B7. Botones sin estilo de foco propio.** Paginación, «Limpiar búsqueda» y × (`search-results.css:24,45`, `search-bar.css:34`) dependen del anillo por defecto del navegador. Hoy se ve, pero es inconsistente. Lo resuelve la regla global propuesta en A2.
- **B8. Enlace del logo.** Su nombre accesible es «Logo de moibaldenegro.com» (`Layout.astro:36`) y describe la imagen, no el destino. Recomendación: `alt="Inicio — moibaldenegro.com"`. Además, la imagen tiene `width="72"` pero no `height`, lo que causa un salto de layout (UX y CLS).
- **B9. Enlace externo a x.com sin aviso** (`Layout.astro:39`). Recomendación: un texto o icono «(X, sitio externo)». Criterio relacionado: 2.4.4 (buena práctica).
- **B10. Los enlaces de «Recomendados» solo cubren el texto del título** (`posts/[id].astro:70-75`), pero la fila completa tiene hover (`post-next.css:12`). Esto es inconsistente con los resultados de búsqueda, que usan `::after` para extender el área (`search-results.css:36`). Recomendación: el mismo patrón de enlace extendido.
- **B11. El fallback de HTB «Cargando estadísticas…»** (`index.astro:31`) desaparece sin aviso y, si la API falla, no queda nada. Esto es aceptable, solo es informativo.
- **B12. Lo que ya cumple:** `lang="es"` (`Layout.astro:16`), viewport sin bloquear el zoom (`Layout.astro:26`), `aria-current="page"` en la navbar con indicador visual que no depende solo del color (subrayado, `layout.css:53-58`), anillo de foco en enlaces (`layout.css:62-65`, 5.04:1), `iframe` de YouTube con `title` (`02-principios.md:40-45`), `pre` de Shiki con `tabindex="0"` (scroll accesible por teclado), enlaces del cuerpo de los posts subrayados (no dependen del color; `post.css:74-77`) y paginación en un `<nav aria-label>`.

## 3. Orden sugerido para crear features (vía spec_author)

1. A3 (bug de clear) y M6 (listeners de paginación): son bugs funcionales y baratos de arreglar.
2. A1 (región de estado compartida), que también resuelve parte de M5 y M6.
3. A2, B7 y M2 (foco global y objetivo del ×).
4. A4 (main en el Layout y skip link) y M1 (header en móvil y `scroll-padding-top`).
5. M3, M4 y M7 (insignia, kicker y alts) y el resto de Bajas.

## 4. Pendientes fuera de alcance (no investigados)

- Restaurar el DNS del dominio y repetir esta auditoría sobre producción con axe-core o Lighthouse y un lector de pantalla real (NVDA y VoiceOver).
- Slugs con espacio y caracteres no ASCII en URLs (`dist/client/posts/03-principios solid/`, `01-diseño-detallado`), que afectan a la UX y a los enlaces compartidos.
- Ausencia de `<meta name="description">` y de página 404 propia (SEO y UX).
- El token de comentario de Shiki (#6A737D, 3.93:1) fallará cuando un post incluya comentarios de código.

## Fuentes

- WCAG 2.2 (norma): https://www.w3.org/TR/WCAG22/
- Understanding 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Técnica H2: https://www.w3.org/WAI/WCAG22/Techniques/html/H2
- Astro View Transitions, accesibilidad: https://docs.astro.build/en/guides/view-transitions/
- Resolución DNS: https://dns.google/resolve?name=moibaldenegro.com&type=A
