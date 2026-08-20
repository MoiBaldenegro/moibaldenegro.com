# Diseño — Retirar el ancla del logo del navbar (feature 13)

## Contexto visual

- **Componente afectado:** `src/layouts/Layout.astro`, navbar `.site-navbar`
  (chrome compartido de todas las páginas).
- **Estado actual:** ancla del logo (`<a href="/"><img src="/assets/mxvi_logo.webp"
  width="72"/></a>` con aria-current de la portada) + enlace de texto Home sin
  aria-current + About + Arquitectura + @moibaldenegro + SearchBar.
- **Estado deseado («como estaba», commit 72e5c52):** enlace de texto Home como
  único enlace de la portada, sin logo; el Home conserva el marcador de página
  activa que tenía el logo.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| — | — | Sin tokens nuevos: el enlace Home hereda `--color-accent` / `--color-accent-hover` vía `.site-navbar a[aria-current="page"]` y `.site-navbar a:hover` de layout.css |

## Decisiones y constraints

- Decisión 1: el enlace Home asume el rol del ancla del logo:
  `aria-current={Astro.url.pathname === '/' ? 'page' : undefined}` (único
  marcador de la portada; conserva REQ-37-03: Home + About + Arquitectura = 3
  aria-current con degradado `'page' : undefined`).
- Decisión 2: se conserva el asset `public/assets/mxvi_logo.webp` (ya existía
  en 72e5c52; fuera de alcance borrarlo).
- Decisión 3: los tests del navbar siguen la presentación real: se ajustan las
  aserciones REQ-12-03/04 de `tests/restore-navbar-home-link.test.mjs` con la
  justificación en el encabezado (precedente REQ-43-06).
- Restricciones del proyecto: estilos separados de la UI (sin `<style>` en
  Layout.astro; nada de CSS nuevo), ≤100 líneas por archivo, sin JS.

## Alternativa descartada

- Alternativa considerada: mantener el logo y quitar el Home de texto.
- Motivo del descarte: contradice la petición del humano («el home fue
  reemplazado por el logo... que quede como estaba, era correcto») y el estado
  verificado 72e5c52, que no tenía logo en el navbar.