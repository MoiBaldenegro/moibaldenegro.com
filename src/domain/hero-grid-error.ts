// Error del motor del mosaico del hero (Decisión 4 de specs/01_hero-grid-explicit-rows/design.md):
// vive en su propio módulo para que hero-grid-rows.ts pueda lanzarlo sin crear un ciclo de imports;
// hero-grid-layout.ts lo re-exporta para no romper a sus importadores.

export class HeroGridLayoutError extends Error {
  constructor(message: string) {
    super(`hero-grid-layout: ${message}`);
    this.name = 'HeroGridLayoutError';
  }
}
