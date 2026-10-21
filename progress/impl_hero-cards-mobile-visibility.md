# Implementación — feature 106 hero-cards-mobile-visibility

Estado: **listo para review (ronda 2)**. La ronda 1 quedó bloqueada por el peso de la portada (REQ-47-06, ver «Bloqueo»);
el líder ajustó la spec (REQ-106-08/09 reescritos, 18 y 19 nuevos) y la ronda 2 (al final) lo resuelve con `./init.sh` en
verde. No lancé subagentes ni hice commits. Las secciones de la ronda 1 se conservan como historial.

## Cambios

- `src/domain/entities/hero-card.ts`: `readonly showOnMobile: boolean` en `HeroCard` y `HeroRichCard` (REQ-106-01).
- `src/domain/repositories/hero-cards-fields-parse.ts` (nuevo, 59 líneas): `HeroCardsDataError`, `asCard`, `expectString`,
  `expectNumber`, `readBoolean(card, field, index, fallback)` (nuevo, también lo usa `featured`), `readOption` y
  `readSpriteRef`, movidos desde el parse. Pensado para que lo reutilicen la 107 y la 108 (REQ-106-07).
- `src/domain/repositories/hero-cards-parse.ts` (65 líneas, antes 99): importa del módulo hermano y vuelve a exportar
  `HeroCardsDataError` (el repositorio no cambia). `showOnMobile`: por defecto `false` en icono y `true` en ricas; si no es
  booleano lanza `hero-cards.json: la tarjeta <i> tiene un campo "showOnMobile" que debe ser booleano` (REQ-106-02..05).
- `src/data/hero-cards.json`: `"showOnMobile"` explícito en las 15 cards, `true` solo en `htb` (REQ-106-06).
- `src/components/hero-card.astro` y `src/components/hero-cards/htb-card.astro`: `data-show-on-mobile={String(card.showOnMobile)}`
  al final del `<article>` (REQ-106-08).
- `src/styles/hero-section.css` (68 líneas): dentro del `@media (max-width: 768px)` existente,
  `.hero-grid > .hero-card[data-show-on-mobile="false"] { display: none; }` con comentario (REQ-106-09).
- Sin cambios: `hero-grid-layout.ts`, `hero-grid-template.ts`, `hero-card.css`, `tokens.css`, `sprite.svg`,
  `src/content/posts/**`, `tests/hack-the-box-sprite.test.mjs` (sha256 antes/después idénticos, `sha256sum -c` OK; esos archivos
  ya tenían cambios sin commitear de otras features, así que la prueba es el sha y no `git diff`).

## Tests

- Nuevo `tests/hero-cards-mobile-visibility.test.mjs` (85 líneas, solo `node:test` y la stdlib más el helper
  `tests/helpers/astro-build.mjs`).
- Tests heredados ajustados en la misma línea (sin sumar líneas), cada uno con «Ajuste feature 106 (precedente REQ-43-06)»
  y la misma intención que antes:
  - `hero-card-kinds-domain.test.mjs`: los fixtures `ICON`/`RICH` declaran `showOnMobile` (igual que la 99 hizo con `featured`).
  - `hero-cards-repository.test.mjs` REQ-31-02: lo esperado incluye `showOnMobile: false`.
  - `hero-cards-unique-tech.test.mjs` REQ-97-10 y `htb-hero-card.test.mjs` REQ-92-01: HTB esperado con `showOnMobile: true`.
  - `hero-card-registry.test.mjs` REQ-91-06, `htb-hero-card.test.mjs` REQ-92-04 y `hero-mosaic-layout.test.mjs` REQ-99-18:
    el regex del `<article>` admite `data-show-on-mobile={String(card.showOnMobile)}`.
  - `hero-cards-extra-logos.test.mjs` REQ-103-09/10/11: el regex del article construido incluye `data-show-on-mobile="false"`.
  - `hero-cards-polish.test.mjs` REQ-101-11/12/13: `htb-card.astro` igual a la del commit de la 99 salvo el atributo nuevo;
    REQ-101-17: además de `cornerIcon` y `backgroundIcon` se quita `showOnMobile` antes de comparar el JSON.

