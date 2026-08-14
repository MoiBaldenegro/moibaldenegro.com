# Investigación: imagen del hero perdida al volver atrás (Astro ClientRouter + view transitions)

> Fecha: 2026-08-14 · Repo: moibaldenegro.com (astro ^7.2.0, @astrojs/cloudflare ^14.2.1, prerender estático) · Contexto: feature 24 (view transitions / ClientRouter)

## Resumen ejecutivo (5 líneas)

1. En navegación back, el `<ClientRouter />` de Astro **re-fetchea y re-parsea la portada con DOMParser** y reemplaza el `<body>`: el `<img>` del hero es un nodo nuevo que debe volver a cargarse, y si no está cargado/decodificado cuando Chromium monta la capa viva `::view-transition-new`, el hero queda en blanco durante (y a veces después de) la transición.
2. El síntoma coincide con un **bug de Chromium confirmado** — issues.chromium.org/331926174 + withastro/astro#10595: distorsión/áreas en blanco en páginas largas con muchas imágenes (exactamente el caso de la portada); más probable con DevTools abiertas; sin fix general, solo workarounds.
3. `transition:persist` **solo funciona si el elemento existe en ambas páginas** (verificado en el código fuente de Astro, `swap-functions.ts`): persist solo en la portada no sirve. La solución robusta es persistir el `<img>` del hero en las dos páginas (visible en portada + copia oculta en el detalle) para que el mismo nodo se mueva y nunca se re-cree desde DOMParser.
4. En Firefox, las imágenes `loading="lazy"` provenientes de DOMParser **ignoran el lazy y cargan eager** al navegar con ClientRouter (withastro/astro#14135, cerrado wontfix) — afecta a las cards si se conserva lazy.
5. Acciones concretas: persist del hero en ambas páginas, `<link rel="preload" as="image">` del hero en el head, quitar `transition:name` de las imágenes de cards/detalle (o `transition:animate="none"` + preload) y conservar el morph solo en el título, mantener dimensiones fijas (ya hay `aspect-ratio`), probar con DevTools cerradas y abiertas.

---

## 1. Contexto verificado en el repo

- `src/layouts/Layout.astro` L4/L22: `import { ClientRouter } from 'astro:transitions'` + `<ClientRouter />` (sin `fallback` → default `animate`).
- `src/pages/index.astro`: portada con `NewHero` (hero) + `LatestArticles` (cards) + `HtbStadistics` (`server:defer`); `prerender = true`.
- `src/components/new-hero/new-hero.astro` L26-29: `<img src={profile.image} alt={profile.name}>` — SIN `transition:name`, SIN `loading` (eager). Es la imagen que se pierde.
- `src/components/latest-articles.astro` L19-22: `<img loading="lazy" transition:name={`img-${post.id}`}>` y `<h2 transition:name={`title-${post.id}`}>`, dentro de `<a href={`/posts/${post.id}`}>`.
- `src/pages/posts/[id].astro` L40-43: `<img transition:name={`img-${entry.id}`}>` (sin `loading`) y `<h1 transition:name={`title-${entry.id}`}>`; `prerender = true`.
- No existe `transition:persist` en ningún archivo.
- Dimensiones: `.profile-image` con `height: 68%` e img `width/height: 100%` (`src/styles/profile-card.css`); `.latest-articles__image` y `.post__image` con `aspect-ratio` (16/9 y 4/3). **Se descarta la hipótesis de snapshot 0×0 por falta de dimensiones.**

## 2. Mecánica verificada (fuente primaria: código fuente de Astro)

- **No hay caché de DOM previo.** Cada navegación (clic, back vía popstate, forward) ejecuta `fetchHTML()` + `parser.parseFromString()` (DOMParser) y luego el swap. Ver: `packages/astro/src/transitions/router.ts` (`transition()` → `defaultLoader()` → `fetchHTML`/`parseFromString`; `onPopState` → `transition('back', ...)`).
- **Swap = `document.body.replaceWith(newDocument.body)`.** Ver: `packages/astro/src/transitions/swap-functions.ts` (`swapBodyElement`). Los `<img>` del documento nuevo nacen en un documento inerte (DOMParser) y empiezan a cargar al insertarse en el DOM vivo.
- **`transition:persist` exige match en ambas páginas:** `const newEl = newElement.querySelector('[data-astro-transition-persist="id"]'); if (!newEl) continue;` — si el elemento no existe en la página destino, el viejo se descarta con el body viejo. Por tanto persist del hero SOLO en la portada no persiste nada.
- **Precedente DOMParser:** `reifyMediaElements()` re-crea `<video>/<audio>` con `document.createElement()` porque los elementos de DOMParser no inicializan su media stack (ver #17601). **No hay reificación equivalente para `<img>`** — los imgs dependen del comportamiento del navegador.
- **El router pre-carga solo stylesheets** (`preloadStyleLinks()`), nunca imágenes.
- La transición por defecto es `fade` (crossfade con `mix-blend-mode: plus-lighter` por el navegador); el `<html>` recibe `data-astro-transition="back"` durante la navegación back (útil para CSS direccional).

## 3. Por qué se pierde el hero al volver atrás (síntesis de evidencias)

1. Back → la portada se re-fetchea (depende de la caché HTTP; #10311 documenta que con ClientRouter los recursos se vuelven a pedir) → se re-parsea con DOMParser → swap.
2. El hero es un `<img>` nuevo; al montar `document.startViewTransition` el navegador captura el estado viejo (detalle) y la capa nueva `::view-transition-new(root)` es una **representación viva** del nuevo DOM (MDN). Si el webp (~112KB) no está cargado/decodificado al montar esa capa, el área queda en blanco durante el crossfade.
3. El caso coincide con el **bug de Chromium 331926174** ("View transitions have a distorted animation on a large page with a bunch of images") documentado en **withastro/astro#10595**: martrapp (maintainer) confirmó que la distorsión se reproduce con las MPA view transitions nativas de Chrome (sin participación de Astro), es más probable con DevTools abiertas, solo aparece en páginas largas, y esperar la carga de imágenes dentro del update callback no es solución porque el rendering está bloqueado durante la transición. Workarounds sugeridos por el mantenedor: espera artificial ≥500ms tras el swap (no recomendable como solución de producción), placeholders `<div>` + insertar los `<img>` después de que terminen las animaciones.
4. En Firefox el problema es distinto pero relacionado: los `<img loading="lazy">` de DOMParser ignoran el atributo y cargan eager (#14135, cerrado wontfix; mismo bug resuelto en Svelte vía PR #11593 con técnica de quitar/restaurar `src`+`loading` alrededor del swap).

## 4. Respuestas a las preguntas planteadas

1. **¿Cómo funcionan los elementos compartidos?** Astro asigna `view-transition-name` automáticamente por tipo+posición, o manualmente con `transition:name` (valor único por página). El navegador empareja old/new por nombre y anima el grupo (`::view-transition-group` → `::view-transition-image-pair` → `::view-transition-old` [snapshot estático] + `::view-transition-new` [vivo]). El morph de imagen solo se ve bien si ambas copias están cargadas al capturar (chromakode; Chrome docs: "the thumbnail could be cross-fading with a not-yet-loaded full image").
2. **¿Por qué se pierde el hero?** No participa en ningún morph (no tiene nombre) y es eager: el culpable es la ventana de recarga + montaje de la capa viva en back + bug de Chromium 331926174/#10595 (página larga con muchas imágenes). No es lazy ni falta de dimensiones (descartado arriba).
3. **¿Soluciones/mejores prácticas?** (a) `transition:persist` del hero en ambas páginas (el mismo nodo se mueve, nunca se re-crea ni se captura en blanco); (b) preload de la imagen del hero (y de la imagen del post destino si se conserva el morph); (c) quitar el morph de las imágenes (dejar solo títulos) o `transition:animate="none"` + `mix-blend-mode: normal` en el par (técnica de Chrome docs para que la imagen vieja quede debajo mientras la nueva carga); (d) mantener dimensiones fijas (ya cumplido con aspect-ratio); (e) no confiar en lazy para imágenes que transicionan (Firefox #14135).
4. **¿Issues conocidos?** Ver tabla abajo. Los más relevantes: #10595 (upstream Chromium 331926174), #14135 (Firefox lazy, wontfix), #10311 (recursos re-fetcheados en back).
5. **¿Estructura correcta card → detalle con imágenes?** Opción recomendada para este repo: morph solo en títulos (`title-${id}` en h2/h1), imágenes SIN `transition:name` (o con `transition:animate="none"`), hero persistido en ambas páginas, y preload en head. Si se quiere el morph de imagen: quitar lazy de la card, añadir preload de la imagen del post, y (opcional) precargar antes de navegar en `astro:before-preparation`.

## 5. Issues y fuentes

| Tema | Fuente (URL) | Estado |
|---|---|---|
| Distorsión/áreas en blanco con imágenes en view transitions (upstream Chromium) | https://issues.chromium.org/issues/331926174 | Confirmado título; estado del issue no verificado |
| Mismo bug reportado en Astro; martrapp confirma upstream + workarounds (≥500ms, placeholders, dev tools) | https://github.com/withastro/astro/issues/10595 (comentarios) | Cerrado (upstream) |
| ClientRouter rompe lazy load de imágenes en Firefox (DOMParser ignora lazy); workaround custom swap | https://github.com/withastro/astro/issues/14135 | Cerrado, wontfix |
| Fix equivalente en Svelte (quitar/restaurar src+loading alrededor del swap) | https://github.com/sveltejs/svelte/pull/11593 | PR |
| Recursos re-fetcheados en navegación back (template Portfolio) | https://github.com/withastro/astro/issues/10311 | Cerrado |
| Elementos DOMParser no inicializan media stack → reifyMediaElements | https://github.com/withastro/astro/issues/17601 | Contexto DOMParser |
| Router: fetch + DOMParser en cada navegación; preload solo styles | https://github.com/withastro/astro/blob/main/packages/astro/src/transitions/router.ts | Código fuente main |
| Swap: `replaceWith`; persist solo si existe en ambas páginas | https://github.com/withastro/astro/blob/main/packages/astro/src/transitions/swap-functions.ts | Código fuente main |
| Guía oficial Astro: fade default, persist, name único por página, proceso de navegación, fallback | https://docs.astro.build/en/guides/view-transitions/ | Docs oficiales |
| MDN: `::view-transition-old` snapshot estático; `::view-transition-new` representación viva | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API | Docs oficiales |
| Chrome: crossfade con imagen no cargada; `animation: none` + `mix-blend-mode: normal` | https://developer.chrome.com/docs/web-platform/view-transitions/same-document | Docs oficiales |
| Chrome: "misconceptions" — los snapshots no son screenshots (capa viva) | https://developer.chrome.com/blog/view-transitions-misconceptions | Blog oficial |
| Jank de imágenes en Astro view transitions (white rectangle, pop-in, morph de thumbnails) | https://chromakode.com/post/astro-view-transitions | Blog (secundaria) |
| Técnicas flicker: persist + congelar dimensiones | https://www.zinruss.com/astro-view-transitions-flicker-optimization | Blog (secundaria, SEO) |
| Descartados como ruido: #8944, #8983, #13908, #9500, #13819, #16130, #7145, #17084, #17355 | GitHub issues withastro/astro | — |

## 6. Recomendaciones concretas (por archivo, para el implementer)

1. **`src/components/new-hero/new-hero.astro`**: añadir `transition:persist="hero-profile"` al `<img>` del hero.
2. **`src/pages/posts/[id].astro` (o Layout.astro)**: incluir una copia oculta del mismo `<img>` con `transition:persist="hero-profile"` y el mismo `src` (p. ej. `aria-hidden="true"` + clase de ocultación) para que el nodo se mueva portada↔detalle y nunca se re-cree desde DOMParser. Alternativa de arquitectura: mover el hero al `Layout.astro` compartido (chrome único) con persist y mostrarlo solo en portada vía prop/ruta — encaja con la convención de "un solo layout".
3. **`src/layouts/Layout.astro`**: `<link rel="preload" as="image" href="/assets/content/<profile>.webp">` en el head (el router solo pre-carga stylesheets).
4. **`src/components/latest-articles.astro` + `src/pages/posts/[id].astro`**: quitar `transition:name` de los `<img>` (dejar el morph solo en títulos), o si se conserva: quitar `loading="lazy"` de la card, preload de la imagen del post y `transition:animate="none"`/`mix-blend-mode: normal` en el par. Los nombres `img-*`/`title-*` son únicos por página (requisito ya cumplido).
5. **Verificación**: probar back con DevTools cerradas y abiertas (el bug de Chromium es más probable con DevTools), y en Chrome/Firefox/Safari. En Firefox, decidir si el comportamiento eager de las lazy cards es aceptable o usar `fallback="none"` (navegación normal en no-soportados, sugerido por martrapp en #14135).
6. **No recomendado** en este repo: custom swap function (rompe persist si se implementa mal y añade JS de runtime — el proyecto es estático por defecto). Solo si el persist + preload no bastan.

## 7. Pendiente / no confirmado

- Estado abierto/cerrado de issues.chromium.org/331926174 (solo se confirmó el título y descripción vía búsqueda).
- No se encontró un bug de Chromium específico de "img creado por DOMParser que no carga tras view transition" (el caso documentado es Firefox #14135). Si el hero sigue perdiéndose tras aplicar persist+preload, convendría abrir issue con repro mínimo en withastro/astro citando este informe.
- No se verificó empíricamente en el sitio (rol explorer no ejecuta el dev server): las recomendaciones de §6 están basadas en fuentes primarias y código fuente, no en reproducción local.