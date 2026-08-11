# Review — feature 14 game-of-life-engine

**Veredicto:** APPROVED

## Resumen

- **Spec:** `specs/14_game-of-life-engine/requirements.md` (REQ-14-01..09)
- **Acceptance:** feature id 14 en `feature_list.json` (status `in_progress`, correcto en fase de review)
- **Informe implementador:** `progress/impl_14_game-of-life-engine.md`
- **Revisado por:** agente revisor (nivel 1) — verificación independiente ejecutada en esta sesión
- **Fecha:** 2026-08-11

## Verificación de la pregunta de revisión (test-first)

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?** SÍ.

- Evidencia en `progress/impl_14_game-of-life-engine.md` §1: ROJO capturado con `node --test tests/game-of-life-engine.test.mjs` ANTES de existir `src/utils/game-of-life.ts` → `ERR_MODULE_NOT_FOUND` (módulo no encontrado), `# pass 0`, `# fail 1`, salida transcrita. Corroborado en `progress/current.md` (bitácora "Feature en curso"): test escrito PRIMERO → ROJO `ERR_MODULE_NOT_FOUND` → implementación → VERDE 11/11.
- VERDE: test de la feature 11/11 post-implementación (`# pass 11`, `# fail 0`); suite completa 104/104 (`# pass 104`, `# fail 0`, `# skipped 0`).
- **Verificación independiente del revisor:** `node --test "tests/**/*.test.mjs"` → **104/104 pass, 0 fail, 0 skipped**. ✔

## Checklist con evidencia concreta

### Checkpoints (CHECKPOINTS.md)

- C1 (estilos separados de la UI): [x] — N/A: feature de motor puro en `src/utils/`, no crea componentes ni estilos.
- C2 (sin lógica en UI): [x] — N/A: no hay archivos de UI; la lógica vive en `src/utils/game-of-life.ts` (regla 8 de architecture.md, separación lógica/UI).
- C3 (datos vía repositorio): [x] — N/A: el motor no lee JSON ni accede a datos; cero imports de `src/data`.
- C4 (tokens, no valores sueltos): [x] — N/A: sin estilos ni CSS en la feature (los tokens del fondo son de la feature 15).
- C5 (≤100 líneas por archivo): [x] — `src/utils/game-of-life.ts` tiene 70 líneas de contenido (71 con el salto final) ≤ 100; test REQ-14-09 lo asevera (test REQ-14-09: lee el archivo y cuenta líneas). Nota: `tests/game-of-life-engine.test.mjs` tiene 187 líneas; excede 100 pero sigue el patrón establecido y aprobado en features 1-13 (los test files del repo exceden 100 y la spec solo limita el módulo REQ-14-09). No es desviación nueva.
- C6 (sin dependencias externas): [x] — el módulo tiene cero imports (TS puro); el test usa solo stdlib (`node:test`, `node:assert/strict`, `node:fs`). Verificado por lectura directa.
- C7 (datos del dominio válidos): [x] — N/A: la feature no toca `src/data/` ni entidades.
- C8 (errores nombrados, sin fallos silenciosos): [x] — `GameOfLifeError` (regla 3) lanzado por `createGrid` (dimensiones no enteras o ≤0, línea 21-23) y `randomizeGrid` (densidad fuera de 0..1, línea 28-30); test "entradas inválidas lanzan GameOfLifeError" lo asevera (5 casos). `stepGrid([])` devuelve `[]` (caso degenerado documentado en informe §4, coherente con REQ-14-08).
- C9 (init.sh verde): [x] — **verificado por el revisor**: `./init.sh` → todas las comprobaciones ✔, "El entorno está perfecto. Podemos empezar a trabajar."
- C10 (UI desktop/móvil): [x] — N/A: sin UI en esta feature (la feature 15 integra el fondo en el layout).
- C11 (feature_list.json): [x] — feature 14 en status `in_progress` (estado correcto durante la review; el cierre a `done` lo decide el líder tras el veredicto); ninguna otra feature a medias.
- C12 (current.md documenta): [x] — `progress/current.md` documenta plan, ROJO, implementación y VERDE con detalle (sección "Feature en curso").
- C13 (sin temporales/debug/TODOs): [x] — sin archivos temporales, sin `print()`/console en el módulo, sin TODOs; los comentarios del módulo (líneas 1-7) son documentación.

### Trazabilidad acceptance ↔ REQ (feature 14)

