// Feature 102 (latest-posts-tests-from-content): el helper tests/helpers/latest-real-posts.mjs
// deriva del frontmatter real los ids de los últimos artículos con PostsRepository.getPosts() y
// latestPosts() del dominio (REQ-102-01..03). Fixtures en os.tmpdir() (REQ-102-10).
// Spec: specs/102_latest-posts-tests-from-content/requirements.md (sin design.md: no toca UI).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HELPER = new URL('./helpers/latest-real-posts.mjs', import.meta.url);
const load = async () => {
  assert.ok(existsSync(HELPER), 'falta tests/helpers/latest-real-posts.mjs (REQ-102-01)');
  return (await import(HELPER.href)).latestRealPostIds;
};
const dirs = [];
after(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });
const fixture = (posts) => {
  const root = mkdtempSync(join(tmpdir(), 'latest-real-posts-')); dirs.push(root);
  posts.forEach(([folder, slug, created]) => {
    mkdirSync(join(root, folder), { recursive: true });
    writeFileSync(join(root, folder, `${slug}.md`), `---\nslug: ${slug}\ntitle: T ${slug}\ncreated: "${created}"\nupdated: "${created}"\n---\n\nCuerpo.\n`);
  });
  return root;
};

test('REQ-102-01/02: con 4 posts desordenados devuelve los 3 de created más reciente en orden descendente', async () => {
  const latestRealPostIds = await load();
  const root = fixture([['os', 'b-medio', '19 Septiembre 2026'], ['arch', 'd-viejo', '10 Agosto 2026'],
    ['arch', 'a-nuevo', '16 Octubre 2026'], ['sd', 'c-otro', '28 Septiembre 2026']]);
  assert.deepEqual(await latestRealPostIds(3, root), ['a-nuevo', 'c-otro', 'b-medio']);
  assert.deepEqual(await latestRealPostIds(1, root), ['a-nuevo']);
});

test('REQ-102-01: sin raíz lee src/content/posts y con LATEST_POSTS_LIMIT por defecto devuelve 3 ids', async () => {
  const latestRealPostIds = await load();
  const ids = await latestRealPostIds();
  assert.equal(ids.length, 3); assert.ok(ids.every((id) => typeof id === 'string' && id.length > 0));
});

test('REQ-102-03: un empate de created en los limit + 1 primeros lanza un error con los slugs empatados', async () => {
  const latestRealPostIds = await load();
  const root = fixture([['a', 'p-uno', '16 Octubre 2026'], ['a', 'p-dos', '28 Septiembre 2026'],
    ['b', 'p-tres', '19 Septiembre 2026'], ['b', 'p-cuatro', '19 Septiembre 2026']]);
  await assert.rejects(latestRealPostIds(3, root), (error) => /p-tres/.test(error.message) && /p-cuatro/.test(error.message));
});

test('REQ-102-03: un empate fuera de los limit + 1 primeros no lanza', async () => {
  const latestRealPostIds = await load();
  const root = fixture([['a', 'p-uno', '16 Octubre 2026'], ['a', 'p-dos', '28 Septiembre 2026'],
    ['b', 'p-tres', '19 Septiembre 2026'], ['b', 'p-cuatro', '18 Septiembre 2026'],
    ['c', 'p-cinco', '1 Agosto 2026'], ['c', 'p-seis', '1 Agosto 2026']]);
  assert.deepEqual(await latestRealPostIds(3, root), ['p-uno', 'p-dos', 'p-tres']);
});
