# Diseño — Restaurar el enlace Home en el navbar (feature 12)

## Contexto visual

- Pantalla afectada: navbar compartida de `src/layouts/Layout.astro`
  (`header.site-navbar > nav`), visible en todas las páginas.
- Estado actual: solo el ancla del logo (img → `/`), About, Arquitectura y
  @moibaldenegro + SearchBar. Falta el enlace de texto «Home» que los tests
  REQ-08-04 (architecture-nav-link) y REQ-08-05 (layout-refactor) exigen:
  suite en rojo (2 fail).
- Estado deseado: enlace de texto «Home» → `/` antes de About, heredando los
  estilos del navbar (`.site-navbar a` y `a[aria-current="page"]` de
  `layout.css`), sin CSS nuevo. Estado pre-regresión (commit 72e5c52):
  `<a href="/">Home</a>` plano.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| — | — | Ninguno nuevo: el enlace hereda `layout.css` (REQ-12-02, patrón REQ-08-05) |

## Decisiones y constraints

- Decisión 1: ancla plana `<a href="/">Home</a>` sin clase ni style propios:
  hereda `.site-navbar a` y el estado activo `a[aria-current="page"]` de
  `layout.css` (mismo patrón que el enlace Arquitectura de la feature 8,
  REQ-08-05).
- Decisión 2: el enlace Home NO declara aria-current: el ancla del logo ya
  marca la portada (`Astro.url.pathname === '/' ? 'page' : undefined`) y el
  estado pre-regresión (72e5c52) era un ancla plana. Un segundo aria-current
  para `/` duplicaría el marcador de página actual.
- Decisión 3: posición del enlace: Home → About → Arquitectura →
  @moibaldenegro → SearchBar (orden natural y pre-regresión).
- Restricciones aplicables: sin `<style>` en el Layout (estilos separados),
  ≤100 líneas por archivo (Layout.astro queda en ~49 líneas), sin JS de
  runtime, sin dependencias.

## Alternativa descartada

- Añadir aria-current al enlace Home con la misma condición que el logo:
  duplicaría el marcador de la página actual en la portada (dos enlaces con
  aria-current="page" al mismo destino) y se aparta del estado pre-regresión.
  Se descarta (Decisión 2).