// src/domain/repositories/hero-cards-repository.ts

// 🟢 Importamos el contenido del JSON como string en tiempo de build via Vite.
// Esto incrusta los datos en el bundle y elimina la dependencia de node:fs/node:path.
import rawJsonData from '../../data/hero-cards.json?raw';
import type { HeroCard } from '../entities/hero-card.ts';

export class HeroCardsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeroCardsDataError';
  }
}

export class HeroCardsRepository {
  private readonly rawData: string;

  constructor(rawData: string = rawJsonData) {
    this.rawData = rawData;
  }

  getCards(): HeroCard[] {
    return parseHeroCards(this.readJson());
  }

  private readJson(): unknown {
    if (!this.rawData || this.rawData.trim() === '') {
      throw new HeroCardsDataError(
        'hero-cards.json: no se pudieron leer las tarjetas (contenido vacío)',
      );
    }
    try {
      return JSON.parse(this.rawData);
    } catch {
      throw new HeroCardsDataError('hero-cards.json: el archivo no es un JSON válido');
    }
  }
}

function parseHeroCards(data: unknown): HeroCard[] {
  if (!Array.isArray(data)) {
    throw new HeroCardsDataError('hero-cards.json: el contenido no es un arreglo de tarjetas');
  }
  return data.map((entry, index) => {
    const card = asCard(entry, index);
    return {
      id: expectString(card, 'id', index),
      title: expectString(card, 'title', index),
      colorToken: expectString(card, 'colorToken', index),
      icon: expectString(card, 'icon', index),
      gridColumn: expectString(card, 'gridColumn', index),
      gridRow: expectString(card, 'gridRow', index),
      rotate: expectNumber(card, 'rotate', index),
      scale: expectNumber(card, 'scale', index),
      iconWidth: expectString(card, 'iconWidth', index),
    };
  });
}

function asCard(entry: unknown, index: number): Record<string, unknown> {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new HeroCardsDataError(`hero-cards.json: la tarjeta ${index} no es un objeto`);
  }
  return entry as Record<string, unknown>;
}

function expectString(card: Record<string, unknown>, field: string, index: number): string {
  if (typeof card[field] !== 'string') {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} tiene un campo "${field}" que debe ser texto`,
    );
  }
  return card[field] as string;
}

function expectNumber(card: Record<string, unknown>, field: string, index: number): number {
  if (typeof card[field] !== 'number') {
    throw new HeroCardsDataError(
      `hero-cards.json: la tarjeta ${index} tiene un campo "${field}" que debe ser número`,
    );
  }
  return card[field] as number;
}