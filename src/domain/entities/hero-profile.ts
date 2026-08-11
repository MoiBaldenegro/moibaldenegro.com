// Entidad del dominio: perfil del hero (REQ-05-02, feature 5 hero-profile-domain).
// Tipa los datos de src/data/hero.json. Inmutable: todos los campos son readonly.

export interface HeroProfile {
  readonly name: string;
  readonly username: string;
  readonly verified: boolean;
  readonly image: string;
  readonly description: string;
}
