# Diseño — Scroll horizontal fijado de «Últimos artículos» en escritorio (feature 72 latest-articles-horizontal-scroll)

## Contexto visual

- Pantalla: portada (`src/pages/index.astro`), sección `.latest-articles` (3 cards de los posts más recientes, `latest-articles.astro`).
- Estado actual: las 3 cards apiladas en vertical (`.latest-articles__list { display: grid }`), cada una de ancho `min(var(--container-max), 95%)` centrada.
- Estado deseado en escritorio (≥1201 px y `prefers-reduced-motion: no-preference`):
  1. Al llegar a la sección, la card 1 está centrada «tal cual»; las cards 2 y 3 esperan fuera de la vista, a la derecha.
  2. La sección queda fijada (pin) y el scroll vertical (scrub, ~100vh por card que pasa) desplaza el track a la izquierda: la card 2 atraviesa la pantalla y queda centrada a mitad de recorrido; al final la card 3 queda centrada.
  3. Se libera el pin y la página continúa (sección HTB) sin saltos.
- Estado en móvil, tablet (≤1200 px), con reduced-motion o sin JS: idéntico al actual (apiladas), sin pin-spacer.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--container-max` | 1500px | tope del ancho de la card en modo horizontal (igual que hoy) |
| `--header-height` | 74px | resta de la altura disponible si el header queda visible durante el pin |
| `--gap-card` | 14px | separación vertical encabezado/track (sin cambio) |

No se añaden tokens (tokens.css está en 97 líneas y su conteo está fijado en REQ-17-09, REQ-26-07, REQ-39-09, REQ-40-11, REQ-42-09 y REQ-16-09). Los literales permitidos son los no cromáticos ya precedentes (`100%`, `100vw`, `100vh`/`100svh`, `16 / 9`, `flex: 0 0 100%`).

## Estructura (archivos)

| Archivo | Rol | Límite |
|---------|-----|--------|
| `src/domain/latest-horizontal.ts` | geometría pura (feature 71) | ≤100 |
| `src/components/latest-horizontal/latest-horizontal.ts` | llamada a GSAP: `registerPlugin`, `gsap.matchMedia`, `init`/`destroy`, listener `focusin` | ≤100 |
| `src/components/latest-horizontal/latest-horizontal.astro` | import del CSS + `<script>` con `astro:page-load` → init y `astro:before-swap` → destroy; sin marcado visible necesario | ≤100 |
| `src/styles/latest-horizontal.css` | reglas bajo `.latest-articles--horizontal` | ≤100 |
| `src/pages/index.astro` | monta `<LatestHorizontal />` (26 líneas hoy) | ≤100 |

`latest-articles.astro` (39 líneas, REQ-30-15 prohíbe `<script>` en él) y `latest-articles.css` (98 líneas, conteo fijado) no se tocan: el módulo localiza `.latest-articles` y `.latest-articles__list` por clase.

## Decisiones y constraints

- **Pin de la sección, animación del track.** Se fija `<section class="latest-articles">` y se anima `.latest-articles__list` (GSAP: no animar el elemento fijado; con track `display:flex` `pinSpacing` sería `false` por defecto).
- **Slots de ancho completo.** En modo horizontal la sección ocupa el ancho del viewport (`width: 100%`, `overflow: clip`), el track es `display: flex` sin gap y cada card vive en un slot `flex: 0 0 100%` centrada con `margin-inline: auto` y su ancho actual. Así el centro de la card *i* queda en `i·V + V/2` (feature 71) y las cards 2 y 3 empiezan fuera de la vista. El encabezado «Últimos artículos» conserva su posición alineada con el contenedor.
- **La card debe caber (REQ-72-08).** Hoy la card mide más que el viewport (imagen 1149×646 a 1280 px más título, meta, descripción y tags). En modo horizontal se limita **solo el ancho** de la card (p. ej. `width: min(var(--container-max), 95%, calc(<alto disponible> * <factor>))` o `max-height` de la imagen con `aspect-ratio` intacto) hasta que card + encabezado quepan en el viewport. El implementer mide con CDP a 1280×800 y 1440×900 y documenta la fórmula elegida. Si no hay forma de que quepa conservando el aspecto, para y lo registra (decisión del humano).
- **Recorrido.** `end: () => '+=' + pinScrollLength(innerHeight, n)` (≈ 200vh para 3 cards); `x: () => trackOffset(1, V, n)`; `scrub: true`, `ease: 'none'`, `invalidateOnRefresh: true`, `anticipatePin: 1`. `start` lo decide la medición: `'top top'` o desplazado por el header si este sigue visible (impl_61: con `body { height: 100% }` el header solo es sticky en el primer viewport).
- **matchMedia** `(min-width: 1201px) and (prefers-reduced-motion: no-preference)`: el corte de escritorio del sitio (el hero cambia a diseño de tablet en ≤1200). Reacciona en vivo a resize y al cambio de preferencia; la clase `latest-articles--horizontal` se añade dentro del handler y se quita en su limpieza.
- **ClientRouter.** `registerPlugin` a nivel de módulo (se ejecuta una vez). `astro:page-load` → `init()` (llama antes a `destroy()`); `astro:before-swap` → `destroy()` (`mm.revert()`), con el DOM viejo aún presente. Tras crear el trigger, `ScrollTrigger.refresh()` y, si `history.state?.scrollY` difiere del `scrollY` actual, `scrollTo(0, history.state.scrollY)` (mitigación del riesgo §4 del informe; validar con CDP). No usar `clearScrollMemory` (pisaría el `scrollRestoration = "manual"` de Astro).
- **Búsqueda en vivo.** `.home__landing[hidden]` oculta la portada; al reaparecer hay que llamar a `ScrollTrigger.refresh()` (p. ej. `MutationObserver` sobre el atributo `hidden`, registrado dentro del contexto y desconectado al revertir).
- **Foco.** `focusin` en el track: índice de la card → `window.scrollTo({ top: focusScrollTarget(i, n, st.start, st.end), behavior: 'instant' })`. No usar `inert` ni `tabindex="-1"`. `overflow: clip` evita el scroll programático del contenedor.
- **Mejora progresiva.** Sin JS, en ≤1200 px o con reduced-motion no se añade la clase ni el pin: layout actual.
- **CSP.** GSAP 3.15 no usa `eval`/`new Function` ni inyecta `<script>`/`<style>`; usa `style.cssText`, permitido por `style-src 'unsafe-inline'` vigente (si algún día se retira, revisar).
- **Rendimiento.** ~45 KB gzip solo en la portada (empaquetado por Astro en el script del componente). Presupuesto 51200 B gzip.
- Restricciones del proyecto: lógica en `.ts`, estilos en `src/styles/*.css` importados por el componente, sin `<style>` en `.astro`, solo tokens, ≤100 líneas por archivo, dependencia aprobada en la feature 70.

## Verificación visual (Chrome headless + CDP sobre `astro preview`)

| Viewport | Escenario | Esperado |
|----------|-----------|----------|
| 1280×800 y 1440×900 | p = 0 | card 1 centrada (±2 px), cards 2 y 3 con `left ≥ innerWidth`, un `.pin-spacer` |
| 1280×800 y 1440×900 | p = 0,5 | x del track = `trackOffset(0.5)` (±2 px), card 2 centrada, top de la sección constante |
| 1280×800 y 1440×900 | p = 1 y después | card 3 centrada; al seguir bajando la sección sube y la HTB entra sin salto |
| 1280×800 | reduced-motion emulado | sin clase, sin pin-spacer, cards apiladas |
| 1024 y 375 | normal | sin pin, cards apiladas como hoy |
| 1280×800 | ida a un post y atrás | un solo `.pin-spacer`, scrollY restaurado (±2 px) |
| 1280×800 | Tab hasta el enlace de la card 3 | la card 3 dentro del viewport |
| 1280×800 | clic en la card 3 con pin activo | navega al post sin errores en consola |

Capturas PNG por escenario referenciadas en `progress/impl_72.md`.

## Alternativa descartada

- Alternativa considerada: CSS puro con `position: sticky` + `animation-timeline: scroll()` (scroll-driven animations), sin dependencia.
- Motivo del descarte: el humano autorizó GSAP explícitamente; además las scroll-driven animations no están en todos los navegadores de escritorio objetivo y no resuelven el pin con espaciado ni la integración con ClientRouter con la misma fiabilidad.
- Alternativa considerada: corte en 769 px (breakpoint móvil del repo) o 1025 px.
- Motivo del descarte: el humano pidió «solo escritorio»; 769–1200 es el diseño de tablet del hero (features 51 y 69) y en tablets táctiles el pin sufre con la barra de direcciones. 1201 px es el corte de escritorio ya existente; revisable por el humano.
