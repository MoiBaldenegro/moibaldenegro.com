// Parseo y validación de src/data/hero-cards.json (REQ-90-04..08, feature 90; category REQ-98-05..07,
// feature 98; featured REQ-99-03/04, feature 99; logos extra REQ-103-02..04, feature 103; showOnMobile
// REQ-106-02..05, feature 106; href REQ-107-02..04, feature 107; backgroundIconSize REQ-108-02..04, feature 108). Módulo hermano de hero-cards-repository.ts para mantener ambos en <=100 líneas
// (precedente about-parse.ts); los lectores de campos viven en hero-cards-fields-parse.ts (REQ-106-07). Todo
// fallo lanza HeroCardsDataError nombrando hero-cards.json, el índice de la tarjeta y el campo o valor culpable.

import {
  HERO_BACKDROP_SIZES,
  HERO_CARD_CATEGORIES,
  HERO_CARD_KINDS,
  type HeroCard,
  type HeroGridCard,
  type HeroRichCard,
} from '../entities/hero-card.ts';
import {
  HeroCardsDataError,
  asCard,
  expectNumber,
  expectString,
  readBackdropSize,
  readBoolean,
  readHref,
  readOption,
  readSpriteRef,
  type Entry,
} from './hero-cards-fields-parse.ts';

export { HeroCardsDataError };

export function parseHeroCards(data: unknown): HeroGridCard[] {
  if (!Array.isArray(data)) {
    throw new HeroCardsDataError('hero-cards.json: el contenido no es un arreglo de tarjetas');
  }
  return data.map((entry, index) => {
    const card = asCard(entry, index);
    const kind = readOption(card, 'kind', HERO_CARD_KINDS, index);
    return kind === 'icon' ? parseIconCard(card, index) : parseRichCard(card, kind, index);
  });
}

// showOnMobile ausente: false en las de icono, true en las ricas (petición humana 2026-10-20, REQ-106-03/04).
function parseIconCard(card: Entry, index: number): HeroCard {
  return {
    id: expectString(card, 'id', index),
    kind: 'icon',
    title: expectString(card, 'title', index),
    colorToken: expectString(card, 'colorToken', index),
    icon: expectString(card, 'icon', index),
    category: readOption(card, 'category', HERO_CARD_CATEGORIES, index),
    featured: readBoolean(card, 'featured', index, false),
    rotate: expectNumber(card, 'rotate', index),
    scale: expectNumber(card, 'scale', index),
    iconWidth: expectString(card, 'iconWidth', index),
    showOnMobile: readBoolean(card, 'showOnMobile', index, false),
    href: readHref(card, index),
    ...readSpriteRef(card, 'cornerIcon', index),
    ...readSpriteRef(card, 'backgroundIcon', index),
    ...readBackdropSize(card, HERO_BACKDROP_SIZES, index),
  };
}

function parseRichCard(card: Entry, kind: HeroRichCard['kind'], index: number): HeroRichCard {
  return {
    id: expectString(card, 'id', index),
    kind,
    title: expectString(card, 'title', index),
    colorToken: expectString(card, 'colorToken', index),
    showOnMobile: readBoolean(card, 'showOnMobile', index, true),
    href: readHref(card, index),
    // Feature 112 (REQ-112-02..05): logos opcionales con los mismos lectores que las de icono.
    ...readSpriteRef(card, 'icon', index),
    ...readSpriteRef(card, 'backgroundIcon', index),
    ...readBackdropSize(card, HERO_BACKDROP_SIZES, index),
  };
}
