# Informe de implementación — feature 2 `hero-row-new-tools`

- **Feature**: id 2 — `hero-row-new-tools` (Fila nueva del hero con bash, webassembly, astro, opencode y tauri).
- **Spec**: `specs/02_hero-row-new-tools/requirements.md` (REQ-02-01..13) y
  `specs/02_hero-row-new-tools/design.md` (Decisiones 1-8, tabla de tokens y de trazabilidad).
- **Petición humana** (2026-10-21, verbatim): «En las cards del hero pon una nueva fila con los los
  sprites de bash, web assembly, astro, opencode, y tauri, la card grande sera la de astro.»
- **Sesión**: 2026-10-21 — implementer (ciclo TDD: test en rojo → código → suite en verde → regresión visual).
- **Estado**: implementada y verificada; **no** se marca `done` (queda pendiente el APPROVED del reviewer).

---

## 1. Qué se ha hecho

El mosaico del hero pasa de 15 a **20 tarjetas** en tres franjas inferiores, con la nueva en el medio:

| Franja | Antes (15 tarjetas) | Ahora (20 tarjetas) |
|--------|--------------------|---------------------|
| Zona superior | htb (5×4) · rust · aws · cloudflare · node (5×2) | **igual** |
| `row: 1` | nestjs (4×2) · css · react · html · claude-code | **igual** |
| `row: 2` | — | **bash · webassembly · astro (4×2) · opencode · tauri** (nueva) |
| `row: 3` | bun · claude · typescript (4×2) · youtube · github | typescript (4×2) · bun · claude · youtube · github (renumerada) |

Además: los 5 tokens de color de marca (`--color-marca-bash|webassembly|astro|opencode|tauri`), la
hoja hermana `src/styles/hero-card-brands.css` con la geometría del icono de las 5 tarjetas y su
ajuste a ≤1200 px, y el import de esa hoja en `src/components/hero-card.astro`.

**El dominio no se ha tocado**: la feature 1 ya resueltó el motor (`row` → franja de 5 tarjetas con
la `featured` en el hueco grande). La fila nueva se declara **solo en los datos**.

## 2. Archivos tocados

### Nuevos

| Archivo | Rol |
|---------|-----|
| `src/styles/hero-card-brands.css` (24 líneas) | Hoja hermana de `hero-card.css` (Decisión 4): las 5 reglas `[data-color-token]` (fondo de marca + geometría del icono) y el bloque `@media (max-width: 1200px)` con la escala reducida (Decisión 6). |
| `tests/hero-row-new-tools.test.mjs` (70 líneas) | Suite de la feature: datos (REQ-02-01..04), renumeración de filas, colocación de la fila 2 (REQ-02-05..07), sprite intacto (REQ-02-12) e higiene. |
| `tests/hero-row-new-tools-styles.test.mjs` (56 líneas) | Tokens (REQ-02-08), reglas de marca (REQ-02-09), astro mayor (REQ-02-10) y breakpoint de 1200 px (REQ-02-11). **Se separó del anterior porque el límite de 100 líneas por archivo no cabía en un solo test.** |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `src/data/hero-cards.json` (17 → 22 líneas) | 5 tarjetas nuevas (`bash`, `webassembly`, `astro`, `opencode`, `tauri`) con `row: 2` y `featured` solo en `astro`; las 5 de las redes sociales pasan de `row: 2` a `row: 3` (Decisión 2). |
| `src/styles/tokens.css` (99 → 97 líneas) | Los 5 tokens `--color-marca-*` nuevos; el bloque de marcas se compacta a dos marcas por línea (Decisión 5). Sin colores fuera de aquí. |
| `src/components/hero-card.astro` (40 → 41 líneas) | `import "../styles/hero-card-brands.css";` junto a las otras tres hojas de la tarjeta. |
| `tests/hero-grid-explicit-rows.test.mjs` (94 → 100 líneas) | **Ajuste legítimo** del `MAP` de regresión (ver §6) y de los recuentos (15 → 20 tarjetas). |

**Sin tocar**: `src/domain/**` (la feature 1 ya resolvió el dominio), `public/assets/svg/sprite.svg`
(REQ-02-12), `src/middleware.ts` (cambio ajeno del editor), `specs/**`, `package.json`, `feature_list.json`
(solo el `status` de la feature 2) y el estado de la feature 1.

