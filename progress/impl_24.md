# Informe de implementación — Feature 24 related-card-model

> Feature 24 — related-card-model: resolver las propiedades de cada
> recomendado en build como objeto con título, imagen y meta.
> Spec: specs/24_related-card-model/requirements.md (REQ-24-01..06).
> Research: progress/research/recomendados-cards-objetos.md.

## Qué se hizo

- `src/domain/related-titles.ts` (23 → 29 líneas, ≤100 OK): `RelatedLink`
  extiende con `readonly img: string`, `readonly author: string` y
  `readonly readtime: number`; `resolveRelatedTitles` resuelve las tres
  desde los `Posts` recibidos con el mismo `Map` por href (`/posts/<id>`)
  que hoy resolvía el título. Un href sin Post conocido degrada a
  `{ href, title: href, img: '', author: '', readtime: 0 }` sin lanzar
  (nunca rompe el build; la integridad la sigue auditando REQ-22-06).
- `tests/related-card-model.test.mjs` (nuevo): 7 tests contra
  REQ-24-01..06 + convención (esquema/entidad/repositorio/vista/CSS
  intactos, la vista no pinta cards — eso es feature 25).
- `tests/related-titles-design-align.test.mjs` (ajuste REQ-24-05,
  precedente REQ-43-06, justificación en el encabezado): fakePosts
  enriquecido con `img/author/readtime` y la aserción exacta REQ-23-01
  incluye las propiedades nuevas; los destinos `/posts/[id]` no cambian.

## Qué NO se tocó (scope)

- `src/content.config.ts` (esquema `related: z.array(z.string()).optional()`
  intacto), entidad `Post`, `posts-repository.ts` (98 líneas),
  frontmatter `*.md`, `src/pages/posts/[id].astro` ni `post-next.css`
  (eso es feature 25). Sin JS de runtime, sin dependencias, sin tokens.

## Evidencia del ciclo rojo/verde

### Rojo (antes de implementar, solo el test nuevo existía)

```
$ node --test tests/related-card-model.test.mjs
not ok 1 - REQ-24-01: RelatedLink expone href, title, img, author y readtime readonly
not ok 2 - REQ-24-02: resolveRelatedTitles resuelve img, author y readtime desde los Posts
not ok 3 - REQ-24-03: un href sin Post conocido degrada a href/título sin lanzar
ok 4 - REQ-24-04: esquema y frontmatter related conservan el arreglo de texto
not ok 5 - REQ-24-05: los tests REQ-23-01/02 ajustan la forma exacta con justificación
ok 6 - REQ-24-06: related-titles.ts no supera las 100 líneas
ok 7 - Convención: esquema, entidad, repositorio, vista y CSS intactos de la feature 25
# tests 7
# pass 3
# fail 4
```

### Verde (tras implementar + ajuste REQ-23 con justificación)

```
$ node --test tests/related-card-model.test.mjs tests/related-titles-design-align.test.mjs
# tests 16
# pass 16
# fail 0
```

```
$ ./init.sh
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Estado

- `feature_list.json`: feature 24 en `in_progress` (el `done` lo marca el
  cierre tras el `APPROVED` de `progress/review_24.md`).
- Listo para que el líder lance al reviewer.
