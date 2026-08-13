// Repositorio del dominio: tarjetas del hero (REQ-31-01..08, feature 31).
// Única vía de acceso a src/data/hero-cards.json; entrega las entidades HeroCard.
// Lee el contenido crudo con un loader inyectable () => string cuyo default
// materializa el JSON con un import con atributo (patrón canónico verificado
// en progress/research/lectura-json-sin-nodefs.md): sin módulos node ni el
// sufijo de raw de Vite, el prerender podrá ejecutarse en workerd (REQ-31-03).
// Si el loader falla, el contenido no es JSON válido o no tiene la forma de
// las tarjetas, lanza HeroCardsDataError (REQ-31-06): nunca falla en silencio.

import heroCardsJson from '../../data/hero-cards.json' with { type: 'json' };
import type { HeroCard } from '../entities/hero-card.ts';

// Contrato del loader inyectable: entrega el contenido CRUDO como texto.
export type HeroCardsJsonLoader = () => string;

// Única materialización del import con atributo en el default del loader.
const DEFAULT_RAW = JSON.stringify(heroCardsJson);

export class HeroCardsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeroCardsDataError';
  }
}

export class HeroCardsRepository {
  private readonly load: HeroCardsJsonLoader;

  constructor(load: HeroCardsJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getCards(): HeroCard[] {
    return parseHeroCards(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try {
      raw = this.load();
    } catch {
      throw new HeroCardsDataError('hero-cards.json: no se pudieron leer las tarjetas');
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