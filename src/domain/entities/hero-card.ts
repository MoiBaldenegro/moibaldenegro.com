// Entidad del dominio: tarjeta del hero (REQ-06-02, feature 6 hero-cards-domain).
// Tipa las tarjetas de src/data/hero-cards.json. Inmutable: todos los campos
// son readonly. colorToken referencia el token de marca --color-marca-<token>
// de src/styles/tokens.css (Decisión 1 de specs/04_hero-cards-styles/design.md),
// sin valores hex en los datos (REQ-06-04).

export interface HeroCard {
  readonly id: string;
  readonly title: string;
  readonly colorToken: string;
  readonly icon: string;
  readonly gridColumn: string;
  readonly gridRow: string;
  readonly rotate: number;
  readonly scale: number;
  readonly iconWidth: string;
}
