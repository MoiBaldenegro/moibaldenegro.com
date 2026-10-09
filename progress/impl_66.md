# Informe de implementación — feature 66 site-domain-moisesbaldenegro

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). Origen: el humano confirma que el dominio real es moisesbaldenegro.com.
moibaldenegro.com da NXDOMAIN.

## Ciclo rojo/verde (REQ-66-09)

- Test nuevo `tests/site-domain-moisesbaldenegro.test.mjs` escrito primero.
- ROJO: `ℹ pass 1 / ℹ fail 5`. Solo pasaba REQ-66-08, la conservación de las cuentas
  @moibaldenegro y del Worker moibaldenegro-web.
- VERDE: 6/6. Suite completa 792/792; `./init.sh` en verde.

## Cambios

- Dominio y marca: cada literal `moibaldenegro.com` pasa a `moisesbaldenegro.com` en:
  - `astro.config.mjs` (site)
  - `src/domain/seo/head.ts` (BRAND y 2 comentarios)
  - `src/layouts/Layout.astro` (alt del logo)
  - `src/pages/about.astro` (título)
  - `src/domain/repositories/htb-profile-repository.ts` (User-Agent)
  - `public/site.webmanifest` (name y short_name)
  - `README.md` (título)
- Sin cambios (REQ-66-08): `@moibaldenegro` (hero.json, TWITTER_SITE, texto del enlace),
  `https://x.com/moibaldenegro` y el Worker `moibaldenegro-web` de wrangler.jsonc.
- Tests que fijaban el dominio viejo, ajustados con la nota «Ajuste feature 66 (precedente
  REQ-43-06)»: about-page, article-json-ld, layout-refactor, manifest-generator-cleanup,
  project-readme, search-keyboard-escape, security-headers, seo-head-base,
  sitemap-robots-endpoints, social-meta-tags y link-image-accessible-names. El cambio afecta a
  literales y a regex con el punto escapado.
- Líneas (REQ-66-10): ningún test pasa de ≤100 a >100 líneas (seo-head-base 99→100,
  sitemap-robots-endpoints 95→96, security-headers 87→88, link-image-accessible-names 78→79).
  about-page (265), layout-refactor (203), project-readme (132) y search-keyboard-escape (361) ya
  superaban 100 antes de esta feature; aquí solo suman la línea de la nota (deuda previa).

## Verificación

- El test de build (REQ-66-06) recorre index, about y un post (canonical, og:url, og:image y
  url/@id del JSON-LD), cada `<loc>` del sitemap y la línea Sitemap de robots.txt: todos
  empiezan por `https://moisesbaldenegro.com/`.
- Build de `./init.sh`: `<link rel="canonical" href="https://moisesbaldenegro.com/">`,
  `<title>About — moisesbaldenegro.com</title>`,
  `Sitemap: https://moisesbaldenegro.com/sitemap.xml`. `grep -rl moibaldenegro.com dist/client`
  no devuelve nada.

## Nota

El humano ya hizo commit de parte de este trabajo (c387cd8, «fix: update site domain
references…»). Los ajustes de regex con el punto escapado de 4 tests quedan en el working tree.
