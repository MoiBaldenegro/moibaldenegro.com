// Repositorio: artículos (REQ-07-02..04 f7; REQ-18-03..05 f18; REQ-20-03..05 f20).
// Única vía a la colección unificada posts. DECISIÓN 2026-09-18: post.id =
// data.slug (no entry.id) porque entry.id incluye subcarpeta architecture/ u
// os/ y rompería /posts/[id] y los hrefs next/related (/posts/<slug>).

import type { Post } from '../entities/post.ts';
import { parseSpanishDate } from '../search/parse-date.ts';
export class PostsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostsDataError';
  }
}

export class PostsRepository {
  private readonly loadEntries: () => Promise<unknown[]>;

  constructor(loadEntries: () => Promise<unknown[]> = loadPostEntries) {
    this.loadEntries = loadEntries;
  }

  async getPosts(): Promise<Post[]> {
    let entries: unknown[];
    try {
      entries = await this.loadEntries();
    } catch {
      throw new PostsDataError('posts: no se pudieron leer los artículos de la colección');
    }
    return entries.map((entry, index) => parsePost(entry, index)).sort(byCreatedDesc);
  }
}
async function loadPostEntries(): Promise<unknown[]> {
  const { getCollection } = await import('astro:content'); return getCollection('posts');
}

function byCreatedDesc(a: Post, b: Post): number {
// Orden de portada "Últimos artículos": lo más nuevo primero por created
// (fecha española -> YYYY-MM-DD comparable); empates conservan el orden.
  const da = parseSpanishDate(a.created);
  const db = parseSpanishDate(b.created);
  if (da < db) return 1;
  if (da > db) return -1;
  return 0;
}
function parsePost(entry: unknown, index: number): Post {
  const data = asData(entry, index);
  const slug = expectString(data, 'slug', index);
  return {
    id: slug,
    slug,
    title: expectString(data, 'title', index),
    author: expectString(data, 'author', index),
    img: expectString(data, 'img', index),
    readtime: expectNumber(data, 'readtime', index),
    description: expectString(data, 'description', index),
    tags: expectTags(data, index),
    created: expectString(data, 'created', index),
    updated: expectString(data, 'updated', index),
    next: expectNext(data, index),
    related: expectRelated(data, index),
  };
}

function asData(entry: unknown, index: number): Record<string, unknown> {
  const data = typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>).data : undefined;
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new PostsDataError(`posts: el artículo ${index} no tiene data de objeto`);
  }
  return data as Record<string, unknown>;
}
function expectString(data: Record<string, unknown>, field: string, index: number): string {
  const value = data[field];
  if (typeof value !== 'string') throw new PostsDataError(`posts: el artículo ${index} tiene un campo "${field}" que debe ser texto`);
  return value;
}
function expectNumber(data: Record<string, unknown>, field: string, index: number): number {
  const value = data[field];
  if (typeof value !== 'number') throw new PostsDataError(`posts: el artículo ${index} tiene un campo "${field}" que debe ser número`);
  return value;
}
function expectNext(data: Record<string, unknown>, index: number): string | null {
  const value = data.next;
  if (value === undefined) return null;
  if (typeof value !== 'string' || !/^\/posts\/.+/.test(value)) {
    throw new PostsDataError(`posts: el artículo ${index} tiene un campo "next" que debe ser una ruta interna /posts/<id>`);
  }
  return value;
}
function expectRelated(data: Record<string, unknown>, index: number): string[] | null {
  const value = data.related;
  if (value === undefined) return null;
  if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === 'string' && /^\/posts\/.+/.test(item))) throw new PostsDataError(`posts: el artículo ${index} tiene un campo "related" que debe ser un arreglo de rutas internas /posts/<id>`);
  return value as string[];
}
function expectTags(data: Record<string, unknown>, index: number): string[] {
  if (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string')) {
    throw new PostsDataError(`posts: el artículo ${index} tiene un campo "tags" que debe ser un arreglo de texto`);
  }
  return data.tags as string[];
}