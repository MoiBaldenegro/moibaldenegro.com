// Resolución del componente por tipo de tarjeta del grid del hero (REQ-91-01/02,
// feature 91 hero-card-registry). El registro literal vive en el frontmatter de
// src/components/hero-cards/hero-grid-card.astro; aquí solo la elección y el error.

import type { HeroCardKind } from './entities/hero-card.ts';

/** Un kind sin componente registrado: rompe el build en vez de dejar una celda vacía. */
export class HeroCardKindError extends Error {
  constructor(kind: string) {
    super(`hero-grid-card: el tipo de tarjeta "${kind}" no tiene componente registrado`);
    this.name = 'HeroCardKindError';
  }
}

/** Devuelve la entrada del registro asociada al kind o lanza HeroCardKindError. */
export function pickCardComponent<T>(
  registry: Readonly<Partial<Record<HeroCardKind, T>>>,
  kind: HeroCardKind,
): T {
  const component = registry[kind];
  if (component === undefined) throw new HeroCardKindError(kind);
  return component;
}
