// Test de la restauración de latest-articles.astro al contrato de la
// entidad Post (REQ-20-01..07, feature 20 latest-articles-restore).
//
// Verifica contra specs/20_latest-articles-restore/requirements.md y design.md:
//   REQ-20-01 — el componente obtiene los artículos desde PostsRepository
//               y el frontmatter se limita a imports y paso de datos.
//   REQ-20-02 — el componente no importa astro:content ni getCollection.
//   REQ-20-03 — marcado semántico article/h2/p/span con post.title,
//               post.author, post.readtime, post.description y post.tags.
//   REQ-20-04 — el texto "min de lectura" se muestra junto al autor.
//   REQ-20-05 — el <img> lleva la clase latest-articles__image,
//               src con post.img, alt={post.title} y loading="lazy".
//   REQ-20-06 — la card enlaza a la ruta /posts/{id}. La prohibición original
//               de enlaces /posts (Decisión 3 del design.md de la feature 20)
//               era transitoria: la petición del humano (ciclo 30, feature 36
//               posts-navigation-fix) restaura la navegación, por lo que esta
//               verificación pasa de «ausencia» a «presencia» del enlace
//               /posts/${post.id} (REQ-36-04).
//   REQ-20-07 — componente y hoja ≤100 líneas; la hoja conserva la regla de
//               la feature 17 con tokens, sin colores sueltos.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENT_PATH = new URL('../src/components/latest-articles.astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/latest-articles.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_PATH), 'src/components/latest-articles.astro no existe');
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/latest-articles.css no existe (REQ-20-07)');
  return readFileSync(CSS_PATH, 'utf8');
}

// Extrae la etiqueta <img> de la card (una sola por card en el map del
// componente). Fallar aquí es un fallo de REQ-20-05.
function imgTag(astro) {
  const match = astro.match(/<img[^>]*>/);
  assert.ok(match, 'latest-articles.astro no renderiza ningún <img> (REQ-20-05)');
  return match[0];
}

test('REQ-20-01: obtiene los artículos desde PostsRepository', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /posts-repository/,
    'latest-articles.astro no importa el módulo posts-repository (REQ-20-01)'
  );
  assert.match(
    astro,
    /PostsRepository/,
    'latest-articles.astro no usa la clase PostsRepository (REQ-20-01)'
  );
  assert.match(
    astro,
    /getPosts\(\)/,
    'latest-articles.astro no obtiene los artículos con getPosts() (REQ-20-01)'
  );
});

test('REQ-20-02: no importa astro:content ni getCollection directamente', () => {
  const astro = readComponent();
  assert.doesNotMatch(
    astro,
    /astro:content/,
    'latest-articles.astro importa astro:content directamente (REQ-20-02)'
  );
  assert.doesNotMatch(
    astro,
    /getCollection/,
    'latest-articles.astro usa getCollection directamente (REQ-20-02)'
  );
});

test('REQ-20-03: marcado semántico article/h2/p/span con los cinco campos', () => {
  const astro = readComponent();
  for (const tag of ['<article', '<h2', '<p', '<span']) {
    assert.ok(
      astro.includes(tag),
      `el marcado no usa la etiqueta semántica "${tag}" (REQ-20-03)`
    );
  }
  for (const field of ['post.title', 'post.author', 'post.readtime', 'post.description', 'post.tags']) {
    assert.ok(
      astro.includes(field),
      `el marcado no interpola ${field} (REQ-20-03)`
    );
  }
});

test('REQ-20-04: muestra el texto "min de lectura" junto al autor', () => {
  const astro = readComponent();
  assert.ok(
    astro.includes('min de lectura'),
    'el marcado no muestra el tiempo de lectura (REQ-20-04)'
  );
});

