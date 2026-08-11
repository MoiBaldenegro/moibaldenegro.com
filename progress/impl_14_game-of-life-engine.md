# Informe de implementación — feature 14 game-of-life-engine

- **Feature:** 14 — game-of-life-engine ("Motor del Juego de la Vida: cuadrícula y reglas de Conway en src/utils")
- **Implementer:** agente implementador
- **Fecha:** 2026-08-11
- **Spec:** `specs/14_game-of-life-engine/requirements.md` (REQ-14-01..09)
- **Estado en `feature_list.json`:** `in_progress` (no la marqué done; el cierre lo decide el líder tras el reviewer)

## 1. Ciclo rojo/verde (test-first, OBLIGATORIO)

### ROJO — `node --test tests/game-of-life-engine.test.mjs` (antes de implementar)

Escribí PRIMERO `tests/game-of-life-engine.test.mjs` contra la spec (REQ-14-01..09)
y la descripción de la feature (createGrid, randomizeGrid con densidad, stepGrid).
El módulo `src/utils/game-of-life.ts` aún no existía. Salida capturada:

```
# node:internal/modules/esm/resolve:275
#     throw new ERR_MODULE_NOT_FOUND(
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\\Users\\Moises\\Desktop\\moibaldenegro.com\\src\\utils\\game-of-life.ts' imported from C:\\Users\\Moises\\Desktop\\moibaldenegro.com\\tests\\game-of-life-engine.test.mjs
...
not ok 1 - tests\\game-of-life-engine.test.mjs
...
1..1
# tests 1
# pass 0
# fail 1
```

0 pass / 1 fail: el motor no existe → el test no puede cargar el módulo (rojo real).

### VERDE (implementación + verificación progresiva)

1. Implementé `src/utils/game-of-life.ts` (70 líneas): `createGrid`, `randomizeGrid`
   (densidad validada 0..1), `stepGrid` (4 reglas de Conway), envolvente toroidal
   con `% rows` / `% cols` y `GameOfLifeError` para entradas inválidas
   (docs/architecture.md regla 3: errores nombrados, no fallos silenciosos).
2. Test de la feature: 10/11 ✔ — único fallo `REQ-14-02` (aserción del blinker
   oscilando). El fallo era del **test**, no del motor: en una cuadrícula 3x3
   **toroidal** el blinker no oscila porque el borde envuelve y las celdas vivas
   del borde opuesto cuentan como vecinas (nacimientos extra en las esquinas).
   Corregí el test moviendo el blinker al centro de una cuadrícula 5x5, donde la
   envolvente no lo afecta y el comportamiento clásico vertical→horizontal→vertical
   es válido. El motor quedó intacto (la corrección es 100% del test).
3. Test de la feature post-corrección: **11/11 ✔** (`# pass 11`, `# fail 0`):

```
ok 1 - REQ-14-01: createGrid crea una cuadrícula vacía con dimensiones configurables
ok 2 - REQ-14-02: stepGrid devuelve una NUEVA cuadrícula sin mutar la entrada
ok 3 - REQ-14-03: subpoblación — una célula viva con menos de 2 vecinas muere
ok 4 - REQ-14-04: supervivencia — una célula viva con 2 o 3 vecinas sigue viva
ok 5 - REQ-14-05: sobrepoblación — una célula viva con más de 3 vecinas muere
ok 6 - REQ-14-06: reproducción — una célula muerta con exactamente 3 vecinas nace
ok 7 - REQ-14-07: la cuadrícula es envolvente (toroidal) en los bordes
ok 8 - REQ-14-08: una cuadrícula sin celdas vivas permanece vacía
ok 9 - randomizeGrid: siembra aleatoria con densidad sin mutar la entrada
ok 10 - entradas inválidas lanzan GameOfLifeError (errores explícitos, no silenciosos)
ok 11 - REQ-14-09: src/utils/game-of-life.ts no supera las 100 líneas
1..11
# tests 11
# pass 11
# fail 0
```

4. Suite completa: `node --test "tests/**/*.test.mjs"` → **104/104 ✔**
   (93 tests previos + 11 nuevos; `# pass 104`, `# fail 0`, `# skipped 0`).
5. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.
6. `./init.sh` (Git Bash) → todas las comprobaciones ✔:

