// Test del motor del Juego de la Vida (REQ-14-01..09, feature 14 game-of-life-engine).
//
// Verifica contra specs/14_game-of-life-engine/requirements.md:
//   REQ-14-01 — createGrid crea una cuadrícula vacía con dimensiones configurables.
//   REQ-14-02 — stepGrid calcula la siguiente generación aplicando las reglas
//               (inmutabilidad: cada generación devuelve una NUEVA cuadrícula).
//   REQ-14-03 — subpoblación: célula viva con menos de 2 vecinas muere.
//   REQ-14-04 — supervivencia: célula viva con 2 o 3 vecinas sigue viva.
//   REQ-14-05 — sobrepoblación: célula viva con más de 3 vecinas muere.
//   REQ-14-06 — reproducción: célula muerta con exactamente 3 vecinas nace.
//   REQ-14-07 — envolvente toroidal: los bordes opuestos son adyacentes.
//   REQ-14-08 — cuadrícula sin celdas vivas → siguiente generación vacía.
//   REQ-14-09 — src/utils/game-of-life.ts ≤ 100 líneas.
//
// Además cubre randomizeGrid (densidad), que forma parte del módulo según la
// descripción de la feature y progress/research/game-of-life-background.md, y
// los errores explícitos (GameOfLifeError) para entradas inválidas
// (docs/architecture.md regla 3: errores nombrados, no fallos silenciosos).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  createGrid,
  randomizeGrid,
  stepGrid,
  GameOfLifeError,
} from '../src/utils/game-of-life.ts';

const MODULE_URL = new URL('../src/utils/game-of-life.ts', import.meta.url);

test('REQ-14-01: createGrid crea una cuadrícula vacía con dimensiones configurables', () => {
  assert.equal(typeof createGrid, 'function', 'createGrid no está expuesta (REQ-14-01)');
  const grid = createGrid(3, 5);
  assert.equal(grid.length, 3, 'la cuadrícula debe tener 3 filas');
  assert.ok(grid.every((row) => row.length === 5), 'cada fila debe tener 5 columnas');
  assert.ok(grid.every((row) => row.every((cell) => cell === 0)), 'todas las celdas deben nacer muertas');
  assert.notEqual(grid, createGrid(3, 5), 'cada llamada devuelve una cuadrícula nueva');
});

test('REQ-14-02: stepGrid devuelve una NUEVA cuadrícula sin mutar la entrada', () => {
  assert.equal(typeof stepGrid, 'function', 'stepGrid no está expuesta (REQ-14-02)');
  const input = [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const snapshot = structuredClone(input);
  const next = stepGrid(input);
  assert.notEqual(next, input, 'stepGrid debe devolver una nueva cuadrícula (REQ-14-02)');
  assert.deepEqual(input, snapshot, 'la cuadrícula de entrada no debe mutarse (REQ-14-02)');
  // Blinker vertical → horizontal → vertical (integración del cómputo de la
  // siguiente generación con las 4 reglas). El blinker va centrado en 5x5
  // para que la envolvente toroidal no lo afecte (REQ-14-07).
  assert.deepEqual(stepGrid(stepGrid(input)), input, 'el blinker oscila y vuelve a su estado inicial');
});

test('REQ-14-03: subpoblación — una célula viva con menos de 2 vecinas muere', () => {
  const lone = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ];
  assert.equal(stepGrid(lone)[1][1], 0, 'una célula viva aislada (0 vecinas) debería morir');
  const oneNeighbor = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ];
  const next = stepGrid(oneNeighbor);
  assert.equal(next[1][1], 0, 'una célula viva con 1 vecina debería morir');
  assert.equal(next[0][0], 0, 'la vecina con 1 vecina también debería morir');
});

test('REQ-14-04: supervivencia — una célula viva con 2 o 3 vecinas sigue viva', () => {
  // Bloque 2x2 (still life): cada célula viva tiene exactamente 3 vecinas.
  const block = [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ];
  const next = stepGrid(block);
  assert.equal(next[1][1], 1, 'célula viva con 3 vecinas debería sobrevivir');
  assert.equal(next[1][2], 1, 'célula viva con 3 vecinas debería sobrevivir');
  assert.equal(next[2][1], 1, 'célula viva con 3 vecinas debería sobrevivir');
  assert.equal(next[2][2], 1, 'célula viva con 3 vecinas debería sobrevivir');
  // Barra vertical del blinker: la célula central tiene exactamente 2 vecinas.
  const blinker = [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ];
  assert.equal(stepGrid(blinker)[1][1], 1, 'célula viva con 2 vecinas debería sobrevivir');
});

