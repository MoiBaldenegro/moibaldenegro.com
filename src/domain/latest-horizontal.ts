// Geometría pura del scroll horizontal de las cards de últimos artículos (feature 71, rehecha en
// la feature 73). Sin GSAP ni acceso al DOM: solo números, testeable con node:test.
// Modelo (73): se ve un PAR de cards de ancho W separadas por G que llena el contenedor y queda
// centrado en la sección de ancho V (margen lateral = pairInset). Al inicio se ven las cards 1 y
// 2; el track se desplaza (n − 2) × (W + G) hasta que se ven las cards n − 1 y n. El scroll
// vertical del tramo fijado es 1:1 con ese recorrido.

const validCount = (count: number): boolean => Number.isInteger(count) && count >= 3;
const validSize = (size: number): boolean => Number.isFinite(size) && size > 0;
const validGap = (gap: number): boolean => Number.isFinite(gap) && gap >= 0;
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const clamp01 = (value: number): number => (Number.isFinite(value) ? clamp(value, 0, 1) : 0);

/** Ancho de cada card del par: la mitad del contenedor menos el gap, limitado por maxWidth (alto del viewport). */
export function pairCardWidth(containerWidth: number, gap: number, maxWidth: number): number {
  if (!validSize(containerWidth) || !validGap(gap) || !validSize(maxWidth)) return 0;
  return Math.min((containerWidth - gap) / 2, maxWidth);
}

/** Margen lateral que centra el par (2 × W + G) en la sección de ancho V; nunca negativo. */
export function pairInset(viewportWidth: number, cardWidth: number, gap: number): number {
  if (!validSize(viewportWidth) || !validSize(cardWidth) || !validGap(gap)) return 0;
  return Math.max(0, (viewportWidth - 2 * cardWidth - gap) / 2);
}

/** Recorrido horizontal del track: (n − 2) × (W + G), o 0 si no aplica (n < 3). */
export function trackTravel(cardWidth: number, gap: number, count: number): number {
  return validCount(count) && validSize(cardWidth) && validGap(gap) ? (count - 2) * (cardWidth + gap) : 0;
}

/** Scroll vertical del tramo fijado: 1:1 con el recorrido horizontal. */
export function pinScrollLength(cardWidth: number, gap: number, count: number): number {
  return trackTravel(cardWidth, gap, count);
}

/** Desplazamiento x del track para un progreso (acotado a [0, 1]). */
export function trackOffset(progress: number, cardWidth: number, gap: number, count: number): number {
  return 0 - clamp01(progress) * trackTravel(cardWidth, gap, count);
}

/** Borde izquierdo de la card `index` relativo a la sección, con el track desplazado `offset`. */
export function cardLeftX(index: number, viewportWidth: number, cardWidth: number, gap: number, offset: number): number {
  return pairInset(viewportWidth, cardWidth, gap) + index * (cardWidth + gap) + offset;
}

/** Scroll del tramo fijado en el que la card `index` queda completa dentro del par visible. */
export function focusScrollTarget(index: number, count: number, start: number, end: number): number {
  if (!validCount(count)) return start;
  const k = clamp(Number.isFinite(index) ? index - 1 : 0, 0, count - 2);
  return start + (k / (count - 2)) * (end - start);
}
