# Review — feature 38

**Veredicto:** APPROVED

Feature 38 `layout-main-skip-link` (spec `specs/38_layout-main-skip-link/`). Dependencias: `depends_on: [35]` → 35 `done`.
Implementada por el líder en rol de implementer (autorización humana explícita); revisada con el mismo rigor.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x] — `.skip-link` vive en `src/styles/layout.css:93-99`; ningún `.astro` tocado añade `<style>`.
- C2 (frontmatter solo imports y datos): [x] — `Layout.astro` solo añade marcado (`:40`, `:52-54`); las páginas solo cambian `main`→`div`.
- C3 (datos vía repositorios): [x] — sin cambios en acceso a datos.
- C4 (solo tokens): [x] — `--gap-card`, `--radius-pill`, `--color-accent`, `--color-text`, `--transition-default` existen en `tokens.css` (líneas 19, 27, 67, 74, 88). `z-index: 200` y `font-weight: 600` no son colores/espaciados/radios/sombras (mismo criterio que `z-index: 100` del navbar).
- C5 (≤100 líneas): [x] — Layout 56, layout.css 99, new-hero 56, not-found 14, about 24, posts/[id] 82, search 31, [...term] 40, test nuevo 80, helper 46.
- C6 (sin dependencias nuevas): [x] — el helper usa solo Node stdlib.
- C7 (`./init.sh` verde): [x] — ver «Verificación»; la última corrida termina «El entorno está perfecto».
- C8 (test-first): [x] — `progress/impl_38.md` documenta el rojo (1 pass / 5 fail, con el test endurecido antes de implementar) y el verde 616/616 ×3.
- C9 (repo limpio): [x] — no quedan `node_modules/.astro-build.lock` ni `src/styles/tmp-audit.css` tras las corridas; no hay debug ni TODOs.

## Trazabilidad REQ
- REQ-38-01: [x] `Layout.astro:52-54` `<main id="contenido" tabindex="-1"><slot /></main>` (tabindex conforme a design.md).
- REQ-38-02: [x] `Layout.astro:40` es el primer hijo de `body`; el test lo comprueba sobre el HTML del build en `/`, `/about`, `/search`, `/404` y todos los posts.
- REQ-38-03: [x] `grep "<main"` en `src/` solo encuentra `Layout.astro`. new-hero, about, posts/[id], search y [...term] pasan a `<div class="X">` conservando la clase; ninguna hoja selecciona `main` (verificado en `src/styles/`).
- REQ-38-04: [x] el test cuenta exactamente un `<main` por página del build.
- REQ-38-05: [x] `translateY(-200%)` con `top: 14px`: con ~33px de alto el borde inferior queda en ~-19px, fuera de vista; sin `display:none` ni `visibility:hidden`.
- REQ-38-06: [x] `.skip-link:focus { transform: none; }` y `z-index: 200` > 100 del `.site-navbar`.
- REQ-38-07: [x] estilos en `layout.css`, colores y radio solo con tokens.
- REQ-38-08: [x] `tests/post-header.test.mjs:20-22` y `tests/post-page-styles.test.mjs:13-14,104-105` documentan el ajuste con el precedente REQ-43-06; el resto de aserciones (article, clases BEM) se conserva.
- REQ-38-09: [x] rojo documentado en `progress/impl_38.md`.
- REQ-38-10: [x] ver C5.
- REQ-38-11: [x] ver «Verificación».

## Helper `tests/helpers/astro-build.mjs` (arreglo del flake de builds)
Correcto y no debilita ningún test:
- Lock por `mkdirSync` atómico (falla con `EEXIST` si ya existe) en `node_modules/` (ignorado por git, `.gitignore:11`); liberación en `finally`; recuperación de lock huérfano a los 5 min. El archivo no casa con `tests/**/*.test.mjs`, así que no lo ejecuta el runner.
- En los 5 tests (about-page, home-latest-articles-limit, not-found-page, seo-head-base, layout-main-skip-link) solo cambia la invocación de `spawnSync` por `astroBuild(...)`; mismos args, mismo `maxBuffer`, y todas las aserciones sobre `build.status` y el HTML se mantienen intactas.
- `Atomics.wait` sobre `SharedArrayBuffer` es una espera síncrona válida en el hilo principal de Node.

## Verificación
- `./init.sh` ×3: 1.ª corrida con el paso de tests en rojo, 2.ª y 3.ª en verde.
- `pnpm test` ×11 aislado (incluida la secuencia formato → test → build ×3): 10 en verde 616/616 y 1 fallo.
- El único fallo capturado con log es **ajeno a la feature 38**: `tests/game-of-life-removal.test.mjs:166` (REQ-25-07) da `ENOENT ... src\styles\tmp-audit.css`. Es la carrera documentada en el historial (cierres de las features 25, 26 y 28; `progress/review_28.md:177-182`): `tests/cleanup-dead-code.test.mjs:80-92` escribe y borra esa hoja dentro de `src/` mientras otro test recorre `src/`. Ninguno de los dos archivos está modificado por la 38. Ya hay una decisión pendiente del humano sobre este caso (`progress/history.md:1373,1386`). No aparece ningún fallo de `astro build` (`assets:storage`) en ninguna corrida.

## Observaciones no bloqueantes
1. Se repite el flake preexistente de `tmp-audit.css` (2 de 14 corridas). Recomiendo que el líder abra una feature propia para llevar ese fixture a `os.tmpdir()` (mismo patrón que la 28). No se pide en la 38 para no mezclar features.
2. `tests/post-header.test.mjs:173`: el nombre del test sigue diciendo «se conservan main.post» aunque ahora la aserción es `div.post`. Solo es cosmético.
3. El contraste de `#ffffff` sobre `--color-accent` (#7d68ff) es de unos 3,96:1, por debajo del 4,5:1 de WCAG AA para texto normal. Es lo que fija design.md (tabla de tokens), así que no es un defecto de la implementación. Lo puede valorar el humano en una feature futura.
4. `about-page` y `home-latest-articles-limit` compilan en `dist/` y lo leen después de soltar el lock. El margen de carrera es mínimo, porque el siguiente build tarda en arrancar antes de vaciar `dist/`, y era peor antes del cambio. Si reaparece, pasar ambos a un `outDir` temporal como los otros tres.
5. `CHECKPOINTS.md` no se ha tocado (se ignora por instrucción del líder). El ítem visual (desktop/móvil) no lo verificó este revisor.

## Cambios requeridos (si aplica)
Ninguno.
