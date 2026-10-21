# Review — feature 107

**Veredicto:** APPROVED

## Revisión 2

**Veredicto vigente:** APPROVED. Revisor nivel 1, 2026-10-20, ronda 3 de `progress/impl_hero-cards-links.md`.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>`): [x] no cambia respecto a la revisión 1.
- C2 (frontmatter solo imports y paso de datos): [x] `src/domain/hero-card-link.ts:4-6` exporta `isExternalHref(href: string | null): boolean`. `src/components/hero-card.astro:6,17` y `src/components/hero-cards/htb-card.astro:6,15` solo importan el helper y hacen `const external = isExternalHref(card.href);`. No queda `startsWith` en los `.astro`.
- C3 (datos vía repositorio): [x] no cambia.
- C4 (tokens): [x] no cambia.
- C5 (≤ 100 líneas): [x] hero-card-link.ts 6, hero-card-link-domain.test.mjs 9, hero-cards-links.test.mjs 100, hero-cards-polish.test.mjs 100 (igual que en HEAD), hero-card.astro 50, htb-card.astro 33.
- C6 (sin dependencias, sin JS de runtime): [x]
- C7 (sin enlaces anidados): [x] el test de build (REQ-107-06/07/09/10/11/27) pasa en verde.
- C8 (test-first): [x] el rojo de la ronda 3 está documentado: ERR_MODULE_NOT_FOUND del helper y REQ-107-08 en fail, 7 pass y 2 fail. Después falló REQ-101-11/12/13, que era lo esperado por el import nuevo, y por último quedó en verde con 1121/1121.
- C9 (`./init.sh` verde): [x] exit 0 en esta revisión (formato, tests al 100 %, build). `dist/client/index.html` pesa **39 457 B**, por debajo de 40 000. El umbral sigue intacto en `tests/search-index-lazy-load.test.mjs:97` (`size < 40000`).
- C10 (dependencias en done): [x]
- C11 (archivos ajenos sin tocar): [x] `git diff --name-only HEAD` sale vacío para sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs y search-index-lazy-load.test.mjs.
- C12 (ajustes de tests heredados anotados): [x] la nota de `tests/hero-cards-polish.test.mjs:66` se amplía con «y el import de isExternalHref».

## Cambios requeridos de la revisión 1
1. Resuelto. El helper está en el dominio y tiene su test unitario en `tests/hero-card-link-domain.test.mjs:5-9`, que cubre https → true, /about → false y null → false.
2. Resuelto. `tests/hero-cards-links.test.mjs:48-55` comprueba el import del dominio, la ausencia de `startsWith`, la línea `const external = isExternalHref(card.href);` y que « (sitio externo)» solo se añade cuando `external` es true. El archivo sigue en 100 líneas.
3. Resuelto. La exclusión de `tests/hero-cards-polish.test.mjs:66` cubre el import nuevo y lleva la nota de precedente REQ-43-06.
4. Resuelto. `./init.sh` sale en verde, la ronda 3 está anotada con su rojo y su verde, y el peso queda en 39 457 B, dentro del umbral.

## Regresiones
No hay. Solo cambia el frontmatter. En el HTML del build hay exactamente 2 `a.card-link`, los de YOUTUBE y GITHUB, con `rel="noopener"` y la misma URL que antes, y 0 `xlink:href`. Además, el test de build sigue exigiendo que el marcado de los enlaces sea idéntico byte a byte. El peso del HTML solo varía en ±4 B respecto a la ronda 2, que es el token del server island. Como el DOM renderizado no cambia, no repetí la verificación con CDP: la de la revisión 1 sigue valiendo.

---

# Revisión 1 (histórico)


**Veredicto:** CHANGES_REQUESTED

Revisor nivel 1, 2026-10-20. Alcance: solo la 107 (ronda 2 de `progress/impl_hero-cards-links.md`). No se evalúan la 108 ni los
cambios de la 106 que siguen sin commit en el árbol (`hero-section.css`, `hero-card-registry.test.mjs`, `hero-mosaic-layout.test.mjs`,
`hero-cards-mobile-visibility.test.mjs`, el atributo condicional `data-show-on-mobile`).

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>`): [x] hoja nueva `src/styles/hero-card-link.css` (64 líneas), sin `<style>` ni `style=` en los dos componentes.
- C2 (frontmatter solo imports y paso de datos): [ ]  ← Razón: `src/components/hero-card.astro:16` y `src/components/hero-cards/htb-card.astro:15` calculan en el frontmatter `const external = card.href !== null && card.href.startsWith('https://');`. Clasificar la liga como externa es lógica de transformación, y está duplicada en dos archivos de UI. `docs/architecture.md:35` (regla 8: «El frontmatter de un `.astro` se limita a imports y paso de datos. Cualquier lógica (parseo, transformación, validación…) se extrae a módulos `.ts`») y `docs/conventions.md:57-59` lo prohíben. Hay precedente directo para el mismo caso: el footer recibe `external` del dominio (`src/domain/site-footer.ts:12,27,31`) y `site-footer.astro` solo lo pinta.
- C3 (datos vía repositorio, validación en el parse): [x] `readHref` en `src/domain/repositories/hero-cards-fields-parse.ts:61-67` (null o ausente → null; `https://\S+` o `/` sin `//`; si no, `HeroCardsDataError` con hero-cards.json, el índice y "href"), y `hero-cards-parse.ts:53,66` lo usa en los dos tipos. Los componentes no leen JSON.
- C4 (tokens, sin valores sueltos de color): [x] solo `--color-text`, `--color-accent`, `--radius-card` y `--transition-default`; `tokens.css` intacto.
- C5 (≤ 100 líneas): [x] hero-card.astro 49, htb-card.astro 30, hero-card-link.css 64, tests/hero-cards-links.test.mjs 100, tests/hero-cards-links-xlink.test.mjs 39. Ningún test heredado crece por encima de su tamaño en HEAD (los que ya pasaban de 100 se quedan igual; visual-polish-refactor pasa de 239 a 242 y ya estaba por encima antes).
- C6 (sin dependencias, sin JS de runtime): [x]
- C7 (sin enlaces anidados): [x] medido por CDP: 0 `a a`, 1 `<a>` solo en los article de GITHUB y YOUTUBE y ninguno en HTB.
- C8 (test-first, rojo y verde documentados): [x] rojo de la ronda 1 (8/8 fail) y de la ronda 2 (4/5 fail) anotados antes del código; suite final 1120/1120.
- C9 (`./init.sh` verde): [x] exit 0 (formato, tests al 100 %, build). Peso de `dist/client/index.html`: **39 461 B** (el informe da 39 453 B; la diferencia es el token aleatorio del server island). Margen ≈ 539 B. Umbral de REQ-47-06 intacto: `tests/search-index-lazy-load.test.mjs:97` sigue con `size < 40000`.
- C10 (dependencias en done): [x] depende de la 106.
- C11 (archivos ajenos sin tocar): [x] `git diff --name-only HEAD` sale vacío para sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, hero-card.css, hero-card-accents.css, tokens.css, about-hero.astro, site-footer.astro y search-index-lazy-load.test.mjs.
- C12 (tests heredados con «Ajuste feature 107 (precedente REQ-43-06)» y la misma intención): [x] kinds-domain (4), extra-logos (2), polish (2), repository, unique-tech, htb-hero-card y visual-polish-refactor.

