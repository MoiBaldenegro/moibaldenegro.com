// Feature 107 hero-cards-links, ronda 3 (REQ-107-08/09): la clasificación de la liga vive en el dominio, no en el frontmatter.
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { isExternalHref } from '../src/domain/hero-card-link.ts';

test('REQ-107-08/09: isExternalHref solo es true para ligas https://', () => {
  assert.equal(isExternalHref('https://github.com/MoiBaldenegro'), true);
  assert.equal(isExternalHref('/about'), false);
  assert.equal(isExternalHref(null), false);
});
