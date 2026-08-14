// Repositorio del dominio: artículos (REQ-07-02..04, feature 7 posts-domain).
// Única vía de acceso a los artículos para la UI: envuelve la colección
// architecture de astro:content (getCollection) y entrega las entidades Post.
// Si un artículo no cumple el esquema de la entidad o la lectura falla, lanza
// PostsDataError (REQ-07-03): nunca falla en silencio.

import type { Post } from '../entities/post.ts';

export class PostsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostsDataError';
  }
}

export class PostsRepository {
  private readonly loadEntries: () => Promise<unknown[]>;

  constructor(loadEntries: () => Promise<unknown[]> = loadArchitectureEntries) {
    this.loadEntries = loadEntries;
  }

  async getPosts(): Promise<Post[]> {
    let entries: unknown[];
    try {
      entries = await this.loadEntries();
    } catch {
      throw new PostsDataError(
        'architecture: no se pudieron leer los artículos de la colección',
      );
    }
    return entries.map((entry, index) => parsePost(entry, index));
  }
}

async function loadArchitectureEntries(): Promise<unknown[]> {
  const { getCollection } = await import('astro:content');
  return getCollection('architecture');
}

function parsePost(entry: unknown, index: number): Post {
  const data = asData(entry, index);
  const id = (entry as Record<string, unknown>).id;
  if (typeof id !== 'string') {
    throw new PostsDataError(`architecture: el artículo ${index} no tiene id de texto`);
  }
  return {
    id,
    slug: expectString(data, 'slug', index),
    title: expectString(data, 'title', index),
    author: expectString(data, 'author', index),
    img: expectString(data, 'img', index),
    readtime: expectNumber(data, 'readtime', index),
    description: expectString(data, 'description', index),
    tags: expectTags(data, index),
    created: expectString(data, 'created', index),
    updated: expectString(data, 'updated', index),
  };
}

function asData(entry: unknown, index: number): Record<string, unknown> {
  if (typeof entry !== 'object' || entry === null || !('data' in entry)) {
    throw new PostsDataError(`architecture: el artículo ${index} no tiene data de objeto`);
  }
  const data = (entry as Record<string, unknown>).data;
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new PostsDataError(`architecture: el artículo ${index} no tiene data de objeto`);
  }
  return data as Record<string, unknown>;
}

function expectString(data: Record<string, unknown>, field: string, index: number): string {
  if (typeof data[field] !== 'string') {
    throw new PostsDataError(
      `architecture: el artículo ${index} tiene un campo "${field}" que debe ser texto`,
    );
  }
  return data[field] as string;
}

function expectNumber(data: Record<string, unknown>, field: string, index: number): number {
  if (typeof data[field] !== 'number') {
    throw new PostsDataError(
      `architecture: el artículo ${index} tiene un campo "${field}" que debe ser número`,
    );
  }
  return data[field] as number;
}

function expectTags(data: Record<string, unknown>, index: number): string[] {
  if (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string')) {
    throw new PostsDataError(
      `architecture: el artículo ${index} tiene un campo "tags" que debe ser un arreglo de texto`,
    );
  }
  return data.tags as string[];
}