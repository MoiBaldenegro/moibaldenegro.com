// Entidad del dominio: artículo (REQ-07-01, feature 7 posts-domain).
// Tipa los artículos de la colección architecture (src/content/architecture).
// Inmutable: todos los campos son readonly. tags ya viene transformado a
// arreglo de texto por el schema de src/content.config.ts.
// id y slug (REQ-36-01, feature 36 posts-navigation-fix): id identifica la
// entrada de la colección; slug proviene del frontmatter (exposición para uso
// futuro; la ruta sigue /posts/[id] con id = entry.id, contrato REQ-24-05).

export interface Post {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly author: string;
  readonly img: string;
  readonly readtime: number;
  readonly description: string;
  readonly tags: readonly string[];
  readonly created: string;
  readonly updated: string;
}