### Reparto de líneas (límite de 100)

```
100  tests/hero-grid-explicit-rows.test.mjs   97  src/styles/tokens.css
 70  tests/hero-row-new-tools.test.mjs         56  tests/hero-row-new-tools-styles.test.mjs
 41  src/components/hero-card.astro            24  src/styles/hero-card-brands.css
 22  src/data/hero-cards.json                  99  src/styles/hero-card.css (sin cambios)
```

Ningún archivo del proyecto pasa de 100 líneas (`wc -l` sobre `src/**` y `tests/**`).

## 3. Ciclo rojo → verde (evidencia)

### 3.1 ROJO — test escrito antes del código

Se escribieron `tests/hero-row-new-tools.test.mjs` y `tests/hero-row-new-tools-styles.test.mjs`
contra la spec, y se ajustó el `MAP` de `tests/hero-grid-explicit-rows.test.mjs` **antes** de tocar
el código. Primera ejecución (`node --test "tests/**/*.test.mjs"`):

```
✔ REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1 (1.404ms)
✔ REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande (1.1095ms)
✔ REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError (0.2573ms)
✔ REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande (0.5046ms)
✔ REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError (0.2453ms)
✔ REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError (0.2095ms)
✖ REQ-01-14: la migración con "row" conserva la colocación de las 15 tarjetas actuales (1.9412ms)
✖ REQ-01-14: hero-cards.json declara "row" en las 15 tarjetas de las franjas inferiores (0.6201ms)
✔ higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha (1.1641ms)
✖ REQ-02-08: tokens.css define los cinco --color-marca-* nuevos (1.5769ms)
✖ REQ-02-09: cada marca nueva tiene su regla [data-color-token] con el fondo de su token (0.2526ms)
✖ REQ-02-10: la regla de astro declara un icono mayor que el de las cuatro pequeñas de su fila (0.1916ms)
✖ REQ-02-11: a 1200 px las cinco tarjetas nuevas bajan la escala del icono (0.7421ms)
✖ REQ-02-01/02/03/04: las cinco tarjetas de la fila nueva declaran sprite, colorToken, row 2, featured solo en astro y showOnMobile false (1.8124ms)
✖ REQ-02-01: el repositorio expone la fila nueva y las redes sociales pasan a row 3 (0.5809ms)
✖ REQ-02-05/06/07: la fila 2 del mosaico contiene las cinco marcas con astro en el hueco grande (1.0987ms)
✔ REQ-02-12: el sprite no ha cambiado y contiene los cinco symbols nuevos (17.9851ms)
✖ higiene: hero-card.astro importa la hoja nueva y ningún archivo tocado pasa de 100 líneas (0.7339ms)
ℹ tests 18
ℹ pass 8
ℹ fail 10
```

Fallos representativos del rojo (mensajes reales):

```
test at tests\hero-grid-explicit-rows.test.mjs:76:1
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
      [
  +     'bun',
  -     'bash',
        1,
        9,
        2,
        2
      ],

test at tests\hero-row-new-tools-styles.test.mjs:14:1
  AssertionError [ERR_ASSERTION]: falta el token de bash

test at tests\hero-row-new-tools-styles.test.mjs:20:1
  Error: ENOENT: no such file or directory, open '...\src\styles\hero-card-brands.css'

test at tests\hero-row-new-tools.test.mjs:18:1
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  + []
  - [
  -   'bash',
  -   'webassembly',
  -   'astro',
  -   'opencode',
  -   'tauri'
  - ]

test at tests\hero-row-new-tools.test.mjs:65:1
  AssertionError [ERR_ASSERTION]: The input did not match the regular expression
  /import "\.\.\/styles\/hero-card-brands\.css"/. Input: ...
```

El único test verde del conjunto nuevo es REQ-02-12 (el sprite ya tenía los 5 symbols y no se toca):
correcto, es la comprobación de "no cambiar".

### 3.2 VERDE — suite completa tras implementar

