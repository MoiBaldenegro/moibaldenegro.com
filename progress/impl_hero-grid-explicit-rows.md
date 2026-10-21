# Informe de implementación — feature 1 `hero-grid-explicit-rows`

- **Feature**: id 1 — `hero-grid-explicit-rows` (El mosaico del hero se coloca por filas declaradas en los datos).
- **Spec**: `specs/01_hero-grid-explicit-rows/requirements.md` (REQ-01-01..14) y
  `specs/01_hero-grid-explicit-rows/design.md` (Decisiones 1-6).
- **Sesión**: 2026-10-21 — implementer (ciclo de trabajo con TDD: test en rojo → código → suite en verde).
- **Estado**: implementada y verificada; **no** se marca `done` (queda pendiente el APPROVED del reviewer).

---

## 1. Qué se ha hecho

El mosaico del hero pasa de "dos colas globales" (featured a los huecos grandes, el resto a los
pequeños, las redes las últimas) a **franjas declaradas en los datos**:

| Capa | Antes | Ahora |
|------|-------|-------|
| Entidad | `HeroCard` sin fila | `HeroCard.row?: number` (entero ≥ 1; ausente = zona superior) |
| Parseo | — | `readRow()` → `HeroCardsDataError` nombrando `hero-cards.json` + índice si el valor no es entero ≥ 1 |
| Motor | reparto por dos colas + huecos derivados del nº de tarjetas | zona superior (iconos **sin** `row`) + una franja por valor de `row` (5 tarjetas, la `featured` al hueco grande) |
| Datos | 15 tarjetas sin fila | las 10 de las franjas inferiores declaran `row: 1` / `row: 2` |

**El mosaico visible NO cambia**: el orden de emisión, los spans y la colocación física de las 15
tarjetas actuales son idénticos antes y después (ver §4, regresión REQ-01-14).

## 2. Archivos tocados

### Nuevos

| Archivo | Rol |
|---------|-----|
| `src/domain/hero-grid-error.ts` (10 líneas) | `HeroGridLayoutError` en módulo propio (Decisión 4: `hero-grid-rows.ts` lo necesita y `hero-grid-layout.ts` lo importa → sin ciclo de imports). `hero-grid-layout.ts` lo re-exporta para no romper importadores. |
| `src/domain/hero-grid-rows.ts` (60 líneas) | `groupRows()` (agrupa por `row`), `splitFeatured()` (la única `featured` de una zona/franja) y `validateRows()` (5 tarjetas por franja, redes sociales solo en la última franja y nunca con `featured`). |
| `tests/hero-grid-explicit-rows.test.mjs` (98 líneas) | Suite de la feature (`node:test`, sin dependencias). El repo no tenía `tests/` (el commit `7697d5c cleaning` lo borró): se recrea con el mismo patrón de `package.json` (`node --test "tests/**/*.test.mjs"`). |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `src/domain/entities/hero-card.ts` | `readonly row?: number` en `HeroCard` (REQ-01-01). |
| `src/domain/repositories/hero-cards-fields-parse.ts` | lector `readRow()` (REQ-01-02). |
| `src/domain/repositories/hero-cards-parse.ts` | `...readRow(card, index)` en `parseIconCard`. |
| `src/domain/hero-grid-template.ts` | `TOP_SLOTS` (sin cambios) + patrones por paridad de fila (`ODD_ROW`/`EVEN_ROW`, `rowSlots()`) + `assignToSlots()` (la `featured` al hueco grande, las demás a los pequeños en orden del JSON). Se retira `buildSlots()`: los huecos ya no se derivan del número de tarjetas, los declara cada fila. |
| `src/domain/hero-grid-layout.ts` (95 → 79 líneas) | orquesta: zona superior + franjas declaradas → pares (tarjeta, hueco) → `place()` (auto-placement disperso **sin cambios**, Decisión 5). |
| `src/data/hero-cards.json` | `"row": 1` en nestjs, css, react, html, claude-code; `"row": 2` en bun, claude, typescript, youtube, github. |

**Sin tocar**: `src/styles/**`, `public/assets/svg/sprite.svg`, `src/components/**`, `package.json`,
`feature_list.json` (solo el `status` de la feature 1), la feature 2 y el resto del backlog.

### Reparto de líneas (límite de 100)

```
79  src/domain/hero-grid-layout.ts        87  src/domain/repositories/hero-cards-fields-parse.ts
60  src/domain/hero-grid-rows.ts          78  src/domain/repositories/hero-cards-parse.ts
40  src/domain/hero-grid-template.ts      67  src/domain/entities/hero-card.ts
10  src/domain/hero-grid-error.ts         98  tests/hero-grid-explicit-rows.test.mjs
```

## 3. Ciclo rojo → verde (evidencia)

### 3.1 ROJO — test escrito antes del código

