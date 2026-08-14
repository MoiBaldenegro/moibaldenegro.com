# Diseño — Pulido estético y refactor de presentación (feature 37)

## Contexto visual

Pulido general del sitio tras la revisión del ciclo 30 (informe
`progress/research/revision-general-ciclo30.md`, hallazgos A1-A6):

1. `new-hero.astro`: dos divs muertos `.hero-noise` y `.hero-flower` (sin
   reglas CSS) → se eliminan del marcado.
2. `hero-card.astro`: `<a href="">` vacío envolviendo el icono → se elimina el
   ancla (el icono queda como `<div>`; sin destino no es un enlace).
3. `Layout.astro` / `layout.css`: `aria-current="page"` en el enlace de la
   página actual + estado activo; estilos `:focus-visible` globales para
   enlaces (anillo acento con tokens); viewport con `initial-scale=1`.
4. Indentación uniforme de 2 espacios en todos los `.astro` (hoy
   `htb-stadistics.astro` usa tabs y `new-hero`/`hero-card` tienen sangrado
   extra).
5. `latest-articles.astro` / `latest-articles.css`: encabezado de sección
   «Últimos artículos» (`h2.latest-articles__heading`) con tokens.
6. `htb-stadistics.css`: margen vertical del contenedor para separar la
   tarjeta de la sección de artículos y del borde inferior.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Uso |
|-------|-----|
| `--color-accent` / `--color-accent-hover` | anillo de foco y estado activo |
| `--color-text` / `--color-text-secondary` | encabezado de sección y navbar |
| `--color-border` / `--color-border-strong` | separadores y subrayado activo |
| `--radius-pill` | anillo del foco visible |
| `--transition-default` | transiciones de foco/hover |
| `--gap-card` | espaciado del encabezado y de la sección HTB |
| `--container-max` | ancho del encabezado de sección |

## Decisiones y constraints

- Decisión 1: el `aria-current="page"` se asigna comparando el `href` del
  enlace con la ruta de la página (en el layout, vía `Astro.url.pathname` —
  lectura, sin lógica de negocio).
- Decisión 2: el foco visible usa el patrón clásico sin dependencias:
  `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`
  en `layout.css` (global) y en las cards interactivas de `latest-articles.css`.
- Decisión 3: el encabezado de sección es un `h2` real (jerarquía H1→H2 de la
  portada) con la clase BEM `latest-articles__heading`, colocado al inicio de
  la sección; el título de cada card sigue siendo `h2.latest-articles__title`
  con su `transition:name`. Efecto colateral conocido: REQ-24-03 de
  `tests/view-transitions.test.mjs` selecciona el PRIMER `<h2>` del archivo
  (hoy el de la card); con el encabezado delante, la aserción se actualiza
  para localizar el `h2.latest-articles__title` con su par `title-${post.id}`
  (mismo contrato, selector más preciso — cambio de test autorizado y
  documentado en el informe del ciclo).
- Restricciones del proyecto: estilos separados de la UI (todo en
  `src/styles/`), sin `style=` inline, ≤100 líneas por archivo, sin hex/rgba
  sueltos (guard de la feature 12), sin JS de runtime añadido, tokens únicos.

## Alternativa descartada

- Alternativa considerada: añadir JavaScript para detectar la página activa y
  animar la navbar.
- Motivo del descarte: la regla 9 (estático por defecto) y el patrón
  `aria-current` con `Astro.url` resuelven el caso sin una sola línea de JS de
  runtime.
