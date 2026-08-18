# Informe de implementación — feature 8: architecture-nav-link

- **Fecha**: 2026-08-18
- **Implementador**: agente implementador (ciclo del arnés)
- **Spec**: `specs/08_architecture-nav-link/requirements.md` (REQ-08-01..05) y
  `design.md` (Decisiones 1-3, restricción ≤100 líneas)
- **Backlog**: feature 8, `status: "in_progress"` (NO marcada done: espera reviewer)

## Estado inicial

- `src/layouts/Layout.astro` (38 líneas): navbar con Home (/), About (/about),
  perfil externo @moibaldenegro (https://x.com/moibaldenegro), SearchBar y
  SearchEscape. No existía ningún enlace a /arquitectura.
- La ruta dinámica `/arquitectura` ya funciona (feature 7, done: catch-all
  on-demand `[...term].astro` que filtra el catálogo por término).
- `layout.css` ya estiliza `a[aria-current="page"]` (patrón REQ-37-03 de About).

## Ciclo rojo/verde

### ROJO (test-first, antes de tocar src/)

Test escrito primero: `tests/architecture-nav-link.test.mjs` (5 tests de
inspección por regex sobre Layout.astro + layout.css, precedente de
visual-polish-refactor.test.mjs y search-bar-header.test.mjs).

`node --test tests/architecture-nav-link.test.mjs` → **3 fallos / 2 passes**:

```
# Subtest: REQ-08-01: el navbar incluye un enlace de texto Arquitectura a /arquitectura
not ok 1 - REQ-08-01: ... error: 'el navbar no incluye el enlace Arquitectura hacia /arquitectura (REQ-08-01)'
# Subtest: REQ-08-02/03: ... not ok 2 - ... error: 'no se encuentra el enlace Arquitectura (REQ-08-02)'
ok 3 - REQ-08-04: se conservan Home, About, @moibaldenegro y la barra de búsqueda
# Subtest: REQ-08-05: ... not ok 4 - ... error: 'no se encuentra el enlace Arquitectura (REQ-08-05)'
ok 5 - REQ-08 (design): Layout.astro no supera las 100 líneas
1..5
# tests 5
# pass 2
# fail 3
```

Fallan exactamente los acceptance que dependen del enlace inexistente
(REQ-08-01, REQ-08-02/03, REQ-08-05); pasan los que ya eran ciertos
(REQ-08-04 conservación y ≤100 líneas).

### Cambio exacto en src/layouts/Layout.astro

**+1 línea** (design.md D1: junto a los enlaces internos, misma condición de
ruta que About; D3: sin JS, marcado estático con ClientRouter ya presente):

```astro
<a aria-current={Astro.url.pathname === '/about' || Astro.url.pathname === '/about/' ? 'page' : undefined} href="/about">About</a>
<a aria-current={Astro.url.pathname === '/arquitectura' || Astro.url.pathname === '/arquitectura/' ? 'page' : undefined} href="/arquitectura">Arquitectura</a>   ← NUEVA
<a href="https://x.com/moibaldenegro">@moibaldenegro</a>
```

- REQ-08-01: enlace de texto `Arquitectura` con `href="/arquitectura"`.
- REQ-08-02/03: `aria-current="page"` solo cuando `Astro.url.pathname` es
  `/arquitectura` o `/arquitectura/`; resto de rutas → `undefined` (omisión),
  idéntico patrón ternario al de About.
- REQ-08-04: Home, About, @moibaldenegro y SearchBar intactos.
- REQ-08-05: sin clase, sin style, sin `<style>` en el Layout, sin cambios en
  `layout.css` ni en `tokens.css`: hereda `.site-navbar a` y
  `a[aria-current="page"]` existentes.
- Layout.astro: **39 líneas** (≤100 ✔).

### VERDE

1. Test de feature: `node --test tests/architecture-nav-link.test.mjs` →
   **5/5 ok** (`# pass 5, # fail 0`).
2. Suite completa: `pnpm test` → **386/386 pass** (381 previos + 5 nuevos);
   `layout-refactor.test.mjs` (REQ-08-01..06 del layout) y
   `search-bar-header.test.mjs` (REQ-04-01) siguen en verde; tampoco se rompió
   `visual-polish-refactor.test.mjs` (REQ-37-03 cuenta 2+ aria-current y sigue
   pasando).
3. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json,
   progress/current.md, specs/ y docs/dependencies.md correctos`.
4. `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
   tokens.css en src/styles`.
5. `bash ./init.sh` → **"✔ El entorno está perfecto. Podemos empezar a
   trabajar."** (node ✔, pnpm ✔, dependencias ✔, feature_list.json ✔,
   progress/current.md ✔, formato ✔, tests 100% ✔, build de producción ✔).

## Scope

- Único archivo de código tocado: `src/layouts/Layout.astro` (+1 línea).
- Nuevo artefacto de test: `tests/architecture-nav-link.test.mjs` (5 tests).
- Sin estilos nuevos, sin tokens nuevos, sin JS nuevo, sin dependencias.
- No se tocó ninguna otra feature (barra de búsqueda, /search, catch-all
  `[...term]`, portada, etc. intactos).

## Estado del backlog

- feature_list.json: feature 8 `status: "in_progress"` (el implementador no
  marca done; espera el review del líder).