// Parseo y validación de src/data/hero-cards.json (REQ-90-04..08, feature 90; category
// REQ-98-05..07, feature 98; featured REQ-99-03/04, feature 99). Módulo hermano de hero-cards-repository.ts para mantener ambos
// en <=100 líneas (precedente about-parse.ts). Todo fallo lanza HeroCardsDataError nombrando
// hero-cards.json, el índice de la tarjeta y el campo o valor culpable.

import {
  HERO_CARD_CATEGORIES,
  HERO_CARD_KINDS,
  type HeroCard,
  type HeroGridCard,
  type HeroRichCard,
} from '../entities/hero-card.ts';

export class HeroCardsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeroCardsDataError';
  }
}

type Entry = Record<string, unknown>;

export function parseHeroCards(data: unknown): HeroGridCard[] {
  if (!Array.isArray(data)) {
    throw new HeroCardsDataError('hero-cards.json: el contenido no es un arreglo de tarjetas');
  }
  return data.map((entry, index) => {
    const card = asCard(entry, index);
    const kind = readOption(card, 'kind', HERO_CARD_KINDS, index);
    return kind === 'icon' ? parseIconCard(card, index) : parseRichCard(card, kind, index);
  });
}

// Campo de catálogo cerrado: ausente = primer valor del catálogo (kind icon, category tech).
function readOption<T extends string>(card: Entry, field: string, options: readonly T[], index: number): T {
  if (!(field in card)) return options[0];
  const value = card[field];
  if (!options.includes(value as T)) {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} declara un ${field} inválido "${String(value)}"`,
    );
  }
  return value as T;
}

function parseIconCard(card: Entry, index: number): HeroCard {
  return {
    id: expectString(card, 'id', index),
    kind: 'icon',
    title: expectString(card, 'title', index),
    colorToken: expectString(card, 'colorToken', index),
    icon: expectString(card, 'icon', index),
    category: readOption(card, 'category', HERO_CARD_CATEGORIES, index),
    featured: 'featured' in card ? (expectType(card, 'featured', index, 'boolean') as boolean) : false,
    rotate: expectNumber(card, 'rotate', index),
    scale: expectNumber(card, 'scale', index),
    iconWidth: expectString(card, 'iconWidth', index),
  };
}

function parseRichCard(card: Entry, kind: HeroRichCard['kind'], index: number): HeroRichCard {
  return {
    id: expectString(card, 'id', index),
    kind,
    title: expectString(card, 'title', index),
    colorToken: expectString(card, 'colorToken', index),
  };
}

function asCard(entry: unknown, index: number): Entry {
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

function expectString(card: Entry, field: string, index: number): string {
  return expectType(card, field, index, 'string') as string;
}

function expectNumber(card: Entry, field: string, index: number): number {
  return expectType(card, field, index, 'number') as number;
}
