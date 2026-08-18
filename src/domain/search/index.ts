// Índice de búsqueda (REQ-02-07, feature 2 search-domain): el registro
// serializable que la UI embebe en el documento para filtrar en el cliente.
// El llamador provee los Posts y sus cuerpos markdown (getCollection entrega
// el cuerpo en build; el arnés no permite node:fs en runtime). Un campo
// ausente se trata como texto vacío (REQ-02-08): nunca rompe la búsqueda.

import type { Post } from '../entities/post.ts';
import { parseSpanishDate } from './parse-date.ts';

export interface SearchIndexEntry {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly body: string;
  readonly date: string; // YYYY-MM-DD comparable (REQ-02-05)
  readonly img: string;
  readonly readtime: number;
  readonly author: string;
}

export function buildSearchIndex(
  posts: readonly Post[],
  bodies: Readonly<Record<string, string>>,
): SearchIndexEntry[] {
  return posts.map((post) => {
    const id = textOrEmpty(post.id);
    return {
      id,
      title: textOrEmpty(post.title),
      description: textOrEmpty(post.description),
      tags: Array.isArray(post.tags) ? post.tags : [],
      body: bodies[id] ?? '',
      date: parseSpanishDate(textOrEmpty(post.created)),
      img: textOrEmpty(post.img),
      readtime: typeof post.readtime === 'number' ? post.readtime : 0,
      author: textOrEmpty(post.author),
    };
  });
}

function textOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