### Rojo (antes de implementar, `node --test tests/hero-cards-mobile-visibility.test.mjs`, exit 1)

```
✖ REQ-106-01: HeroCard y HeroRichCard declaran readonly showOnMobile: boolean y conservan sus campos
✖ REQ-106-02/03/04: el valor declarado llega tal cual; ausente = false en icono y true en ricas
✖ REQ-106-05: un showOnMobile no booleano lanza HeroCardsDataError con archivo, índice y campo
✖ REQ-106-06: las 15 tarjetas del JSON declaran showOnMobile, true solo en htb
✖ REQ-106-07: el parse queda partido en hero-cards-parse.ts y un hermano, ambos <= 100 líneas; el JSON real da 15
✖ REQ-106-08 (build): data-show-on-mobile en cada article del hero y plantillas sin style ni script
✖ REQ-106-09: display none para las cards false solo dentro de @media (max-width: 768px)
✔ REQ-106-13/17: la feature no toca el dominio del mosaico y los archivos tocados miden <= 100 líneas
✖ REQ-106-14/16: capturas por ancho y tests heredados ajustados con la nota
ℹ tests 9  ℹ pass 1  ℹ fail 8
```

(El único verde es la guarda de que el dominio del mosaico no se toca.)

### Verde (`pnpm test` completo después de implementar)

```
✔ REQ-106-01 … ✔ REQ-106-14/16   (9/9)
ℹ tests 1107
ℹ pass 1106
ℹ fail 1
✖ REQ-47-01/06 (build): sin índice embebido y portada < 40 000 bytes (ajuste feature 96)
  AssertionError [ERR_ASSERTION]: index.html pesa 40202 bytes
```

`./init.sh`: formato ✔, build ✔, tests ✘ (solo por el fallo de arriba) → exit 1.

## Bloqueo — presupuesto de peso de la portada (REQ-47-06)

- `dist/client/index.html` medía **39 775 B** antes de la feature (build base, margen 225 B) y **40 194 B** después (en el
  outDir temporal del test, 40 202 B). Los 15 atributos que pide REQ-106-08 suman unos 419 B
  (` data-show-on-mobile="false"` = 28 B x 14 + `"true"` = 27 B).
- La 106 no puede cumplir a la vez REQ-106-08 (atributo `true|false` en los 15 article) y REQ-106-17 (`./init.sh` en
  verde) sin tocar `tests/search-index-lazy-load.test.mjs`. Ese test no fija marcado de las cards, sino un presupuesto de
  peso; subirle el umbral debilitaría su intención (contra REQ-106-16), y la regla de umbral de REQ-96-07 era de la 96.
  No lo toqué.
- Opciones para decidir (líder / spec_author):
  1. Ajustar el umbral de REQ-47-06 con «Ajuste feature 106 (precedente REQ-43-06)» siguiendo la regla de REQ-96-07
     (peso medido + 3000 redondeado al millar con tope 42 000 → 42 000 B). Basta una línea; el resto ya está hecho.
  2. Cambiar la spec para pintar el atributo solo cuando es `true` (`data-show-on-mobile` en HTB, +27 B → ~39 802 B) y
     ocultar con `.hero-grid > .hero-card:not([data-show-on-mobile])` dentro del `@media`. Hay que reescribir REQ-106-08/09
     y su test.
  3. Recortar bytes de la portada en otra feature antes de la 106.
  Pintar solo `"false"` no alcanza (~392 B → ~40 167 B).

## Verificación en navegador (Chrome headless + CDP)

Scripts en el scratchpad `cdp106/` (`m106.mjs` mide y captura, `cmp.mjs` compara con `base.json`). Build de producción +
`pnpm preview --port 4416`; la línea base salió del mismo árbol antes de cualquier cambio. Viewport `<w> x 1000`, DPR 1. El
servidor de 4416 se paró al terminar; el `pnpm dev` de :4321 no se tocó.

