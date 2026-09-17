// related-titles.ts — View-model de los recomendados (REQ-23-01/02, feature 23
// related-titles-design-align; REQ-24-01/02, feature 24 related-card-model;
// REQ-27-01/02, feature 27 anchor-nunca-url).
// Resuelve en build las propiedades de cada href de post.related a partir de
// los Posts del repositorio (base: feature 26, hrefs íntegros a post.id). La
// vista lo importa y pasa el resultado por props; el frontmatter no resuelve
// nada inline (regla 8). Sin JS de runtime: todo en prerender. Un href sin
// post conocido se omite del resultado (nunca rompe el build y el texto del
// anchor nunca es una URL; la integridad la audita REQ-26-05).

import type { Post } from './entities/post.ts';

export interface RelatedLink {
  readonly href: string;
  readonly title: string;
  readonly img: string;
  readonly author: string;
  readonly readtime: number;
}

export function resolveRelatedTitles(
  posts: readonly Post[],
  related: readonly string[] | null,
): RelatedLink[] {
  if (related === null) return [];
  const postByHref = new Map(posts.map((post) => [`/posts/${post.id}`, post]));
  return related.flatMap((href) => {
    const post = postByHref.get(href);
    if (!post) return [];
    return [{ href, title: post.title, img: post.img, author: post.author, readtime: post.readtime }];
  });
}
