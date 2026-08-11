// game-of-life-canvas.ts — Driver del fondo del Juego de la Vida (features 15 y 16).
// Conecta el motor puro (feature 14) con un canvas 2D vanilla: bucle
// requestAnimationFrame, throttle de generación con shouldTick (REQ-16-01/02),
// pausa con document.hidden (REQ-15-06), fotograma estático con
// prefers-reduced-motion (REQ-15-05), color --color-accent y celda
// --size-gol-cell vía getComputedStyle (REQ-15-03, REQ-15-08), siembra con
// densidad baja (REQ-15-07) y media resolución (RENDER_SCALE, REQ-16-04).
// Sin dependencias externas (regla 2) y ≤100 líneas (regla 12).

import { createGrid, randomizeGrid, stepGrid, type Cell } from './game-of-life.ts';
import { renderFrame, RENDER_SCALE } from './gol-render.ts';

const SEED_DENSITY = 0.15;
const TICK_INTERVAL_MS = 80; // 12,5 gen/seg (REQ-16-02, rango decidido 10-15)

export function shouldTick(timestamp: number, lastTick: number, interval: number): boolean {
  return timestamp - lastTick >= interval;
}

export function mountGameOfLife(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const computed = getComputedStyle(canvas);
  const accent = computed.getPropertyValue('--color-accent').trim();
  const cellSize = Number.parseFloat(computed.getPropertyValue('--size-gol-cell'));
  if (!accent || !cellSize) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let grid: Cell[][] = createGrid(1, 1);
  let frameId = 0;
  let lastTick = 0;

  const resize = () => {
    const cols = Math.max(1, Math.floor(window.innerWidth / cellSize));
    const rows = Math.max(1, Math.floor(window.innerHeight / cellSize));
    canvas.width = Math.floor((cols * cellSize) / RENDER_SCALE);
    canvas.height = Math.floor((rows * cellSize) / RENDER_SCALE);
    const fresh = createGrid(rows, cols);
    grid = randomizeGrid(fresh, SEED_DENSITY);
    renderFrame(ctx, grid, cellSize, accent);
  };

  const animate = (timestamp: number) => {
    if (shouldTick(timestamp, lastTick, TICK_INTERVAL_MS)) {
      grid = stepGrid(grid);
      renderFrame(ctx, grid, cellSize, accent);
      lastTick = timestamp;
    }
    frameId = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (document.hidden || reducedMotion.matches || frameId !== 0) return;
    lastTick = performance.now();
    frameId = window.requestAnimationFrame(animate);
  };

  const stop = () => {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  };

  const onVisibility = () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  };

  const onMotionChange = () => {
    stop();
    renderFrame(ctx, grid, cellSize, accent);
    start();
  };

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', onMotionChange);

  resize();
  start();

  return () => {
    stop();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
    reducedMotion.removeEventListener('change', onMotionChange);
  };
}
