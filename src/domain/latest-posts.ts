// latest-posts.ts — Recorte de la lista de la portada (REQ-30-01..05, feature
// 30 home-latest-articles-limit). Sin design.md: la feature no toca UI.
//
// Aplica a los artículos que entrega PostsRepository.getPosts() la política
// editorial de la sección «Últimos artículos» de la portada: pintar solo los
// `limit` primeros (= 3) y, si la colección tiene menos, todos los
// disponibles. NO reordena: el orden canónico por created lo fija el
// comparador byCreatedDesc del repositorio (una sola verdad) y NO muta la
// entrada (slice devuelve copia). Un límite que no sea entero positivo
// devuelve un arreglo vacío (contrato determinista). Vive en un módulo de
// dominio, no en el repositorio (ya está en 100/100 líneas, REQ-30-14) ni en el
// frontmatter del componente (regla 8: el frontmatter solo hace imports y paso
// de datos).

import type { Post } from './entities/post.ts';

export const LATEST_POSTS_LIMIT = 3;

export function latestPosts(posts: readonly Post[], limit: number = LATEST_POSTS_LIMIT): Post[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];
  return posts.slice(0, limit);
}