| Acceptance (feature_list.json) | REQ | Evidencia |
|---|---|---|
| Test en rojo antes de crear el módulo y verde al final | REQ-14-01, REQ-14-02 | Informe §1 (ROJO `ERR_MODULE_NOT_FOUND` 0 pass/1 fail → VERDE 11/11); tests "REQ-14-01" (createGrid 3×5, todas 0, referencia nueva) y "REQ-14-02" (referencia distinta, snapshot no mutado, blinker 5×5 oscila) |
| Subpoblación: viva con <2 vecinas muere | REQ-14-03 | Test REQ-14-03: viva aislada (0 vecinas) muere; viva con 1 vecina muere (ambas celdas). Re-verificado independientemente |
| Supervivencia con 2-3 y sobrepoblación con >3 | REQ-14-04, REQ-14-05 | Tests REQ-14-04 (bloque 2×2 con 3 vecinas sobrevive; centro del blinker con 2 vecinas sobrevive) y REQ-14-05 (3×3 todo vivo, 8 vecinas cada célula → todo muere) |
| Reproducción: muerta con exactamente 3 vecinas nace | REQ-14-06 | Test REQ-14-06: blinker vertical → laterales muertos con 3 vecinas nacen |
| Bordes envolventes (toroidal) | REQ-14-07 | Test REQ-14-07: esquina (0,0) nace SOLO con 3 vecinas a través del borde opuesto; esquina viva aislada muere contando el borde opuesto. Código: `% rows` / `% cols` en `countLiveNeighbors` (líneas 42-53) |
| Cuadrícula vacía permanece vacía | REQ-14-08 | Test REQ-14-08: `createGrid(4,4)` → siguiente generación idéntica y vacía; `[]` → `[]` |
| `src/utils/game-of-life.ts` ≤ 100 líneas | REQ-14-09 | Test REQ-14-09 (cuenta líneas del archivo: 70 ≤ 100) |

Extra cubierto sin REQ propio (descripción de la feature): `randomizeGrid` (nueva cuadrícula sin mutar, densidad 0 → ninguna viva, 1 → todas vivas, 0.5 → mezcla) y `GameOfLifeError` para entradas inválidas (regla 3). Ambos con test dedicado.

### Verificaciones ejecutadas por el revisor (todas ✔)

1. Lectura directa de `src/utils/game-of-life.ts` (70 líneas): `createGrid` valida dimensiones enteras positivas; `randomizeGrid` valida densidad 0..1; `countLiveNeighbors` envuelve con `(row + dr + rows) % rows` y `(col + dc + cols) % cols` (toroidal); `stepGrid` implementa exactamente las 4 reglas (`alive && (n === 2 || n === 3) || !alive && n === 3`), nunca escribe sobre la entrada (solo sobre `next`), `[]` → `[]`. Tipos `Cell = 0 | 1` y `Grid = readonly Cell[][]` sin `any`.
2. `node --test "tests/**/*.test.mjs"` → `# tests 104 / # pass 104 / # fail 0 / # skipped 0`.
3. Verificación funcional **independiente** (script propio de 15 aserciones, casos no copiados del test): subpoblación en borde, bloque 2×2, sobrepoblación 3×3, reproducción blinker 3×3, nacimiento toroidal de esquina, vacía → vacía, inmutabilidad (referencia + snapshot JSON), blinker 5×5 fase horizontal y oscilación, randomizeGrid densidades 0/1, `GameOfLifeError` ×2 → **15/15 ok**.
4. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.
5. `./init.sh` (Git Bash) → verde completo: herramientas ✔, harness ✔, formato ✔, tests ✔, build ✔, "El entorno está perfecto".
6. `git status --porcelain` → scope correcto: solo `feature_list.json` y `progress/current.md` (modificados) y `src/utils/game-of-life.ts`, `tests/game-of-life-engine.test.mjs`, `progress/impl_14_game-of-life-engine.md` (nuevos); `specs/14_*`, `specs/15_*` y `progress/research/` son del spec_author. Sin tocar UI, layout, dominio ni scripts del arnés.
7. Conteo de líneas: módulo 70 líneas de contenido (71 con salto final) ≤ 100; test 187 líneas.

## Notas (no bloqueantes, sin cambios requeridos)

1. El informe `progress/impl_14_game-of-life-engine.md` §2 dice que el test tiene 243 líneas; el archivo real tiene 187. Solo imprecisión de documentación: no afecta a la funcionalidad ni a la evidencia (mismo patrón que la nota 1 del review 11).
2. El blinker del test REQ-14-02 usa 5×5 centrado en lugar de 3×3, con justificación en informe §4. Verificado independientemente: en 3×3 toroidal el blinker vertical genera nacimientos extra en las esquinas (cada esquina ve 3 vecinas a través del borde), por lo que no oscila — es la física correcta de REQ-14-07, no un defecto del motor. La corrección es 100% del test.
3. `randomizeGrid([])` lanzaría `GameOfLifeError` (porque `createGrid(0,0)` valida dimensiones positivas). El caso no está en la spec ni lo usa la feature 15 (siembra sobre una cuadrícula real del viewport); el comportamiento actual (error explícito, no silencioso) es coherente con la regla 3.

## Conclusión

La feature cumple REQ-14-01..09 y los 7 criterios de acceptance, el ciclo rojo/verde está evidenciado en el informe y corroborado en `progress/current.md`, la verificación funcional independiente (15/15 aserciones propias) confirma la física de Conway con envolvente toroidal e inmutabilidad, la suite completa queda en verde (104/104), `./init.sh` termina con el entorno perfecto y el scope de git solo toca archivos de la feature. **APPROVED.**
