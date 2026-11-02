// Parseo y validación de src/data/promo-tiles.json (REQ-04-05..07, feature 4).
// Módulo hermano de promo-tiles-repository.ts para mantener ambos en <=100 líneas.
// Todo fallo lanza PromoTilesDataError nombrando promo-tiles.json, el cuadro y el campo.

import type { PromoTile, PromoTileLink } from '../entities/promo-tile.ts';

export class PromoTilesDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromoTilesDataError';
  }
}

type Data = Record<string, unknown>;

const TILE_COUNT = 4;
const TEXTS = ['id', 'title', 'subtitle', 'image', 'imageAlt', 'tone'] as const;
const LINKS = ['primary', 'secondary'] as const;
const HREF_PREFIXES = ['/', 'https://'];

const fail = (detail: string): never => {
  throw new PromoTilesDataError(`promo-tiles.json: ${detail}`);
};

export function parsePromoTiles(data: unknown): readonly PromoTile[] {
  const tiles = isRecord(data) ? data.tiles : undefined;
  if (!Array.isArray(tiles)) fail('falta el array "tiles"');
  const list = tiles as unknown[];
  if (list.length !== TILE_COUNT) {
    fail(`"tiles" debe tener exactamente ${TILE_COUNT} cuadros (tiene ${list.length})`);
  }
  return list.map(parseTile);
}

function parseTile(value: unknown, index: number): PromoTile {
  const where = `tiles[${index}]`;
  if (!isRecord(value)) return fail(`el cuadro ${where} debe ser un objeto`);
  const [id, title, subtitle, image, imageAlt, tone] = TEXTS.map((key) => text(value, key, where));
  const [primary, secondary] = LINKS.map((key) => parseLink(value[key], `${where}.${key}`, where));
  return { id, title, subtitle, image, imageAlt, tone, primary, secondary };
}

function parseLink(value: unknown, path: string, where: string): PromoTileLink {
  if (!isRecord(value)) return fail(`el campo "${path}" del cuadro ${where} debe ser un objeto`);
  const label = text(value, 'label', where, path);
  const href = text(value, 'href', where, path);
  if (!HREF_PREFIXES.some((prefix) => href.startsWith(prefix))) {
    fail(`el campo "${path}.href" del cuadro ${where} debe empezar por "/" o "https://"`);
  }
  return { label, href };
}

function text(record: Data, key: string, where: string, parent?: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') {
    const field = parent ? `${parent}.${key}` : `${where}.${key}`;
    fail(`el campo "${field}" del cuadro ${where} debe ser un texto no vacío`);
  }
  return value as string;
}

function isRecord(value: unknown): value is Data {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
