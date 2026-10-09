# Informe de implementación — feature 44 article-json-ld

- Fecha: 2026-10-08 (iniciada en la sesión 1 y terminada en la sesión 2 tras el handoff).
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` sigue sin estar disponible en la sesión de Claude Code).
- Spec: `specs/44_article-json-ld/requirements.md` (sin design.md). La carpeta
  `specs/44_performance-jank-reduction/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/domain/seo/json-ld.ts` (NUEVO, 41 líneas) | `blogPostingJsonLd(post, site)`: `@context` schema.org, `@type` BlogPosting, headline, description, image absoluta de la portada, datePublished/dateModified YYYY-MM-DD vía parseSpanishDate (modified cae a published), author Person `{name, url: <site>/about}` y mainEntityOfPage = canonical del post (barra final). `serializeJsonLd(data)`: `JSON.stringify` + `</script` → `<\/script` (REQ-44-01..05). |
| `src/pages/posts/[id].astro` (85 líneas) | `jsonLd = serializeJsonLd(blogPostingJsonLd(post, site))` y `<script type="application/ld+json" is:inline set:html={jsonLd}>` (REQ-44-06). |
| `tests/article-json-ld.test.mjs` (NUEVO) | Unitarios + build a outDir temporal: un único ld+json BlogPosting parseable por post. |
| 6 tests heredados (`code-copy-button`, `next-post-button`, `related-card-model`, `related-cards-present`, `related-posts-list`, `related-titles-design-align`) | Prohibían cualquier `<script` en la página del post. Ahora prohíben cualquier `<script` salvo `type="application/ld+json"` (datos estructurados, no JS de runtime), con el ajuste documentado junto a la aserción (precedente REQ-43-06). Comprobado: la regex sigue detectando `<script>` y `<script type="module">`. |

## Decisión sobre fechas (respuesta del humano: «pon lo que consideres mejor»)

Se mantienen fechas sin hora ni zona horaria (`YYYY-MM-DD`): son ISO 8601 válidas para
schema.org/Article, y el frontmatter solo tiene el día, así que añadir hora o zona inventaría una
precisión que no existe. Aplica también a `article:published_time` de la feature 43.

## Ciclo rojo/verde (REQ-44-07)

Rojo — antes de crear `src/`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\seo\json-ld.ts'
```

Tras implementar, el test nuevo pasó 7/7 y fallaron los 6 tests heredados anteriores (contrato
cambiado). Se ajustaron y la suite quedó en 654/654 (2 de 3 corridas; la otra cayó solo en el flake
preexistente REQ-25-07 de tmp-audit.css, feature 59). `./init.sh`: formato ✔, tests ✔, build ✔.
