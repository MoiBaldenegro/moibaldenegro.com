// Datos y repositorio del About (REQ-80-01..19, specs/80_about-data-repository). Sin UI.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AboutRepository, AboutDataError } from '../src/domain/repositories/about-repository.ts';
import { heroLinks, cvContact } from '../src/domain/about-links.ts';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const RAW = read('src/data/about.json');
const profile = new AboutRepository().getProfile();
const withData = (patch) => () => JSON.stringify({ ...JSON.parse(RAW), ...patch });
const expectError = (load, needle) => assert.throws(() => new AboutRepository(load).getProfile(),
  (e) => e instanceof AboutDataError && e.name === 'AboutDataError' && e.message.includes(needle));
const CREATED = ['src/data/about.json', 'src/domain/entities/about-profile.ts',
  'src/domain/repositories/about-repository.ts', 'src/domain/repositories/about-parse.ts',
  'src/domain/about-links.ts', 'tests/about-data-repository.test.mjs'];

test('REQ-80-01/03: getProfile() entrega el contenido canónico de about.json', () => {
  assert.equal(profile.headline, 'Senior Software Engineer | Backend & Node.js Developer | Systems Architect');
  assert.equal(profile.location, 'Guadalajara, Jalisco, México');
  assert.equal(profile.photoAlt, 'Retrato de Moisés Baldenegro Melendez');
  assert.ok(profile.summary.length > 0);
  const sizes = { links: 4, stats: 4, experience: 4, skills: 6, projects: 5, content: 2,
    education: 1, certifications: 3, languages: 2 };
  for (const [field, n] of Object.entries(sizes)) assert.equal(profile[field].length, n, field);
  assert.equal(profile.philosophy.motto, 'Deterministic Engineering in an Agentic World');
});

test('REQ-80-02/03: entidad readonly e import con atributo sin node:fs', () => {
  const entity = read('src/domain/entities/about-profile.ts');
  const props = entity.split('\n').filter((l) => /^\s+(readonly\s+)?\w+\??\s*:/.test(l));
  assert.ok(props.length >= 14);
  for (const l of props) assert.match(l, /^\s+readonly\s/, `sin readonly: ${l}`);
  for (const l of entity.split('\n').filter((x) => x.includes('[]'))) {
    assert.match(l, /readonly\s+\w+\[\]/, `array sin readonly: ${l}`);
  }
  const repo = read('src/domain/repositories/about-repository.ts');
  assert.match(repo, /import\s+\w+\s+from\s+'\.\.\/\.\.\/data\/about\.json'\s+with\s*\{\s*type:\s*'json'\s*\}/);
  for (const f of ['src/domain/repositories/about-repository.ts', 'src/domain/repositories/about-parse.ts']) {
    assert.doesNotMatch(read(f), /node:fs|from\s+'fs'|\?raw/, f);
  }
});

test('REQ-80-04..08: errores nombrados AboutDataError', () => {
  expectError(() => { throw new Error('x'); }, 'about.json');
  expectError(() => '{no json', 'about.json');
  const { headline, ...rest } = JSON.parse(RAW);
  expectError(() => JSON.stringify(rest), 'headline');
  expectError(withData({ headline: '' }), 'headline');
  expectError(withData({ skills: [] }), 'skills');
  const links = [...JSON.parse(RAW).links, { id: 'twitter', label: 'X', href: 'https://x.com' }];
  expectError(withData({ links }), 'twitter');
});

test('REQ-80-09/10/11: experiencia en orden con periodos sin fechas inventadas', () => {
  const [first, ...others] = profile.experience;
  assert.equal(first.role, 'Líder de Desarrollo & Arquitecto de Software');
  assert.equal(first.organization, 'Taquerías MG');
  assert.equal(first.period, 'sep 2023 – presente');
  assert.ok(first.result.includes('septiembre de 2025'));
  assert.deepEqual(others.map((e) => e.organization),
    ["Kellogg's Company", 'Universidad Estatal de Sonora (UES)', 'Winchester Interconnect']);
  assert.deepEqual(others.map((e) => e.period), ['1 año 2 meses', '3 años 5 meses', '1 año 4 meses']);
  const months = /\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\.?(\s|$)/i;
  for (const e of others) assert.ok(!/\d{4}/.test(e.period) && !months.test(e.period), e.period);
  for (const e of profile.experience) {
    for (const k of ['role', 'organization', 'place', 'period']) assert.ok(e[k].length > 0, k);
    assert.ok(e.highlights.length > 0);
  }
});

test('REQ-80-12/13/14: heroLinks y cvContact', () => {
  assert.deepEqual(heroLinks(profile).map((l) => l.id), ['github', 'linkedin', 'youtube']);
  assert.deepEqual(cvContact(profile).map((l) => l.id), ['site', 'linkedin', 'github']);
  assert.deepEqual(heroLinks(profile).map((l) => l.href), ['https://github.com/MoiBaldenegro',
    'https://www.linkedin.com/in/moibaldenegro/', 'https://www.youtube.com/@moibaldenegro']);
  assert.equal(cvContact(profile)[0].href, 'https://moisesbaldenegro.com');
  const without = (id) => ({ ...profile, links: profile.links.filter((l) => l.id !== id) });
  assert.throws(() => heroLinks(without('youtube')), (e) => e instanceof AboutDataError && e.message.includes('youtube'));
  assert.throws(() => cvContact(without('site')), (e) => e instanceof AboutDataError && e.message.includes('site'));
});

test('REQ-80-15/16/17: privacidad y hrefs absolutos', () => {
  const text = RAW.replace(/<[^>]*>/g, ' ');
  assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  assert.doesNotMatch(text, /\+?\d[\d\s().-]{8,}\d/);
  for (const term of ['Salud Digna', 'Cinnamon', 'neww relic', 'moisesbaldenegro1546', 'Lamar University']) {
    assert.ok(!text.toLowerCase().includes(term.toLowerCase()), term);
  }
  for (const item of [...profile.links, ...profile.projects, ...profile.content]) {
    assert.ok(item.href.startsWith('https://') || item.href === '/home', item.href); // Ajuste feature 116 (precedente REQ-43-06): blog a /home (REQ-116-12)
  }
});

test('REQ-80-19: cada archivo creado mide <= 100 líneas', () => {
  for (const f of CREATED) assert.ok(read(f).split('\n').length <= 100, f);
});
