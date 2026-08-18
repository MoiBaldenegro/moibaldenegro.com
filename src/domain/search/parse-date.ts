// Conversión de la fecha de publicación (REQ-02-05, feature 2 search-domain).
// El campo created de Post es texto español (p. ej. "10 Agosto 2026"): se
// convierte a un valor comparable YYYY-MM-DD (ordenable léxicamente). Una
// fecha ausente o inválida devuelve '' (REQ-02-08: campo ausente = texto
// vacío) y, al ordenar descendente, queda al final.

import { normalizeText } from './normalize.ts';

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const DATE_PATTERN = /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{4})$/;

export function parseSpanishDate(text: string): string {
  const match = DATE_PATTERN.exec(text.trim());
  if (match === null) return '';
  const day = Number(match[1]);
  const month = MONTHS.indexOf(normalizeText(match[2]));
  const year = Number(match[3]);
  if (month === -1 || day < 1 || day > 31 || year < 1) return '';
  const dd = String(day).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');
  return `${String(year).padStart(4, '0')}-${mm}-${dd}`;
}
