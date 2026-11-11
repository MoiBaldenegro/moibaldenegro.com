// Test de la feature 14 whoami-page (REQ-14-01..12). Spec: specs/14_whoami-page/.
// node:test, sin dependencias. La página About pasa a llamarse whoami (texto y URL).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { legacyRedirect } from '../src/domain/http/legacy-redirects.ts';
import { rootRedirect } from '../src/domain/http/root-redirect.ts';
import { buildSitemap } from '../src/domain/seo/sitemap.ts';
import { footerColumns } from '../src/domain/site-footer.ts';
import { AboutRepository } from '../src/domain/repositories/about-repository.ts';
import { PromoTilesRepository } from '../src/domain/repositories/promo-tiles-repository.ts';

const read = (path) => readFileSync(path, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

test('REQ-14-01/02/06: la página vive en whoami.astro con su título', () => {
  assert.ok(existsSync('src/pages/whoami.astro'));
  assert.ok(!existsSync('src/pages/about.astro'));
  assert.match(read('src/pages/whoami.astro'), /<Layout title="whoami — moisesbaldenegro\.com"/);
});

test('REQ-14-03/04: el header enlaza whoami con aria-current en /whoami', () => {
  const link = read('src/layouts/Layout.astro').match(/<a class="mx-nav-link"[^>]*href="\/whoami">whoami<\/a>/);
  assert.ok(link, 'falta el enlace whoami del header');
  assert.match(link[0], /Astro\.url\.pathname === '\/whoami' \|\| Astro\.url\.pathname === '\/whoami\/' \? 'page'/);
});

test('REQ-14-05: el footer enlaza whoami', () => {
  const [navigation] = footerColumns(new AboutRepository().getProfile());
  assert.ok(navigation.links.some((link) => link.label === 'whoami' && link.href === '/whoami'));
  assert.ok(!navigation.links.some((link) => link.href === '/about'));
});

test('REQ-14-07/08: /about, /about/ y la raíz responden 301 a /whoami', () => {
  assert.equal(legacyRedirect('/about'), '/whoami');
  assert.equal(legacyRedirect('/about/'), '/whoami');
  assert.equal(rootRedirect('/'), '/whoami');
  assert.equal(legacyRedirect('/whoami'), null);
});

test('REQ-14-09: el sitemap lista /whoami/', () => {
  const xml = buildSitemap([], 'https://moisesbaldenegro.com');
  assert.match(xml, /<loc>https:\/\/moisesbaldenegro\.com\/whoami\/<\/loc>/);
  assert.doesNotMatch(xml, /\/about\//);
});

test('REQ-14-10/11/12: JSON-LD, promo y src ya no enlazan /about', () => {
  assert.match(read('src/domain/seo/json-ld.ts'), /new URL\('\/whoami', site\)/);
  for (const tile of new PromoTilesRepository().getTiles()) {
    for (const link of [tile.primary, tile.secondary]) assert.notEqual(link.href, '/about', tile.id);
  }
  for (const file of walk('src').filter((p) => /\.(astro|ts|json)$/.test(p))) {
    if (file.endsWith('legacy-redirects.ts')) continue;
    assert.doesNotMatch(read(file), /["'`]\/about\/?["'`]/, file);
  }
});