```
$ node --test "tests/**/*.test.mjs"
✔ REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1 (1.6991ms)
✔ REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande (1.2974ms)
✔ REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError (0.2706ms)
✔ REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande (0.4959ms)
✔ REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError (0.2453ms)
✔ REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError (0.2062ms)
✔ REQ-01-14: la colocación del mosaico es la esperada tras el ajuste de la feature 2 (20 tarjetas) (0.613ms)
✔ REQ-01-14: hero-cards.json declara "row" en las 15 tarjetas de las franjas inferiores (0.6122ms)
✔ higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha (1.1544ms)
✔ REQ-02-08: tokens.css define los cinco --color-marca-* nuevos (1.1246ms)
✔ REQ-02-09: cada marca nueva tiene su regla [data-color-token] con el fondo de su token (0.4812ms)
✔ REQ-02-10: la regla de astro declara un icono mayor que el de las cuatro pequeñas de su fila (0.9097ms)
✔ REQ-02-11: a 1200 px las cinco tarjetas nuevas bajan la escala del icono (0.3164ms)
✔ REQ-02-01/02/03/04: las cinco tarjetas de la fila nueva declaran sprite, colorToken, row 2, featured solo en astro y showOnMobile false (1.1777ms)
✔ REQ-02-01: el repositorio expone la fila nueva y las redes sociales pasan a row 3 (0.8251ms)
✔ REQ-02-05/06/07: la fila 2 del mosaico contiene las cinco marcas con astro en el hueco grande (0.8992ms)
✔ REQ-02-12: el sprite no ha cambiado y contiene los cinco symbols nuevos (19.1384ms)
✔ higiene: hero-card.astro importa la hoja nueva y ningún archivo tocado pasa de 100 líneas (1.0315ms)
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

### 3.3 Resto de comprobaciones en verde

```
$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos

$ node scripts/audit-design-tokens.mjs
AUDIT ✔ ningún color fuera de tokens.css en src/styles

$ ./init.sh
--- Herramientas y dependencias ---
✔ node instalado   ✔ pnpm instalado   ✔ dependencias instaladas (node_modules)
--- Archivos del harness ---
✔ AGENTS.md existe   ✔ feature_list.json existe   ✔ progress/current.md existe
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 4. Tabla de colocación (resultado real)

Colocación calculada por el motor (dominio) y **medida en el navegador** (CDP) a 1280 px: coinciden.

```
[ id, columna, fila, colSpan, rowSpan ]   (x, y, w, h medidos en el navegador a 1280 px)
[htb        6, 1, 5x4]   (540,   97, 495, 422)
[rust      11, 1, 2x2]   (1049,  97, 189, 204)
[aws       11, 3, 2x2]   (1049, 315, 189, 204)
[cloudflare 6, 5, 2x2]   (540,  533, 189, 204)
[node       8, 5, 5x2]   (744,  533, 495, 204)
[nestjs     1, 7, 4x2]   (32,   751, 393, 204)
[css        5, 7, 2x2]   (439,  751, 189, 204)
[react      7, 7, 2x2]   (642,  751, 189, 204)
[html       9, 7, 2x2]   (845,  751, 189, 204)
[claude-code 11, 7, 2x2] (1049, 751, 189, 204)
[bash       1, 9, 2x2]   (32,   969, 189, 204)   ← fila nueva
[webassembly 3, 9, 2x2]  (235,  969, 189, 204)   ← fila nueva
[astro      5, 9, 4x2]   (439,  969, 393, 204)   ← fila nueva, hueco grande (4 columnas)
[opencode   9, 9, 2x2]   (845,  969, 189, 204)   ← fila nueva
[tauri     11, 9, 2x2]   (1049, 969, 189, 204)   ← fila nueva
[typescript 1, 11, 4x2]  (32,  1187, 393, 204)
[bun        5, 11, 2x2]  (439, 1187, 189, 204)
[claude     7, 11, 2x2]  (642, 1187, 189, 204)
[youtube    9, 11, 2x2]  (845, 1187, 189, 204)
[github    11, 11, 2x2]  (1049,1187, 189, 204)
```

- La **fila 2** ocupa las 12 columnas: `bash` (2) + `webassembly` (2) + `astro` (4) + `opencode` (2) +
  `tauri` (2) = 12, sin huecos (separación de 14 px = `--gap-card`) y **sin solapamientos**
  (comprobado por intersección de rectángulos en el navegador: `solapes: []`).
- `astro` cae en el **tercer hueco** de la franja (el grande del patrón de fila par), como pide la
  Decisión 1 del design y la petición humana.
