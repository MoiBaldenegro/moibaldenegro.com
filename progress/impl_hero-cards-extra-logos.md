# Implementación — feature 103 hero-cards-extra-logos

Fecha: 2026-10-19. Autor: implementer. Spec: `specs/103_hero-cards-extra-logos/requirements.md` (REQ-103-01..30) y `design.md`. Análisis: `progress/research/hero-cards-extra-logos.md`. Valores por defecto (ad)-(ag) de `progress/current.md`, aplicados tal cual.

## Qué se hizo

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `src/domain/entities/hero-card.ts` | `HeroCard` gana `readonly cornerIcon?: string` y `readonly backgroundIcon?: string` (con comentario). `HeroRichCard` y los demás campos sin cambios (REQ-103-01). | 47 |
| `src/domain/repositories/hero-cards-parse.ts` | `readSpriteRef(card, field, index)`: campo ausente → `{}` (no hay clave, ni siquiera `undefined`, REQ-103-02); presente → debe ser texto que cumpla `^/assets/svg/sprite.svg#\S+$`, si no lanza `HeroCardsDataError` «hero-cards.json: la tarjeta N tiene un campo "cornerIcon" que debe ser /assets/svg/sprite.svg#<id>» (REQ-103-03); válido → mismo texto (REQ-103-04). Se esparce en `parseIconCard`. Compactado sin partir el módulo (constructor del error y `expectString`/`expectNumber` en una línea cada uno) | 94 → 99 |
| `src/data/hero-cards.json` | `claude-code`: `cornerIcon #claude`, `backgroundIcon #anthropic-wordmark`; `github`: `backgroundIcon #github-wordmark`. El resto sin cambios (REQ-103-06/07/08). | 17 |
| `src/components/hero-card.astro` | Importa `../styles/hero-card-accents.css`. Render condicional `{card.backgroundIcon && (...)}` de `div.card-backdrop` entre el header y `.card-icon`, y `{card.cornerIcon && (...)}` de `div.card-corner` después de `.card-icon`; cada svg con `aria-hidden="true" focusable="false"` y `<use xlink:href href>`. Sin `style`, sin `<script>`, sin `if (` (REQ-09-04), sin leer el JSON (REQ-103-09/10/12). | 24 → 41 |
| `src/styles/hero-card-accents.css` (nueva) | Todas las reglas nombran `.card-corner` o `.card-backdrop` (REQ-103-14). Valores en la tabla de abajo. | 40 |
| `tests/hero-cards-extra-logos.test.mjs` (nuevo) | 10 tests, solo `node:test` + stdlib (más el helper `tests/helpers/astro-build.mjs` del repo, también stdlib) (REQ-103-28). | 100 |
| `tests/hero-cards-polish.test.mjs` | Ajuste de REQ-101-17 con la nota «Ajuste feature 103 (precedente REQ-43-06)»: diff vacío de `hero-grid-layout.ts` y `hero-grid-template.ts` frente a `0c786e4`, y `deepEqual` del JSON actual sin `cornerIcon`/`backgroundIcon` contra `git show 0c786e4:src/data/hero-cards.json`. Para quedar en 100 líneas, los dos `import` de `node:test`/`node:assert` pasan a una sola línea (como ya estaba la línea 6) (REQ-103-27). | 100 |

Capturas en `progress/research/hero103/`: `claude-code-<w>.png` y `github-<w>.png` (los cinco anchos), `hero-grid-<w>.png` (final) y `hero-grid-<w>-antes.png` (línea base).

### Valores finales de `hero-card-accents.css` (los de design.md, sin cambios)

| Propiedad | >= 1201 px | <= 1200 px |
|-----------|-----------|-----------|
| `.card-corner` | `top 16px; right 16px; z-index 3` | `top 14px; right 14px` |
| `.card-corner svg` | `22px x 22px` | `18px x 18px` |
| `.hero-card:has(> .card-corner) .card-header` | `right: 46px` | `right: 40px` |
| `.card-backdrop` | `left/right 22px; bottom var(--gap-card); height 40px; z-index 0; --card-backdrop-opacity: 0.1; opacity: var(--card-backdrop-opacity)` | `left/right 14px; height 28px` |
| `.card-backdrop svg` | `100% x 100%` | igual |
| comunes `.card-corner, .card-backdrop` | `position absolute; pointer-events none; user-select none; line-height 0` | — |

