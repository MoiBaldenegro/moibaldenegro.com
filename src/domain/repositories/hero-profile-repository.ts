// Repositorio del dominio: perfil del hero (REQ-05-03, feature 5 hero-profile-domain).
// Única vía de acceso a src/data/hero.json; entrega la entidad HeroProfile.
// Si el JSON no existe, no es JSON válido o no tiene la forma del perfil,
// lanza HeroProfileDataError (REQ-05-04): nunca falla en silencio.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { HeroProfile } from '../entities/hero-profile.ts';

// Ruta por defecto contra la raíz del proyecto (no import.meta.url): en el
// prerender de Astro el bundle vive en dist/.prerender y las rutas relativas
// al módulo ya no resuelven a src/data (REQ-09-04, feature 9).
const DEFAULT_DATA_URL = pathToFileURL(join(process.cwd(), 'src', 'data', 'hero.json'));

export class HeroProfileDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeroProfileDataError';
  }
}

export class HeroProfileRepository {
  private readonly dataUrl: URL;

  constructor(dataUrl: URL = DEFAULT_DATA_URL) {
    this.dataUrl = dataUrl;
  }

  getProfile(): HeroProfile {
    return parseHeroProfile(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try {
      raw = readFileSync(this.dataUrl, 'utf-8');
    } catch {
      throw new HeroProfileDataError(
        `hero.json: no se pudo leer el perfil desde "${this.dataUrl.pathname}"`,
      );
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