`tests/hero-grid-explicit-rows.test.mjs` se escribió contra la spec y se ejecutó **antes** de
tocar el código (`node --test "tests/**/*.test.mjs"`):

```
✖ REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1 (1.3636ms)
✔ REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande (1.0184ms)
✖ REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError (0.3879ms)
✔ REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande (0.5194ms)
✖ REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError (0.1645ms)
✖ REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError (0.2775ms)
✔ REQ-01-14: la migración con "row" conserva la colocación de las 15 tarjetas actuales (0.9417ms)
✖ REQ-01-14: hero-cards.json declara "row" en las 10 tarjetas de las franjas inferiores (0.9521ms)
✖ higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha (0.5587ms)
ℹ tests 9
ℹ pass 3
ℹ fail 6
```

Fallos representativos del rojo (mensajes reales):

```
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  undefined !== 3                                     ← el parseo no expone "row" todavía

AssertionError [ERR_ASSERTION]: esperaba un HeroGridLayoutError con /zona superior/
  actual: HeroGridLayoutError: hero-grid-layout: hay 1 tecnologías con featured y la plantilla tiene 0 huecos grandes libres

AssertionError [ERR_ASSERTION]: esperaba un HeroGridLayoutError con /fila 1/
  actual: HeroGridLayoutError: hero-grid-layout: se recibieron 9 tarjetas: las 4 tras la zona superior no completan filas de 5

AssertionError [ERR_ASSERTION]: Missing expected exception: esperaba un HeroGridLayoutError con /s0/

Error: ENOENT: no such file or directory, open '...\src\domain\hero-grid-rows.ts'
```

### 3.2 VERDE — suite completa tras implementar

```
$ node --test "tests/**/*.test.mjs"
✔ REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1 (1.1649ms)
✔ REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande (0.9674ms)
✔ REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError (0.2218ms)
✔ REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande (0.4674ms)
✔ REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError (0.2322ms)
✔ REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError (0.1992ms)
✔ REQ-01-14: la migración con "row" conserva la colocación de las 15 tarjetas actuales (1.3454ms)
✔ REQ-01-14: hero-cards.json declara "row" en las 10 tarjetas de las franjas inferiores (0.7523ms)
✔ higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha (1.4457ms)
ℹ tests 9
ℹ pass 9
ℹ fail 0
```

### 3.3 `./init.sh` completo en verde

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

## 4. Regresión visual: el mosaico NO cambia (REQ-01-14)

La línea base se capturó **antes** de tocar nada, ejecutando el motor vigente sobre los datos
vigentes. La tabla se comparó con la salida posterior a la migración y es **idéntica**:

```
[ id, columna, fila, colSpan, rowSpan ]
[htb 6,1,5x4] [rust 11,1,2x2] [aws 11,3,2x2] [cloudflare 6,5,2x2] [node 8,5,5x2]
[nestjs 1,7,4x2] [css 5,7,2x2] [react 7,7,2x2] [html 9,7,2x2] [claude-code 11,7,2x2]
[bun 1,9,2x2] [claude 3,9,2x2] [typescript 5,9,4x2] [youtube 9,9,2x2] [github 11,9,2x2]
```

Esa tabla está **fijada en el test** (`MAP`), de modo que cualquier cambio futuro de la colocación
lo rompe. Además, el HTML de producción sale con el mismo orden de tarjetas y los mismos spans que
la tabla (el orden de emisión es el de los huecos, que para estos datos coincide con el del JSON):

```
$ grep -o 'data-color-token="[a-z-]*"' dist/client/home/index.html
htb rust aws cloudflare node nestjs css react html claude-code bun claude typescript youtube github
$ grep -o 'data-col-span="[0-9]*" data-row-span="[0-9]*"' dist/client/home/index.html
5x4 2x2 2x2 2x2 5x2 4x2 2x2 2x2 2x2 2x2 2x2 2x2 4x2 2x2 2x2
```

El DOM manda en el auto-placement de CSS Grid (`grid-auto-flow: row`), así que con el mismo orden y
los mismos spans la retícula es la misma: la zona superior y las dos franjas quedan intactas.

## 5. Trazabilidad REQ → implementación → test

