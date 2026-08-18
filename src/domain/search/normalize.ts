// Normalización del texto de búsqueda (REQ-02-01, feature 2 search-domain).
// Se aplica al término consultado y a los campos del artículo: minúsculas y
// sin diacríticos (NFD, se quitan las marcas combinantes). Con esto
// "Agilismo" == "agilismo" y "diseño" == "diseno".

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
