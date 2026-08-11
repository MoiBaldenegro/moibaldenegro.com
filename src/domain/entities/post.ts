// Entidad del dominio: artículo (REQ-07-01, feature 7 posts-domain).
// Tipa los artículos de la colección architecture (src/content/architecture).
// Inmutable: todos los campos son readonly. tags ya viene transformado a
// arreglo de texto por el schema de src/content.config.ts.

export interface Post {
  readonly title: string;
  readonly author: string;
  readonly img: string;
  readonly readtime: number;
  readonly description: string;
  readonly tags: readonly string[];
  readonly created: string;
  readonly updated: string;
}
