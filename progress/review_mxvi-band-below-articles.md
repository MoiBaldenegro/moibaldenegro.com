# Review — feature 8

**Veredicto:** APPROVED

Feature `mxvi-band-below-articles`. Spec: `specs/08_mxvi-band-below-articles/` (REQ-08-01..11).
Revisión del 2026-11-02.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (no se tocó ningún CSS ni se añadió `<style>`)
- C2 Frontmatter solo con imports y paso de datos: [x] (`home.astro` L1-17 sin cambios)
- C3 Ningún componente lee JSON directamente: [x] (no hay cambios de datos)
- C4 Solo tokens: [x] (REQ-08-08 no se activó; `mxvi-logos-banner.css` sin cambios)
- C5 Archivos de 100 líneas o menos: [x] (`home.astro` 28, `tests/mxvi-band-below-articles.test.mjs` 53, `tests/promo-tiles-section-ui.test.mjs` 87)
- C6 Sin dependencias nuevas: [x]
- C7 Datos válidos y repositorios con errores nombrados: [x] (sin cambios)
- C8 `./init.sh` en verde: [x] (formato, tests al 100% y build en verde, ejecutado por el reviewer)
- C9 Página correcta en desktop y móvil sin errores de consola: [x], con una observación ajena a la feature (ver más abajo)
- C10 Feature en `done` y ninguna otra a medias: [ ] pendiente del líder. La feature 8 está en `in_progress`; las features 1-7 están en `done`. No bloquea la aprobación.
- C11 `progress/current.md` e historial: [x] durante la sesión. El cierre lo hace el líder.
- C12 Sin temporales ni debug: [x]

## Verificación

- Dependencias: `depends_on: [7]`, y la feature 7 está en `done`.
- TDD: `progress/impl_mxvi-band-below-articles.md` §2 muestra el rojo antes de tocar `home.astro`: REQ-08-01 y 02/03/04 fallaban, y REQ-04-08 fallaba tras reescribir la aserción. Los tests 05, 06 y 11 ya pasaban; el informe los presenta como guardas de regresión, y lo acepto. §3 muestra el verde (71/71). Lo confirmé con `./init.sh` en verde.
- Orden (REQ-08-01..05): en `src/pages/home.astro` L21-25 el orden es exactamente `NewHero`, `LatestArticles`, `LatestHorizontal`, `MxviLogosBanner`, `PromoTiles`. `<SearchLive />` sigue fuera (L27). En el DOM servido el orden coincide: `section.new-hero`, `section.latest-articles` (a 1280 px, `div.latest-articles--horizontal-pin`), `section.mxvi-logos` y `section.promo-tiles`.
- Alcance (REQ-08-06/07): `git diff HEAD -- src/` solo trae el movimiento de una línea en `home.astro`. Las features 5-7 ya están en el commit be6373a, así que no hay otros cambios en `src/`. `tests/promo-tiles-section-ui.test.mjs` solo cambia el nombre del test y la regex de REQ-04-08 (L19 y L24), como pide REQ-08-09. El componente y el CSS de la cinta no cambian.
- REQ-08-10, verificación visual hecha por el reviewer: `pnpm build` (vía `./init.sh`), `pnpm preview` en el puerto 4399 y Chrome headless con CDP a 375, 768 y 1280 px. Medidas en `progress/research/mxvi-band-below-articles-review/review-medidas.json`, capturas `band-{375,768,1280}px.png` (viewport) y `band-context-*.png`.
  - La cinta queda debajo del bloque de artículos y justo encima de PromoTiles en los tres anchos. Bordes superior e inferior de 1px `var(--color-border)` visibles. `padding-block` de 32 / 38,4 / 64 px. PromoTiles empieza pegado al borde inferior, con su `padding-top` de 10 px. Visualmente está bien separada y no hace falta activar REQ-08-08.
  - Sin scroll horizontal: `scrollWidth` es igual al ancho útil en los tres anchos (375; 758 y 1270 con la `scrollbar-gutter: stable`). A 768 y 1280 px la cinta va de -5 a +5 px del área útil por el `100vw`, recortada por `overflow-x: clip`. Es lo mismo que ya anotó la review de la feature 6.
  - 1280 px: la cinta aparece después de la reserva sticky del bloque horizontal (top 2933 px). Al dejarla a 450 px del borde superior del viewport, ninguna card de artículos se solapa con ella (0 intersecciones).
  - Consola: solo hay un error, el 404 de `/assets/content/api-auth.webp`, que ya existía y es ajeno a la feature (ver las reviews de las features 6 y 7).
- El servidor de preview y Chrome se pararon al terminar.

## Observaciones (no bloqueantes)
1. A 1280 px queda una franja oscura de unos 190 px entre las últimas cards y la cinta. Es el final de la reserva `margin-bottom` del recorrido horizontal (`latest-horizontal-reserve.css`), que ya existía. Si el humano la quiere más corta, habría que abrir una feature aparte.
2. El 404 de `api-auth.webp` sigue abierto. Conviene abrir una feature aparte, como ya recomendaron las reviews anteriores.

## Cambios requeridos (si aplica)
Ninguno.
