// Colocación del mosaico del hero (REQ-99-05..14, feature 99 hero-os-panel-mosaic, sobre REQ-98-11..14 de la
// feature 98; franjas declaradas REQ-01-03..14, feature 1 hero-grid-explicit-rows; mapa en
// specs/01_hero-grid-explicit-rows/design.md). Reparte los huecos de la plantilla (hero-grid-template.ts):
// la zona superior (tarjetas de icono sin "row", con la tarjeta rica) y las franjas declaradas por "row"
// (cinco tarjetas cada una, la featured en el hueco grande). Después calcula la celda de inicio que produce
// el auto-placement disperso de CSS Grid. El marcado solo emite el tamaño (data-col-span/data-row-span).
// Si el mosaico no cierra, lanza HeroGridLayoutError.

import type { HeroCard, HeroGridCard } from './entities/hero-card.ts';
import { HeroGridLayoutError } from './hero-grid-error.ts';
import { groupRows, splitFeatured, validateRows } from './hero-grid-rows.ts';
import { assignToSlots, rowSlots, TOP_SLOTS, type HeroGridSlot } from './hero-grid-template.ts';

export { HeroGridLayoutError };

export interface PlacedHeroCard {
  readonly card: HeroGridCard;
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly column: number;
  readonly row: number;
}

const GRID_COLUMNS = 12;
// Perfil reservado: refleja profile-card.css (grid-column 1 / span 5, grid-row 1 / span 6).
const PROFILE = { column: 1, row: 1, colSpan: 5, rowSpan: 6 } as const;

/** Ordena, dimensiona y coloca las tarjetas del hero; lanza HeroGridLayoutError si no cierran. */
export function layoutHeroCards(cards: readonly HeroGridCard[]): PlacedHeroCard[] {
  const custom = cards.filter((card) => card.kind !== 'icon');
  const icons = cards.filter((card): card is HeroCard => card.kind === 'icon');
  if (custom.length > TOP_SLOTS.length) {
    throw new HeroGridLayoutError(
      `hay ${custom.length} tarjetas personalizadas (kind distinto de icon); el máximo es ${TOP_SLOTS.length}`,
    );
  }
  const top = icons.filter((card) => card.row === undefined);
  const rows = groupRows(icons);
  validateRows(rows, top);
  const topSlots = TOP_SLOTS.slice(custom.length);
  if (top.length !== topSlots.length) {
    throw new HeroGridLayoutError(
      `la zona superior tiene ${top.length} tarjetas de icono y necesita ${topSlots.length}`,
    );
  }
  const zone = splitFeatured(top, 'la zona superior');
  const ordered: readonly (readonly [HeroGridCard, HeroGridSlot])[] = [
    ...custom.map((card, index) => [card, TOP_SLOTS[index]] as const),
    ...assignToSlots(zone.featured, zone.others, topSlots),
    ...rows.flatMap((row) => {
      const split = splitFeatured(row.cards, `la fila ${row.row}`);
      return assignToSlots(split.featured, split.others, rowSlots(row.row));
    }),
  ];
  return place(ordered);
}

// Auto-placement disperso (grid-auto-flow: row): el cursor avanza por columnas y, si la
// tarjeta no cabe en la fila, baja una fila desde la primera columna.
function place(ordered: readonly (readonly [HeroGridCard, HeroGridSlot])[]): PlacedHeroCard[] {
  const taken = new Set<string>();
  const cells = (column: number, row: number, width: number, height: number): string[] =>
    Array.from({ length: width * height }, (_, i) => `${column + (i % width)}:${row + Math.floor(i / width)}`);
  cells(PROFILE.column, PROFILE.row, PROFILE.colSpan, PROFILE.rowSpan).forEach((cell) => taken.add(cell));
  let column = 1;
  let row = 1;
  return ordered.map(([card, { colSpan, rowSpan }]) => {
    while (!fits(cells(column, row, colSpan, rowSpan), taken, column + colSpan - 1)) {
      if (column + colSpan - 1 < GRID_COLUMNS) column += 1;
      else { row += 1; column = 1; }
    }
    cells(column, row, colSpan, rowSpan).forEach((cell) => taken.add(cell));
    return { card, colSpan, rowSpan, column, row };
  });
}

function fits(area: readonly string[], taken: ReadonlySet<string>, lastColumn: number): boolean {
  return lastColumn <= GRID_COLUMNS && area.every((cell) => !taken.has(cell));
}
