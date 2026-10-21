# Implementación — feature 107 hero-cards-links

Estado: ronda 1 **blocked** por presupuesto de peso (REQ-107-27/28); ronda 2 (abajo) desbloquea con la limpieza de `xlink:href` y queda lista para el reviewer.
Fecha: 2026-10-20. Spec: `specs/107_hero-cards-links/requirements.md` y `design.md`.

## Peso de `dist/client/index.html` (REQ-107-27/28)

| Medida | Bytes |
|--------|------:|
| Antes de la feature (`pnpm build` en este árbol, tras la 106) | **39 798** |
| Después (`pnpm build`, marcado exacto de la spec) | **40 211** |
| Después en el outDir temporal de `tests/search-index-lazy-load.test.mjs` | 40 215 |
| Después en el build de `tests/hero-cards-links.test.mjs` / `hero-cards-mobile-visibility.test.mjs` | 40 203 |
| Umbral REQ-47-06 | < 40 000 |

Exceso: **211 B** (margen previo 202 B; la feature suma 413 B). El CSS va en hoja externa (`/_astro/index.*.css`), así que
`hero-card-link.css` no pesa en el HTML; lo que pesa es el marcado que fija la spec (REQ-107-06/08/09/10):

```
<a class="card-link" href="https://github.com/MoiBaldenegro" rel="noopener"><span class="visually-hidden">GITHUB (sitio externo)</span><span class="card-link__arrow" aria-hidden="true">↗</span></a>
```

199 B en GITHUB + 206 B en YOUTUBE = 405 B (más ≈ 8 B de hash/serialización). Ningún atributo de ese marcado es
opcional según la spec, así que no cabe sin debilitar su propósito: paro según REQ-107-28.

### Recortes posibles dentro de la propia 107 (todos requieren cambiar la spec) y su resultado

| Recorte (acumulado) | Ahorro | Peso estimado |
|---------------------|------:|------:|
| Flecha por CSS `.card-link::after { content: "↗" }` en vez de `span.card-link__arrow` (REQ-107-10) | 118 B | 40 093 |
| + `aria-label="GITHUB (sitio externo)"` en vez de `span.visually-hidden` (REQ-107-08) | 46 B | 40 047 |
| + quitar `rel="noopener"` (sin `target` no tiene efecto; REQ-107-09) | 30 B | 40 017 |
| + quitar « (sitio externo)» del nombre accesible | 32 B | 39 985 |

Ni siquiera los tres primeros juntos caben; solo cabe quitando también el aviso de sitio externo (15 B de margen), lo que
debilita la accesibilidad pedida y deja la 108 sin margen.

### Opciones para el líder / spec_author

1. **Feature previa de limpieza de bytes de la portada** (recomendada): las 18 `<use>` del hero repiten
   `xlink:href="…"` junto a `href="…"`; quitar el `xlink:href` (obsoleto, todos los navegadores objetivo leen `href`)
   ahorra **750 B** medidos en el `dist` actual, lo que deja sitio a la 107 (≈ 39 461 B) y a la 108. Toca
   `hero-card.astro` y el test de la 103 (`tests/hero-cards-extra-logos.test.mjs` fija `xlink`): debe ser su propia
   feature (fuera del scope de la 107).
2. Ajustar el umbral de REQ-47-06 con «Ajuste feature 107 (precedente REQ-43-06)» según la regla de REQ-96-07
   (peso medido + 3000 redondeado al millar, tope 42 000 → 42 000 B). Debilita el presupuesto.
3. Reescribir REQ-107-08/09/10 con los recortes de la tabla (como mínimo los cuatro), aceptando la pérdida.

## Ciclo rojo/verde

### Rojo (antes de escribir código; `node --test tests/hero-cards-links.test.mjs`)