## Verificación independiente (Chrome headless + CDP)

`astro preview --port 4437` sobre el dist de `./init.sh` (ya parado; el `pnpm dev` de :4321 no se tocó). Script en
`scratchpad/rev107/r107.mjs` y resultado en `scratchpad/rev107/result.json`. Línea base: `scratchpad/cdp107/base.json`, que es el build de la ronda 1, todavía con `xlink:href`.

| Ancho | Δ cards | `<use>` | xlink:href (DOM+HTML) | bbox > 0 | Δ `<use>` |
|------:|------:|------:|------:|------:|------:|
| 375 | 0 | 17 | 0 | 17/17 con la regla de la 106 borrada del CSSOM (1 regla) | 0 |
| 800 / 1024 / 1280 / 1600 | 0 | 17 | 0 | 17/17 | 0 |

- 375 con la regla de la 106 activa: solo HTB está visible y hay 0 `a.card-link` visibles. La 106 queda intacta.
- 800/1024/1280/1600, GITHUB y YOUTUBE:
  - `elementFromPoint` en el centro da `card-link`, y el enlace cubre la card menos el borde de 1 px.
  - El nombre AX es «GITHUB (sitio externo)» / «YOUTUBE (sitio externo)» con rol link, `rel="noopener"` y sin `target`.
  - Flecha: opacity 0 y transform none en reposo. Con hover real del ratón y con foco por Tab real (`:focus-visible` true) pasa a opacity 1 y `matrix(1,0,0,1,2,-2)`.
  - El outline es `solid 2px rgb(125,104,255)` con offset -4px.
  - El solape flecha/título es 0 en reposo, hover y foco. El título ocupa 1 línea y la flecha queda dentro del article. Ninguna de las dos cards tiene cornerIcon, así que el solape con la esquina no aplica, aunque las reglas de 46/40 y 76/66 px existen.