Sin `transform`, `transition` ni `:hover` en la hoja (REQ-103-22). El z-index del fondo es 0 y va antes de `.card-icon` en el DOM, así que queda debajo del icono principal; la esquina va a 3, por encima del icono y por debajo del header (4) (REQ-103-21). Sin colores: los logos usan el `fill` de su symbol en el sprite.

## Integridad (REQ-103-13/29)

sha256 al empezar la feature y al terminar (iguales):

| Archivo | sha256 |
|---------|--------|
| `src/styles/hero-card.css` | `874030a4636bee106b9a28f17e8d60bfb86873fa14aa689095da3c51af93aa9f` (antes = después) |
| `src/styles/tokens.css` | `1c353b42c1e932f353f53daf79c82ea1ca9d1e14354f1404c915e0576c68cd3f` (antes = después) |
| `public/assets/svg/sprite.svg` | `6b9c3ed3c24e1fe9ed5c9f232e84f94feb874ae4e1b7abe7762202c195590ea7` (antes = después; solo lectura) |
| `tests/hack-the-box-sprite.test.mjs` | `6a02cacf1b5a22f80ee81ce67b8d79d98208cdd55c7fec9b5aae1a56dc6285a5` (antes = después) |
| `src/domain/hero-grid-layout.ts` | `140cbd82…ac8d78` (antes = después) |
| `src/domain/hero-grid-template.ts` | `6c670558…99c2` (antes = después) |

`src/content/posts/systems-design/*.md` no se tocaron (sus cambios sin commitear son del humano y ya estaban). Nota: `hero-card.css` y `tokens.css` ya tenían cambios sin commitear de la 101 antes de empezar; por eso la comparación se hace con el sha256 del inicio de la feature y no con `git diff HEAD`.

## Ciclo rojo/verde

### Rojo (tests escritos antes del código; ya con el ajuste de REQ-101-17)

`node --test tests/hero-cards-extra-logos.test.mjs tests/hero-cards-polish.test.mjs`:

```
✖ REQ-103-01 ... AssertionError: The input did not match the regular expression /readonly cornerIcon\?: string;/
✖ REQ-103-02/04 ... Expected values to be strictly deep-equal
✖ REQ-103-03 ... Missing expected exception: cornerIcon=7
✖ REQ-103-05/06/07/08 ... Expected values to be strictly deep-equal
✔ REQ-103-09/10/11 (build): capas extra en orden y cards sin campos con el marcado de antes
✖ REQ-103-12/13 ... did not match /import "\.\.\/styles\/hero-card-accents\.css";/
✖ REQ-103-14/15 ... src/styles/hero-card-accents.css no existe
✖ REQ-103-16/17/18 ... Expected values to be strictly deep-equal
✖ REQ-103-19/20/21/22 ... Expected values to be strictly deep-equal
✖ REQ-103-26/27/30 ... falta claude-code-375.png
✔ REQ-101-01..21 (9 tests de la 101, REQ-101-17 ya ajustado)
ℹ tests 19
ℹ pass 10
ℹ fail 9
```

REQ-103-09/10/11 sale verde en rojo **a propósito**: es la guarda de no-regresión. Compara cada `article.hero-card` de icono del build con el marcado esperado a partir del JSON (header + `.card-icon`, más las capas solo si están los campos). Sin campos en el JSON, el marcado esperado es el de antes de la feature y ya se cumplía. Con los campos ya puestos, la misma aserción exige el orden `header > card-backdrop > card-icon > card-corner`. Además comprueba que las otras 12 cards siguen idénticas, byte a byte, al HTML de antes (mismas clases, atributos y `use`).

### Verde

Mismo comando:

```
✔ REQ-103-01 … ✔ REQ-103-26/27/30 (10/10)
✔ REQ-101-01/02/03 … ✔ REQ-101-21 (9/9, REQ-101-17 con el JSON sin los campos nuevos = 0c786e4)
ℹ tests 19
ℹ pass 19
ℹ fail 0
```