test('REQ-14-05: sobrepoblación — una célula viva con más de 3 vecinas muere', () => {
  // 3x3 todo vivo: cada célula tiene 8 vecinas (toroidal) → todas mueren.
  const crowded = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  const next = stepGrid(crowded);
  assert.equal(next[1][1], 0, 'célula viva con 8 vecinas debería morir (sobrepoblación)');
  assert.ok(
    next.every((row) => row.every((cell) => cell === 0)),
    'la cuadrícula completa debería quedar vacía (sobrepoblación)',
  );
});

test('REQ-14-06: reproducción — una célula muerta con exactamente 3 vecinas nace', () => {
  // Blinker vertical → la fila central horizontal nace con 3 vecinas.
  const blinker = [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ];
  const next = stepGrid(blinker);
  assert.equal(next[1][0], 1, 'celda muerta con 3 vecinas debería nacer');
  assert.equal(next[1][2], 1, 'celda muerta con 3 vecinas debería nacer');
});

test('REQ-14-07: la cuadrícula es envolvente (toroidal) en los bordes', () => {
  // Células vivas en (0,2), (2,0) y (2,2): la esquina (0,0) tiene exactamente
  // 3 vecinas SOLO si el borde envuelve (sin envolvente tendría 0 vecinas).
  const wrap = [
    [0, 0, 1],
    [0, 0, 0],
    [1, 0, 1],
  ];
  const next = stepGrid(wrap);
  assert.equal(next[0][0], 1, 'la esquina (0,0) debería nacer por vecinas del borde opuesto');
  // Célula viva en la esquina (0,0): sus 8 vecinas (incluidas las del borde
  // opuesto) están muertas → muere por subpoblación (el cómputo cruza bordes).
  const corner = [
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  assert.equal(stepGrid(corner)[0][0], 0, 'la esquina muere aunque mire hacia el borde opuesto');
});

test('REQ-14-08: una cuadrícula sin celdas vivas permanece vacía', () => {
  const empty = createGrid(4, 4);
  const next = stepGrid(empty);
  assert.ok(
    next.every((row) => row.every((cell) => cell === 0)),
    'una cuadrícula sin celdas vivas debería seguir vacía',
  );
  assert.deepEqual(next, empty, 'la siguiente generación de una cuadrícula vacía es idéntica');
  assert.deepEqual(stepGrid([]), [], 'una cuadrícula sin filas permanece vacía');
});

test('randomizeGrid: siembra aleatoria con densidad sin mutar la entrada', () => {
  assert.equal(typeof randomizeGrid, 'function', 'randomizeGrid no está expuesta');
  const grid = createGrid(20, 20);
  const snapshot = structuredClone(grid);
  const seeded = randomizeGrid(grid, 0.5);
  assert.notEqual(seeded, grid, 'randomizeGrid debe devolver una nueva cuadrícula');
  assert.deepEqual(grid, snapshot, 'randomizeGrid no debe mutar la cuadrícula de entrada');
  assert.equal(seeded.length, grid.length, 'mantiene el número de filas');
  assert.ok(seeded.every((row) => row.length === grid[0].length), 'mantiene el número de columnas');
  const none = randomizeGrid(createGrid(4, 4), 0);
  assert.ok(none.every((row) => row.every((cell) => cell === 0)), 'densidad 0 → ninguna célula viva');
  const all = randomizeGrid(createGrid(4, 4), 1);
  assert.ok(all.every((row) => row.every((cell) => cell === 1)), 'densidad 1 → todas las células vivas');
  const mixed = randomizeGrid(createGrid(30, 30), 0.5);
  const alive = mixed.flat().filter((cell) => cell === 1).length;
  assert.ok(alive > 0 && alive < 30 * 30, 'densidad 0.5 → mezcla de vivas y muertas');
});

test('entradas inválidas lanzan GameOfLifeError (errores explícitos, no silenciosos)', () => {
  assert.throws(() => createGrid(0, 4), GameOfLifeError, 'filas 0 deberían lanzar GameOfLifeError');
  assert.throws(() => createGrid(4, -1), GameOfLifeError, 'columnas negativas deberían lanzar GameOfLifeError');
  assert.throws(() => createGrid(2.5, 4), GameOfLifeError, 'dimensiones no enteras deberían lanzar GameOfLifeError');
  assert.throws(() => randomizeGrid(createGrid(4, 4), -0.1), GameOfLifeError, 'densidad negativa debería lanzar GameOfLifeError');
  assert.throws(() => randomizeGrid(createGrid(4, 4), 1.5), GameOfLifeError, 'densidad > 1 debería lanzar GameOfLifeError');
});

test('REQ-14-09: src/utils/game-of-life.ts no supera las 100 líneas', () => {
  assert.ok(existsSync(MODULE_URL), 'src/utils/game-of-life.ts no existe (REQ-14-09)');
  const lineCount = readFileSync(MODULE_URL, 'utf8').split('\n').length;
  assert.ok(lineCount <= 100, `game-of-life.ts tiene ${lineCount} líneas (máximo 100, REQ-14-09)`);
});