- Las redes sociales (`youtube`, `github`) **siguen en la esquina inferior derecha** (columnas 9 y 11 de
  la última franja): el invariante de la feature 1 se mantiene.
- La zona superior y la franja `row: 1` **no cambian** respecto a la línea base de la feature 1.

## 5. Regresión visual (REQ-02-13)

Dev server: `pnpm astro dev --background` (ya arrancado en `http://localhost:4321`, pid 34400; la
página del hero es `/home`, la raíz redirige a `/about`). Capturas headless de Chrome
(`C:/Program Files/Google/Chrome/Application/chrome.exe`) por CDP (WebSocket global de Node), con
lectura de la consola del navegador (`Runtime.consoleAPICalled`, `Runtime.exceptionThrown`,
`Log.entryAdded`).

**Capturas** en `progress/research/hero-row-new-tools/`: `hero-375px.png`, `hero-768px.png`,
`hero-1024px.png` (extra, para el breakpoint de REQ-02-11) y `hero-1280px.png`, más `informe.json`
con las medidas y los errores de consola por ancho.

| Ancho | Fila nueva | Resultado |
|-------|------------|-----------|
| **1280 px** | visible, 5 tarjetas | Franja completa de 12 columnas: `bash`, `webassembly`, `astro` (4 columnas, 3.ª posición), `opencode`, `tauri`. Sin huecos, sin solapamientos. El glifo de **astro** (la "A" blanca con el degradado magenta) se lee con claridad en su hueco grande; las cuatro pequeñas se distinguen entre sí (el óvalo blanco de bash, el "WA" violeta de webassembly, el cuadrado blanco de opencode y el logo ámbar/cian de tauri). **0 errores de consola.** |
| **1024 px** (≤1200 px) | visible, 5 tarjetas | A ≤1200 px el mosaico **se aplana** en una retícula uniforme de 6 columnas (comportamiento preexistente de `hero-card.css`: `grid-column/grid-row: auto !important`), así que la fila nueva deja de ser una franja y sus tarjetas fluyen como las de las demás franjas. Los 5 iconos se ven con la escala reducida (3) y se leen bien: bash, webassembly, astro, opencode, tauri. **0 errores de consola.** |
| **768 px** | **oculta por diseño** | A ≤768 px el mosaico solo muestra la tarjeta rica (HACK THE BOX) y el perfil: las tarjetas de icono con `showOnMobile: false` quedan en `display: none` (`hero-section.css`, REQ-106-09). Es lo pedido en la Decisión 8 / REQ-02-04. **0 errores de consola.** |
| **375 px** | **oculta por diseño** | Igual que a 768 px (móvil). Página limpia, sin huecos ni solapamientos. **0 errores de consola.** |

Nota sobre la captura: la primera pasada usó `captureBeyondViewport: true`, que redimensiona el
viewport, dispara el `refresh` de ScrollTrigger y rehace la entrada "lego" (GSAP) de las cards: las
capturas salían con las cards a `opacity: 0`. Las capturas definitivas se hicieron **sin**
redimensionar (viewport de 1600 px de alto para que el hero completo entre en pantalla), con las 20
cards a `opacity: 1` verificado por CDP antes de capturar.

## 6. Ajuste del test de la feature 1 (regresión REQ-01-14)

`tests/hero-grid-explicit-rows.test.mjs` fija la colocación del mosaico en el `MAP`. Al insertar la
fila nueva y renumerar las franjas ese `MAP` **cambia de forma legítima** (no es una regresión): se
ha actualizado al valor nuevo y se ha añadido la nota **«Ajuste feature 2»** junto al `MAP` (la
referencia de esa nota se corrigió tras el review: ver el addendum del cierre).

```js
// Ajuste feature 2 (spec: specs/02_hero-row-new-tools/requirements.md): la fila nueva de herramientas (bash,
// webassembly, astro, opencode, tauri) entra como fila 2 y las redes sociales pasan a la fila 3, así que las
// franjas inferiores cambian de forma legítima (no es una regresión): fila 2 = [bash, webassembly, astro GRANDE,
// opencode, tauri] y fila 3 = [typescript GRANDE, bun, claude, youtube, github] (el patrón alterno mueve typescript al 1.º hueco).
```

Cambios en ese test (ninguna comprobación se ha rebajado ni eliminado):

