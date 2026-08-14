# Diseño — Hero perdido al volver del detalle (feature 43)

## Contexto visual

- **Portada (`/`)**: hero con `img` del perfil (new-hero.astro, sin clase, eager).
- **Detalle (`/posts/[id]`)**: panel `.post__hero` con `img.post__image` + copia.
- **Problema**: al volver del detalle, el hero aparece sin imagen (404
  `GET /posts/assets/moises-hero.jpg`) o en blanco durante la transición.
- **Estado deseado**: el hero vuelve SIEMPRE con su imagen; sin cambios
  visuales en el diseño aprobado.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| (ninguno nuevo) | — | Sin tokens nuevos: `tokens.css` queda en 87 líneas (REQ-26-07/40-11/42-09). La regla de ocultación usa `display: none`, sin color. |

## Decisiones y constraints

- **Decisión 1 — Ruta absoluta en los datos, no en el componente.**
  `src/data/hero.json`: `"image": "assets/moises-hero.jpg"` →
  `"/assets/moises-hero.jpg"`. El componente sigue renderizando `src={profile.image}`
  tal cual. Motivo: la ruta relativa resuelve contra `/posts/` cuando el
  ClientRouter re-parsea la portada con DOMParser antes de cambiar la URL;
  la ruta absoluta de sitio elimina el 404 en cualquier contexto. El dato es
  la fuente de verdad (patrón del repo: cards usan `/assets/content/${img}`).
- **Decisión 2 — Persist del hero en ambas páginas (requisito de Astro).**
  El `<img>` del hero de la portada lleva `transition:persist="hero-profile"`;
  el detalle incluye una COPIA OCULTA del mismo `<img>` (mismo `src` vía
  `HeroProfileRepository`, mismo id, `alt={profile.name}` para que al
  sustituir al hero de la portada conserve el texto alternativo). Verificado en
  `swap-functions.js` de Astro 7.2.0: si el id no existe en ambas páginas, no
  se persiste nada. La copia NO lleva `loading` (eager) ni `transition:name`.
- **Decisión 3 — Ocultación estructural por atributo, no por clase.**
  El swap sobrevive el nodo VIEJO (`newTarget.replaceWith(el)`): una clase
  ocultadora viajaría con el nodo y fallaría en portada→detalle (el hero
  visible de la portada no tiene la clase). La regla en `layout.css` es
  `.post__hero [data-astro-transition-persist="hero-profile"] { display: none; }`:
  el selector sigue al atributo (viaja con el nodo) y está acotado a la
  estructura `.post__hero` (solo existe en el detalle), por lo que al volver a
  la portada el mismo nodo queda visible y en el detalle queda oculto. Sin
  `hidden` ni `aria-hidden` (viajarían con el nodo y romperían el hero o la
  accesibilidad).
- **Decisión 4 — Posición de la copia dentro de `.post__hero`.**
  La copia va DESPUÉS de `img.post__image` y de `.post__hero-copy`: el primer
  `<img>` de la página debe seguir siendo `img.post__image` con
  `transition:name={`img-${entry.id}`}` (REQ-24-05, REQ-42-08) y la copia NO
  lleva `transition:name` (no participa en ningún morph).
- **Decisión 5 — Preload del hero en el head del layout.**
  `<link rel="preload" as="image" href={profile.image} />` en el `<head>` del
  layout (el ClientRouter solo pre-carga stylesheets). El layout lee el perfil
  con `HeroProfileRepository` (chrome compartido, dato constante del sitio).
- **Decisión 6 — Se conserva el morph de imágenes (riesgo visual mínimo).**
  Los pares `img-${id}`/`title-${id}` de cards y detalle NO se tocan
  (REQ-24-03/05, REQ-42-08). El morph de imagen en back sigue expuesto al bug
  de Chromium 331926174/#10595 (upstream, sin fix general): mitigación
  aplicada = persist (el hero nunca se re-crea desde DOMParser) + preload del
  hero y del post (feature 44) + `transition:animate="none"` (feature 44) +
  aspect-ratio ya presente. Riesgo residual documentado en
  `progress/research/fix-imagen-hero-y-rendimiento-ciclo36.md` §5.
- **Restricción del proyecto**: estilos separados de la UI (la regla de
  ocultación vive en `layout.css`, no en el `.astro`); datos vía repositorio
  (ni el layout ni la página leen `hero.json` directamente); ≤100 líneas por
  archivo; sin JS de runtime propio (persist/preload son declarativos del
  framework).

## Alternativa descartada

- **Persist del hero en el Layout compartido** (copia oculta renderizada por
  el layout en todas las páginas): en la portada habría DOS elementos con el
  mismo id `hero-profile` (copia del layout + hero visible), y el
  `querySelector` del swap emparejaría con la primera (la copia del layout),
  dejando el hero visible re-parseado → el bug persistiría.
- **Quitar `transition:name` de las imágenes (morph solo en títulos)**: arregla
  el jank del morph pero cambia la animación aprobada por el humano
  ("quedó muy bonito"); no pedido.
- **Prefixar la ruta en el componente** (`src={`/${profile.image}`}`): deja el
  dato frágil y obligaría a duplicar la lógica en la copia del detalle; la
  canonical correcta es el dato absoluto.
