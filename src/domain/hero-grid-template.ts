// Plantillas del mosaico del hero (REQ-99-05/06, feature 99 hero-os-panel-mosaic; mapa en
// specs/99_hero-os-panel-mosaic/design.md). Módulo hermano de hero-grid-layout.ts para mantener
// ambos en <=100 líneas. Cada hueco declara su tamaño (columnas x filas) y si es grande: los grandes
// reciben las tecnologías con featured y los pequeños el resto (panel de sistema operativo).

export interface HeroGridSlot {
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly large: boolean;
}

const slot = (colSpan: number, rowSpan: number, large = false): HeroGridSlot => ({ colSpan, rowSpan, large });

// Zona superior (columnas 6-12 x filas 1-6): 5x4, 2x2, 2x2, 2x2 y 5x2; el quinto hueco es el grande.
export const TOP_SLOTS: readonly HeroGridSlot[] = [slot(5, 4), slot(2, 2), slot(2, 2), slot(2, 2), slot(5, 2, true)];

// Filas inferiores de 2 filas de alto: 4-2-2-2-2 en las de índice par y 2-2-4-2-2 en las impares,
// con la doble (4 columnas) como hueco grande; así ningún par de filas repite el patrón del siguiente.
const ROW_PATTERNS: readonly (readonly HeroGridSlot[])[] = [
  [slot(4, 2, true), slot(2, 2), slot(2, 2), slot(2, 2), slot(2, 2)],
  [slot(2, 2), slot(2, 2), slot(4, 2, true), slot(2, 2), slot(2, 2)],
];

export const ROW_LENGTH = 5;

/** Secuencia de huecos para `count` tarjetas: zona superior y filas inferiores alternas. */
export function buildSlots(count: number): HeroGridSlot[] {
  const rows = Math.ceil(Math.max(0, count - TOP_SLOTS.length) / ROW_LENGTH);
  const bottom = Array.from({ length: rows }, (_, index) => ROW_PATTERNS[index % ROW_PATTERNS.length]).flat();
  return [...TOP_SLOTS, ...bottom].slice(0, count);
}
