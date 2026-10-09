# Informe de implementación — feature 46 search-index-endpoint

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/46_search-index-endpoint/requirements.md` (sin design.md). Paso 1 de 2 (el 2 es la 47).

## Cambios

| Archivo | Cambio |
|---|---|
| `src/domain/search/index-json.ts` (NUEVO) | `searchIndexJson(posts, entries)`: bodies por `entry.data.slug`, `buildSearchIndex` y `JSON.stringify` con `</script` → `<\/script` (JSON válido). Única función de serialización (REQ-46-02/03). |
| `src/pages/search-index.json.ts` (NUEVO) | `prerender = true`, `GET` → `searchIndexJson(...)` con `application/json; charset=utf-8` (REQ-46-01/04). |
| `index.astro`, `search.astro`, `[...term].astro` | Sustituyen `entries` + mapeo de bodies + `JSON.stringify` + escape por `const indexJson = searchIndexJson(posts, await getCollection('posts'))`. El script embebido se mantiene hasta la 47: el comportamiento visible no cambia. |
| `tests/search-index-endpoint.test.mjs` (NUEVO) | Endpoint (prerender + Content-Type), los 4 consumidores usan la función única sin repetir el mapeo, salida de la función (bodies y escape) y build a outDir temporal: `client/search-index.json` existe y **es igual** al índice embebido de `/search`. |
| 4 tests heredados | `search-dedicated-view` (REQ-03-07), `search-landing-live-transition` (REQ-05-04), `root-term-search` (REQ-07-05 ×2) y `posts-unified-collection` exigían `JSON.stringify`, `buildSearchIndex`, el mapeo `entry.data.slug` y el literal `<\/script` **en cada página**. Ahora comprueban `searchIndexJson(` en la página y el mapeo/escape en el dominio (el escape, por su salida real). Ajuste documentado junto a cada aserción (precedente REQ-43-06). |

## Ciclo rojo/verde (REQ-46-05)

Rojo — antes de crear `src/`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\search\index-json.ts'
```

Tras implementar: test nuevo 5/5; fallaron 5 tests heredados (contrato movido al dominio) y se
reapuntaron. Verde — `pnpm test` 672/672 en 3 corridas; `./init.sh` verde.
`dist/client/search-index.json` se emite como asset estático.

## Ronda 2 — cambios requeridos de progress/review_46.md

| Punto | Resolución |
|---|---|
| 1. Dos aserciones de escape pasaban solo por un comentario | `tests/search-dedicated-view.test.mjs` (REQ-03-07) y `tests/search-landing-live-transition.test.mjs` (REQ-05-04) ya no buscan el literal `<\/script` en la página: comprueban la **salida real** de `searchIndexJson` con un post cuyo título contiene `</script>` (mismo patrón que `root-term-search` REQ-07-05), con nota del ajuste (precedente REQ-43-06). |
| 2. Comentarios obsoletos del frontmatter | `index.astro` y `search.astro` ya no dicen que la página serializa con `JSON.stringify` ni escapa: el comentario remite a `searchIndexJson`. Ninguna página contiene ya el literal `<\/script`. |
| 3. Verificación | `pnpm test` 672/672 en 3 corridas; `./init.sh` verde. |

**Prueba de mutación** (para demostrar que las aserciones protegen de verdad): se quitó temporalmente el
`.replace(...)` de `searchIndexJson` → fallan REQ-03-07, REQ-05-04, REQ-07-05 y REQ-46-02/03 (4 tests).
Se restauró el archivo (sin diff respecto a la versión revisada) → 0 fallos.