| Ancho | Cards visibles | Hijos visibles de .hero-grid | Separación | Títulos en AX tree | Δ máx. rect vs base | hero scrollW/clientW | Errores |
|------:|------:|------|------|------|------:|------|--:|
| 375  | 1 (14 con display none) | perfil (y 97–730.3) + HACK THE BOX (y 744.3–934.3) | 14 px = --gap-card (14px) | solo «HACK THE BOX» | 0 px (HTB) | 365/365 | 0 |
| 800  | 15 | 16 | igual que base | los 15 | 0 px | 790/790 | 0 |
| 1024 | 15 | 16 | igual que base | los 15 | 0 px | 1014/1014 | 0 |
| 1280 | 15 | 16 | igual que base | los 15 | 0 px | 1270/1270 | 0 |
| 1600 | 15 | 16 | igual que base | los 15 | 0 px | 1590/1590 | 0 |

- Sin scroll horizontal del hero en ningún ancho (`scrollWidth == clientWidth`, igual que la base).
- Tabulación: las cards no tienen elementos enfocables ni antes ni después (0 en la base y 0 ahora); con `display: none` las
  ocultas quedan fuera del orden de tabulación por definición.
- Capturas del hero: `progress/research/hero106/hero-{375,800,1024,1280,1600}.png`.
- Errores de consola, excepciones y red: 0 en base y 0 en final.

## Ronda 2 — atributo condicional (ajuste de spec del líder, REQ-106-08/09/18/19)

Feature 106 vuelta a `in_progress`. Lo de la ronda 1 que no cambia (entidad, parse partido, JSON con `showOnMobile`
explícito en las 15 cards) se queda tal cual; solo cambia el marcado, el selector CSS y los tests.

### Cambios

- `src/components/hero-card.astro` y `src/components/hero-cards/htb-card.astro`:
  `data-show-on-mobile={card.showOnMobile ? 'true' : undefined}` (Astro no pinta el atributo cuando vale `undefined`):
  HTB sale con `data-show-on-mobile="true"` y las 14 de icono sin atributo (REQ-106-08/18).
- `src/styles/hero-section.css` (68 líneas): dentro del `@media (max-width: 768px)` existente,
  `.hero-grid > .hero-card:not([data-show-on-mobile]) { display: none; }`; ya no hay regla con `[data-show-on-mobile="false"]` (REQ-106-09).
- `tests/search-index-lazy-load.test.mjs` sin tocar (`git status` limpio para ese archivo); el umbral < 40 000 B sigue igual.

### Tests (test primero)

- `tests/hero-cards-mobile-visibility.test.mjs` (88 líneas): el test de marcado pasa a «REQ-106-08/18/19 (build)»: en
  `dist/client/index.html` solo el article `htb` lleva ` data-show-on-mobile="true"`, ninguno de los 14 de icono contiene
  `data-show-on-mobile`, las dos plantillas usan la expresión condicional y no tienen `style=` ni `<script`, y la portada pesa
  < 40 000 B. El de REQ-106-09 busca el selector `:not([data-show-on-mobile])` con `display: none` dentro del `@media`, y además
  comprueba que ninguna regla usa `[data-show-on-mobile="false"]` y que ninguna regla fuera del `@media` menciona el atributo.
- Tests heredados que ya había ajustado en la ronda 1 y que ahora no exigen el atributo en todas las cards. Cada uno conserva la
  nota «Ajuste feature 106 (precedente REQ-43-06)», amplía el texto de la nota y mantiene su intención:
  - `hero-card-registry.test.mjs` REQ-91-06, `htb-hero-card.test.mjs` REQ-92-04 y `hero-mosaic-layout.test.mjs` REQ-99-18: el
    regex del `<article>` de la plantilla pide `data-show-on-mobile={card.showOnMobile ? 'true' : undefined}`.
  - `hero-cards-polish.test.mjs` REQ-101-11/12/13: `htb-card.astro` igual a la del commit de la 99 salvo esa expresión.
  - `hero-cards-extra-logos.test.mjs` REQ-103-09/10/11: el article de icono construido vuelve a ser exactamente el marcado de
    antes (`data-row-span="N">`, sin el atributo), de modo que el test también comprueba REQ-106-18; la nota sigue en la línea.
  - Los ajustes de forma de `getCards()` (REQ-31-02, REQ-92-01, REQ-97-10, fixtures de kinds-domain, REQ-101-17) no cambian: el
    JSON y el parse no cambian.

