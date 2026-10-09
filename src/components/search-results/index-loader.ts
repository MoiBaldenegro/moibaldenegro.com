// Carga diferida del índice de búsqueda (feature 47 search-index-lazy-load,
// REQ-47-02..05). Sustituye al <script id="search-index"> embebido: el índice
// (/search-index.json, feature 46) se pide con fetch una sola vez por sesión
// y la promesa se reutiliza aunque haya navegaciones con ClientRouter. Tras
// resolver, el índice queda en caché síncrona: las vistas posteriores pintan
// sin esperar. Un fallo no se cachea (se reintenta en la siguiente petición).
import type { SearchIndexEntry } from '../../domain/search/index.ts';

export const INDEX_URL = '/search-index.json';
export const INDEX_ERROR_MESSAGE = 'No se pudo cargar el índice de búsqueda';

// Error explícito y con nombre (docs/architecture.md §3, docs/conventions.md):
// respuesta HTTP fallida o cuerpo que no es un array de entradas del índice.
export class SearchIndexLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchIndexLoadError';
  }
}

type Fetcher = (url: string) => Promise<Response>;
export type IndexLoader = () => Promise<SearchIndexEntry[]>;

let resolved: SearchIndexEntry[] | null = null;
let pending: Promise<SearchIndexEntry[]> | null = null;

export function loadSearchIndex(fetchFn: Fetcher = (url) => fetch(url)): Promise<SearchIndexEntry[]> {
  pending ??= fetchFn(INDEX_URL)
    .then(async (response) => {
      if (!response.ok) throw new SearchIndexLoadError(`${INDEX_URL} respondió ${response.status}`);
      const body: unknown = await response.json();
      if (!Array.isArray(body)) throw new SearchIndexLoadError(`${INDEX_URL} no devolvió un array de entradas`);
      resolved = body as SearchIndexEntry[];
      return resolved;
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}

// Ejecuta `run` con el índice: al momento si ya está en caché; si no, al
// resolver `load`. Si la carga falla, llama a `fail` (error explícito).
export function withSearchIndex(
  run: (index: SearchIndexEntry[]) => void,
  fail: () => void,
  load: IndexLoader = loadSearchIndex,
): void {
  if (resolved !== null) return run(resolved);
  load().then(run, fail);
}

// Ganchos de tests: precargar un índice conocido o vaciar la caché.
export function primeSearchIndex(index: SearchIndexEntry[]): void {
  resolved = index;
  pending = Promise.resolve(index);
}
export function resetSearchIndexCache(): void {
  resolved = null;
  pending = null;
}