Suite completa (`pnpm test`): `ℹ tests 1074 · pass 1074 · fail 0`. `./init.sh`: exit 0, «✔ El entorno está perfecto».

## Medida CDP (Chrome headless, `pnpm build` + `pnpm preview --port 4403`, alto 1000 px, DPR 1)

La línea base salió del build anterior a cualquier cambio de código (mismo medidor). Los scripts `measure.mjs` y `sum.mjs` están en el scratchpad de la sesión (`cdp103/`). Coordenadas en px del documento. Las posiciones de la esquina y del fondo se miden desde el borde exterior de la card, y la card tiene 1 px de borde: por eso `top/right 16px` en CSS sale como 17 px medidos, y 14px como 15 px.

### REQ-103-25: geometría de las 15 `article.hero-card`

A 375, 800, 1024, 1280 y 1600 px, la diferencia máxima entre los rectángulos finales y los de la línea base es **0,00 px** en las 15 cards, con el mismo orden. Solo cambian los hijos de CLAUDE CODE (2 → 4) y GITHUB (2 → 3).

### REQ-103-23/24: solapes y contraste

| Ancho | CLAUDE CODE título (l,t,r,b) | líneas | svg esquina (w×h, top/right) | svg fondo (w×h, left/bottom) | solape título/esquina | solape título/fondo | GITHUB título | GITHUB fondo | solape título/fondo |
|------|------|------|------|------|------|------|------|------|------|
| 375 | 24,1/2599,3/314,9/2616,3 | 1 | 18×18, 15/15 | 316,8×28, 15/15 | 0 | 0 | 24,1/3619,3/340,9/3636,3 | 316,8×28 | 0 |
| 800 | 417,0/934/474,4/968 | 2 | 18×18, 15/15 | 83,4×28, 15/15 | 0 | 0 | 289,6/1088/373,0/1105 | 83,4×28 | 0 |
| 1024 | 529,0/1011,3/621,9/1045,3 | 2 | 18×18, 15/15 | 118,9×28, 15/15 | 0 | 0 | 366,1/1165,3/485,0/1182,3 | 118,9×28 | 0 |
| 1280 | 1071,8/770/1191,3/789 | 1 | 22×22, 17/17 | 143,4×40, 23/15 | 0 | 0 | 1071,8/988/1132,8/1007 | 143,4×40 | 0 |
| 1600 | 1329,7/770/1498,0/789 | 1 | 22×22, 17/17 | 192,3×40, 23/15 | 0 | 0 | 1329,7/988/1390,7/1007 | 192,3×40 | 0 |

Además del rectángulo de `.card-title`, se midieron los rectángulos de cada línea de texto (Range sobre el título). Solape texto/esquina y texto/fondo = 0 en los cinco anchos. Distancia entre el final del texto y el inicio de la esquina: 202,7 px (375), 13,2 (800), 48,7 (1024), 9,5 (1280) y 58,4 (1600). «CLAUDE CODE» parte en dos líneas a 800 (ya lo hacía antes: 34 px de alto en la base) y a 1024, donde antes cabía en una (17 → 34 px de alto). Es lo previsto en la Decisión 3: el título parte en dos líneas y no se superpone a la esquina.

Contraste del título aunque se solapara (peor caso, blanco al 10 % sobre el fondo de marca): CLAUDE CODE 8,73:1 sobre `rgb(92,42,28)`, GITHUB 14,46:1 sobre `rgb(9,18,35)`. Ambos ≥ 4,5:1, aunque no hace falta porque el solape es 0. La opacidad calculada de `.card-backdrop` es 0.1 en todos los anchos.

### Hover (REQ-103-22)

Con el puntero sobre CLAUDE CODE, GITHUB y BUN (control sin extras), los valores calculados son idénticos a la base en los cinco anchos: card `matrix(1,0,0,1,0,-4)`, `contrast(1.4)`, sombra hover, y el svg principal a `rotate(2deg)` y escala x1.12 (`matrix(5.59659, 0.195437, …)` en >= 1201 y `matrix(2.23864, 0.0781749, …)` en <= 1200). `.card-corner`, `.card-backdrop` y sus svg quedan con `transform: none` y `transition: all 0s` (sin transición propia).

