# Diseño — Enlace Arquitectura en el navbar (feature 8)

## Contexto visual

- **Pantalla afectada**: navbar compartida de `src/layouts/Layout.astro`
  (presente en todas las páginas vía layout único).
- **Estado actual**: el navbar enlaza `Home` (/), `About` (/about) y el perfil
  externo `@moibaldenegro` (https://x.com/moibaldenegro), más la `SearchBar` y
  el control de Escape. Con la feature 7, `/arquitectura` es una búsqueda por
  término del catálogo, pero no hay ningún enlace que la descubra.
- **Estado deseado**: el navbar enlaza `Home`, `About`, `Arquitectura`,
  `@moibaldenegro` y la barra de búsqueda; el enlace de la ruta activa conserva
  el acento y subrayado que ya estiliza `layout.css` vía `aria-current="page"`
  (patrón existente de About, REQ-37-03). "Arquitectura" actúa como atajo de
  búsqueda de la sección temática: navega a `/arquitectura`, que filtra el
  catálogo por el término (feature 7).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| (ninguno nuevo) | — | El enlace hereda los estilos existentes de `.site-navbar a` y `a[aria-current="page"]` de `layout.css`; no se añade CSS ni tokens nuevos |

## Decisiones y constraints

- **Decisión 1 — Mismo patrón que About**: el enlace se inserta junto a los
  enlaces internos (Home/About) y usa la misma condición de ruta activa que
  About (pathname igual a `/arquitectura` o `/arquitectura/`) para declarar
  `aria-current="page"` (REQ-08-02, REQ-08-03). El estado visual ya existe en
  `layout.css`; cero estilos nuevos.
- **Decisión 2 — Semántica de atajo de búsqueda**: tras la corrección del
  humano (la ruta es dinámica por término, feature 7), el enlace no representa
  una "página de sección" sino un atajo a la búsqueda `arquitectura`; se
  mantiene porque es exactamente la URL que el humano probó y esperaba ver
  funcionando, y da descubrimiento a la ruta dinámica desde el chrome común.
- **Decisión 3 — Sin JS de runtime**: el enlace es marcado estático dentro del
  Layout; la navegación usa el `ClientRouter` ya presente. No se añade ningún
  script.
- **Restricción aplicable — un solo layout**: el cambio vive únicamente en
  `Layout.astro`; no se crea un layout nuevo.
- **Restricción aplicable — ≤100 líneas por archivo**: el Layout tiene 38
  líneas; el enlace añade 1 línea (y la condición de aria-current).

## Alternativa descartada

- **Alternativa considerada**: enlazar `/arquitectura` desde la portada (p. ej.
  un enlace "Ver todos" en `LatestArticles`) en lugar del navbar.
- **Motivo del descarte**: el navbar es el patrón establecido para navegar
  entre páginas internas del sitio (Home/About) y el enlace queda disponible
  en todas las páginas; la portada ya presenta los artículos en sus tarjetas.
  Añadir además un enlace en la portada excedería el alcance sin beneficio
  claro.