// Repositorio del dominio: tarjetas del hero (REQ-06-03, feature 6 hero-cards-domain).
// Única vía de acceso a src/data/hero-cards.json; entrega las entidades HeroCard.
// Si el JSON no existe, no es JSON válido o no tiene la forma de las tarjetas,
// lanza HeroCardsDataError (REQ-06-05): nunca falla en silencio.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { HeroCard } from '../entities/hero-card.ts';

// Ruta por defecto contra la raíz del proyecto (no import.meta.url): en el
// prerender de Astro el bundle vive en dist/.prerender y las rutas relativas
// al módulo ya no resuelven a src/data (REQ-09-04, feature 9).
const DEFAULT_DATA_URL = pathToFileURL(join(process.cwd(), 'src', 'data', 'hero-cards.json'));

export class HeroCardsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeroCardsDataError';
  }
}

export class HeroCardsRepository {
  private readonly dataUrl: URL;

  constructor(dataUrl: URL = DEFAULT_DATA_URL) {
    this.dataUrl = dataUrl;
  }

  getCards(): HeroCard[] {
    return parseHeroCards(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try {
      raw = readFileSync(this.dataUrl, 'utf-8');
    } catch {
      throw new HeroCardsDataError(
        `hero-cards.json: no se pudieron leer las tarjetas desde "${this.dataUrl.pathname}"`,
      );
    }
    try {
      return JSON.parse(raw);
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
