# Review — feature 42

**Veredicto:** APPROVED

Alcance: `src/domain/seo/sitemap.ts` (41 líneas), `src/pages/sitemap.xml.ts` (12),
`src/pages/robots.txt.ts` (11), `tests/sitemap-robots-endpoints.test.mjs` (91).
Spec: `specs/42_sitemap-robots-endpoints/requirements.md` (REQ-42-01..11).
Dependencias `depends_on` [34, 35]: ambas en `done`.

## Pregunta de revisión (test-first y suite verde)
- Rojo previo documentado en `progress/impl_42.md` (§Ciclo rojo/verde):
  `ERR_MODULE_NOT_FOUND ... src\domain\seo\sitemap.ts`, pass 0 / fail 1, antes de crear `src/`.
- Verde: test nuevo 9/9 (reproducido por el reviewer con `node --test`), `./init.sh`
  ejecutado por el reviewer: EXIT=0, tests al 100% y build OK.
- La feature no salta dependencias pendientes.

## Verificación contra la spec
- REQ-42-01: `src/pages/sitemap.xml.ts:7` `prerender = true`; Content-Type
  `application/xml; charset=utf-8` (l.11). `dist/client/sitemap.xml` generado.
- REQ-42-02: `/`, `/about/` y un `<url>` por post con loc absoluto sobre el origin del site
  (`sitemap.ts:25-29`). Comprobado en `dist/client/sitemap.xml`: 2 + 8 entradas.
- REQ-42-03: solo se emiten `/`, `/about/` y `/posts/...`; sin /search, términos ni /404.
- REQ-42-04/05: `parseSpanishDate(updated) || parseSpanishDate(created)` (`sitemap.ts:27`).
- REQ-42-06: `encodeURIComponent(post.id)` + `escapeXml` sobre la loc (`sitemap.ts:14-20,28`).
  Build: `03-principios%20solid`, `01-dise%C3%B1o-detallado`.
- REQ-42-07: `robotsTxt` (`sitemap.ts:39-41`) y `src/pages/robots.txt.ts` (prerender, text/plain);
  `dist/client/robots.txt` con `Sitemap: https://moibaldenegro.com/sitemap.xml`.
- REQ-42-08: sin dependencias nuevas (test l.70-74).
- REQ-42-10: los tres archivos de `src/` muy por debajo de 100 líneas.
- REQ-42-11: `./init.sh` verde.

Arquitectura/convenciones: lógica pura en `src/domain/seo/` (junto a `head.ts` de la feature 35),
endpoints finos que solo pasan datos del `PostsRepository`; sin acceso directo a JSON, sin JS
de runtime (prerender), sin dependencias.

## Observaciones no bloqueantes
1. `tests/sitemap-robots-endpoints.test.mjs:57-61` (REQ-42-06): como `encodeURIComponent`
   convierte `&` en `%26` antes de `escapeXml`, el caso `a&b` nunca ejercita la rama `&amp;`;
   la aserción de la l.60 se cumple de forma trivial. El escape XML queda como defensa sin
   cobertura efectiva. Aceptable porque el slug siempre se codifica antes.
2. REQ-42-05 se prueba con `updated: ''` y no con el campo ausente; el tipo `Post`
   (`src/domain/entities/post.ts:26`) exige `updated: string` y el repositorio usa
   `expectString`, así que `''` es el caso real de "sin updated". Aceptable.
3. Las loc llevan barra final (`/about/`, `/posts/<slug>/`) en lugar de `/about`; decisión
   justificada en `progress/impl_42.md` por coherencia con los canonical de la feature 35.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (la feature no toca UI)
- C2 Sin lógica en UI: [x] (endpoints `.ts` delegan en `buildSitemap`/`robotsTxt`)
- C3 Datos vía repositorio: [x] (`PostsRepository.getPosts()`)
- C4 Tokens: [x] (no aplica, sin CSS)
- C5 Máx. 100 líneas: [x]
- C6 Sin dependencias externas: [x]
- C7 `src/data/*.json` válido y tipado: [x] (sin cambios)
- C8 Repositorios con errores nombrados: [x] (sin cambios)
- C9 `./init.sh` verde: [x] (EXIT=0 en la ejecución del reviewer)
- C10 Desktop/móvil sin errores en consola: [x] (no aplica: endpoints XML/texto sin UI)
- C11 `feature_list.json` con la tarea en `done`: [ ]  ← Razón: sigue `in_progress`; el cierre lo hace el líder tras este APPROVED.
- C12 `progress/current.md` / `history.md` al día: [x]
- C13 Sin temporales, debug ni TODOs: [x] (el test borra su outDir temporal en `finally`)

## Cambios requeridos (si aplica)
Ninguno.
