// Entidad del dominio: cuadro de la sección promocional de la home (REQ-04-03, feature 4).
// Tipa los datos de src/data/promo-tiles.json. Inmutable: campos y enlaces readonly.

export interface PromoTileLink {
  readonly label: string;
  readonly href: string;
}

export interface PromoTile {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly image: string;
  readonly imageAlt: string;
  // Tono de fondo: el CSS lo resuelve a var(--color-promo-<tone>) (REQ-04-15).
  readonly tone: string;
  readonly primary: PromoTileLink;
  readonly secondary: PromoTileLink;
}
