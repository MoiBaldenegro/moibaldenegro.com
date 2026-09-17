# Análisis — El anchor de recomendados muestra la URL en vez del título

> Reporte bruto del humano: "hay que meter un texto o título que reemplace a lo
> que metemos dentro del anchor, no que se vea la url en el anchor".
> Fecha: 2026-09-17. Rol: spec_author (solo research + alta en backlog, sin
> código; no se toca `src/` ni `tests/`).
> Evidencia verificada por el líder (no se re-verifica, se analiza).

## Problema en palabras propias y alcance

La vista `src/pages/posts/[id].astro` (línea 68) ya pinta
`<a class="post__related-link" href={item.href}>{item.title}</a>`: el texto del
anchor ES el título… cuando el view-model lo resuelve. Pero el build real
(`dist/client/posts/03-principios solid/index.html`) renderiza el segundo
recomendado como
`<a class="post__related-link" href="/posts/01-diseño_detallado">/posts/01-diseño_detallado</a>`:
la URL aparece como texto visible. El primer recomendado de esa misma página
sí muestra su título ("Agilismo, diseño y fragilidad"), así que el bug no está
en el marcado sino en los datos que lo alimentan. Alcance: solo frontmatter
`next`/`related` de los 4 artículos y el fallback de
`src/domain/related-titles.ts`. Sin JS, sin CSS nuevo (solo tokens si hiciera
falta), ≤100 líneas, test-first.

## Qué es entry.id realmente (y por qué la feature 22 lo invirtió)

- `src/domain/repositories/posts-repository.ts` (línea 37): `post.id` es
  `entry.id` tal cual lo entrega `getCollection("architecture")`.
- `src/pages/posts/[id].astro` `getStaticPaths` (línea 27): la ruta se emite
  con `params: { id: entry.id }`. O sea: **post.id = entry.id = segmento de
  ruta**. Son el mismo identificador en las tres capas.
- El loader es `glob` sobre `./src/content/architecture` (`content.config.ts`,
  líneas 6-9). Da igual qué regla interna use el loader para asignar el id:
  la verdad de terreno la dicta el build emitido. Y el build dice:

| Nombre de fichero | Campo `slug` del frontmatter | Ruta emitida en `dist/client/posts/` |
|---|---|---|
| `00-agilismo.md` | `00-agilismo` | `00-agilismo` |
| `01-diseño_detallado.md` (guion-bajo) | `01-diseño-detallado` (guion) | `01-diseño-detallado` |
| `02-principios.md` (corto) | `02-principios-del-diseno-de-software` (largo) | `02-principios-del-diseno-de-software` |
| `03-principios_solid.md` (guion-bajo) | `03-principios solid` (espacio) | `03-principios solid` |

- Conclusión: **entry.id = valor del campo `slug`, NO el nombre de fichero**
  (difieren en 3 de 4 artículos). La feature 22 asumió
  "entry.id = nombre de fichero" y "corrigió" los hrefs hacia los nombres de
  fichero: invirtió el diagnóstico. Los hrefs que tocó (slugs) eran los que
  resolvían; los que dejó (nombres de fichero) son los que rompen el lookup.
- Deuda visible que NO entra en alcance: el slug `03-principios solid`
  contiene un espacio literal (ruta con espacio en el dist). Renombrar slugs
  rompería URLs ya emitidas; se deja como está y los hrefs lo citan exacto.

## Tabla: href actual (feature 22) vs post.id real vs ruta del dist

| Origen | Href actual en frontmatter | post.id real / ruta del dist | ¿Resuelve? |
|---|---|---|---|
| `00` next | `/posts/01-diseño_detallado` (_) | `/posts/01-diseño-detallado` (-) | MISS |
| `00` related[0] | `/posts/02-principios` | `/posts/02-principios-del-diseno-de-software` | MISS |
| `01` next | `/posts/02-principios` | `/posts/02-principios-del-diseno-de-software` | MISS |
| `01` related[0] | `/posts/03-principios_solid` (_) | `/posts/03-principios solid` (espacio) | MISS |
| `02` next | `/posts/03-principios_solid` (_) | `/posts/03-principios solid` (espacio) | MISS |
| `02` related[0] | `/posts/00-agilismo` | `/posts/00-agilismo` | HIT |
| `03` related[0] | `/posts/00-agilismo` | `/posts/00-agilismo` | HIT (el dist muestra su título) |
| `03` related[1] | `/posts/01-diseño_detallado` (_) | `/posts/01-diseño-detallado` (-) | MISS (el dist muestra la URL) |

6 de 8 hrefs fallan. Efectos: (a) en `related-titles.ts` el `Map` con clave
``/posts/${post.id}`` no encuentra el href; (b) además los 3 `next` rotos
apuntan a rutas inexistentes (botón "Siguiente artículo" → 404).

## Por qué el fallback muestra la URL

`src/domain/related-titles.ts` línea 28:

```ts
if (!post) return { href, title: href, img: '', author: '', readtime: 0 };
```

Ante un href sin Post conocido degrada el **título al propio href**, y la
vista pinta `{item.title}` como texto del anchor → la URL queda visible. El
degradado se diseñó para "nunca romper el build" (REQ-24-03), pero convierte
un dato roto en un síntoma visible (URL como texto) más un enlace a 404. El
validador del repositorio (`/^\/posts\/.+/` en `expectNext`/`expectRelated`)
deja pasar cualquier ruta con ese prefijo, así que nada detuvo los 6 hrefs
rotos (riesgo ya asumido como R2 en su día).

## Descomposición

| Complejidad | Features | Criterio |
|---|---|---|
| Simple + simple (frontmatter; una función) | **2** | Separar datos curados vs. endurecimiento del view-model |

- **26 `next-related-hrefs-reales`** (base, primero): corrige los 6 hrefs a
  los post.id/rutas reales (valores exactos de la tabla; los 2 HIT se
  conservan). Solo frontmatter `*.md`, fuera del conteo de 100 líneas de
  `src/`. Sin `design.md` (no toca UI). `depends_on: []`.
- **27 `anchor-nunca-url`** (endurecimiento): el fallback de
  `resolveRelatedTitles` filtra el item sin Post conocido en vez de degradar
  su título a la ruta (filtrar, no titular: un título derivado seguiría
  enlazando a un 404; omitir mata los dos síntomas a la vez y conserva el
  no-throw de REQ-24-03), más test que barre `/posts/` en el texto visible de
  los anchors. `related-titles.ts` tiene 31/100 líneas (margen amplio). Sin
  `design.md` (no toca `.astro` ni CSS). `depends_on: [26]` (el
  endurecimiento se verifica sobre hrefs íntegros).
- Cada feature independiente y testeable con `node:test` (inspección +
  unidad), test-first, `status: pending`. Ninguna requiere dependencias
  externas. La feature 10 (`in_progress`) no se toca.