```
✖ REQ-107-01: HeroCard y HeroRichCard declaran readonly href: string | null y conservan sus campos
✖ REQ-107-02/03: href https:// o /ruta llega tal cual; ausente o null = null (icono y rica)
✖ REQ-107-04: un href inválido lanza HeroCardsDataError con archivo, índice y campo
✖ REQ-107-05: el JSON declara href en las 15 tarjetas: github y youtube con su URL, el resto null
✖ REQ-107-08: la plantilla solo añade « (sitio externo)» cuando href empieza por https://
✖ REQ-107-06/07/09/10/11/27 (build): a.card-link como último hijo solo en GITHUB y YOUTUBE, sin anidar, y portada < 40 000 B
✖ REQ-107-12/14..21: hero-card-link.css cubre la card, muestra la flecha con hover o foco y respeta reduced motion
✖ REQ-107-22/23/25/26: capturas, informe, tests heredados con la nota y mosaico intacto
ℹ tests 8  ℹ pass 0  ℹ fail 8
```

### Tras implementar (no llega a verde)

```
✔ REQ-107-01 ✔ REQ-107-02/03 ✔ REQ-107-04 ✔ REQ-107-05 ✔ REQ-107-08 ✔ REQ-107-12/14..21
✖ REQ-107-06/07/09/10/11/27 (build) — AssertionError: index.html pesa 40211 bytes (REQ-107-27)
   (las aserciones de marcado previas a la del peso pasan: último hijo exacto en GITHUB/YOUTUBE, ninguno en las 13, sin <a> anidado)
✖ REQ-107-22/23/25/26 — falta github-800-rest.png (CDP no ejecutada: bloqueo antes de verificar en navegador)
ℹ tests 8  ℹ pass 6  ℹ fail 2
```

Suite completa (`pnpm test`): 1115 tests, 1100 pass, **15 fail**. Además de los dos de arriba y de los de peso
(REQ-47-01/06 → 40 215 B, REQ-106-08/18/19 → 40 203 B), fallan por el cambio esperado del JSON/marcado y aún **no se
han ajustado** (quedan pendientes con «Ajuste feature 107 (precedente REQ-43-06)» cuando se desbloquee):
REQ-90-04/05 y REQ-90-04 (forma de getCards() sin href), REQ-98-06/07, REQ-99-02/03/04, REQ-31-02, REQ-97-10, REQ-92-01
(forma de la entidad / del JSON), REQ-103-09/10/11 (YOUTUBE gana un hijo), REQ-101-11/12/13 (htb-card.astro cambia),
REQ-101-17 (hero-cards.json cambia) y REQ-37-02 (`tests/visual-polish-refactor.test.mjs`: prohíbe anclas en
hero-card.astro; hay que reinterpretarlo como «sin href vacío»). `./init.sh` no queda en verde.

## Estado del árbol (implementación conforme a la spec, a la espera de decisión)

- `src/domain/entities/hero-card.ts`: `readonly href: string | null` en HeroCard y HeroRichCard.
- `src/domain/repositories/hero-cards-fields-parse.ts`: `readHref` (null/ausente → null; `https://\S+` o `/` sin `//`;
  otro valor → HeroCardsDataError con hero-cards.json, índice y "href"). `hero-cards-parse.ts` lo usa en ambos tipos.
- `src/data/hero-cards.json`: `href` explícito en las 15 (github y youtube con su URL, 13 null).
- `src/components/hero-card.astro` y `src/components/hero-cards/htb-card.astro`: a.card-link como último hijo si hay href,
  importan `src/styles/hero-card-link.css` (hoja nueva, 64 líneas, solo tokens).
- `tests/hero-cards-links.test.mjs` (nuevo, 100 líneas, sin dependencias: node:test y stdlib).
- No se tocaron sprite.svg, src/content/posts, tests/hack-the-box-sprite.test.mjs, hero-card.css, tokens.css, el
  mosaico ni tests/search-index-lazy-load.test.mjs. No se arrancó ningún servidor.
- Si se elige la opción 1, la implementación sigue válida tal cual; con la 3 hay que rehacer el marcado y su test.

## Ronda 2 (2026-10-20) — limpieza de `xlink:href` (REQ-107-07 reformulado, REQ-107-29..36, Decisión 7)

