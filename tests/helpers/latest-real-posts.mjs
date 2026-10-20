// Feature 102 (latest-posts-tests-from-content, REQ-102-01..03): ids de los últimos artículos
// derivados del contenido real. Helper de tests, no es un test (el glob del arnés solo ejecuta
// *.test.mjs; precedente tests/helpers/astro-build.mjs). Lee slug y created del frontmatter de
// cada .md bajo la raíz y ordena con el mismo dominio que la portada: PostsRepository.getPosts()
// (byCreatedDesc) + latestPosts(). Si dos de los limit + 1 primeros comparten created, el orden
// dependería del loader glob de Astro (no determinable desde el test): se lanza un error que
// nombra los slugs empatados en vez de dar un falso verde.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PostsRepository } from '../../src/domain/repositories/posts-repository.ts';
import { latestPosts, LATEST_POSTS_LIMIT } from '../../src/domain/latest-posts.ts';
import { parseSpanishDate } from '../../src/domain/search/parse-date.ts';

const POSTS_ROOT = fileURLToPath(new URL('../../src/content/posts/', import.meta.url));

const field = (md, key, file) => {
  const front = md.replace(/\r/g, '').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const value = front.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm'))?.[1]?.replace(/^"(.*)"$/, '$1');
  if (!value) throw new Error(`latest-real-posts: ${file} no tiene "${key}" en el frontmatter`);
  return value;
};

const entryOf = (root, file) => {
  const md = readFileSync(join(root, file), 'utf8');
  const [slug, created] = [field(md, 'slug', file), field(md, 'created', file)];
  return { data: { slug, title: slug, author: '', img: '', readtime: 0, description: '', tags: [], created, updated: created } };
};

export async function latestRealPostIds(limit = LATEST_POSTS_LIMIT, root = POSTS_ROOT) {
  const files = readdirSync(root, { recursive: true }).map(String).filter((f) => f.endsWith('.md'));
  const entries = files.map((file) => entryOf(root, file));
  const posts = await new PostsRepository(async () => entries).getPosts();
  const head = posts.slice(0, limit + 1);
  for (let i = 1; i < head.length; i++) {
    const tied = head.filter((p) => parseSpanishDate(p.created) === parseSpanishDate(head[i].created));
    if (tied.length > 1) throw new Error(`latest-real-posts: created empatado (${head[i].created}) entre ${tied.map((p) => p.slug).join(', ')}`);
  }
  return latestPosts(posts, limit).map((post) => post.id);
}
