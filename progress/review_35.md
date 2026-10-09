# Review — feature 35

**Veredicto:** APPROVED

Feature 35 `seo-head-base` (spec `specs/35_seo-head-base/requirements.md`, sin design.md).
Implementada por el líder en rol de implementer (autorización humana explícita), revisada con el
mismo rigor. Solo se revisan los cambios de la 35; los de las features 31-34 ya tienen veredicto.

## Requisitos

- REQ-35-01 [x] `astro.config.mjs:6` `site: 'https://moibaldenegro.com'`.
- REQ-35-02 [x] `src/domain/seo/head.ts:18-22` `composeTitle`: sin título devuelve la marca y no la
  duplica (`About — moibaldenegro.com` se queda igual). Test: `tests/seo-head-base.test.mjs:31-35`.
- REQ-35-03 [x] `head.ts:26-28` `canonicalUrl` con `new URL(...).href` (codifica espacios y no
  ASCII). Test: líneas 37-40. Comprobado en `dist/`: `/posts/03-principios%20solid/` y
  `/posts/01-dise%C3%B1o-detallado/`.
- REQ-35-04 [x] `Layout.astro:29` emite una meta description cuando la página pasa la prop.
  index, about, search, 404 y posts la pasan; el build tiene exactamente 1 por página (test, líneas 65-69 y 79-83:
  la de cada post coincide con su frontmatter).
- REQ-35-05 [x] `Layout.astro:30` emite un canonical absoluto por página (comprobado en el
  `dist/client` de los 8 posts, en `/` y en `/404`).
- REQ-35-06 [x] `Layout.astro:26-27`; en el HTML generado `<head><meta charset="utf-8"><meta name="viewport" ...>`
  van como primeros hijos.
- REQ-35-07 [x] `index.astro:15,30` `title={profile.name}` (vía `HeroProfileRepository`, no JSON
  directo) y `description={SITE_DESCRIPTION}`. Salida: `<title>Moisés Baldenegro Melendez | moibaldenegro.com</title>`.
- REQ-35-08 [x] El frontmatter de `Layout.astro` (líneas 18-20) solo destructura las props y llama a
  `composeTitle`/`canonicalUrl`; no concatena la marca (test, líneas 49-55).
- REQ-35-09 [x] `progress/impl_35.md` documenta el rojo (`ERR_MODULE_NOT_FOUND` de `head.ts`, 0/1)
  antes de tocar `src/`. También deja constancia de los 2 fallos que eran bugs del propio test,
  corregidos sin relajar el requisito.
- REQ-35-10 [x] Archivos de `src/` tocados: head.ts 28, Layout 53, index 40, about 24, search 31,
  404 12, [...term] 40, posts/[id] 82 líneas. El test nuevo tiene 97.
- REQ-35-11 [x] `./init.sh` verde en esta revisión: formato, tests al 100% y build.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>`): [x]
- C2 (frontmatter solo importa y pasa datos; lógica en `src/domain/seo/head.ts`): [x]
- C3 (datos vía repositorio; el nombre del perfil sale de `HeroProfileRepository`): [x]
- C4 (tokens; la feature no toca CSS): [x]
- C5 (máx. 100 líneas): [x] en los archivos de `src/`. `tests/layout-refactor.test.mjs` ya tenía
  200 líneas antes de esta feature (`git show HEAD`) y pasa a 202. No lo introduce la 35.
- C6 (sin dependencias externas): [x]
- C7 (`./init.sh` verde): [x]
- C8 (TDD: evidencia de rojo previo y suite verde final): [x]
- C9 (dependencias `depends_on` en done): [x] según el líder; se ignora feature_list.json por instrucción.

## Observaciones (no bloqueantes)
1. `SITE_DESCRIPTION` (`head.ts:7-8`) repite literalmente el `<h1>` de `src/pages/about.astro:21`. Lo mismo
   pasa con `SEARCH_DESCRIPTION` frente a `search-results.astro:9` y con `NOT_FOUND_DESCRIPTION`
   frente a `not-found.astro:8`. Hay dos fuentes de verdad: si se edita uno, el otro deriva. Se recomienda que
   about.astro, search-results.astro y not-found.astro consuman la constante en una feature posterior.
2. `/404` emite `canonical` hacia `https://moibaldenegro.com/404/`, y las páginas SSR de `[...term].astro`
   hacia su propia URL. Todas llevan `noindex`, así que el impacto es mínimo, aunque un canonical en
   páginas noindex es una señal mixta.
3. El canonical lleva barra final (`/about/`) y el navbar enlaza `/about`. Ya está anotado en impl_35 como
   fuera de alcance (audit_seo B4).

## Cambios requeridos (si aplica)
Ninguno.
