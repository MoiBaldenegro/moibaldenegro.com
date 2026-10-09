// Índice de búsqueda serializado (feature 46 search-index-endpoint,
// REQ-46-02/03). Única función que construye el JSON: la comparten el
// endpoint /search-index.json y las páginas que aún lo embeben (portada,
// /search y /<término>). Los cuerpos markdown se indexan por slug del
// frontmatter (colección unificada, decisión 2026-09-18) y «</script» se
// escapa como «<\/script» (JSON válido) para poder embeberlo en un <script>.
import type { Post } from '../entities/post.ts';
import { buildSearchIndex } from './index.ts';

export interface PostEntryBody {
  readonly data: { readonly slug: string };
  readonly body?: string;
}

export function searchIndexJson(posts: readonly Post[], entries: readonly PostEntryBody[]): string {
  const bodies = Object.fromEntries(entries.map((entry) => [entry.data.slug, entry.body ?? '']));
  return JSON.stringify(buildSearchIndex(posts, bodies)).replace(/<\/script/gi, '<\u005c/script');
}
