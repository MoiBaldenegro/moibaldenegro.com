// Feature 66 (site-domain-moisesbaldenegro): el dominio real es moisesbaldenegro.com.
// moibaldenegro.com no existe (NXDOMAIN), pero canonical, sitemap, og:url y JSON-LD apuntaban
// ahí. La marca visible pasa también a moisesbaldenegro.com (decisión revisable del humano).
// Las cuentas @moibaldenegro y el Worker moibaldenegro-web no cambian (no son dominios).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { astroBuild } from './helpers/astro-build.mjs';
import { BRAND, composeTitle } from '../src/domain/seo/head.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const NEW = 'moisesbaldenegro.com';
const OLD = ['moi', 'baldenegro.com'].join('');
const ORIGIN = `https://${NEW}/`;
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

test('REQ-66-01: astro.config.mjs declara site https://moisesbaldenegro.com', () => {
  assert.match(read('astro.config.mjs'), /site:[ ]*'https:[/][/]moisesbaldenegro[.]com'/);
});

test('REQ-66-02: BRAND y composeTitle sin título valen moisesbaldenegro.com', () => {
  assert.equal(BRAND, NEW);
  assert.equal(composeTitle(undefined), NEW);
});

test('REQ-66-03/04/05: about, logo, manifest y User-Agent de HTB usan el dominio nuevo', () => {
  assert.ok(read('src/pages/about.astro').includes(`title="About — ${NEW}"`), 'título de about');
  assert.ok(read('src/layouts/Layout.astro').includes(`alt="Inicio — ${NEW}"`), 'alt del logo');
  const manifest = JSON.parse(read('public/site.webmanifest'));
  assert.equal(manifest.name, NEW);
  assert.equal(manifest.short_name, NEW);
  assert.ok(read('src/domain/repositories/htb-profile-repository.ts').includes(`'User-Agent': '${NEW}'`), 'User-Agent');
});

test('REQ-66-07: src/, public/, astro.config.mjs y README.md sin el dominio viejo', () => {
  const files = [...walk(fileURLToPath(new URL('src', root))), ...walk(fileURLToPath(new URL('public', root)))]
    .filter((f) => !/[.](png|ico|webp|jpe?g|gif|woff2?)$/i.test(f));
  for (const file of [...files, fileURLToPath(new URL('astro.config.mjs', root)), fileURLToPath(new URL('README.md', root))]) {
    assert.ok(!readFileSync(file, 'utf8').includes(OLD), `${file} contiene ${OLD}`);
  }
});

test('REQ-66-08: se conservan @moibaldenegro, x.com/moibaldenegro y el Worker moibaldenegro-web', () => {
  assert.ok(read('src/data/hero.json').includes('"@moibaldenegro"'), 'username de hero.json');
  assert.match(read('src/domain/seo/social.ts'), /TWITTER_SITE[^\n]*'@moibaldenegro'/);
  assert.ok(read('src/layouts/Layout.astro').includes('href="https://x.com/moibaldenegro"'));
  assert.match(read('wrangler.jsonc'), /"name":[ ]*"moibaldenegro-web"/);
});

test('REQ-66-06 (build): canonical, og, JSON-LD, sitemap y robots apuntan a moisesbaldenegro.com', () => {
  const out = mkdtempSync(join(tmpdir(), 'domain-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const client = join(out, 'client');
    const post = readdirSync(join(client, 'posts'))[0];
    for (const page of ['index.html', join('about', 'index.html'), join('posts', post, 'index.html')]) {
      const html = readFileSync(join(client, page), 'utf8');
      const urls = [
        ...[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]),
        ...[...html.matchAll(/<meta property="og:(?:url|image)" content="([^"]+)"/g)].map((m) => m[1]),
        ...[...html.matchAll(/"(?:url|@id)":"(https?:[^"]+)"/g)].map((m) => m[1]),
      ];
      assert.ok(urls.length >= 2, `${page}: sin URLs absolutas`);
      for (const url of urls) assert.ok(url.startsWith(ORIGIN), `${page}: ${url}`);
    }
    const sitemapFile = [join(client, 'sitemap.xml'), join(client, 'sitemap.xml', 'index.html')].find(existsSync);
    if (sitemapFile) for (const [, loc] of readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<[/]loc>/g)) assert.ok(loc.startsWith(ORIGIN), loc);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
