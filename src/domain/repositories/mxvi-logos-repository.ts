// Repositorio del dominio: logos MXVI de la cinta de la home (REQ-05-07..10, feature 5).
// Única vía de acceso a src/data/mxvi-logos.json; entrega entidades MxviLogo en el
// orden del JSON. Loader inyectable () => string cuyo default materializa el JSON con
// un import con atributo (patrón de promo-tiles-repository.ts): apto para prerender.
// Si el loader falla, el JSON es inválido o no tiene la forma esperada, lanza
// MxviLogosDataError (validación en mxvi-logos-parse.ts): nunca falla en silencio.

import mxviLogosJson from '../../data/mxvi-logos.json' with { type: 'json' };
import type { MxviLogo } from '../entities/mxvi-logo.ts';
import { MxviLogosDataError, parseMxviLogos } from './mxvi-logos-parse.ts';

export { MxviLogosDataError };

// Contrato del loader inyectable: entrega el contenido CRUDO como texto (REQ-05-08).
export type MxviLogosJsonLoader = () => string;

// Única materialización del import con atributo en el default del loader.
const DEFAULT_RAW = JSON.stringify(mxviLogosJson);

export class MxviLogosRepository {
  private readonly load: MxviLogosJsonLoader;

  constructor(load: MxviLogosJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getLogos(): readonly MxviLogo[] {
    return parseMxviLogos(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try {
      raw = this.load();
    } catch {
      throw new MxviLogosDataError('mxvi-logos.json: no se pudieron leer los logos');
    }
    try {
      return JSON.parse(raw);
    } catch {
      throw new MxviLogosDataError('mxvi-logos.json: el archivo no es un JSON válido');
    }
  }
}