test('REQ-20-05: el <img> lleva la clase, src con post.img, alt={post.title} y loading lazy', () => {
  const img = imgTag(readComponent());
  assert.match(
    img,
    /class="latest-articles__image"/,
    'el <img> no lleva la clase latest-articles__image (REQ-20-05)'
  );
  assert.ok(
    img.includes('post.img'),
    'el <img> no referencia post.img (REQ-20-05)'
  );
  assert.match(
    img,
    /alt=\{post\.title\}/,
    'el <img> no usa alt={post.title} (REQ-20-05)'
  );
  assert.match(
    img,
    /loading="lazy"/,
    'el <img> no declara loading="lazy" (REQ-20-05)'
  );
});

test('REQ-20-06: cada card enlaza a la ruta /posts/{id} con el id real (REQ-36-04)', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /href=\{`\/posts\/\$\{post\.id\}`\}/,
    'la card no enlaza a /posts/${post.id} (REQ-36-04, REQ-20-06 actualizado)'
  );
  assert.ok(
    astro.includes('latest-articles__link'),
    'el enlace de la card no lleva la clase latest-articles__link (REQ-36-04)'
  );
});

test('REQ-20-07: el componente no supera las 100 líneas sin lógica ni estilos embebidos', () => {
  const astro = readComponent();
  const lineCount = countLines(astro);
  assert.ok(
    lineCount <= 100,
    `latest-articles.astro tiene ${lineCount} líneas (máximo 100, REQ-20-07)`
  );
  assert.doesNotMatch(
    astro,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(/,
    'el componente contiene lógica de negocio en el frontmatter (REQ-20-07)'
  );
  assert.doesNotMatch(
    astro,
    /\bstyle\s*=/,
    'el componente conserva el atributo style inline (REQ-20-07)'
  );
  assert.doesNotMatch(
    astro,
    /<style/i,
    'el componente contiene un bloque <style> embebido (REQ-20-07)'
  );
  assert.doesNotMatch(
    astro,
    /\breadFileSync\b|new\s+URL\(/,
    'el componente lee archivos o URLs de datos directamente (REQ-20-07)'
  );
});

test('REQ-20-07: la hoja conserva la regla de la feature 17 sin superar 100 líneas', () => {
  const css = readCss();
  const lineCount = countLines(css);
  assert.ok(
    lineCount <= 100,
    `latest-articles.css tiene ${lineCount} líneas (máximo 100, REQ-20-07)`
  );
  const rule = css.match(/\.latest-articles__image\s*\{([\s\S]*?)\}/);
  assert.ok(rule, 'latest-articles.css no conserva la regla .latest-articles__image (REQ-20-07)');
  assert.match(
    rule[1],
    /width\s*:\s*100%/,
    'la regla de la imagen no conserva width 100% (REQ-20-07)'
  );
  assert.match(
    rule[1],
    /aspect-ratio\s*:\s*16\s*\/\s*9/,
    'la regla de la imagen no conserva aspect-ratio 16/9 (REQ-20-07)'
  );
  assert.match(
    rule[1],
    /object-fit\s*:\s*cover/,
    'la regla de la imagen no conserva object-fit cover (REQ-20-07)'
  );
  assert.match(
    rule[1],
    /var\(--radius-card\)/,
    'la regla de la imagen no conserva var(--radius-card) (REQ-20-07)'
  );
  assert.match(
    rule[1],
    /var\(--color-border\)/,
    'la regla de la imagen no conserva var(--color-border) (REQ-20-07)'
  );
  assert.match(
    rule[1],
    /var\(--gap-card\)/,
    'la regla de la imagen no conserva var(--gap-card) (REQ-20-07)'
  );
  assert.doesNotMatch(
    rule[1],
    /#[0-9a-fA-F]{3,8}\b/,
    'la regla de la imagen contiene un color hex hardcodeado (REQ-20-07)'
  );
  assert.doesNotMatch(
    rule[1],
    /rgba?\(/,
    'la regla de la imagen contiene rgb()/rgba() hardcodeado (REQ-20-07)'
  );
});