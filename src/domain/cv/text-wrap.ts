// Partición de texto en líneas para el CV en PDF (REQ-81-07/08, feature 81).
// Puro: la anchura la da `measure` (inyectable; en el PDF, la métrica de la
// fuente a un tamaño dado). Sin dependencias de pdf-lib.

// Anchura de un texto en puntos.
export type TextMeasure = (text: string) => number;

// Parte `text` por espacios en líneas cuya anchura no supera `maxWidth`. Una
// palabra más ancha que `maxWidth` queda sola en su línea, sin cortarla.
// Unir las líneas con un espacio reproduce el texto (espacios ya colapsados).
export function wrapText(text: string, maxWidth: number, measure: TextMeasure): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ').filter((w) => w !== '')) {
    const candidate = current === '' ? word : `${current} ${word}`;
    if (current !== '' && measure(candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}
