# Review — feature 94

**Veredicto:** APPROVED

> reviewer (nivel 1), 2026-10-14. Revisado: ronda 3 vigente. Alcance: solo la 94 (`src/styles/layout.css`,
> `tests/sticky-footer.test.mjs`, `tests/geist-pixel-extend.test.mjs`), con el diff de 268e9ad para esos archivos y el
> `git diff` sin commitear. La 93 (blocked) no se evalúa.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>`): [x] El cambio es solo CSS, en `src/styles/layout.css:6,14-17`. No toca ningún `.astro`.
- C2 (frontmatter sin lógica): [x] No aplica: no hay cambios en `.astro` ni en `.ts`.
- C3 (datos vía repositorio): [x] No aplica.
- C4 (tokens, sin hardcodear): [x] `layout.css:15` usa `var(--color-background)`, `var(--color-text)` y `var(--font-sans)`. `100vh`/`100dvh`/`100%` son unidades de viewport o porcentaje, no colores, espaciados, radios ni sombras (design.md, «Tokens usados»). El test `REQ-94-01..05` (`tests/sticky-footer.test.mjs:63-65`) prohíbe hex y rgb.
- C5 (≤100 líneas): [x] `layout.css` 99 (`wc -l` = 99, REQ-94-05) y `tests/sticky-footer.test.mjs` 65.
- C6 (sin dependencias nuevas): [x] El test solo usa `node:test`, `node:assert`, `node:fs` y `node:child_process`.
- C7 (JSON válido y tipado; errores nombrados): [x] No se toca `src/data`.
- C8 (`./init.sh` verde): [x] Lo ejecuté yo. Entorno, formato, tests al 100% y build, todo en verde. `node --test tests/sticky-footer.test.mjs tests/geist-pixel-extend.test.mjs` da 20 pass y 0 fail.
- C9 (visual desktop y móvil, sin errores de consola): [x] Lo verifiqué yo en Chrome headless con CDP (DPR 1, fuentes cargadas, dev server :4321 que ya estaba corriendo y que dejé corriendo). No hubo excepciones ni `console.error` en ninguna de las rutas medidas. Detalle abajo.
- C10 (feature en done y ninguna a medias): [ ] Lo cierra el líder. La 94 sigue `in_progress` hasta este APPROVED. No tiene `depends_on`, así que no salta ninguna dependencia. La 93 está `blocked`, no a medias, y queda fuera de alcance.
- C11 (progress al día, sin temporales ni TODOs): [x] `progress/current.md` documenta las rondas 1-3 y `progress/impl_sticky-footer.md` las tres rondas. Mis scripts de medición y de réplica del rojo están en el scratchpad, fuera del repo. Chrome quedó cerrado.

## Pregunta de revisión (test-first y dependencias)
- **Rojo antes del código:** sí. El informe (Ronda 3, «Rojo») muestra `✖ REQ-94-04` con `actual: ' margin: 0; width: 100%; '`, 7 pass y 1 fail. Lo reproduje de forma independiente: ejecuté el `tests/sticky-footer.test.mjs` actual contra `git show HEAD:src/styles/layout.css` y `REQ-94-04` falla, mientras que 01/02/03/05 y la guarda de tokens pasan. En esa copia 10/11 también fallan, pero solo porque fuera del repo no hay `git diff`. La ronda 1 (rojo 4/4) es coherente con el test original de 268e9ad.
- **Verde al final:** sí. Lo confirman `./init.sh` verde y 8/8 en el test de la feature.
- **Dependencias:** la 94 no tiene `depends_on`.

## Diff revisado (solo la 94)
- 268e9ad `layout.css`: body flex column con `min-height: 100vh; min-height: 100dvh` (`:14`), y `background`/`color`/`font-family` compactados en una línea (`:15`) para quedarse en 99 líneas. Añade `body > main { flex: 1 0 auto; }` (`:17`).
- Sin commitear `layout.css:6`: vuelve `height: 100%` al reset `html, body` (REQ-94-04 corregido) y el comentario cita REQ-94-04.
- `tests/sticky-footer.test.mjs:43-48`: el test de REQ-94-04 está invertido (`assert.match(reset, /(^|[;\s])height:\s*100%\s*;/)`). La cabecera `:2` cita REQ-94-01..14.
- `tests/geist-pixel-extend.test.mjs:26`: `layout.css` sale de `UNCHANGED` con la nota «Ajuste feature 94 (REQ-94-01..05, precedente REQ-43-06)». `site-menu.css` sigue en la lista.
- REQ-94-10/11: `site-footer.css` y `site-menu.css` no tienen diff frente a HEAD. `Layout.astro` y `tests/mobile-hamburger-menu.test.mjs` no tienen diff sin commitear. Sus cambios en 268e9ad llevan la nota «Ajuste feature 93» y pertenecen a la 93.

## Verificación independiente en navegador (Chrome headless + CDP)
- **REQ-94-06, páginas cortas** (/search, /search?q=zzzz y /404 a 375×1700, 800×1400 y 1280×1000): `footer.bottom − innerHeight` = **0** al cargar y con el scroll al máximo. `scrollHeight` = `innerHeight`, sin scroll extra.
- **Mismas rutas con 800 px de alto** (375/800/1280): no son más bajas que el viewport (scrollHeight entre 807 y 1441), así que REQ-94-06 no aplica. Con el scroll al máximo, Δ está entre −0.4 y 0.5 (±1), sin hueco bajo el footer. El hueco main→footer es de 70 px (el `margin-top` de site-footer.css).
- **REQ-94-07, páginas largas** (/ y /posts/04-ciclo-de-vida-y-arquitectura a 375/800/1280): el footer empieza 70 px tras `main.bottom`, sin solape. scrollHeight es 6248/6972, 4205/5091 y 3095/4345, idéntico a la tabla «antes» de la ronda 1.
- **REQ-94-08, header** con 800 px de alto (/ y post 04 a 375/800/1280): top **0** tras `scrollTo(0, 500)` y **−1265** tras `scrollTo(0, 2000)` (scrollY 2000). `position` calculado: sticky. Alto del body: 800. Es el comportamiento de HEAD~1 de 268e9ad.
- **REQ-94-14:** el header mide **65 px** a 800, 1000 y 1280 en /, en el post 04 y en /search.
- **REQ-94-09, menú móvil** a 375×800 en /search y en /: aria-expanded pasa de false a true (panel `visible`) y vuelve a false. scrollWidth 365 ≤ clientWidth 375 en los tres estados.

## Observaciones (no bloquean)
1. La cabecera de `progress/impl_sticky-footer.md:3` todavía dice «REQ-94-01..13» y «ronda 3». La spec vigente llega a REQ-94-14, que está medido en la Ronda 3. Es solo texto de bitácora.
2. Las guardas REQ-94-10/11 (`tests/sticky-footer.test.mjs:54-61`) comparan contra `HEAD`. Como 268e9ad ya está commiteado, en adelante solo detectan cambios sin commitear. Eso basta para esta ronda.
3. A 1280×800, /search (824 px) es 24 px más alta que el viewport. Al cargar, el footer queda 23.9 px por debajo del borde, y con el scroll al máximo queda pegado. Lo marca la spec: con contenido más alto que el viewport rige REQ-94-07, no REQ-94-06.

## Cambios requeridos (si aplica)
Ninguno.