Estado: **implementada, pendiente de reviewer** (107 en `in_progress`). La implementación de la ronda 1 (entidad, `readHref`,
JSON, `a.card-link`, `hero-card-link.css`, `tests/hero-cards-links.test.mjs`) se mantiene sin cambios.

### Cambios de la ronda

- `src/components/hero-card.astro`: los 3 `<use>` de la plantilla (fondo, icono y esquina) pasan a `<use href={…}/>` sin
  `xlink:href` (17 en la portada). Comentario de la feature en el frontmatter. 49 líneas.
- `tests/hero-cards-links-xlink.test.mjs` (nuevo, 41 líneas, solo `node:test` y stdlib): REQ-107-29/30/31/34/35/36 (+26/27).
- `tests/hero-cards-extra-logos.test.mjs:53` (REQ-107-34): espera `<use href="…"></use>`, en la misma línea (100 líneas).
- 11 tests heredados ajustados con «Ajuste feature 107 (precedente REQ-43-06)», misma intención:
  - `tests/hero-card-kinds-domain.test.mjs` REQ-90-04/05, REQ-90-04, REQ-98-06/07, REQ-99-02/03/04: la forma esperada de `getCards()` incluye `href: null` (omitido = null, REQ-107-03).
  - `tests/hero-cards-repository.test.mjs` REQ-31-02: la tarjeta inyectada sale con `href: null`.
  - `tests/hero-cards-unique-tech.test.mjs` REQ-97-10 y `tests/htb-hero-card.test.mjs` REQ-92-01: la entrada htb lleva `href: null`.
  - `tests/hero-cards-polish.test.mjs` REQ-101-11/12/13: `htb-card.astro` igual a la 99 salvo `data-show-on-mobile` (106) y el import, el `const external` y el bloque `a.card-link` (107); REQ-101-17: JSON igual a la 99 salvo `cornerIcon`/`backgroundIcon`/`showOnMobile`/`href`.
  - `tests/hero-cards-extra-logos.test.mjs` REQ-103-09/10/11: además del `<use href>`, GITHUB y YOUTUBE terminan en su `a.card-link` (las 13 sin href, mismo marcado).
  - `tests/visual-polish-refactor.test.mjs` REQ-37-02: la única ancla permitida es el `a.card-link` con `href={card.href}` guardado por `card.href &&`; fuera de él, ninguna `<a` (el icono sigue siendo div).
- Sin tocar: `public/assets/svg/sprite.svg`, `src/content/posts`, `tests/hack-the-box-sprite.test.mjs`, `src/styles/hero-card.css`,
  `src/styles/tokens.css`, `src/components/about/about-hero.astro`, `src/components/site-footer/site-footer.astro`,
  `tests/search-index-lazy-load.test.mjs` (umbral REQ-47-06 < 40 000 intacto) ni el dominio del mosaico.

### Peso de `dist/client/index.html` (REQ-107-27/35)

| Medida (`pnpm build`) | Bytes |
|--------|------:|
| Antes de la feature (tras la 106) | **39 798** |
| Ronda 1 (enlace, con `xlink:href`) | 40 211 (40 203 en el build de los tests) |
| Después de la feature (ronda 2, sin `xlink:href`) | **39 453** |
| Margen frente a 40 000 B | **547** |

Los 17 ` xlink:href="…"` medían 750 B en el build de los tests (40 203 → 39 453). `grep -c xlink dist/client/index.html` = 0.
Fuera del cambio de `xlink`, el documento final es idéntico byte a byte al de la ronda 1 (salvo el id/token aleatorio del
server island de HTB, que cambia en cada build).

### Ciclo rojo/verde de la ronda

Rojo (`node --test tests/hero-cards-links-xlink.test.mjs`, antes de tocar `hero-card.astro`):

