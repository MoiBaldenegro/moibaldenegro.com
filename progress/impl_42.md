# Informe de implementación — feature 42 sitemap-robots-endpoints

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/42_sitemap-robots-endpoints/requirements.md` (sin design.md). La carpeta
  `specs/42_post-header-horizontal-card/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/domain/seo/sitemap.ts` (NUEVO, 44 líneas) | `buildSitemap(posts, site)`: `/`, `/about/` y `/posts/<encodeURIComponent(id)>/` con loc absoluto sobre el origin del site, `lastmod` YYYY-MM-DD desde `updated` o, si falta o no es válido, `created` (parseSpanishDate), escape XML de `& < > " '`; excluye /search, términos y /404 (REQ-42-02..06). `robotsTxt(site)`: `User-agent: *`, `Allow: /`, `Sitemap: <site>/sitemap.xml` (REQ-42-07). |
| `src/pages/sitemap.xml.ts` (NUEVO) | `prerender = true`, `GET` → `buildSitemap(PostsRepository.getPosts(), site)` con `application/xml; charset=utf-8` (REQ-42-01). |
| `src/pages/robots.txt.ts` (NUEVO) | `prerender = true`, `GET` → `robotsTxt(site)` en `text/plain; charset=utf-8` (REQ-42-07). |
| `tests/sitemap-robots-endpoints.test.mjs` (NUEVO) | Unitarios con Posts de prueba (slug con espacio y con `&`), inspección de los endpoints, sin dependencias nuevas y build a outDir temporal (helper): `client/sitemap.xml` y `client/robots.txt`. |

Decisión: las `loc` llevan barra final (`/about/`, `/posts/<slug>/`), igual que los canonical de la
feature 35, para no mandar a los buscadores señales distintas para la misma URL.

## Ciclo rojo/verde (REQ-42-09)

Rojo — antes de crear `src/`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\seo\sitemap.ts'
ℹ pass 0 / ℹ fail 1
```

Verde — el test nuevo pasa 9/9; `pnpm test` 640/640 en 5 corridas seguidas; `./init.sh` verde.
Dos corridas previas de `./init.sh` dieron rojo en tests sin reproducirse fuera (init descarta la
salida): coincide con el flake preexistente de tmp-audit.css, que corrige la feature 59.

## Resultado del build

`dist/client/sitemap.xml` lista `/`, `/about/` y los 8 posts con lastmod; `dist/client/robots.txt`
apunta a `https://moibaldenegro.com/sitemap.xml`.
