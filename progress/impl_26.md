# Informe de implementación — feature 26 next-related-hrefs-reales

- Feature: 26 — next-related-hrefs-reales (status: in_progress; NO se marca done: el cierre espera el APPROVED del reviewer en progress/review_26.md).
- Spec: specs/26_next-related-hrefs-reales/requirements.md (REQ-26-01..05, EARS). Sin design.md (no toca UI).
- Verdad de terreno: progress/research/anchor-sin-url.md — post.id = entry.id = slug = segmento de ruta (build en dist/client/posts/); el nombre de fichero NO es el id en 3 de 4 artículos. La feature 22 invirtió el diagnóstico y dejó 6 de 8 hrefs en MISS (anchor con la URL visible + botón Siguiente a 404).

## Plan ejecutado

- Test-first: escribir tests/next-related-hrefs-reales.test.mjs contra la spec y observarlo en rojo.
- Corregir SOLO frontmatter *.md a los slugs reales; no tocar esquema/entidad/repositorio/vista/CSS.
- Ajustar con justificación REQ-43-06 los tests previos que codificaban los hrefs de la 22.
- Validar contra post.id de PostsRepository (no filenames) y dejar ./init.sh en verde.

## Cambios (scope estricto)

Frontmatter (4 líneas next + 4 líneas related, nada más):

- 00-agilismo.md: next → /posts/01-diseño-detallado; related → [/posts/02-principios-del-diseno-de-software].
- 01-diseño_detallado.md: next → /posts/02-principios-del-diseno-de-software; related → [/posts/03-principios solid].
- 02-principios.md: next → /posts/03-principios solid; related conserva [/posts/00-agilismo].
- 03-principios_solid.md: related → [/posts/00-agilismo, /posts/01-diseño-detallado].
- No se tocó src/content.config.ts, src/domain/entities/post.ts, src/domain/repositories/posts-repository.ts, src/pages/posts/[id].astro ni ningún CSS.

Tests:

- NUEVO tests/next-related-hrefs-reales.test.mjs (REQ-26-01..05): REQ-26-01..04 asercionan los valores exactos; REQ-26-05 deriva los post.id del campo slug, inspecciona que PostsRepository entrega post.id desde entry.id (`(entry as Record<string, unknown>).id`) y resuelve cada href contra `PostsRepository.getPosts()` con loader inyectado (ids = slugs). En ningún punto se usa el nombre de fichero como id (solo localiza el fichero cuyo frontmatter se lee).
- AJUSTE tests/next-post-data.test.mjs (REQ-18-06 CHAIN → slugs reales; justificación REQ-43-06 en el encabezado: el test sigue al dato real).
- AJUSTE tests/next-related-hrefs-fix.test.mjs (REQ-22-01..04 → slugs reales; `entryIds()` ahora deriva del campo slug en vez de readdir; REQ-22-07 pasa de prohibir todo espacio a prohibir espacios perimetrales porque el slug canónico `03-principios solid` contiene un espacio interior — justificación REQ-43-06 en el encabezado).
- NO tocados tests/related-titles-design-align.test.mjs ni tests/related-card-model.test.mjs: usan fixtures sintéticos autocontenidos (no leen frontmatter) y siguen en verde; el cambio de contrato del fallback (REQ-24-03 vs filtrado) pertenece a la feature 27 anchor-nunca-url, que los ajustará.

## Evidencia rojo → verde

ROJO (antes de tocar frontmatter, solo el test nuevo contra los hrefs de la 22):

```
node --test tests/next-related-hrefs-reales.test.mjs
# tests 5
# pass 0
# fail 5
...
error: '00-agilismo.md declara next "/posts/01-diseño_detallado" sin post.id entregado por PostsRepository (REQ-26-05)'
```

Los 5 tests (REQ-26-01..05) fallaron: ningún href de la 22 coincide con un post.id del repositorio.

VERDE (tras la corrección + ajustes 18/22):

```
node --test tests/next-related-hrefs-reales.test.mjs tests/next-related-hrefs-fix.test.mjs
  tests/next-post-data.test.mjs tests/related-posts-data.test.mjs tests/related-card-model.test.mjs
  tests/related-titles-design-align.test.mjs tests/related-posts-list.test.mjs
  tests/related-cards-present.test.mjs tests/next-post-button.test.mjs tests/posts-repository.test.mjs
# tests 73
# pass 73
# fail 0
```

Suite completa del arnés:

```
./init.sh
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Notas para el reviewer

- El slug `03-principios solid` conserva su espacio literal a propósito: renombrarlo rompería URLs ya emitidas (deuda documentada en el research, fuera de alcance).
- REQ-22-07 original ("ningún valor contiene espacios") era incompatible con ese slug canónico; se estrechó a espacios perimetrales con justificación en el encabezado del test.
- La feature 27 (depends_on [26]) endurecerá el fallback de related-titles.ts sobre estos hrefs ya íntegros.
