// Parseo y validación de src/data/hero-cards.json (REQ-90-04..08, feature 90).
// Módulo hermano de hero-cards-repository.ts para mantener ambos en <=100 líneas
// (precedente about-parse.ts). Todo fallo lanza HeroCardsDataError nombrando
// hero-cards.json, el índice de la tarjeta y el campo o valor culpable.

import {
  HERO_CARD_KINDS,
  type HeroCard,
  type HeroCardKind,
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
    const kind = readKind(card, index);
    return kind === 'icon' ? parseIconCard(card, index) : parseRichCard(card, kind, index);
  });
}

function readKind(card: Entry, index: number): HeroCardKind {
  if (!('kind' in card)) return 'icon';
  const kind = card.kind;
  if (!HERO_CARD_KINDS.includes(kind as HeroCardKind)) {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} declara un kind inválido "${String(kind)}"`,
    );
  }
  return kind as HeroCardKind;
}

function parseIconCard(card: Entry, index: number): HeroCard {
  return {
    id: expectString(card, 'id', index),
    kind: 'icon',
    title: expectString(card, 'title', index),
    colorToken: expectString(card, 'colorToken', index),
    icon: expectString(card, 'icon', index),
    gridColumn: expectString(card, 'gridColumn', index),
    gridRow: expectString(card, 'gridRow', index),
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
    gridColumn: expectString(card, 'gridColumn', index),
    gridRow: expectString(card, 'gridRow', index),
  };
}

function asCard(entry: unknown, index: number): Entry {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new HeroCardsDataError(`hero-cards.json: la tarjeta ${index} no es un objeto`);
  }
  return entry as Entry;
}

function expectString(card: Entry, field: string, index: number): string {
  if (typeof card[field] !== 'string') {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} tiene un campo "${field}" que debe ser texto`,
    );
  }
  return card[field] as string;
}

function expectNumber(card: Entry, field: string, index: number): number {
  if (typeof card[field] !== 'number') {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} tiene un campo "${field}" que debe ser número`,
    );
  }
  return card[field] as number;
}
