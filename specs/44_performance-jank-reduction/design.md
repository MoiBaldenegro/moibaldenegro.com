# Diseño — Reducción de jank de scroll y navegación (feature 44)

## Contexto visual

- **Navbar sticky full-width** con `backdrop-filter: blur(18px)` (layout.css):
  el blur se recalcula por frame al scrollear → jank de scroll (sospechoso nº 1
  de la investigación del ciclo 35).
- **Cards de la portada**: hover con `box-shadow` + `filter: contrast(1.4)` +
  `transform` (hero-card.css) y `box-shadow` (latest-articles.css) → paint por
  frame durante 280 ms.
- **Navegación con ClientRouter**: crossfade del snapshot de página completa
  (grupo `root`) que rasteriza la página nueva con sus efectos caros + morph de
  la imagen del post sin decodificar (rectángulo vacío + pop).
- **Estado deseado**: el sitio se VE igual (mismo diseño aprobado), pero el
  scroll y la navegación dejan de perder frames y el morph de imagen llega con
  imagen.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#070716` | Fondo del navbar vía `color-mix(in srgb, var(--color-background) 92%, transparent)` |
| `--color-accent` | `#7d68ff` | `border-color` del hover de hero-card |
| `--transition-default` | `.28s cubic-bezier(.2,.8,.2,1)` | Transición base de las cards (conservada: REQ-10-03) |

Sin tokens nuevos: `tokens.css` queda en 87 líneas (REQ-26-07/40-11/42-09);
el alfa del navbar se decide en la hoja con `color-mix` (precedente del repo en
post-header.css: `color-mix(in srgb, var(--color-accent) 12%, transparent)`).

## Decisiones y constraints

- **Decisión 1 — Navbar sin blur, fondo más opaco por color-mix.**
  Se ELIMINA `backdrop-filter: blur(18px)` de `.site-navbar` y el fondo pasa a
  `color-mix(in srgb, var(--color-background) 92%, transparent)` (opción 1 del
  research, "mantiene estética"): el scroll queda en puro compositing. El
  borde inferior existente (`--color-border-strong`) conserva la separación
  visual. Alternativas descartadas: `blur(8px)` (sigue siendo paint por frame
  en scroll) y subir el alpha en tokens.css (tocaría el guard de 87 líneas).
- **Decisión 2 — Hovers de cards solo con transform (+ border-color).**
  `.hero-card:hover` conserva `transform: translateY(-4px)` y gana
  `border-color: var(--color-accent)`; se eliminan `box-shadow` y
  `filter: contrast(1.4)` (paint por frame; el filter repinta la card + su SVG
  gigante). `.latest-articles__card:hover` conserva `border-color:
  var(--color-accent)` y gana `transform: translateY(-2px)`; se elimina
  `box-shadow: var(--shadow-card-hover)`. La transición base
  (`var(--transition-default)`) se conserva (REQ-10-03): el coste residual del
  border-color es una franja de 1px, no la card completa.
- **Decisión 3 — `transition:animate="none"` en `<html>` del layout.**
  Elimina el crossfade del grupo `root` (snapshot de página completa caro) y
  conserva los morphs de los elementos nombrados (imagen + título del post):
  el efecto aprobado por el humano se mantiene y el coste de rasterización de
  página completa desaparece. No rompe REQ-08-01 (`/<html\s+lang="es"/`).
- **Decisión 4 — Slot `name="head"` + preload del post.**
  El layout declara `<slot name="head" />` en el `<head>` (patrón Astro para
  inyección por página) y `[id].astro` inyecta
  `<link slot="head" rel="preload" as="image" href={`/assets/content/${img}`} fetchpriority="high" />`
  como primer hijo de `<Layout>`: la descarga de la imagen del detalle arranca
  en el swap, el morph tiene imagen que mostrar y el hero del detalle no se
  pinta en blanco.
- **Decisión 5 — El morph de imágenes se conserva.**
  Pares `img-${id}`/`title-${id}` intactos (REQ-24-03/05, REQ-42-08): el bug
  de Chromium 331926174/#10595 es upstream y queda mitigado (preload +
  persist de la feature 43 + sin snapshot root). Sin cambios de tests
  existentes.
- **Restricción del proyecto**: sin JS de runtime propio (todo declarativo del
  framework); estilos en hojas (`layout.css`, `hero-card.css`,
  `latest-articles.css`), sin `<style>` en `.astro`; ≤100 líneas por archivo;
  tokens (el `color-mix` usa un token, sin hex/rgba sueltos).

## Alternativa descartada

- **Mantener blur(18px) solo en desktop ≥1024px con degradación móvil**: el
  blur no aporta legibilidad (el fondo ya tendrá alpha alto) y complica; el
  coste de scroll es de escritorio también.
- **`will-change: backdrop-filter`**: no resuelve el re-blur por frame y gasta
  memoria (research §A).
- **Acortar `--transition-default` a ~.18s**: tocaría tokens.css (guard 87
  líneas) y no es necesario: sin box-shadow/filter animados no hay paint por
  frame que recortar.
- **Sombras hover pre-rasterizadas con `::after` + blur**: complejidad extra
  sin pedido del humano; la elevación + borde de acento cubren el feedback.
- **Morph solo en títulos (quitar transition:name de imágenes)**: cambio
  visual no pedido; el preload + `transition:animate="none"` ya resuelven el
  jank del morph.
