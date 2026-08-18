# Diseño — Barra de búsqueda en el header (feature 4)

## Contexto visual

- **Qué pantalla**: navbar del `src/layouts/Layout.astro` (header único del
  sitio, presente en la Landing, `/about`, `/posts/[id]` y `/search`). La
  petición pide la barra en "header o sección hero de la Landing Page": el
  header del Layout es el header de la Landing y, al ser compartido, permite
  refinar la consulta desde la vista dedicada sin duplicar componentes.
- **Estado actual**: el navbar solo tiene enlaces (Home, About, @moibaldenegro).
- **Estado deseado**: un input de búsqueda prominente con placeholder, un botón
  de limpieza X visible solo cuando hay texto, retorno de foco al vaciar,
  Enter → `/search?q=<consulta>`, y un evento de cambio de consulta que la
  portada escucha para el live search (REQ-04-07).

## Tokens usados (solo tokens existentes de tokens.css)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-navbar` | `rgba(8,8,18,.75)` | Fondo del contenedor de la barra (ya usado por el navbar, feature 44) |
| `--color-surface` | `#101018` | Fondo del input |
| `--color-border` | `rgba(255,255,255,.08)` | Borde del input en reposo |
| `--color-border-strong` | `rgba(255,255,255,.15)` | Borde del input en foco |
| `--color-text` | `#ffffff` | Texto escrito en el input |
| `--color-text-secondary` | `#b8b8c5` | Placeholder y símbolo X en reposo |
| `--color-accent` | `#7d68ff` | Símbolo X en hover (acción visible) |
| `--radius-pill` | `999px` | Forma píldora del input |
| `--transition-default` | `.28s cubic-bezier(.2,.8,.2,1)` | Transiciones de foco/hover |
| `--font-sans` | Inter… | Tipografía del sitio |

> Sin tokens nuevos: el set existente cubre la barra.

## Decisiones y constraints

- Decisión 1 (estructura): componente en carpeta propia
  `src/components/search-bar/search-bar.astro` con su módulo de control
  `src/components/search-bar/search-bar.ts` (lógica separada de la UI, regla
  8; el `<script>` del `.astro` solo importa y arranca el módulo) y su hoja
  `src/styles/search-bar.css` importada por el componente. Precedente de
  carpeta por componente: `src/components/new-hero/`. El layout lo integra en
  el `<nav>` del header.
- Decisión 2 (estado y eventos): el control mantiene la consulta activa en
  memoria; con cada cambio emite un `CustomEvent` (p. ej. `search:change` con
  el término en `detail`) en el documento para que la portada reaccione en
  tiempo real (REQ-04-07). El botón X se muestra con CSS condicionado al
  estado (clase `is-filled` sobre la barra) y al activarlo vacía el input y
  devuelve el foco (REQ-04-03, REQ-04-04).
- Decisión 3 (navegación Enter): con consulta no vacía navega a
  `/search?q=<consulta>` (URL construida con `URLSearchParams`, escapando el
  término); con consulta vacía no navega (REQ-04-05, REQ-04-06). La
  navegación convive con `ClientRouter` (feature 24): se usa el mecanismo de
  navegación del framework del sitio.
- Decisión 4 (accesibilidad): el input declara `aria-label` (REQ-04-08) y el
  botón X declara su propósito accesible; el Escape se canaliza en la feature
  6 (depende de esta barra).
- Decisión 5 (JS de runtime): la interacción del input (X, Enter, eventos)
  es JS de cliente justificado — excepción a "estático por defecto" (regla 9)
  con precedentes aprobados (24, 43, 44); sin frameworks ni dependencias.
- Restricciones aplicables: estilos solo en `src/styles/*.css` (prohibido
  `<style>` en `.astro`), tokens sin valores sueltos, ≤100 líneas por archivo
  (si el control excede 100 líneas se parte en módulos, no se fuerza).

## Alternativa descartada

- Alternativa considerada: barra de búsqueda solo en `src/pages/index.astro`
  (sección hero de la Landing, sin tocar el Layout).
- Motivo del descarte: la vista dedicada `/search` se quedaría sin forma de
  refinar la consulta (rompe el flujo natural de la petición "navegar a
  /search/:arg para permitir copiar/compartir"), y duplicaría el componente
  en dos lugares. El header del Layout ES el header de la Landing y la regla
  11 (un solo layout) apunta a alojar el chrome compartido ahí.
