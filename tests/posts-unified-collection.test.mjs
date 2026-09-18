// Tests de la colección unificada posts (architecture + os).
// DECISIÓN (2026-09-18): una sola colección `posts` con subcarpetas
// architecture/ y os/; post.id = data.slug (no entry.id, que incluye la
// subcarpeta y rompería /posts/[id] y los hrefs next/related). URLs planas
// /posts/<slug>; bodies keyeados por slug para no perder el cuerpo en búsqueda.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PostsRepository } from '../src/domain/repositories/posts-repository.ts';

const CONFIG_URL = new URL('../src/content.config.ts', import.meta.url);
const REPO_URL = new URL('../src/domain/repositories/posts-repository.ts', import.meta.url);
const SEARCH_URL = new URL('../src/pages/search.astro', import.meta.url);
const TERM_URL = new URL('../src/pages/[...term].astro', import.meta.url);
const INDEX_URL = new URL('../src/pages/index.astro', import.meta.url);
const DETAIL_URL = new URL('../src/pages/posts/[id].astro', import.meta.url);
const OS_POST_URL = new URL('../src/content/posts/os/00-prueba-os.md', import.meta.url);
const OS_POST_2_URL = new URL('../src/content/posts/os/01-procesos-memoria.md', import.meta.url);

test('colección posts unificada con subcarpetas architecture/ y os/', () => {
  const config = readFileSync(CONFIG_URL, 'utf8');
  assert.match(config, /getCollection\('posts'\)|collections\s*=\s*\{\s*posts\s*\}|base:\s*".\/src\/content\/posts"/, 'content.config.ts no declara la colección unificada posts');
  assert.ok(!/getCollection\('architecture'\)/.test(readFileSync(REPO_URL, 'utf8')), 'el repositorio sigue apuntando a architecture');
});

test('post.id = slug aunque entry.id incluya subcarpeta', async () => {
  const entry = {
    id: 'os/00-prueba-os.md',
    data: {
      slug: '00-prueba-os',
      title: 'Prueba OS',
      author: 'Moises Baldenegro Melendez',
      img: 'arch00.webp',
      readtime: 3,
      description: 'Post de prueba OS.',
      tags: ['os'],
      created: '18 Septiembre 2026',
      updated: '18 Septiembre 2026',
    },
  };
  const posts = await new PostsRepository(async () => [entry]).getPosts();
  assert.equal(posts[0].id, '00-prueba-os', 'post.id no es el slug estable');
  assert.equal(posts[0].slug, '00-prueba-os', 'post.slug no coincide');
});

test('páginas usan getCollection posts y bodies por slug', () => {
  for (const [url, label] of [[SEARCH_URL, 'search'], [TERM_URL, 'term'], [INDEX_URL, 'index'], [DETAIL_URL, 'detalle']]) {
    const src = readFileSync(url, 'utf8');
    assert.match(src, /getCollection\(['"]posts['"]\)/, `${label} no usa getCollection('posts')`);
  }
  for (const [url, label] of [[SEARCH_URL, 'search'], [TERM_URL, 'term'], [INDEX_URL, 'index']]) {
    const src = readFileSync(url, 'utf8');
    assert.match(src, /entry\.data\.slug/, `${label} no keyea bodies por slug`);
  }
});

test('post de prueba OS existe con keyword única de búsqueda', () => {
  assert.ok(existsSync(OS_POST_URL), 'src/content/posts/os/00-prueba-os.md no existe');
  const raw = readFileSync(OS_POST_URL, 'utf8');
  assert.match(raw, /xyz-os-test-123/, 'el post de prueba no contiene la keyword única');
});

test('getPosts ordena por created descendente (fecha, no slug 00)', async () => {
  function entry(slug, created) {
    return { id: `x/${slug}.md`, data: { slug, title: slug, author: 'A', img: 'a.webp', readtime: 1, description: 'd', tags: ['t'], created, updated: created } };
  }
  const posts = await new PostsRepository(async () => [
    entry('00-viejo', '10 Agosto 2026'),
    entry('01-nuevo-os', '19 Septiembre 2026'),
    entry('02-medio', '21 Agosto 2026'),
  ]).getPosts();
  assert.deepEqual(posts.map((p) => p.id), ['01-nuevo-os', '02-medio', '00-viejo'], 'la portada no muestra lo más nuevo primero');
});

test('cadena OS: 00 enlaza next al 01 y related cruzado OS + architecture', () => {
  assert.ok(existsSync(OS_POST_2_URL), 'src/content/posts/os/01-procesos-memoria.md no existe');
  const raw2 = readFileSync(OS_POST_2_URL, 'utf8');
  assert.match(raw2, /xyz-os-test-456/, 'el 2º post no contiene su keyword única');
  const raw1 = readFileSync(OS_POST_URL, 'utf8');
  assert.match(raw1, /next:\s*\/posts\/01-procesos-memoria/, '00-prueba-os no declara next al 01');
  assert.match(raw1, /\/posts\/01-procesos-memoria/, '00-prueba-os no recomienda al 01');
  assert.match(raw1, /\/posts\/00-agilismo/, '00-prueba-os no recomienda architecture');
  assert.match(raw2, /\/posts\/00-prueba-os/, '01 no recomienda de vuelta al 00');
  assert.match(raw2, /\/posts\/00-agilismo/, '01 no recomienda architecture');
});
