// Lectores de campos de src/data/hero-cards.json (REQ-106-07, feature 106): módulo hermano de hero-cards-parse.ts
// para mantener ambos en <=100 líneas. Reúne el error del dominio, los lectores de campos obligatorios y los de
// campos opcionales (catálogo cerrado, booleano con valor por defecto y referencia al sprite). Todo fallo lanza
// HeroCardsDataError nombrando hero-cards.json, el índice de la tarjeta y el campo o valor culpable.

export class HeroCardsDataError extends Error {
  constructor(message: string) { super(message); this.name = 'HeroCardsDataError'; }
}

export type Entry = Record<string, unknown>;

export function asCard(entry: unknown, index: number): Entry {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new HeroCardsDataError(`hero-cards.json: la tarjeta ${index} no es un objeto`);
  }
  return entry as Entry;
}

const TYPE_LABELS = { string: 'texto', number: 'número', boolean: 'booleano' } as const;

function expectType(card: Entry, field: string, index: number, type: keyof typeof TYPE_LABELS): unknown {
  if (typeof card[field] !== type) {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} tiene un campo "${field}" que debe ser ${TYPE_LABELS[type]}`,
    );
  }
  return card[field];
}

export const expectString = (card: Entry, field: string, index: number): string => expectType(card, field, index, 'string') as string;
export const expectNumber = (card: Entry, field: string, index: number): number => expectType(card, field, index, 'number') as number;

// Booleano opcional: ausente = fallback; presente y no booleano = HeroCardsDataError (featured, showOnMobile).
export function readBoolean(card: Entry, field: string, index: number, fallback: boolean): boolean {
  return field in card ? (expectType(card, field, index, 'boolean') as boolean) : fallback;
}

// Campo de catálogo cerrado: ausente = primer valor del catálogo (kind icon, category tech).
export function readOption<T extends string>(card: Entry, field: string, options: readonly T[], index: number): T {
  if (!(field in card)) return options[0];
  const value = card[field];
  if (!options.includes(value as T)) {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} declara un ${field} inválido "${String(value)}"`,
    );
  }
  return value as T;
}

// Logo extra opcional: ausente = sin clave (ni siquiera undefined); presente = /assets/svg/sprite.svg#<id>.
// La existencia del symbol en el sprite la valida el test (el repositorio corre en workerd y no lee public/).
const SPRITE_REF = /^\/assets\/svg\/sprite\.svg#\S+$/;
type SpriteRefField = 'cornerIcon' | 'backgroundIcon';
export function readSpriteRef(card: Entry, field: SpriteRefField, index: number): { [K in SpriteRefField]?: string } {
  if (!(field in card)) return {};
  const value = card[field];
  if (typeof value === 'string' && SPRITE_REF.test(value)) return { [field]: value };
  throw new HeroCardsDataError(`hero-cards.json: la tarjeta ${index} tiene un campo "${field}" que debe ser /assets/svg/sprite.svg#<id>`);
}
