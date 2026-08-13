// Entidad del dominio: perfil de Hack The Box (feature 22 htb-stadistics-section).
// Tipa la respuesta de la API v4 user/profile/basic. Inmutable: todos los campos
// son readonly. Los campos que la API no devuelve llegan a null y la UI muestra
// "N/D" (Decisión 6 del design.md).

export interface HtbProfile {
  readonly name: string | null;
  readonly rank: string | null;
  readonly points: number | null;
  readonly userOwns: number | null;
  readonly systemOwns: number | null;
  readonly countryName: string | null;
  readonly joinedDate: string | null;
}