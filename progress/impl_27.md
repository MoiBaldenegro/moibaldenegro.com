# Informe de implementación — Feature 27 anchor-nunca-url

- Feature: 27 — anchor-nunca-url (Endurecer el view-model para que el texto del anchor nunca sea una URL)
- Spec: specs/27_anchor-nunca-url/requirements.md (REQ-27-01..04, sin design.md)
- Research: progress/research/anchor-sin-url.md
- Estado: implementada, pendiente de review externo (no se marca done)

## Cambio

- `src/domain/related-titles.ts` (31 → 32 líneas, ≤100 OK): `resolveRelatedTitles`
  pasa de degradar (`{ href, title: href, ... }`) a filtrar con `flatMap`
  (href sin Post → `[]`). Conserva no-throw y `related === null → []`.
  Cabecera actualizada a REQ-27-01/02 y base feature 26 (post.id); sin tocar
  `.astro` ni CSS, sin JS de runtime.
- `tests/related-card-model.test.mjs` (ajuste REQ-24-03, precedente REQ-43-06
  documentado en cabecera): la aserción del href desconocido se invierte de
  degradado (`length 1, title === href`) a filtrado (`deepEqual []`)
  conservando `doesNotThrow`. Los destinos conocidos no cambian.
- `tests/anchor-nunca-url.test.mjs` (nuevo, REQ-27-01..04): omisión sin lanzar
  (mixto + solo-desconocidos → `[]`, títulos sin `/posts/`), un item por href
  conocido con título del Post, `null → []`, markup con `href={item.href}` /
  `>{item.title}<` sin `>{href}<` ni `>{item.href}<` más barrido funcional de
  `/posts/` en títulos, y conteo ≤100 líneas.

## Evidencia rojo (test-first, antes del código)

`node --test tests/anchor-nunca-url.test.mjs` → 2 pass / 2 fail:

```
not ok 1 - REQ-27-01: resolveRelatedTitles omite un href sin Post conocido sin lanzar
  error: el href desconocido no se omite del resultado (REQ-27-01) — 2 !== 1
not ok 3 - REQ-27-03: el texto de cada anchor muestra el título sin el prefijo /posts/
  error: el texto del anchor contiene la ruta /posts/no-existe (REQ-27-03)
# pass 2 # fail 2
```

Confirma el bug: el fallback titulaba con la ruta y la vista la pintaba en el anchor.

## Evidencia verde (después del código)

- `node --test tests/anchor-nunca-url.test.mjs tests/related-card-model.test.mjs
  tests/related-titles-design-align.test.mjs tests/related-cards-present.test.mjs`
  → `# pass 27 # fail 0`
- `./init.sh` → todo verde:
  `formato de feature_list.json y progress/current.md ✔`,
  `tests al 100% (node:test) ✔`, `build de producción (pnpm build) ✔`,
  `El entorno está perfecto.`

## Alcance y límites

- Solo REQ-27-01..04; no se toca `[id].astro` ni CSS (sin design.md).
- REQ-23/24/25 y features 20/22/26 sin cambios de contrato (suite verde).
