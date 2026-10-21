// Plantillas del mosaico del hero (REQ-99-05/06, feature 99 hero-os-panel-mosaic; mapa en
// specs/99_hero-os-panel-mosaic/design.md; franjas declaradas REQ-01-03..09, feature 1
// hero-grid-explicit-rows, mapa en specs/01_hero-grid-explicit-rows/design.md). Módulo hermano de
// hero-grid-layout.ts para mantener ambos en <=100 líneas. Cada hueco declara su tamaño (columnas x filas) y si
// es grande: los grandes reciben la tarjeta featured de su zona o fila y los pequeños el resto.

import type { HeroCard } from './entities/hero-card.ts';

export interface HeroGridSlot {
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly large: boolean;
}

const slot = (colSpan: number, rowSpan: number, large = false): HeroGridSlot => ({ colSpan, rowSpan, large });

// Zona superior (columnas 6-12 x filas 1-6): 5x4, 2x2, 2x2, 2x2 y 5x2; el quinto hueco es el grande.
export const TOP_SLOTS: readonly HeroGridSlot[] = [slot(5, 4), slot(2, 2), slot(2, 2), slot(2, 2), slot(5, 2, true)];

// Franjas de 2 filas de alto: 4-2-2-2-2 en las filas impares y 2-2-4-2-2 en las pares, con la doble (4 columnas)
// como hueco grande; así ningún par de franjas repite el patrón del siguiente (Decisión 3 del design).
const ODD_ROW: readonly HeroGridSlot[] = [slot(4, 2, true), slot(2, 2), slot(2, 2), slot(2, 2), slot(2, 2)];
const EVEN_ROW: readonly HeroGridSlot[] = [slot(2, 2), slot(2, 2), slot(4, 2, true), slot(2, 2), slot(2, 2)];

export const ROW_LENGTH = 5;

/** Huecos de la franja declarada `row`: impar con el grande primero, par con el grande en tercera posición. */
export function rowSlots(row: number): readonly HeroGridSlot[] {
  return row % 2 === 1 ? ODD_ROW : EVEN_ROW;
}

/** Reparte las tarjetas de una zona o franja en sus huecos: la featured toma el grande y las demás los pequeños. */
export function assignToSlots(
  featured: HeroCard,
  others: readonly HeroCard[],
  slots: readonly HeroGridSlot[],
): readonly (readonly [HeroCard, HeroGridSlot])[] {
  let index = 0;
  return slots.map((slot): readonly [HeroCard, HeroGridSlot] => (slot.large ? [featured, slot] : [others[index++], slot]));
}