```
✖ REQ-107-29: hero-card.astro pinta cada <use> solo con href (icono, fondo y esquina) y sin xlink
✖ REQ-107-30/31/35 (build): 0 xlink:href, los mismos 17 <use href> del JSON en los article y portada < 40 000 B   (quedan xlink:href)
✖ REQ-107-34: el test de la 103 espera <use href> sin xlink con la nota de ajuste y <= 100 líneas
✔ REQ-107-26/27/36: git diff no toca about-hero, site-footer, hero-card.css, tokens.css ni el umbral de REQ-47-06
✖ REQ-107-32/33/35: el informe anota la ronda 2 con el peso, el margen y la CDP de los <use>   (falta la sección Ronda 2)
ℹ tests 5  ℹ pass 1  ℹ fail 4
```

Suite antes de ajustar los heredados (tras quitar `xlink`): 1120 tests, 1105 pass, 15 fail (los 11 heredados de arriba, los
4 nuevos/107 pendientes de informe y capturas). Los de peso (REQ-47-01/06, REQ-106-08/18/19, REQ-107-27) ya pasan.

Verde: ver «Suite final» abajo.

### Verificación Chrome headless + CDP (REQ-107-13/15/22/32/33)

`astro preview --port 4419` (parado al terminar; no se tocó el dev de :4321), Chrome headless `--headless=new`, viewport
w x 1000, DPR 1. Script `scratchpad/cdp107/m107.mjs`; línea base = el build de la ronda 1 (con `xlink:href`) medido con el
mismo script antes de quitar `xlink`; geometría de cards además contra `cdp106/final-r2.json` (cierre de la 106).

| Ancho | Cards vs base / vs 106 (Δmáx) | `<use>` sin xlink | getBoundingClientRect > 0 | Δmáx `<use>` vs base |
|------:|------:|------:|------:|------:|
| 375 | 0 / 0 px | 17/17 | 17/17 con la regla de la 106 desactivada por CDP (1 regla borrada del CSSOM) | 0 px |
| 800 | 0 / 0 px | 17/17 | 17/17 | 0 px |
| 1024 | 0 / 0 px | 17/17 | 17/17 | 0 px |
| 1280 | 0 / 0 px | 17/17 | 17/17 | 0 px |
| 1600 | 0 / 0 px | 17/17 | 17/17 | 0 px |

(En la base los 17 `<use>` tenían `xlink:href`.) A 375 con la regla de la 106 activa, GITHUB y YOUTUBE están ocultas y hay
0 `a.card-link` visibles/focusables.

Enlaces a 800/1024/1280/1600 (GITHUB y YOUTUBE, mismos valores en ambas y en los cuatro anchos):

- `elementFromPoint` en el centro de la card = su `a.card-link`; el enlace cubre la caja de relleno de la card (card menos el borde de 1 px).
- Nombre accesible «GITHUB (sitio externo)» / «YOUTUBE (sitio externo)»; `rel="noopener"`, sin `target`.
- Flecha: opacity 0 en reposo, 1 con `CSS.forcePseudoState` hover y 1 tras enfocar con la tecla Tab real (`:focus-visible` true); transform `matrix(1, 0, 0, 1, 2, -2)`.
- Foco: outline `solid 2px rgb(125, 104, 255)` (`--color-accent`), offset -4px, visible dentro de la card (capturas `*-focus.png`).
- Solape flecha/título 0 en reposo, hover y foco; sin `cornerIcon` en estas cards (solape con esquina n/a); flecha dentro del article; cada palabra del título en 1 caja dentro del article.
- 1280: clic de ratón en el centro y Enter con el foco piden `https://github.com/MoiBaldenegro` y `https://www.youtube.com/@moibaldenegro` (interceptadas con `Fetch` y canceladas).
- 1280 con `prefers-reduced-motion: reduce`: transform `none` en hover y foco, opacity 1; transition-duration 1e-05s (la regla global de reduced motion de `layout.css` con `!important` gana a `transition: none`; efecto equivalente, sin animación).
- Solo los article de YOUTUBE y GITHUB contienen `<a>`; las 13 cards sin href: marcado idéntico al de la ronda 1 salvo el `xlink:href` (comparación del HTML) y geometría Δ 0.
- Errores de consola / red: **0** (las navegaciones externas canceladas a propósito se excluyen).