- 1280:
  - Navegación interceptada con Fetch: el clic de ratón en el centro y Enter con el foco piden `https://github.com/MoiBaldenegro` y `https://www.youtube.com/@moibaldenegro`.
  - Con `prefers-reduced-motion: reduce`: transform none en hover y en foco, opacity 1 y transition-duration 1e-05s. Esa duración viene de la regla global de `layout.css`, que gana con `!important`, así que no hay animación.
- Las 13 cards sin href tienen el mismo marcado que la línea base, quitando solo el `xlink:href` (0 diferencias en los 15 article).
- Errores de consola, log o excepciones: 0.
- Las capturas `progress/research/hero107/github-{800,1024,1280,1600}-{rest,hover,focus}.png` son coherentes: flecha oculta en reposo, ↗ arriba a la derecha y outline violeta dentro de la card en foco.

Aparte de C2, la feature cumple la spec y la petición humana.

## Cambios requeridos
1. Sacar del frontmatter la clasificación de la liga. Hoy está en `src/components/hero-card.astro:16` y `src/components/hero-cards/htb-card.astro:15`, y debe ir a un módulo `.ts` del dominio. Por ejemplo, `export function isExternalHref(href: string | null): boolean` en `src/domain/hero-card-link.ts` (o junto a `readHref`), con su test unitario escrito antes y en rojo: `https://…` → true, `/about` → false, null → false. Los componentes solo importan y pasan el dato: `const external = isExternalHref(card.href);`, igual que `site-footer.astro` consume `external` de `src/domain/site-footer.ts`. Una alternativa equivalente es que el dominio entregue el booleano ya calculado, siempre que no rompa REQ-107-01.
2. Ajustar `tests/hero-cards-links.test.mjs:52`, que hoy exige `card.href.startsWith('https://')` en el `.astro` y por tanto fija la lógica en la UI. Debe comprobar que el componente importa y usa el helper del dominio, y que la plantilla solo añade « (sitio externo)» cuando `external` es true (línea 53). El archivo tiene que seguir en ≤ 100 líneas.
3. Revisar `tests/hero-cards-polish.test.mjs:66` (REQ-101-11/12/13). Su `replace` elimina `const external[^\n]*\n` pero no un `import` nuevo del helper en `htb-card.astro`. Si se añade ese import, hay que ampliar la exclusión con la nota «Ajuste feature 107 (precedente REQ-43-06)» que ya lleva la línea.
4. Volver a ejecutar `./init.sh` (verde), anotar en `progress/impl_hero-cards-links.md` la ronda 3 con su rojo y su verde, y volver a medir el peso de `dist/client/index.html`. Debe seguir < 40 000 B: el cambio solo toca el frontmatter, así que no debería sumar bytes al HTML.
