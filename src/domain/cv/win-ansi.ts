// Saneado de texto para el CV en PDF (REQ-81-04/05, feature 81 cv-pdf-endpoint).
// Las StandardFonts de pdf-lib (Helvetica) solo codifican WinAnsi (CP1252): con
// cualquier otro carácter (p. ej. el emoji 🦀 de hero.json) pdf-lib lanza al
// dibujar. toWinAnsi elimina lo que no es WinAnsi y colapsa los espacios.

// Caracteres de 0x80-0x9F de CP1252 (el resto es ASCII imprimible y Latin-1).
const CP1252_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';

function isWinAnsi(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || CP1252_EXTRA.includes(char);
}

// Espacios, tabuladores y saltos se normalizan a un espacio simple; el resto de
// caracteres fuera de WinAnsi se elimina. El resultado no lleva espacios en los bordes.
export function toWinAnsi(text: string): string {
  return Array.from(text.replace(/\s/g, ' '))
    .filter(isWinAnsi)
    .join('')
    .replace(/ {2,}/g, ' ')
    .trim();
}