#### Rojo (tests escritos, código sin cambiar; los 6 archivos afectados, exit 1)

```
✖ REQ-91-06: hero-card.astro conserva article.hero-card, data-color-token y card: HeroCard
✖ REQ-103-09/10/11 (build): capas extra en orden y cards sin campos con el marcado de antes
✖ REQ-106-08/18/19 (build): data-show-on-mobile="true" solo en HTB, sin atributo en las de icono, sin style ni script y portada < 40 000 B
✖ REQ-106-09: display none para las cards sin el atributo solo dentro de @media (max-width: 768px)
✖ REQ-101-11/12/13: HTB reduce paddings y aviso en <= 1200 px solo en sus dos hojas y con tokens
✖ REQ-99-18: new-hero usa layoutHeroCards y los article emiten data-col-span/data-row-span sin style ni script
✖ REQ-92-04: htb-card.astro pinta article.hero-card.hero-card--rich con p.card-title
ℹ tests 57  ℹ pass 50  ℹ fail 7
```

#### Verde (`pnpm test` completo después de implementar)

```
✔ REQ-106-01 … ✔ REQ-106-08/18/19 (build) … ✔ REQ-106-14/16   (9/9)
✔ REQ-47-01/06 (build): sin índice embebido y portada < 40 000 bytes (ajuste feature 96)
ℹ tests 1107
ℹ pass 1107
ℹ fail 0
```

`./init.sh`: herramientas ✔, harness ✔, formato ✔, tests al 100 % ✔, build ✔ → **exit 0**.

### Peso de la portada (REQ-106-19)

| Build | dist/client/index.html |
|------|------:|
| Antes de la feature (base) | 39 775 B |
| Ronda 1 (`"true|false"` en las 15) | 40 194 B (rompía REQ-47-06) |
| Ronda 2 (solo `"true"` en HTB) | **39 802 B** (+27 B; margen 198 B frente a 40 000) |

### Verificación en navegador (Chrome headless + CDP, ronda 2)

Mismo método que en la ronda 1 (`cdp106/m106.mjs` + `cmp.mjs` contra `base.json`, la línea base de antes de la feature). Build de producción +
`pnpm preview --port 4416`, viewport `<w> x 1000`, DPR 1. El servidor de 4416 se paró al terminar (taskkill del árbol); el
`pnpm dev` de :4321 sigue en marcha sin tocar.

| Ancho | Cards visibles | Hijos visibles de .hero-grid | Separación | Títulos en AX tree | Δ máx. rect vs base | hero scrollW/clientW | Errores |
|------:|------:|------|------|------|------:|------|--:|
| 375  | 1 (14 con display none) | perfil (y 97–730.3) + HACK THE BOX (y 744.3–934.3) | 14 px = --gap-card (14px) | solo «HACK THE BOX» | 0 px (HTB) | 365/365 | 0 |
| 800  | 15 | 16 | igual que base | los 15 | 0 px | 790/790 | 0 |
| 1024 | 15 | 16 | igual que base | los 15 | 0 px | 1014/1014 | 0 |
| 1280 | 15 | 16 | igual que base | los 15 | 0 px | 1270/1270 | 0 |
| 1600 | 15 | 16 | igual que base | los 15 | 0 px | 1590/1590 | 0 |

- En el DOM, `dataset.showOnMobile` vale `"true"` en `htb` y no existe (`null`) en las 14 de icono.
- 0 elementos enfocables en las cards (igual que la base); 0 errores de consola, excepciones y red.
- Capturas regeneradas: `progress/research/hero106/hero-{375,800,1024,1280,1600}.png`.
- Ajenos intactos (sha256 antes/después, `sha256sum -c` OK): `hero-card.css`, `tokens.css`, `sprite.svg`,
  `tests/hack-the-box-sprite.test.mjs`, `src/content/posts/systems-design/*.md`, `hero-grid-layout.ts`, `hero-grid-template.ts`.