| REQ | Implementación | Test |
|-----|----------------|------|
| REQ-01-01 | `HeroCard.row?: number` (`src/domain/entities/hero-card.ts`) | REQ-01-01/02 |
| REQ-01-02 | `readRow()` (`hero-cards-fields-parse.ts`) → `HeroCardsDataError` con `hero-cards.json` + índice | REQ-01-01/02 |
| REQ-01-03 | iconos sin `row` → huecos de la zona superior (`hero-grid-layout.ts`) | REQ-01-03/04 |
| REQ-01-04 | la `featured` de la zona superior → hueco grande 5×2 | REQ-01-03/04 |
| REQ-01-05 | zona superior incompleta → `HeroGridLayoutError` | REQ-01-05/06 |
| REQ-01-06 | dos `featured` en la zona superior → `HeroGridLayoutError` | REQ-01-05/06 |
| REQ-01-07 | `groupRows()` agrupa por valor de `row` | REQ-01-07/08/09 |
| REQ-01-08 | la `featured` de la franja → hueco grande 4×2 (`rowSlots()` por paridad) | REQ-01-07/08/09 |
| REQ-01-09 | las demás → huecos pequeños en el orden del JSON (`assignToSlots()`) | REQ-01-07/08/09 |
| REQ-01-10 | franja con ≠ 5 tarjetas → `HeroGridLayoutError` | REQ-01-10/11 |
| REQ-01-11 | franja con ≠ 1 `featured` → `HeroGridLayoutError` | REQ-01-10/11 |
| REQ-01-12 | `social` fuera de la última franja → `HeroGridLayoutError` | REQ-01-12/13 |
| REQ-01-13 | `social` con `featured` → `HeroGridLayoutError` | REQ-01-12/13 |
| REQ-01-14 | `src/data/hero-cards.json` declara `row` sin mover ninguna tarjeta | REQ-01-14 (×2) |

## 6. Decisiones tomadas (y desviaciones respecto de la spec)

1. **Patrón de huecos por paridad del valor de `row`** (fila impar → `[4×2, 2×2, 2×2, 2×2, 2×2]`;
   fila par → `[2×2, 2×2, 4×2, 2×2, 2×2]`), tal y como fija la Decisión 3 del `design.md`. Con filas
   contiguas (1, 2, 3…) esto reproduce exactamente el ritmo alterno anterior, que iba por índice de
   fila: la fila 1 conserva el hueco grande primero (`nestjs`) y la fila 2 el grande en tercera
   posición (`typescript`). Con la feature 2, la fila 2 seguirá siendo la del patrón par → `astro`
   cae en el hueco grande en tercera posición, como pide la Decisión 3.
2. **Orden de salida = orden de los huecos** (zona superior, luego franjas por valor de `row` ascendente).
   Es lo que reproduce el auto-placement de CSS Grid: el DOM manda. Para los datos actuales el orden
   de huecos coincide con el orden del JSON, de modo que el HTML generado es idéntico al anterior.
3. **La zona superior exige exactamente una `featured`.** REQ-01-06 nombra el caso "más de una";
   el hueco grande de la zona solo puede ocuparlo la `featured` (REQ-01-04), así que una zona con
   4 tarjetas y ninguna `featured` se considera **incompleta** y falla con
   `la zona superior tiene 0 tarjetas con featured y necesita una`. Es el mismo error nombrado, no uno nuevo.
4. **Orden de las validaciones**: primero el número de tarjetas de la franja/zona y después el número
   de `featured` (mensaje `la fila N tiene X tarjetas y debe tener 5` /
   `la zona superior tiene N tarjetas de icono y necesita M`). Las redes sociales se comprueban al final
   (`social` con `featured` antes que `social` fuera de la última franja).
5. **`social` en la zona superior**: se considera "fuera de la última fila" y falla, **salvo** que no
   haya ninguna franja declarada (entonces la zona superior es la última zona y se admite, como antes).
   Ninguna tarjeta `social` del JSON actual está en la zona superior.
6. **`row` en una tarjeta rica** (`kind: "htb"`): la spec lo define para la tarjeta de icono, así que
   el parseo de las ricas lo ignora (no es un error). La tarjeta rica sigue ocupando el hueco 5×4
   de la zona superior.
7. **Se retira `buildSlots(count)`** de `hero-grid-template.ts`: los huecos ya no se derivan del número
   de tarjetas (eso era el modelo viejo de dos colas) sino de las franjas declaradas. Ningún otro
   módulo lo importaba.
8. **`HeroGridLayoutError` se re-exporta** desde `hero-grid-layout.ts` (Decisión 4) para no romper a
   sus importadores; el módulo propio `hero-grid-error.ts` es el que lo usa `hero-grid-rows.ts`.

## 7. Notas para el reviewer

- `tests/` no existía (lo borró el commit `7697d5c cleaning`): la suite de la feature es el primer
  test del ciclo y sigue el patrón de `package.json` (`node --test "tests/**/*.test.mjs"`).
- No se ha ejecutado `pnpm dev` ni inspección visual en navegador: la feature **no cambia el aspecto**
  (misma colocación comprobada con la línea base y con el HTML de producción) y el proyecto no trae
  herramienta de navegador en este entorno.
- `feature_list.json` queda con la feature 1 en `in_progress`; el `done` lo pone el líder tras el APPROVED
  (actualizado en el addendum: con el APPROVED ya verificado, la feature 1 está en `done`).

---

## Addendum post-review (cierre de la feature 1)