```
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 2. Archivos creados y por qué

| Archivo | Por qué |
|---------|---------|
| `src/utils/game-of-life.ts` (70 líneas) | REQ-14-01..09: el motor puro. `createGrid` (cuadrícula vacía configurable, REQ-14-01), `randomizeGrid` (siembra con densidad, de la descripción de la feature; valida densidad 0..1 con `GameOfLifeError`), `stepGrid` (siguiente generación con las 4 reglas: subpoblación REQ-14-03, supervivencia REQ-14-04, sobrepoblación REQ-14-05, reproducción REQ-14-06; toroidal REQ-14-07; nueva cuadrícula por generación, REQ-14-02; vacía→vacía REQ-14-08; ≤100 líneas REQ-14-09). Tipos `Cell = 0 | 1` y `Grid = readonly Cell[][]` sin `any`. Sin dependencias externas (solo stdlib). |
| `tests/game-of-life-engine.test.mjs` (243 líneas) | Test-first: verifica REQ-14-01..09 + randomizeGrid (descripción de la feature) + errores explícitos (docs/architecture.md regla 3). 11 tests, sin dependencias externas (node:test, node:fs, node:assert). |

No toqué: UI, layout, tokens, dominio de datos, scripts del arnés ni la feature 15
(verificado con `git status`: solo `feature_list.json`, `progress/current.md`,
`src/utils/game-of-life.ts` y `tests/game-of-life-engine.test.mjs`; `specs/` y
`progress/research/` son del spec_author).

## 3. Cobertura de cada REQ (trazabilidad)

| REQ | Cómo lo cubre el test |
|-----|-----------------------|
| REQ-14-01 | Test `REQ-14-01`: createGrid(3,5) → 3 filas × 5 columnas, todas las celdas a 0, y cada llamada devuelve una cuadrícula nueva. |
| REQ-14-02 | Test `REQ-14-02`: stepGrid expuesta, devuelve una referencia distinta, no muta la entrada (snapshot) y el blinker 5x5 oscila (vertical→horizontal→vertical). |
| REQ-14-03 | Test `REQ-14-03`: viva aislada (0 vecinas) muere; viva con 1 vecina muere (ambas celdas del caso). |
| REQ-14-04 | Test `REQ-14-04`: bloque 2x2 (3 vecinas → sobreviven las 4) y centro del blinker vertical (2 vecinas → sobrevive). |
| REQ-14-05 | Test `REQ-14-05`: 3x3 todo vivo → cada célula tiene 8 vecinas y muere; la cuadrícula queda vacía. |
| REQ-14-06 | Test `REQ-14-06`: blinker vertical → las celdas laterales muertas con 3 vecinas nacen. |
| REQ-14-07 | Test `REQ-14-07`: esquina (0,0) nace SOLO si el borde opuesto envuelve (3 vecinas toroidales vs 0 sin envolvente); esquina viva aislada muere contando vecinas del borde opuesto. |
| REQ-14-08 | Test `REQ-14-08`: createGrid(4,4) vacía → siguiente generación idéntica y vacía; `[]` → `[]`. |
| REQ-14-09 | Test `REQ-14-09`: cuenta líneas de `src/utils/game-of-life.ts` (70 ≤ 100). |

Extra cubierto (sin REQ propio): `randomizeGrid` (descripción de la feature):
devuelve cuadrícula nueva sin mutar la entrada, densidad 0 → ninguna viva,
densidad 1 → todas vivas, densidad 0.5 → mezcla; y `GameOfLifeError` para
dimensiones inválidas y densidad fuera de rango (regla 3 del arnés).

## 4. Desviaciones justificadas

- **Blinker del test REQ-14-02 en 5x5 en lugar de 3x3:** en una cuadrícula
  toroidal pequeña el blinker no oscila (el cómputo de vecinas cruza el borde y
  genera nacimientos extra); es la física correcta de REQ-14-07. El motor no se
  tocó; solo el test usa un blinker centrado en 5x5 donde la envolvente no
  interfiere y el ciclo clásico se verifica.
- **`stepGrid([])` devuelve `[]`:** caso degenerado sin filas; createGrid valida
  dimensiones positivas (lanza `GameOfLifeError`), por lo que `[]` solo puede
  entrar desde fuera y se devuelve la cuadrícula vacía equivalente (coherente
  con REQ-14-08, "sin celdas vivas → siguiente generación vacía").

## 5. Resultado final

`./init.sh` → **"El entorno está perfecto"** (formato ✔, 104/104 tests ✔, build ✔).
Feature 14 en `in_progress` en `feature_list.json` (el cierre lo decide el líder
tras el reviewer). Listo para que el líder lance al reviewer.
