// Colocación del mosaico del hero (REQ-99-05..14, feature 99 hero-os-panel-mosaic, sobre REQ-98-11..14 de la
// feature 98; mapa en specs/99_hero-os-panel-mosaic/design.md). Recorre los huecos de la plantilla
// (src/domain/hero-grid-template.ts): llena los primeros con las personalizadas, los grandes con las
// tecnologías featured y los pequeños con el resto de tecnologías y después las redes (orden del JSON en
// cada cola), y calcula la celda de inicio que produce el auto-placement disperso de CSS Grid. El marcado
// solo emite el tamaño (data-col-span/data-row-span). Si el mosaico no cierra, lanza HeroGridLayoutError.

import type { HeroCard, HeroGridCard } from './entities/hero-card.ts';
import { buildSlots, ROW_LENGTH, TOP_SLOTS, type HeroGridSlot } from './hero-grid-template.ts';

export interface PlacedHeroCard {
  readonly card: HeroGridCard;
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly column: number;
  readonly row: number;
}

export class HeroGridLayoutError extends Error {
  constructor(message: string) {
    super(`hero-grid-layout: ${message}`);
    this.name = 'HeroGridLayoutError';
  }
}

const GRID_COLUMNS = 12;
// Perfil reservado: refleja profile-card.css (grid-column 1 / span 5, grid-row 1 / span 6).
const PROFILE = { column: 1, row: 1, colSpan: 5, rowSpan: 6 } as const;

/** Ordena, dimensiona y coloca las tarjetas del hero; lanza HeroGridLayoutError si no cierran. */
export function layoutHeroCards(cards: readonly HeroGridCard[]): PlacedHeroCard[] {
  const custom = cards.filter((card) => card.kind !== 'icon');
  if (custom.length > TOP_SLOTS.length) {
    throw new HeroGridLayoutError(
      `hay ${custom.length} tarjetas personalizadas (kind distinto de icon); el máximo es ${TOP_SLOTS.length}`,
    );
  }
  const bottom = Math.max(0, cards.length - TOP_SLOTS.length);
  if (bottom % ROW_LENGTH !== 0) {
    throw new HeroGridLayoutError(
      `se recibieron ${cards.length} tarjetas: las ${bottom} tras la zona superior no completan filas de ${ROW_LENGTH}`,
    );
  }
  const icons = cards.filter((card): card is HeroCard => card.kind === 'icon');
  const social = icons.filter((card) => card.category === 'social');
  const flagged = social.find((card) => card.featured);
  if (flagged) throw new HeroGridLayoutError(`la red social "${flagged.id}" declara featured y no puede ir en un hueco grande`);
  const featured = icons.filter((card) => card.category === 'tech' && card.featured);
  const small = [...icons.filter((card) => card.category === 'tech' && !card.featured), ...social];
  const slots = buildSlots(cards.length);
  const indexes = slots.map((_, index) => index).filter((index) => index >= custom.length);
  const smallIndexes = indexes.filter((index) => !slots[index].large);
  const lastRowStart = slots.length - ROW_LENGTH;
  social.forEach((card, offset) => {
    const index = smallIndexes[small.length - social.length + offset];
    if (index !== undefined && (bottom === 0 || index < lastRowStart)) {
      throw new HeroGridLayoutError(`la red social "${card.id}" queda fuera de la última fila`);
    }
  });
  const large = indexes.length - smallIndexes.length;
  if (featured.length !== large) {
    throw new HeroGridLayoutError(
      `hay ${featured.length} tecnologías con featured y la plantilla tiene ${large} huecos grandes libres`,
    );
  }
  const bigQueue = featured.values();
  const smallQueue = small.values();
  return place(slots.map((slot, index): readonly [HeroGridCard, HeroGridSlot] => {
    if (index < custom.length) return [custom[index], slot];
    return [(slot.large ? bigQueue : smallQueue).next().value as HeroCard, slot];
  }));
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
