// Repositorio del dominio: perfil del About (REQ-80-03/04/05, feature 80).
// Única vía de acceso a src/data/about.json; entrega la entidad AboutProfile.
// Lee el contenido crudo con un loader inyectable () => string cuyo default
// materializa el JSON con un import con atributo (mismo patrón que
// hero-profile-repository.ts): sin módulos node, apto para prerender en workerd.
// Si el loader falla, el JSON es inválido o no tiene la forma esperada, lanza
// AboutDataError (validación en about-parse.ts): nunca falla en silencio.

import aboutJson from '../../data/about.json' with { type: 'json' };
import type { AboutProfile } from '../entities/about-profile.ts';
import { AboutDataError, parseAboutProfile } from './about-parse.ts';

export { AboutDataError };

// Contrato del loader inyectable: entrega el contenido CRUDO como texto.
export type AboutJsonLoader = () => string;

// Única materialización del import con atributo en el default del loader.
const DEFAULT_RAW = JSON.stringify(aboutJson);

export class AboutRepository {
  private readonly load: AboutJsonLoader;

  constructor(load: AboutJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getProfile(): AboutProfile {
    return parseAboutProfile(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try {
      raw = this.load();
    } catch {
      throw new AboutDataError('about.json: no se pudo leer el perfil');
    }
    try {
      return JSON.parse(raw);
    } catch {
      throw new AboutDataError('about.json: el archivo no es un JSON válido');
    }
  }
}