### REQ-103-26: scroll y errores

| Ancho | sección hero scrollWidth/clientWidth | `.hero-grid` | documento |
|------|------|------|------|
| 375 | 365/365 | 347/347 | 365/375 |
| 800 | 790/790 | 751/751 | 790/800 |
| 1024 | 1014/1014 | 963/963 | 1014/1024 |
| 1280 | 1270/1270 | 1207/1207 | 1270/1280 |
| 1600 | 1590/1590 | 1500/1500 | 1590/1600 |

Sin scroll horizontal. 0 errores de consola, de excepción y de red (respuestas >= 400 o `loadingFailed`) en todo el recorrido. 0 atributos `style` en `.hero-grid` (el único `<script>` es el de la isla HTB, igual que en la base).

### Observación visual (capturas)

En CLAUDE CODE el asterisco de Claude queda arriba a la derecha, alineado con el título. El wordmark «ANTHROPIC» se ve tenue en la franja inferior y el icono principal (pixel art, escala 5 en escritorio) lo tapa en parte, porque va debajo del icono por diseño (design.md). En GITHUB pasa lo mismo con el wordmark «GitHub» bajo el octocat. Si el humano quiere que el fondo se lea más, se puede subir `--card-backdrop-opacity` o la franja (valores (ae), revisables).

## Servidores

Arranqué y paré dos `pnpm preview --port 4403` (línea base y final); el preview bloquea `dist/` y no se deja levantado. No toqué el `pnpm dev` de :4321 (PID 34400, sigue escuchando).

## Fuera de alcance / notas para el reviewer

- No se tocaron `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`, `hero-card.css`, `tokens.css` ni el dominio del mosaico.
- REQ-103-03 rechaza también un texto sin el prefijo, como `"claude"`, y el prefijo sin id (`/assets/svg/sprite.svg#`). La regex exige un id sin espacios (`\S+`).
- Ningún otro test de la suite necesitó ajuste: REQ-55-03, REQ-09-04, REQ-91-06, REQ-99-18 y REQ-101-19 siguen en verde con el marcado nuevo.

## Ronda de revisión 1 (CHANGES_REQUESTED → REQ-103-31..33; REQ-103-24/26 endurecidos)

Cambio único de código: en `src/styles/hero-card-accents.css`, `.card-backdrop` pasa de `z-index: 0` a `z-index: 2`. El fondo se pinta como marca de agua sobre `.card-icon`, que no declara z-index, y queda bajo `.card-corner` (3) y el header (4). Se actualizó el comentario de la regla. La franja, el tamaño, la opacidad (0.1) y el marcado no cambian (41 líneas).

Test: nuevo `REQ-103-31` en `tests/hero-cards-extra-logos.test.mjs`. Comprueba z-index 2 en `.card-backdrop` y 3 en `.card-corner`, que ninguna regla `.card-icon*` de `hero-card.css` declara z-index (incluidas las `@media`) y que el `@media (max-width: 1200px)` no redefine el z-index del fondo. Para seguir en 100 líneas se unieron cinco pares de líneas cortas sin cambiar ninguna aserción.

### Rojo (antes de tocar el CSS)

```
node --test --test-name-pattern="REQ-103-31" tests/hero-cards-extra-logos.test.mjs
✖ REQ-103-31: .card-backdrop en z-index 2, sobre .card-icon (sin z-index en hero-card.css) y bajo .card-corner (3)
  + actual - expected
  +   '0',
  -   '2',
    actual: [ '0', '3', false, undefined ],
    expected: [ '2', '3', false, undefined ],
ℹ tests 1  ℹ pass 0  ℹ fail 1
```

### Verde

- `node --test tests/hero-cards-extra-logos.test.mjs`: tests 11, pass 11, fail 0.
- `pnpm test`: tests 1075, pass 1075, fail 0.
- `./init.sh`: EXIT 0 (formato, tests al 100 % y build). Se ejecutó dos veces, la segunda tras regenerar las capturas.

