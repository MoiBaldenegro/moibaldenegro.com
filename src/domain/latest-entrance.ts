// Animación de entrada de las cards de últimos artículos (feature 75). Funciones puras, sin GSAP
// ni DOM: el runtime (latest-horizontal.ts) y los tests usan la misma curva y los mismos estados.
// Mientras la sección se acerca (del borde inferior del viewport hasta «top top», justo donde
// empieza el tramo fijado de la feature 73), el track baja desde arriba, crece de 0,9 a 1 y
// aparece; el ease cúbico de salida frena hasta velocidad 0, así que se «clava» sin rebote.

export interface EntranceState { y: number; scale: number; opacity: number }

const FINAL: EntranceState = Object.freeze({ y: 0, scale: 1, opacity: 1 });
const validHeight = (vh: number): boolean => Number.isFinite(vh) && vh > 0;

/** Ease cúbica de salida 1 − (1 − p)³ con p acotado a [0, 1]; un valor no finito da 1 (estado final). */
export function entranceEase(progress: number): number {
  if (!Number.isFinite(progress)) return 1;
  const p = Math.min(1, Math.max(0, progress));
  return 1 - (1 - p) ** 3;
}

/** Distancia vertical desde la que entra el track: 40 % del alto del viewport (0 si no es válido). */
export function entranceDistance(viewportHeight: number): number {
  return validHeight(viewportHeight) ? (viewportHeight * 4) / 10 : 0;
}

/** Estado del track para un progreso de entrada; con progreso ≥ 1 es exactamente { y: +0, scale: 1, opacity: 1 }. */
export function entranceState(progress: number, viewportHeight: number): EntranceState {
  if (!validHeight(viewportHeight)) return { ...FINAL };
  const rest = 1 - entranceEase(progress);
  return { y: 0 - entranceDistance(viewportHeight) * rest, scale: 1 - 0.1 * rest, opacity: 1 - rest };
}

/** Progreso de la entrada para un scroll: 0 cuando el envoltorio asoma por abajo, 1 en «top top». */
export function entranceProgress(scrollY: number, wrapperTop: number, viewportHeight: number): number {
  if (!validHeight(viewportHeight) || !Number.isFinite(scrollY) || !Number.isFinite(wrapperTop)) return 1;
  return Math.min(1, Math.max(0, (scrollY - wrapperTop + viewportHeight) / viewportHeight));
}
