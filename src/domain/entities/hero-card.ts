// Entidad del dominio: tarjeta del hero (REQ-06-02, feature 6 hero-cards-domain;
// tipos de tarjeta REQ-90-01..04, feature 90 hero-card-kinds-domain; category y celda
// calculada por src/domain/hero-grid-layout.ts, REQ-98-05/06, feature 98 hero-mosaic-layout; featured
// marca las tecnologías más relevantes, que van a los huecos grandes, REQ-99-02, feature 99).
// Tipa las tarjetas de src/data/hero-cards.json. Inmutable: todos los campos
// son readonly. colorToken referencia el token de marca --color-marca-<token>
// de src/styles/tokens.css (Decisión 1 de specs/04_hero-cards-styles/design.md),
// sin valores hex en los datos (REQ-06-04).

// Catálogo cerrado de tipos de tarjeta del grid; un tipo nuevo se añade aquí.
export const HERO_CARD_KINDS = ['icon', 'htb'] as const;

export type HeroCardKind = (typeof HERO_CARD_KINDS)[number];

// Catálogo cerrado de categorías de las tarjetas de icono (tech por defecto; social va al final).
export const HERO_CARD_CATEGORIES = ['tech', 'social'] as const;

export type HeroCardCategory = (typeof HERO_CARD_CATEGORIES)[number];

// Tarjeta de icono + título de marca (tipo por defecto cuando el JSON omite kind).
export interface HeroCard {
  readonly id: string;
  readonly kind: 'icon';
  readonly title: string;
  readonly colorToken: string;
  readonly icon: string;
  readonly category: HeroCardCategory;
  readonly featured: boolean;
  readonly rotate: number;
  readonly scale: number;
  readonly iconWidth: string;
}

// Tarjeta rica (otro diseño o con datos propios) que hereda las reglas del grid.
export interface HeroRichCard {
  readonly id: string;
  readonly kind: Exclude<HeroCardKind, 'icon'>;
  readonly title: string;
  readonly colorToken: string;
}

// Unión que entrega HeroCardsRepository.getCards() (REQ-90-04).
export type HeroGridCard = HeroCard | HeroRichCard;
