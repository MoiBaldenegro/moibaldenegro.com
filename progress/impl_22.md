# Informe de implementación — Feature 22 next-related-hrefs-fix

> Fecha: 2026-09-17. Estado: implementada, pendiente de review externo.
> Spec: `specs/22_next-related-hrefs-fix/requirements.md` (REQ-22-01..07).
> Research previo: `progress/research/recomendados-next-design.md`.

## Qué se hizo

Corrección de los hrefs editoriales `next`/`related` a los `entry.id` reales
(nombre de fichero sin extensión; la ruta es `/posts/[id]` con
`params: { id: entry.id }`, verificado en `getStaticPaths` de
`src/pages/posts/[id].astro`). Solo frontmatter `*.md` en
`src/content/architecture/` — sin tocar `src/domain`, `src/pages`,
`src/styles` ni repositorio (98/100 líneas, intacto).

| Artículo | Campo | Antes (roto) | Después |
|----------|-------|--------------|---------|
| `00-agilismo.md` | `next` | `/posts/01-diseño-detallado` (guion vs guion-bajo → 404) | `/posts/01-diseño_detallado` (REQ-22-01) |
| `00-agilismo.md` | `related` (nuevo) | — (nulo, lista no se renderizaba) | `[/posts/02-principios]` (REQ-22-05) |
| `01-diseño_detallado.md` | `next` | `/posts/02-principios-del-diseno-de-software` (slug vs id → 404) | `/posts/02-principios` (REQ-22-02) |
| `01-diseño_detallado.md` | `related` (nuevo) | — (nulo) | `[/posts/03-principios_solid]` (REQ-22-05) |
| `02-principios.md` | `next` | `/posts/03-principios solid` (espacio literal → 404) | `/posts/03-principios_solid` (REQ-22-03) |
| `02-principios.md` | `related` (nuevo) | — (nulo) | `[/posts/00-agilismo]` (REQ-22-05) |
| `03-principios_solid.md` | `related` | `[/posts/00-agilismo, /posts/01-diseño-detallado]` (`related[1]` roto → 404) | `[/posts/00-agilismo, /posts/01-diseño_detallado]` (REQ-22-04) |

Los `related` nuevos en 00/01/02 son enlaces cruzados complementarios (no el
siguiente de la cadena): 00→02, 01→03, 02→00. Todos los ids existen y ningún
valor contiene espacios (REQ-22-06/07, auditados por test contra el glob real
del directorio).

## Ciclo rojo/verde (evidencia)

**Rojo** — `node --test tests/next-related-hrefs-fix.test.mjs` antes del fix:

```
# tests 7
# pass 0
# fail 7
```

(7/7 en fallo: p. ej. `00-agilismo declara next "/posts/01-diseño-detallado"
en lugar de "/posts/01-diseño_detallado" (REQ-22-01)` y
`02-principios.md declara el valor "/posts/03-principios solid" con espacios
(REQ-22-07)`).

**Verde** — tras el fix, tests nuevos + suites vecinas:

```
node --test tests/next-related-hrefs-fix.test.mjs tests/next-post-data.test.mjs
  tests/related-posts-data.test.mjs tests/related-posts-list.test.mjs
  tests/next-post-button.test.mjs tests/posts-repository.test.mjs
# tests 45
# pass 45
# fail 0
```

**Suite del arnés** — `./init.sh`: formato ✔, tests al 100% ✔, build ✔,
«El entorno está perfecto» (cero fallos).

## Ajuste colateral justificado (precedente REQ-43-06)

`tests/next-post-data.test.mjs` (REQ-18-06, `CHAIN`) codificaba los hrefs
rotos como valores esperados del frontmatter, así que fallaba tras la
corrección. Se actualizó `CHAIN` a los `entry.id` reales con la justificación
documentada en la cabecera del test. Los fixtures unitarios inyectados
(REQ-18-03/04/05, REQ-20-03/04/05) validan solo formato `/posts/.+` y siguen
en verde sin cambios. Ningún otro test depende de los valores curados
(REQ-21 inspecciona página/CSS, no frontmatter).

## Archivos tocados

- `src/content/architecture/00-agilismo.md` (next + related)
- `src/content/architecture/01-diseño_detallado.md` (next + related)
- `src/content/architecture/02-principios.md` (next + related)
- `src/content/architecture/03-principios_solid.md` (related)
- `tests/next-related-hrefs-fix.test.mjs` (nuevo, REQ-22-01..07)
- `tests/next-post-data.test.mjs` (CHAIN a ids reales + justificación)
- `feature_list.json` (22 → `in_progress`), `progress/current.md`

## Pendiente (fuera de scope)

- El `status: done` lo marca el cierre tras `progress/review_22.md` con
  veredicto `APPROVED` (verificado en disco).
- Base para la feature 23 (`depends_on: [22]`): títulos y alineación al
  design system sobre estos hrefs ya íntegros.