| Cambio | Motivo |
|--------|--------|
| `MAP`: 15 → 20 entradas y valores nuevos | La colocación cambia de forma legítima con la fila nueva (es la regresión que el test debe seguir vigilando) |
| `placed.length` / `size` de ids: 15 → 20 | El mosaico coloca 20 tarjetas |
| Lista de `row` del JSON: 10 → 15 tarjetas, con las filas 1 / 2 / 3 | Es el dato que la feature 2 cambia (Decisión 2) |
| Título del test de REQ-01-14 | «conserva la colocación de las 15 tarjetas» → «la colocación del mosaico es la esperada tras el ajuste de la feature 2 (20 tarjetas)» |

El resto de comprobaciones del test (parseo de `row`, zona superior, validaciones de franja,
redes sociales, higiene de 100 líneas) quedan **intactas**.

## 7. Trazabilidad REQ → implementación → test

| REQ | Implementación | Test |
|-----|----------------|------|
| REQ-02-01 | 5 tarjetas con sprite y `colorToken` de su marca (`src/data/hero-cards.json`) | REQ-02-01/02/03/04 + REQ-02-01 (repositorio) |
| REQ-02-02 | `"row": 2` en las cinco | REQ-02-01/02/03/04 |
| REQ-02-03 | `"featured": true` solo en `astro` | REQ-02-01/02/03/04 |
| REQ-02-04 | `"showOnMobile": false` en las cinco | REQ-02-01/02/03/04 + REQ-02-01 (repositorio) |
| REQ-02-05 | `astro` en el hueco grande (4×2) de la fila 2 (`hero-grid-template.ts`, sin cambios) | REQ-02-05/06/07 |
| REQ-02-06 | `bash`, `webassembly`, `opencode`, `tauri` en los huecos pequeños, en ese orden | REQ-02-05/06/07 |
| REQ-02-07 | La fila 2 suma 2+2+4+2+2 = 12 columnas, sin huecos | REQ-02-05/06/07 (columnas 1..12) |
| REQ-02-08 | 5 tokens `--color-marca-*` en `src/styles/tokens.css` | REQ-02-08 (+ `audit-design-tokens.mjs`) |
| REQ-02-09 | 5 reglas `[data-color-token]` en `src/styles/hero-card-brands.css` | REQ-02-09 |
| REQ-02-10 | `astro` con `--icon-width: 200px` y `--icon-scale: 6` frente a 110/115 px y escala 5 | REQ-02-10 |
| REQ-02-11 | Bloque `@media (max-width: 1200px)` con escala 3 en las cinco | REQ-02-11 (+ captura a 1024 px) |
| REQ-02-12 | Sprite sin tocar; los 5 symbols ya existían | REQ-02-12 (`git diff` + symbols) |
| REQ-02-13 | Capturas a 375 / 768 / 1024 / 1280 px + consola | §5 (regresión visual manual) |

## 8. Decisiones tomadas y desviaciones respecto de la spec

1. **`--icon-scale: 5` explícito en las cuatro tarjetas pequeñas.** La Decisión 6 solo fija el ancho y
   la rotación de las pequeñas (su escala es la de la base `.hero-card`, 5). Se declara explícita
   para que la comparación del REQ-02-10 ("mayores que los de las cuatro pequeñas") sea verificable
   en el propio fichero. **El valor es el mismo que ya aplicaba la base**: el render no cambia.
2. **La suite de la feature va en dos ficheros** (`tests/hero-row-new-tools.test.mjs` y
   `tests/hero-row-new-tools-styles.test.mjs`): con un solo fichero la suite pasaba de 100 líneas
   (límite de `docs/architecture.md` §12). El primero cubre datos, colocación, sprite e higiene; el
   segundo, tokens y estilos.
3. **Títulos de las tarjetas**: `WEB ASSEMBLY` para `webassembly` (dos palabras, como `NODE JS` y
   `CLAUDE CODE`); `BASH`, `ASTRO`, `OPENCODE`, `TAURI` en mayúsculas, como el resto.
4. **`tokens.css` compactado a dos marcas por línea** (Decisión 5): 99 → 97 líneas. Se conserva el
   aviso de la feature 101 sobre el contraste de `nestjs` (como comentario propio) y el resto de
   comentarios del bloque se mantienen. No se crea un segundo archivo de tokens.
