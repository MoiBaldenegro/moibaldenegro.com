// Franjas declaradas del mosaico del hero (REQ-01-07..13, feature 1 hero-grid-explicit-rows; mapa en
// specs/01_hero-grid-explicit-rows/design.md). Agrupa las tarjetas de icono que declaran el mismo "row" y
// valida cada franja: cinco tarjetas exactas, una featured exacta y las redes sociales solo en la última
// franja. Módulo hermano de hero-grid-layout.ts (Decisión 4): el error vive en hero-grid-error.ts para que
// este módulo pueda lanzarlo sin crear un ciclo de imports.

import type { HeroCard } from './entities/hero-card.ts';
import { HeroGridLayoutError } from './hero-grid-error.ts';
import { ROW_LENGTH } from './hero-grid-template.ts';

export interface HeroRow {
  readonly row: number;
  readonly cards: readonly HeroCard[];
}

/** Agrupa por el valor de "row" las tarjetas que lo declaran, en orden ascendente de franja. */
export function groupRows(cards: readonly HeroCard[]): readonly HeroRow[] {
  const grouped = new Map<number, HeroCard[]>();
  for (const card of cards) {
    if (card.row === undefined) continue;
    const list = grouped.get(card.row) ?? [];
    list.push(card);
    grouped.set(card.row, list);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, cards]) => ({ row, cards }));
}

/** Separa la única tarjeta featured del resto; lanza HeroGridLayoutError si no hay exactamente una. */
export function splitFeatured(
  cards: readonly HeroCard[],
  zone: string,
): { featured: HeroCard; others: readonly HeroCard[] } {
  const featured = cards.filter((card) => card.featured);
  if (featured.length !== 1) {
    throw new HeroGridLayoutError(`${zone} tiene ${featured.length} tarjetas con featured y necesita una`);
  }
  return { featured: featured[0], others: cards.filter((card) => !card.featured) };
}

/** Valida las franjas declaradas (REQ-01-10/11) y las redes sociales (REQ-01-12/13). */
export function validateRows(rows: readonly HeroRow[], top: readonly HeroCard[]): void {
  for (const row of rows) {
    if (row.cards.length !== ROW_LENGTH) {
      throw new HeroGridLayoutError(
        `la fila ${row.row} tiene ${row.cards.length} tarjetas y debe tener ${ROW_LENGTH}`,
      );
    }
  }
  const socials = [...top, ...rows.flatMap((row) => row.cards)].filter((card) => card.category === 'social');
  const flagged = socials.find((card) => card.featured);
  if (flagged) {
    throw new HeroGridLayoutError(`la red social "${flagged.id}" declara featured y no puede ir en un hueco grande`);
  }
  const last = rows[rows.length - 1];
  if (!last) return;
  const outside = socials.find((card) => card.row !== last.row);
  if (outside) throw new HeroGridLayoutError(`la red social "${outside.id}" queda fuera de la última fila`);
}
