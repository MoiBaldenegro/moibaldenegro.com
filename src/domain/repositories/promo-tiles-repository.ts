// Repositorio del dominio: cuadros de la sección promocional (REQ-04-04/05, feature 4).
// Única vía de acceso a src/data/promo-tiles.json; entrega entidades PromoTile en el
// orden del JSON. Loader inyectable () => string cuyo default materializa el JSON con
// un import con atributo (patrón de about-repository.ts): apto para prerender en workerd.
// Si el loader falla, el JSON es inválido o no tiene la forma esperada, lanza
// PromoTilesDataError (validación en promo-tiles-parse.ts): nunca falla en silencio.

import promoTilesJson from '../../data/promo-tiles.json' with { type: 'json' };
import type { PromoTile } from '../entities/promo-tile.ts';
import { PromoTilesDataError, parsePromoTiles } from './promo-tiles-parse.ts';

export { PromoTilesDataError };

// Contrato del loader inyectable: entrega el contenido CRUDO como texto.
export type PromoTilesJsonLoader = () => string;

// Única materialización del import con atributo en el default del loader.
const DEFAULT_RAW = JSON.stringify(promoTilesJson);

export class PromoTilesRepository {
  private readonly load: PromoTilesJsonLoader;

  constructor(load: PromoTilesJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getTiles(): readonly PromoTile[] {
    return parsePromoTiles(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try {
      raw = this.load();
    } catch {
      throw new PromoTilesDataError('promo-tiles.json: no se pudieron leer los cuadros');
    }
    try {
      return JSON.parse(raw);
    } catch {
      throw new PromoTilesDataError('promo-tiles.json: el archivo no es un JSON válido');
    }
  }
}