5. **A ≤1200 px la fila nueva deja de ser una franja**: el mosaico se aplana en 6 columnas
   iguales (comportamiento preexistente de `hero-card.css`, `grid-column/grid-row: auto !important`).
   La fila nueva se comporta exactamente igual que las otras dos franjas; la franja de 5 tarjetas
   con `astro` grande solo existe por encima de 1200 px. Es el comportamiento responsive que ya
   tenía el sitio, no un efecto de esta feature.
6. **A ≤768 px la fila nueva no se ve** (`showOnMobile: false`, Decisión 8 / REQ-02-04): el mosaico
   móvil solo muestra la tarjeta rica y el perfil. Por eso la evidencia visual de la franja completa
   es a 1280 px (y a 1024 px, ya aplanada), y a 375/768 px la evidencia es que la página se ve
   limpia y sin errores de consola.
7. **La nota «Ajuste feature 2»** del `MAP` de `tests/hero-grid-explicit-rows.test.mjs` se puso
   inicialmente con la referencia «precedente REQ-43-06» (la pidió el líder), aunque `REQ-43-06` no
   existe en el ciclo actual de specs (el backlog se regeneró con las features 1 y 2). El reviewer lo
   señaló como recomendación no bloqueante **H4** y en el cierre se sustituye por la referencia real
   (`specs/02_hero-row-new-tools/requirements.md`): ver el addendum del cierre.
8. **No se ha tocado el dominio**: la feature 1 ya resueltó `row` → franja. La feature 2 solo declara
   datos, tokens y estilos.

## 9. Notas para el reviewer

- `feature_list.json` queda con la feature 2 en `in_progress`; el `done` lo pone el líder tras el
  APPROVED (y la feature 1 sigue en `done`, sin tocar).
- El cambio ajeno de `src/middleware.ts` (línea en blanco final) **no se ha tocado**: lo gestiona el
  líder.
- Las capturas de la regresión visual están en `progress/research/hero-row-new-tools/` (artefacto
  permanente). El perfil temporal de Chrome que se usó para las capturas se ha borrado del repo.
- La comprobación del sprite del test usa `git diff --quiet HEAD -- public/assets/svg/sprite.svg`; si
  `git` no estuviera disponible, el test se marca como *skipped* en lugar de fallar.

---

## Addendum post-review (cierre de la feature 2)

El reviewer emitió **APPROVED sin cambios requeridos** (`progress/review_hero-row-new-tools.md`,
§3 «Veredicto: APPROVED» y §10 «Cambios requeridos: Ninguno»). Con el APPROVED verificado en disco,
la feature 2 se cierra. No hay trabajo nuevo de implementación: solo dos cambios, uno administrativo y
otro de **solo comentario**.

### A. Paso a `done` en `feature_list.json`

- La feature 2 (`hero-row-new-tools`) pasa de `in_progress` a **`done`**.
- La feature **se conserva en el array** `features` (política de estado del backlog:
  `docs/verification.md` §«Política de estado del backlog»; ninguna feature se elimina del array).
- **No se toca nada más del backlog**: la feature 1 (`hero-grid-explicit-rows`) sigue en `done` con su
  `depends_on` intacto, y no se modifican `project`, `description`, `rules` ni los `acceptance` de
  ninguna feature.

```
$ python -c "…feature_list.json…"
1 hero-grid-explicit-rows -> done
2 hero-row-new-tools -> done | depends_on [1]
```

### B. Recomendación no bloqueante H4 (referencia de la nota del ajuste)

- **Qué decía H4**: la nota del `MAP` de `tests/hero-grid-explicit-rows.test.mjs` decía
  «Ajuste feature 2 (precedente REQ-43-06)», pero `REQ-43-06` no existe en este ciclo (el backlog se
  regeneró con las features 1 y 2; `REQ-43-06` era del ciclo 30) y dejaba una referencia colgante.
  Recomendación del reviewer: referenciar `specs/02_hero-row-new-tools/requirements.md`.
