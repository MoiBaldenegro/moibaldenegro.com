// Repositorio del dominio: perfil del hero (REQ-05-03, feature 5 hero-profile-domain).
// Única vía de acceso a src/data/hero.json; entrega la entidad HeroProfile.
// Si el JSON no existe, no es JSON válido o no tiene la forma del perfil,
// lanza HeroProfileDataError (REQ-05-04): nunca falla en silencio.

import rawJsonData from '../../data/hero.json?raw';
import type { HeroProfile } from '../entities/hero-profile.ts';

export class HeroProfileDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeroProfileDataError';
  }
}

export class HeroProfileRepository {
  private readonly rawData: string;

  constructor(rawData: string = rawJsonData) {
    this.rawData = rawData;
  }

  getProfile(): HeroProfile {
    return parseHeroProfile(this.readJson());
  }

  private readJson(): unknown {
    if (!this.rawData || this.rawData.trim() === '') {
      throw new HeroProfileDataError(
        'hero.json: no se pudo leer el perfil (contenido vacío)',
      );
    }
    try {
      return JSON.parse(this.rawData);
    } catch {
      throw new HeroProfileDataError('hero.json: el archivo no es un JSON válido');
    }
  }
}

function parseHeroProfile(data: unknown): HeroProfile {
  const record = asRecord(data);
  expectString(record, 'name');
  expectString(record, 'username');
  expectBoolean(record, 'verified');
  expectString(record, 'image');
  expectString(record, 'description');
  return {
    name: record.name as string,
    username: record.username as string,
    verified: record.verified as boolean,
    image: record.image as string,
    description: record.description as string,
  };
}

function asRecord(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new HeroProfileDataError('hero.json: el contenido no es un objeto de perfil');
  }
  return data as Record<string, unknown>;
}

function expectString(record: Record<string, unknown>, field: string): void {
  if (typeof record[field] !== 'string') {
    throw new HeroProfileDataError(`hero.json: el campo "${field}" debe ser un texto`);
  }
}

function expectBoolean(record: Record<string, unknown>, field: string): void {
  if (typeof record[field] !== 'boolean') {
    throw new HeroProfileDataError(`hero.json: el campo "${field}" debe ser verdadero o falso`);
  }
}