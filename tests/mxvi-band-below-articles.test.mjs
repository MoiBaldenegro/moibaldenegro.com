// Test de la feature 8 mxvi-band-below-articles — orden de la portada (REQ-08-01..11).
// Spec: specs/08_mxvi-band-below-articles/ (requirements.md + design.md). node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const HOME = 'src/pages/home.astro';
const home = read(HOME);
const landing = () => {
  const m = home.match(/<div class="home__landing"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(m, 'falta .home__landing');
  return m[1];
};

test('REQ-08-01: .home__landing renderiza exactamente los componentes en el orden pedido', () => {
  const tags = [...landing().matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]);
  assert.deepEqual(tags, ['NewHero', 'LatestArticles', 'LatestHorizontal', 'MxviLogosBanner', 'PromoTiles']);
});

test('REQ-08-02/03/04: adyacencias NewHero->LatestArticles, LatestHorizontal->Mxvi, Mxvi->PromoTiles', () => {
  const body = landing();
  assert.match(body, /<NewHero\s*\/>\s*<LatestArticles\s*\/>/);
  assert.match(body, /<LatestHorizontal\s*\/>\s*<MxviLogosBanner\s*\/>/);
  assert.match(body, /<MxviLogosBanner\s*\/>\s*<PromoTiles\s*\/>/);
});

test('REQ-08-05: <MxviLogosBanner aparece una sola vez en home.astro', () => {
  assert.equal(home.match(/<MxviLogosBanner\b/g)?.length ?? 0, 1);
});

test('REQ-08-06: imports conservados y <SearchLive /> fuera de .home__landing', () => {
  const imports = {
    NewHero: '../components/new-hero/new-hero.astro',
    Layout: '../layouts/Layout.astro',
    LatestArticles: '../components/latest-articles.astro',
    LatestHorizontal: '../components/latest-horizontal/latest-horizontal.astro',
    MxviLogosBanner: '../components/mxvi-logos-banner.astro',
    PromoTiles: '../components/promo-tiles/promo-tiles.astro',
    SearchLive: '../components/search-live/search-live.astro',
  };
  for (const [name, path] of Object.entries(imports)) {
    assert.ok(home.includes(`import ${name} from '${path}';`), `falta el import de ${name}`);
  }
  assert.doesNotMatch(landing(), /<SearchLive/);
  const after = home.slice(home.indexOf('</div>'));
  assert.match(after, /<\/div>\s*<SearchLive\s*\/>\s*<\/Layout>/);
});

test('REQ-08-11: archivos tocados con <=100 líneas', () => {
  const archivos = [HOME, 'tests/mxvi-band-below-articles.test.mjs', 'tests/promo-tiles-section-ui.test.mjs'];
  for (const rel of archivos) assert.ok(read(rel).trimEnd().split('\n').length <= 100, rel);
});
