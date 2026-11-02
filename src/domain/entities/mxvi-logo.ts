// Entidad del dominio: logo MXVI de la cinta entre el hero y los artículos (REQ-05-06, feature 5).
// Tipa los datos de src/data/mxvi-logos.json. Inmutable: todos los campos readonly.

export interface MxviLogo {
  // Id del symbol en public/assets/svg/sprite.svg (p. ej. "mxvi-m").
  readonly id: string;
  readonly letter: string;
  // viewBox del symbol con la forma "0 0 <ancho> <alto>" (REQ-05-13).
  readonly viewBox: string;
  // Destino del enlace: siempre externo, empieza por https:// (REQ-05-12).
  readonly href: string;
  // Nombre accesible del enlace (aria-label).
  readonly label: string;
}
