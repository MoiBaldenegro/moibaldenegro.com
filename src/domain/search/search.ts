// Motor de búsqueda (REQ-02-02..06, feature 2 search-domain). Coincidencia por
// subcadena del término normalizado (REQ-02-01) en título, descripción, tags
// (unidos sin '#') y cuerpo; orden descendente por fecha YYYY-MM-DD
// (REQ-02-04/05, empates con orden estable de sort); paginación con PAGE_SIZE
// fijo (REQ-02-06). Consulta vacía coincide con todo el catálogo: la vista
// dedicada (feature 3) muestra su guía cuando q falta.

import type { Post } from '../entities/post.ts';
import { normalizeText } from './normalize.ts';
import { buildSearchIndex, type SearchIndexEntry } from './index.ts';

export const PAGE_SIZE = 6;

export interface SearchPage {
  readonly results: readonly SearchIndexEntry[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
}

export function searchPosts(
  posts: readonly Post[],
  bodies: Readonly<Record<string, string>>,
  query: string,
  page: number,
): SearchPage {
  return searchIndex(buildSearchIndex(posts, bodies), query, page);
}

export function searchIndex(
  index: readonly SearchIndexEntry[],
  query: string,
  page: number,
): SearchPage {
  const term = normalizeText(query);
  const matches = index
    .filter((entry) => searchableText(entry).includes(term))
    .sort(byDateDesc);
  const total = matches.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.max(1, Math.floor(page) || 1);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    results: matches.slice(start, start + PAGE_SIZE),
    total,
    totalPages,
    page: safePage,
  };
}

function searchableText(entry: SearchIndexEntry): string {
  return normalizeText(
    `${entry.title} ${entry.description} ${entry.tags.join(' ')} ${entry.body}`,
  );
}

function byDateDesc(a: SearchIndexEntry, b: SearchIndexEntry): number {
  if (a.date < b.date) return 1;
  if (a.date > b.date) return -1;
  return 0;
}
