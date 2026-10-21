// Feature 95 (home-latest-articles-five): la portada muestra los 4 artículos más recientes
// (footer en 3) y las cards entran/salen en lateral con CSS scroll-driven (sin JS nuevo).
// Spec: specs/95_home-latest-articles-five/ (requirements.md + design.md).
// Ajuste feature 96 (precedente REQ-43-06): la portada vuelve a 3 (REQ-95-01/04/05/06 esperan 3), REQ-95-08 deja de
// congelar latest-horizontal.ts y latest-entrance.ts (rama H-integrado) y REQ-95-13..21 se retiran
// porque latest-cards-slide.css se borra (la animación pasa a GSAP en cards-motion.ts).
// Ajuste feature 116 (precedente REQ-43-06): la portada pasa de / a /home (dist/client/home/index.html y src/pages/home.astro).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { astroBuild } from './helpers/astro-build.mjs';
import { latestRealPostIds } from './helpers/latest-real-posts.mjs'; // Ajuste feature 102 (precedente REQ-43-06)

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const url = (rel) => new URL(`../${rel}`, import.meta.url);
const read = (rel) => readFileSync(url(rel), 'utf8');
const lines = (t) => t.split(/\r?\n/).filter((l, i, all) => i < all.length - 1 || l !== '').length;
const [MODULE, FOOTER] = ['src/domain/latest-posts.ts', 'src/components/site-footer/site-footer.astro'];
const HZ = 'src/components/latest-horizontal/latest-horizontal.astro'; // Ajuste feature 96 (precedente REQ-43-06): sin SLIDE
// Ajuste feature 96 (precedente REQ-43-06): sin la 4.ª. Ajuste feature 102 (precedente REQ-43-06): NEWEST sale; lo esperado se deriva del contenido con latestRealPostIds.
const load = async () => import(url(MODULE).href);
const fake = (n) => Array.from({ length: n }, (_, i) => ({ id: `p-${i}`, created: `${i + 1} Enero 2020` }));
const cut = (html, open, close) => { const at = html.indexOf(open); assert.notEqual(at, -1, open); return html.slice(at, html.indexOf(close, at)); };
// Ajuste feature 96 (precedente REQ-43-06): se retiran slide(), block() y sheet() (la hoja de la 95 ya no existe).

test('REQ-95-01/02/03: límite 3 (ajuste feature 96) en portada y 3 explícito en el footer', async () => {
  assert.match(read(MODULE), /export const LATEST_POSTS_LIMIT = 3;/); // Ajuste feature 96 (precedente REQ-43-06)
  assert.match(read(MODULE), /export const FOOTER_LATEST_POSTS_LIMIT = 3;/);
  const mod = await load(); assert.equal(mod.FOOTER_LATEST_POSTS_LIMIT, 3);
  assert.equal(mod.LATEST_POSTS_LIMIT, 3); // Ajuste feature 96 (precedente REQ-43-06)
  const footer = read(FOOTER);
  assert.match(footer, /import \{[^}]*\bFOOTER_LATEST_POSTS_LIMIT\b[^}]*\} from '\.\.\/\.\.\/domain\/latest-posts\.ts';/);
  assert.match(footer, /latestPosts\(await new PostsRepository\(\)\.getPosts\(\), FOOTER_LATEST_POSTS_LIMIT\)/);
});

test('REQ-95-04/05: 3 primeros (ajuste feature 96) sin mutar; con menos, todos sin lanzar', async () => {
  const { latestPosts } = await load();
  for (const n of [3, 4, 8, 20]) { // Ajuste feature 96 (precedente REQ-43-06)
    const posts = fake(n); const snap = structuredClone(posts); const out = latestPosts(posts);
    assert.deepEqual(out.map((p) => p.id), ['p-0', 'p-1', 'p-2'], `con ${n}`); // Ajuste feature 96 (precedente REQ-43-06)
    assert.deepEqual(posts, snap); assert.notEqual(out, posts);
  }
  for (const n of [0, 1, 2]) assert.doesNotThrow(() => assert.equal(latestPosts(fake(n)).length, n), `con ${n}`);
});

test('REQ-95-06/07/12: build con 3 cards (ajuste feature 96) (transition:name) y footer con 3', async () => { // Ajuste feature 102 (precedente REQ-43-06): async
  const newest = await latestRealPostIds((await load()).LATEST_POSTS_LIMIT); assert.equal(newest.length, 3, 'el helper no deriva 3 ids'); // Ajuste feature 102 (precedente REQ-43-06)
  const build = astroBuild();
  assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
  const html = read('dist/client/home/index.html');
  const section = cut(html, '<section class="latest-articles"', '</section>');
  assert.equal((section.match(/class="latest-articles__card"/g) ?? []).length, 3, 'no hay 3 cards'); // Ajuste feature 96 (precedente REQ-43-06)
  assert.deepEqual([...section.matchAll(/href="(\/posts\/[^"]+)"/g)].map((m) => m[1]), newest.map((s) => `/posts/${s}`)); // Ajuste feature 102 (precedente REQ-43-06)
  assert.equal((section.match(/data-astro-transition-scope=/g) ?? []).length, 6, 'img y h3 sin transition:name'); // Ajuste feature 96 (precedente REQ-43-06)
  assert.ok((read('src/components/latest-articles.astro').match(/transition:name=/g) ?? []).length >= 2);
  assert.equal((cut(html, '<footer class="site-footer"', '</footer>').match(/\bsite-footer__post\b/g) ?? []).length, 3, 'el footer no tiene 3 enlaces');
});

test('REQ-95-08: archivos congelados sin cambios frente a HEAD', () => {
  const frozen = ['src/styles/latest-articles.css', 'src/styles/latest-horizontal.css', 'src/components/latest-articles.astro',
    'src/domain/latest-horizontal.ts']; // Ajuste feature 96 (precedente REQ-43-06): sin latest-horizontal.ts ni latest-entrance.ts. Ajuste feature 97 (precedente REQ-43-06): sin tokens.css
  assert.equal(spawnSync('git', ['diff', '--quiet', 'HEAD', '--', ...frozen], { cwd: ROOT }).status, 0, 'congelados modificados');
});

// Ajuste feature 96 (precedente REQ-43-06): REQ-95-13/14/15/16/22 y REQ-95-17/18/19/20 retirados (hoja latest-cards-slide.css borrada).

test('REQ-95-21/31: import en latest-horizontal.astro (ajuste feature 96) y archivos <= 100 líneas', () => {
  const hz = read(HZ);
  assert.match(hz, /import '\.\.\/\.\.\/styles\/latest-horizontal\.css';/);
  assert.doesNotMatch(hz, /latest-cards-slide/); // Ajuste feature 96 (precedente REQ-43-06): la hoja de la 95 sale
  assert.equal((hz.match(/<script>/g) ?? []).length, 1);
  for (const rel of [MODULE, FOOTER, HZ, 'tests/home-latest-articles-five.test.mjs']) assert.ok(lines(read(rel)) <= 100, rel);
});