### Medida CDP (Chrome headless; `pnpm build` + `pnpm preview --port 4408`, ya parado; alto 1000 px, DPR 1)

Medidor: el del reviewer (`rv103/m.mjs`) ampliado en `scratchpad/cdp103/m-r1.mjs` con la rejilla de REQ-103-32 y el contraste de REQ-103-33. Salida en `cdp103/r1.json`. La línea base de geometría y hover es `rv103/feat.json`, la medida del reviewer antes del ajuste. Solo para medir, se inyecta en la página `pointer-events: auto` en los svg de `.card-backdrop`, `.card-icon` y `.card-corner`, y se retira después.

| Ancho | REQ-103-32 fondo encima (CLAUDE CODE / GITHUB, de 100 puntos) | solape título/fondo (líneas / caja) | solape título/esquina | REQ-103-33 contraste título (CC / GH) | geometría (16 hijos, ±1 px) | hover card + icono | hero / grid scroll |
|------|------|------|------|------|------|------|------|
| 375 | 100 / 100 | 0 / 0 | 0 / 0 | 8,73 / 14,46 | 0 diferencias | igual | 365/365, 347/347 |
| 800 | 100 / 100 | 0 / 0 | 0 / 0 | 8,73 / 14,46 | 0 diferencias | igual | 790/790, 751/751 |
| 1024 | 100 / 100 | 0 / 0 | 0 / 0 | 8,73 / 14,46 | 0 diferencias | igual | 1014/1014, 963/963 |
| 1280 | 100 / 100 | 0 / 0 | 0 / 0 | 8,73 / 14,46 | 0 diferencias | igual | 1270/1270, 1207/1207 |
| 1600 | 100 / 100 | 0 / 0 | 0 / 0 | 8,73 / 14,46 | 0 diferencias | igual | 1590/1590, 1500/1500 |

- REQ-103-32: en los 100 puntos de la rejilla 20x5 (sobre el `use` del fondo, recortado a la card), la primera capa de `elementsFromPoint` es el svg de `.card-backdrop`. Icono, título, esquina y vacío: 0. Umbral: ≥ 60 %.
- REQ-103-33: los paths de `anthropic-wordmark` y `github-wordmark` del sprite son blancos (`fill="#fff"`). Color compuesto (fondo de marca × 0,9 + blanco × 0,1): `rgb(108.3,63.3,50.7)` (CLAUDE CODE) y `rgb(33.6,41.7,57.0)` (GITHUB). El título blanco da 8,73:1 y 14,46:1, ≥ 4,5:1. La CDP también midió con el `fill` calculado del `use`, que es el negro por defecto porque el color está en los paths: 12,69:1 y 18,99:1. Opacidad calculada 0.1 y z-index calculado 2 en los cinco anchos.
- Marcado: `kids` de las 15 cards idéntico a la base. Las cards sin extras siguen con `card-header+card-icon`. 0 atributos `style` en `.hero-grid`.
- Hover (REQ-103-22): `transform`, `filter`, `boxShadow` y `transition` de la card y del svg principal de CLAUDE CODE, GITHUB y BUN iguales a la base en los cinco anchos.
- Errores de consola, excepción o log: 0.
- Capturas regeneradas: `progress/research/hero103/claude-code-<w>.png` y `github-<w>.png` (w = 375/800/1024/1280/1600). Se lee «ANTHROPIC» entero sobre el pixel art a 1280 y «GitHub» entero bajo y sobre el octocat a 1024, como marca de agua tenue.
- Integridad: los sha256 de `sprite.svg`, `hero-card.css`, `tokens.css` y `tests/hack-the-box-sprite.test.mjs` no han cambiado (los de la tabla de Integridad). No se tocaron `src/content/posts/systems-design/*.md`.
- Servidores: arranqué y paré `pnpm preview --port 4408`. El primer intento falló porque `dist/` apuntaba a una build temporal de los tests (`wrangler.json` no encontrado); se resolvió con `pnpm build` antes del preview, igual que en la ronda inicial. El `pnpm dev` de :4321 (PID 34400) sigue intacto.
