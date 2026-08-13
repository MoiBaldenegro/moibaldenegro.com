// Repositorio del dominio: perfil del hero (REQ-31-01..08, feature 31).
// Única vía de acceso a src/data/hero.json; entrega la entidad HeroProfile.
// Lee el contenido crudo con un loader inyectable () => string cuyo default
// materializa el JSON con un import con atributo (patrón canónico verificado
// en progress/research/lectura-json-sin-nodefs.md): sin módulos node ni el
// sufijo de raw de Vite, el prerender podrá ejecutarse en workerd (REQ-31-03).
// Si el loader falla, el contenido no es JSON válido o no tiene la forma del
// perfil, lanza HeroProfileDataError (REQ-31-06): nunca falla en silencio.

import heroJson from '../../data/hero.json' with { type: 'json' };
import type { HeroProfile } from '../entities/hero-profile.ts';

// Contrato del loader inyectable: entrega el contenido CRUDO como texto.
export type HeroProfileJsonLoader = () => string;

// Única materialización del import con atributo en el default del loader.
const DEFAULT_RAW = JSON.stringify(heroJson);

export class HeroProfileDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeroProfileDataError';
  }
}

export class HeroProfileRepository {
  private readonly load: HeroProfileJsonLoader;

  constructor(load: HeroProfileJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getProfile(): HeroProfile {
    return parseHeroProfile(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try {
      raw = this.load();
    } catch {
      throw new HeroProfileDataError('hero.json: no se pudo leer el perfil');
    }
    try {
      return JSON.parse(raw);
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