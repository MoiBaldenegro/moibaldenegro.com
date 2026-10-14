// Repositorio del dominio: tarjetas del hero (REQ-31-01..08, feature 31; tipos
// de tarjeta REQ-90-04..08, feature 90).
// Única vía de acceso a src/data/hero-cards.json; entrega la unión HeroGridCard
// (tarjetas de icono y tarjetas ricas) en el orden del JSON.
// Lee el contenido crudo con un loader inyectable () => string cuyo default
// materializa el JSON con un import con atributo (patrón canónico verificado
// en progress/research/lectura-json-sin-nodefs.md): sin módulos node ni el
// sufijo de raw de Vite, el prerender podrá ejecutarse en workerd (REQ-31-03).
// Si el loader falla, el contenido no es JSON válido o no tiene la forma de
// las tarjetas, lanza HeroCardsDataError (REQ-31-06, validación en
// hero-cards-parse.ts): nunca falla en silencio.

import heroCardsJson from '../../data/hero-cards.json' with { type: 'json' };
import type { HeroGridCard } from '../entities/hero-card.ts';
import { HeroCardsDataError, parseHeroCards } from './hero-cards-parse.ts';

export { HeroCardsDataError };

// Contrato del loader inyectable: entrega el contenido CRUDO como texto.
export type HeroCardsJsonLoader = () => string;

// Única materialización del import con atributo en el default del loader.
const DEFAULT_RAW = JSON.stringify(heroCardsJson);

export class HeroCardsRepository {
  private readonly load: HeroCardsJsonLoader;

  constructor(load: HeroCardsJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getCards(): HeroGridCard[] {
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