Capturas: `progress/research/hero107/github-{800,1024,1280,1600}-{rest,hover,focus}.png`.

### Suite final (verde)

`node --test tests/hero-cards-links-xlink.test.mjs tests/hero-cards-links.test.mjs` dentro de `pnpm test`:

```
✔ REQ-107-29 ✔ REQ-107-30/31/35 (build) ✔ REQ-107-34 ✔ REQ-107-26/27/36 ✔ REQ-107-32/33/35
✔ REQ-107-01 ✔ REQ-107-02/03 ✔ REQ-107-04 ✔ REQ-107-05 ✔ REQ-107-08 ✔ REQ-107-06/07/09/10/11/27 (build)
✔ REQ-107-12/14..21 ✔ REQ-107-22/23/25/26
✔ REQ-47-01/06 (build): sin índice embebido y portada < 40 000 bytes (umbral sin tocar)
ℹ tests 1120  ℹ pass 1120  ℹ fail 0
```

`./init.sh`: exit 0 («tests al 100% (node:test)», «build de producción (pnpm build)», «El entorno está perfecto»).
`dist/client/index.html` tras el build de `init.sh`: 39 453 B. `git diff --name-only HEAD` vacío para sprite.svg,
src/content/posts, tests/hack-the-box-sprite.test.mjs, hero-card.css, tokens.css, about-hero.astro, site-footer.astro,
tests/search-index-lazy-load.test.mjs y el dominio del mosaico.

## Ronda 3 (cambios requeridos 1-4 del review)

1. La clasificación de la liga sale del frontmatter. Nuevo `src/domain/hero-card-link.ts` con
   `isExternalHref(href: string | null): boolean` (true solo con `https://`). `hero-card.astro` y `hero-cards/htb-card.astro`
   solo importan el helper y le pasan el dato: `const external = isExternalHref(card.href);`.
   Test unitario nuevo: `tests/hero-card-link-domain.test.mjs` (https → true, /about → false, null → false).
2. `tests/hero-cards-links.test.mjs` (REQ-107-08) ahora comprueba el import de `isExternalHref` desde el dominio,
   `const external = isExternalHref(card.href);`, que no hay `startsWith` en el `.astro` y que « (sitio externo)» solo va con
   `external`. El archivo sigue en 100 líneas.
3. `tests/hero-cards-polish.test.mjs:66` (REQ-101-11/12/13): se amplía la exclusión con el import del helper en
   `htb-card.astro`, con la nota «Ajuste feature 107 (precedente REQ-43-06)» ampliada a «… y el import de isExternalHref».

### Rojo (antes de crear el helper y tocar los componentes)

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\hero-card-link.ts' imported from ...\tests\hero-card-link-domain.test.mjs
✖ tests\hero-card-link-domain.test.mjs
✖ REQ-107-08: los componentes clasifican con isExternalHref del dominio y solo añaden « (sitio externo)» si external
  AssertionError [ERR_ASSERTION]: src/components/hero-card.astro
ℹ pass 7  ℹ fail 2
```

Tras crear el helper y tocar los componentes, antes de ampliar la exclusión, falló lo previsto:
`✖ REQ-101-11/12/13: HTB reduce paddings y aviso en <= 1200 px solo en sus dos hojas y con tokens` (por el import nuevo).

### Verde

```
./init.sh -> exit 0
✔ tests al 100% (node:test)
✔ El entorno está perfecto. Podemos empezar a trabajar.
pnpm test: ℹ tests 1121  ℹ pass 1121  ℹ fail 0
```

`dist/client/index.html` tras el build de `init.sh`: **39 453 B** (< 40 000; mismo peso que en la ronda 2 y umbral intacto).
El marcado generado no cambia (solo cambia el frontmatter): siguen saliendo `rel="noopener"` y «GITHUB (sitio externo)» /
«YOUTUBE (sitio externo)», y el peso es idéntico byte a byte. Como el marcado no cambia, no hace falta volver a medir con CDP.
`git diff --name-only HEAD` vacío para sprite.svg, src/content/posts y tests/hack-the-box-sprite.test.mjs.