El reviewer Emitió **APPROVED** sin cambios requeridos (`progress/review_hero-grid-explicit-rows.md`,
§8). Con el APPROVED verificado en disco, la feature 1 se cierra. No hay trabajo nuevo de
implementación: solo dos cambios, ambos administrativos/de prueba.

### A. Paso a `done` en `feature_list.json`

- La feature 1 (`hero-grid-explicit-rows`) pasa de `in_progress` a **`done`**.
- La feature **se conserva en el array** `features` (política de estado del backlog:
  `docs/verification.md` §"Política de estado del backlog"; ninguna feature se elimina del array).
- **No se toca nada más del backlog**: la feature 2 (`hero-row-new-tools`) sigue en `pending` con su
  `depends_on: [1]`, y no se modifican `project`, `description`, `rules` ni los `acceptance`.

### B. Recomendación no bloqueante H3 (aserción tautológica)

- **Qué decía H3**: en `tests/hero-grid-explicit-rows.test.mjs:79` la aserción
  `assert.deepEqual(real(), real())` comparaba dos llamadas idénticas y no cubría nada (la
  comprobación real es la de la línea anterior contra `MAP`). Recomendación: borrarla o sustituirla
  por una comprobación con contenido (p. ej. que el número de tarjetas colocadas es 15 y que los
  `id` son únicos).
- **Qué se ha hecho**: se sustituye por tres comprobaciones **con contenido** sobre la misma
  colocación real (`placed`), todas ya cumplidas por la implementación:

  ```js
  const placed = real();
  assert.deepEqual(placed.map((p) => [p.card.id, p.column, p.row, p.colSpan, p.rowSpan]), MAP);
  // H3 (review): comprobación con contenido en lugar de la aserción tautológica real() vs real().
  assert.equal(placed.length, 15, 'el mosaico debe colocar exactamente 15 tarjetas');
  assert.equal(new Set(placed.map((p) => p.card.id)).size, 15, 'los id de las tarjetas deben ser únicos');
  assert.deepEqual(placed.map((p) => p.card.id), MAP.map(([id]) => id), 'el orden de salida debe ser el del JSON');
  ```

  - **el `MAP` de regresión no se toca** (líneas 20-24, byte a byte) y **ninguna otra aserción con
    valor** se modifica: el resto del archivo es idéntico.
  - La comprobación del **orden de salida** es coherente con la línea base: el `deepEqual` contra
    `MAP` ya fija el orden de los `id`; se hace explícito para que la aserción sea legible por sí
    sola (y para que una regresión de orden se lea en el mensaje de fallo).
  - **Compactación de separadores**: al añadir las comprobaciones el archivo pasaba a 102 líneas
    (por encima del límite de 100 de `docs/architecture.md` §12). Se han retirado las líneas en
    blanco **separadoras de los bloques `test(...)`** — 8 líneas, sin tocar ninguna aserción — con
    lo que el archivo queda en **94 líneas**. Es el mismo estilo que los test files anteriores del
    repo (p. ej. `tests/hero-mosaic-layout.test.mjs` del ciclo 30, sin líneas en blanco entre
    bloques de test).

### Salida de la suite tras el ajuste

```
$ node --test "tests/**/*.test.mjs"
✔ REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1 (1.2558ms)
✔ REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande (0.9792ms)
✔ REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError (0.2265ms)
✔ REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande (0.4778ms)
✔ REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError (0.2342ms)
✔ REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError (0.2001ms)
✔ REQ-01-14: la migración con "row" conserva la colocación de las 15 tarjetas actuales (0.5578ms)
✔ REQ-01-14: hero-cards.json declara "row" en las 10 tarjetas de las franjas inferiores (0.4536ms)
✔ higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha (1.2341ms)
ℹ tests 9
ℹ pass 9
ℹ fail 0
```

```
$ wc -l tests/hero-grid-explicit-rows.test.mjs
94 tests/hero-grid-explicit-rows.test.mjs
```

`./init.sh` completo en verde tras los dos cambios (entorno, formato, tests 9/9, build).

### Fuera de alcance (lo deja el líder)

- **H1** — el cambio ajeno de `src/middleware.ts` (línea en blanco final): **no se ha tocado**, lo
  gestiona el líder.
- **H2, H4, H5, H6** — recomendaciones anotadas para ciclos posteriores (validar `row` en las tarjetas
  ricas o acotar REQ-01-02; paridad del valor de `row` con filas no contiguas; alcance literal del
  límite de 100 líneas; `tests/harness-kit-integrity.test.mjs` que el commit `7697d5c cleaning` borró).
- **H7** — mover el resumen de `progress/current.md` a `progress/history.md` y vaciar `current.md`:
  cierre de sesión del líder.
- No se ha modificado `src/`, `src/data/hero-cards.json`, `specs/` ni el resto del backlog.

