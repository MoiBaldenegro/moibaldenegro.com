// gol-render.ts — Pintura del fondo del Juego de la Vida (feature 16).
// Sustituye el fillRect por célula del driver de la feature 15 por una única
// escritura de píxeles por frame: construye un ImageData rellenado por
// bloques de celda y lo vuelca con un solo putImageData (REQ-16-03). Pinta a
// media resolución (RENDER_SCALE 2, REQ-16-04): cada celda del autómata
// ocupa cellSize/RENDER_SCALE px del backing store y el CSS (width/height
// 100% en game-of-life.css) escala el lienzo al viewport. Sin dependencias
// externas y ≤100 líneas (reglas 2 y 12).

import type { Cell } from './game-of-life.ts';

/** Factor de escala interna del canvas: media resolución (REQ-16-04). */
export const RENDER_SCALE = 2;

export class GolRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GolRenderError';
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const digits = hex.replace('#', '');
  const full = digits.length === 3 ? digits.split('').map((c) => c + c).join('') : digits;
  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new GolRenderError(`gol-render: color de acento inválido "${hex}"`);
  }
  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  grid: readonly Cell[][],
  cellSize: number,
  accent: string,
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const img = ctx.createImageData(width, height);
  const data = img.data;
  const block = Math.max(1, Math.floor(cellSize / RENDER_SCALE));
  const [red, green, blue] = hexToRgb(accent);

  for (let row = 0; row < grid.length; row++) {
    const y0 = row * block;
    const y1 = Math.min(y0 + block, height);
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 1) continue;
      const x0 = col * block;
      const x1 = Math.min(x0 + block, width);
      for (let y = y0; y < y1; y++) {
        let offset = (y * width + x0) * 4;
        for (let x = x0; x < x1; x++, offset += 4) {
          data[offset] = red;
          data[offset + 1] = green;
          data[offset + 2] = blue;
          data[offset + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(img, 0, 0);
}