- **Qué se ha hecho**: se sustituye **solo la referencia** por la real, manteniendo intacta la
  explicación del ajuste (que el cambio de colocación es consecuencia **legítima** de la fila nueva y
  **no una regresión**, con el detalle de las dos franjas afectadas y del desplazamiento de
  `typescript` al 1.º hueco por el patrón alterno):

  ```js
  // Ajuste feature 2 (spec: specs/02_hero-row-new-tools/requirements.md): la fila nueva de herramientas (bash,
  // webassembly, astro, opencode, tauri) entra como fila 2 y las redes sociales pasan a la fila 3, así que las
  // franjas inferiores cambian de forma legítima (no es una regresión): fila 2 = [bash, webassembly, astro GRANDE,
  // opencode, tauri] y fila 3 = [typescript GRANDE, bun, claude, youtube, github] (el patrón alterno mueve typescript al 1.º hueco).
  ```

  - **Es un cambio exclusivamente de comentario**: **no se toca ninguna aserción ni el `MAP`** (las 20
    entradas y sus valores son byte a byte los mismos), ni ningún otro test. El comportamiento del test
    no cambia: sigue fijando la misma colocación y sigue vigilando la misma regresión.
  - El comentario se ha redactado en **4 líneas** para no pasar de 100 líneas el fichero
    (`tests/hero-grid-explicit-rows.test.mjs` queda en 100, el límite de `docs/architecture.md` §12).
  - Además, este informe se ha puesto al día en sus §6 y §8.7 para que no describan la referencia
    antigua.

### Salida de la suite tras el cambio

```
$ node --test "tests/**/*.test.mjs"
✔ REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1 (1.1954ms)
✔ REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande (0.9839ms)
✔ REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError (0.2261ms)
✔ REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande (0.4652ms)
✔ REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError (0.2261ms)
✔ REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError (0.2109ms)
✔ REQ-01-14: la colocación del mosaico es la esperada tras el ajuste de la feature 2 (20 tarjetas) (0.6378ms)
✔ REQ-01-14: hero-cards.json declara "row" en las 15 tarjetas de las franjas inferiores (0.7202ms)
✔ higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha (1.4726ms)
✔ REQ-02-08: tokens.css define los cinco --color-marca-* nuevos (1.1113ms)
✔ REQ-02-09: cada marca nueva tiene su regla [data-color-token] con el fondo de su token (0.5282ms)
✔ REQ-02-10: la regla de astro declara un icono mayor que el de las cuatro pequeñas de su fila (0.9593ms)
✔ REQ-02-11: a 1200 px las cinco tarjetas nuevas bajan la escala del icono (0.3869ms)
✔ REQ-02-01/02/03/04: las cinco tarjetas de la fila nueva declaran sprite, colorToken, row 2, featured solo en astro y showOnMobile false (1.229ms)
✔ REQ-02-01: el repositorio expone la fila nueva y las redes sociales pasan a row 3 (0.8761ms)
✔ REQ-02-05/06/07: la fila 2 del mosaico contiene las cinco marcas con astro en el hueco grande (0.9303ms)
✔ REQ-02-12: el sprite no ha cambiado y contiene los cinco symbols nuevos (18.1522ms)
✔ higiene: hero-card.astro importa la hoja nueva y ningún archivo tocado pasa de 100 líneas (0.8802ms)
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

`./init.sh` completo en verde tras los dos cambios (entorno, formato, tests 18/18, build).

```
--- Herramientas y dependencias ---
✔ node instalado   ✔ pnpm instalado   ✔ dependencias instaladas (node_modules)
--- Archivos del harness ---
✔ AGENTS.md existe   ✔ feature_list.json existe   ✔ progress/current.md existe
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

### Fuera de alcance (lo deja el líder)

- **H1** — el cambio ajeno de `src/middleware.ts` (línea en blanco final): **no se ha tocado**, lo
  gestiona el líder.
- **H6** — `CHECKPOINTS.md` y `progress/history.md` desactualizados: los actualiza el líder en el cierre
  de sesión (mover el resumen de `progress/current.md` a `progress/history.md` y vaciar `current.md`).
- **H2** (aclarar REQ-02-13/A8), **H3** (centrado del glifo de `astro` en
  `src/styles/hero-card-brands.css`), **H5** (restituir `tests/harness-kit-integrity.test.mjs`): quedan
  anotados para ciclos posteriores; no se ha tocado `src/` en este cierre.
- No se ha modificado `src/`, `src/data/hero-cards.json`, `src/styles/**`, `specs/` ni el resto del
  backlog.
