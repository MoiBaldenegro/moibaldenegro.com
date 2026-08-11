// Motor puro del Juego de la Vida de Conway (feature 14 game-of-life-engine).
//
// Cuadrícula envolvente/toroidal (REQ-14-07) e inmutable: cada generación
// devuelve una nueva cuadrícula y nunca muta la de entrada (REQ-14-02).
// Sin dependencias externas (docs/architecture.md regla 2) y ≤100 líneas
// (regla 12 / REQ-14-09). Las entradas inválidas lanzan GameOfLifeError
// (regla 3: errores nombrados, no fallos silenciosos).

export type Cell = 0 | 1;

export type Grid = readonly Cell[][];

export class GameOfLifeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameOfLifeError';
  }
}

export function createGrid(rows: number, cols: number): Cell[][] {
  if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
    throw new GameOfLifeError(`createGrid: dimensiones inválidas (${rows}x${cols})`);
  }
  return Array.from({ length: rows }, () => Array<Cell>(cols).fill(0));
}

export function randomizeGrid(grid: Grid, density: number): Cell[][] {
  if (density < 0 || density > 1) {
    throw new GameOfLifeError(`randomizeGrid: densidad fuera de rango (${density})`);
  }
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const next = createGrid(rows, cols);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      next[row][col] = Math.random() < density ? 1 : 0;
    }
  }
  return next;
}

function countLiveNeighbors(grid: Grid, row: number, col: number): number {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      count += grid[(row + dr + rows) % rows][(col + dc + cols) % cols];
    }
  }
  return count;
}

export function stepGrid(grid: Grid): Cell[][] {
  const rows = grid.length;
  if (rows === 0) return [];
  const cols = grid[0].length;
  const next = createGrid(rows, cols);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const neighbors = countLiveNeighbors(grid, row, col);
      const alive = grid[row][col] === 1;
      if ((alive && (neighbors === 2 || neighbors === 3)) || (!alive && neighbors === 3)) {
        next[row][col] = 1;
      }
    }
  }
  return next;
}
