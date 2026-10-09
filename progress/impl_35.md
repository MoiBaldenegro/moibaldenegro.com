# Informe de implementación — feature 35 seo-head-base

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/35_seo-head-base/requirements.md` (sin design.md). La carpeta
  `specs/35_specs-historico-restore/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `astro.config.mjs` | `site: 'https://moibaldenegro.com'` (REQ-35-01). |
| `src/domain/seo/head.ts` (NUEVO, 31 líneas) | `BRAND`, `composeTitle(title?)` («<t> \| moibaldenegro.com», sin duplicar la marca, marca sola sin título), `canonicalUrl(pathname, site)` (`new URL(...).href`, codifica espacios/no-ASCII) y los textos existentes `SITE_DESCRIPTION` (presentación de /about), `SEARCH_DESCRIPTION` (guía de /search) y `NOT_FOUND_DESCRIPTION` (texto del componente 404) (REQ-35-02/03/07/08). |
| `src/layouts/Layout.astro` | Prop `description`; `pageTitle = composeTitle(title)`, `canonical = canonicalUrl(Astro.url.pathname, Astro.site ?? Astro.url.origin)`. Head reordenado: `meta charset` → `viewport` → `title` → description → canonical → robots → favicons/manifest → generator (REQ-35-04/05/06). |
| `src/pages/index.astro` | `title={profile.name}` (HeroProfileRepository) y `description={SITE_DESCRIPTION}` (REQ-35-07). |
| `src/pages/about.astro`, `search.astro`, `404.astro`, `posts/[id].astro` | Pasan su description (`SITE_DESCRIPTION`, `SEARCH_DESCRIPTION`, `NOT_FOUND_DESCRIPTION`, `post.description`). `[...term].astro` no lleva description: es noindex. |
| `tests/seo-head-base.test.mjs` (NUEVO) | Unitarios de head.ts, inspección del Layout/config y build a outDir temporal: 1 description y 1 canonical por página, description de cada post = frontmatter, título y descripción de la portada. |
| `tests/layout-refactor.test.mjs` | REQ-08-02: el default `moibaldenegro.com` se comprueba en `composeTitle(undefined)` y el Layout pinta `{pageTitle}` (contrato cambiado por REQ-35-08). |

## Ciclo rojo/verde (REQ-35-09)

Rojo — `node --test tests/seo-head-base.test.mjs` antes de tocar `src/`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\seo\head.ts' imported from ...\tests\seo-head-base.test.mjs
ℹ pass 0 / ℹ fail 1
```

Tras implementar, la primera corrida dio 5/7: dos fallos eran **bugs del propio test**, no del
código: (1) `\s` sin doble escape dentro de un template literal (`new RegExp(...)`) rompía la lectura
del `slug`; (2) la regex del import exigía el orden `composeTitle, canonicalUrl`. Se corrigieron
(la segunda comprueba ambos nombres por separado, sin relajar el requisito). Luego 7/7.

Verde — `pnpm test`: 597/597 tras actualizar REQ-08-02. `./init.sh`: formato ✔, tests ✔, build ✔.

HTML real (`dist/client`): `/` → `<title>Moisés Baldenegro Melendez | moibaldenegro.com</title>`,
canonical `https://moibaldenegro.com/`; `/about/` → canonical `https://moibaldenegro.com/about/`;
post SOLID → canonical `https://moibaldenegro.com/posts/03-principios%20solid/`.

## Notas

- El canonical lleva barra final porque el build usa formato directorio (`about/index.html`);
  los enlaces internos del navbar van sin barra. Unificarlo (`trailingSlash`) queda fuera de alcance
  (audit_seo.md B4).
- Las descriptions duplicadas de 00-agilismo y 03-principios_solid son contenido: decisión del humano.
