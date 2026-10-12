// Maqueta pura del CV en PDF (REQ-81-09/11/13, feature 81 cv-pdf-endpoint).
// Convierte los bloques de cv-sections.ts en páginas A4 con operaciones de
// texto {text, x, y, size, bold}. No importa pdf-lib: la métrica de la fuente
// llega inyectada en `measure` y el adaptador cv-pdf.ts dibuja el resultado.

import type { AboutProfile } from '../entities/about-profile.ts';
import type { HeroProfile } from '../entities/hero-profile.ts';
import { cvSections, type CvBlock } from './cv-sections.ts';
import { wrapText } from './text-wrap.ts';
import { toWinAnsi } from './win-ansi.ts';

export const PAGE_WIDTH = 595.28;
export const PAGE_HEIGHT = 841.89;
export const MARGIN = 48;
const LEADING = 1.35;

// Anchura en puntos de `text` con la fuente regular o negrita a `size`.
export type CvMeasure = (text: string, size: number, bold: boolean) => number;

export interface CvTextOp {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly bold: boolean;
}

export interface CvPage {
  readonly width: number;
  readonly height: number;
  readonly ops: readonly CvTextOp[];
}

interface Placed {
  readonly block: CvBlock;
  readonly lines: readonly { readonly text: string; readonly x: number }[];
}

// Parte cada bloque en líneas (texto ya en WinAnsi) con su x; las líneas de
// continuación de una viñeta se sangran con la anchura de '• '.
function place(block: CvBlock, measure: CvMeasure): Placed {
  const bold = block.bold ?? false;
  const hang = block.bullet ? measure('• ', block.size, bold) : 0;
  const width = PAGE_WIDTH - 2 * MARGIN - hang;
  const lines = wrapText(toWinAnsi(block.text), width, (t) => measure(t, block.size, bold));
  return { block, lines: lines.map((text, i) => ({ text, x: MARGIN + (i === 0 ? 0 : hang) })) };
}

const lineHeight = (block: CvBlock) => block.size * LEADING;
const blockHeight = (p: Placed) => (p.block.gapBefore ?? 0) + p.lines.length * lineHeight(p.block);

// Altura que debe caber junto: el bloque, los encadenados con keepWithNext y
// la primera línea del bloque que los sigue.
function keptHeight(placed: readonly Placed[], index: number): number {
  let height = 0;
  let i = index;
  for (; i < placed.length && placed[i].block.keepWithNext; i++) height += blockHeight(placed[i]);
  if (i < placed.length) height += i === index ? blockHeight(placed[i]) : lineHeight(placed[i].block);
  return height;
}

export function layoutCv(hero: HeroProfile, about: AboutProfile, measure: CvMeasure): CvPage[] {
  const top = PAGE_HEIGHT - MARGIN;
  const placed = cvSections(hero, about).map((block) => place(block, measure)).filter((p) => p.lines.length > 0);
  const pages: CvTextOp[][] = [[]];
  let cursor = top;
  const newPage = () => {
    pages.push([]);
    cursor = top;
  };
  placed.forEach((p, index) => {
    const { block } = p;
    if (cursor < top && block.keepWithNext && cursor - keptHeight(placed, index) < MARGIN) newPage();
    if (cursor < top) cursor -= block.gapBefore ?? 0;
    for (const line of p.lines) {
      if (cursor - block.size < MARGIN) newPage();
      const y = cursor - block.size;
      const text = toWinAnsi(line.text);
      if (text !== '') pages[pages.length - 1].push({ text, x: line.x, y, size: block.size, bold: block.bold ?? false });
      cursor -= lineHeight(block);
    }
  });
  return pages.map((ops) => ({ width: PAGE_WIDTH, height: PAGE_HEIGHT, ops }));
}
