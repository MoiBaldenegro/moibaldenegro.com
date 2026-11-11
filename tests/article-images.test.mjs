import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
// Feature 15 (REQ-15-01): las imágenes de la prosa vienen de .mx-prose del design system MXVI.
const articleStyles = fs.readFileSync(
  new URL("src/styles/mxvi/components/organisms/prose.css", root),
  "utf8",
);
const post = fs.readFileSync(
  new URL(
    "src/content/posts/systems-design/02-principales-desafios-de-sistemas.md",
    root,
  ),
  "utf8",
);

test("article images are centered and responsive", () => {
  assert.match(articleStyles, /\.mx-prose img\s*\{/);
  assert.match(articleStyles, /display:\s*block/);
  assert.match(articleStyles, /max-width:\s*100%/);
  assert.match(articleStyles, /margin:\s*[^;]*auto/);
  assert.match(articleStyles, /border-radius:\s*var\(--radius-square\)/);
});

test("the systems design post uses semantic HTML figures", () => {
  assert.equal((post.match(/<figure class="post-image">/g) ?? []).length, 4);
  assert.equal((post.match(/<img /g) ?? []).length, 4);
  assert.doesNotMatch(post, /!\[[^\]]*\]\([^)]+\)/);
});
