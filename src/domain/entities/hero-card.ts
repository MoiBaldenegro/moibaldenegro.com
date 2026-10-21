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

// Catálogo cerrado de tamaños del logo de fondo (REQ-108-01, feature 108); md = geometría de la feature 105.
export const HERO_BACKDROP_SIZES = ['sm', 'md', 'lg'] as const;

export type HeroBackdropSize = (typeof HERO_BACKDROP_SIZES)[number];

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
  // Visible en móvil (<= 768 px) o no (REQ-106-01, feature 106); el parse lo rellena si el JSON lo omite.
  readonly showOnMobile: boolean;
  // Liga de la card (REQ-107-01, feature 107): https://… externa o /ruta interna; null = card no clicable.
  readonly href: string | null;
  // Logos extra opcionales y decorativos (REQ-103-01, feature 103): esquina superior derecha y
  // fondo inferior de baja opacidad; si el JSON los omite, la clave no existe y la card queda como antes.
  readonly cornerIcon?: string;
  readonly backgroundIcon?: string;
  // Tamaño del logo de fondo (REQ-108-01..03, feature 108): solo con backgroundIcon; ausente = sin clave (md en CSS).
  readonly backgroundIconSize?: HeroBackdropSize;
}

// Tarjeta rica (otro diseño o con datos propios) que hereda las reglas del grid.
export interface HeroRichCard {
  readonly id: string;
  readonly kind: Exclude<HeroCardKind, 'icon'>;
  readonly title: string;
  readonly colorToken: string;
  readonly showOnMobile: boolean;
  readonly href: string | null;
  // Logos bajo el contenido (REQ-112-01, feature 112): cubo con el hover de las de icono y logo de fondo; ausente = sin clave.
  readonly icon?: string;
  readonly backgroundIcon?: string;
  readonly backgroundIconSize?: HeroBackdropSize;
}

// Unión que entrega HeroCardsRepository.getCards() (REQ-90-04).
export type HeroGridCard = HeroCard | HeroRichCard;
