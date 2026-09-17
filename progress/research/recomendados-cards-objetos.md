# Análisis — Recomendados como objetos con propiedades para cards pequeñas

> Reporte bruto del humano: "se ve muy feo que en la lista aparezca como tal el
> endpoint para darle click, enarray que sean objetos para meterle propiedades y
> poder renderizar una lista más bonita, incluso a modo de cards pequeñitas no
> sé, algo acorde al diseño de la página y bonito".
> Fecha: 2026-09-17. Rol: spec_author (solo research + alta en backlog, sin código).
> Feature 10 en `in_progress`: no se toca.

## Problema en palabras propias y alcance

El detalle `/posts/[id]` ya no muestra el endpoint crudo como texto: la
feature 23 resuelve títulos en build vía `src/domain/related-titles.ts`
(`RelatedLink {href,title}`) y la vista pinta
`<a href={item.href}>{item.title}</a>`. Lo que el humano ve "feo" es lo que
queda: una lista simple de títulos (una línea por item, hairline + wash en
`post-next.css`), sin propiedades visuales con las que componer algo más rico.
El pedido literal ("enarray que sean objetos para meterle propiedades") se
interpreta así: la vista debe recibir **objetos con propiedades** (título,
imagen, meta…) en vez de strings, y con esos objetos renderizar una lista más
bonita —cards pequeñas— acordes al diseño existente. Alcance: solo el pie del
detalle (`post.next`/`post.related`), el módulo `related-titles.ts`, el marcado
de `[id].astro` y `post-next.css`. Sin JS (prerender intacto), sin
dependencias, solo tokens. No se toca `post.css` (100/100) ni el repositorio
(98/100) ni la feature 10.

## Qué toca (capas, datos, repositorios, rutas)

- Fuente: frontmatter `related: string[]` de rutas `/posts/<id>` (features
  20/22, schema `z.array(z.string()).optional()` en `src/content.config.ts`).
- Entidad `Post.related: readonly string[] | null` (`post.ts`, 26 líneas).
- Repositorio `posts-repository.ts` (98/100 líneas, **sin margen**).
- View-model: `related-titles.ts` (23/100, con margen) — `RelatedLink`
  `{href,title}` + `resolveRelatedTitles(posts, related)`.
- Vista: `src/pages/posts/[id].astro` (73/100, ~27 de margen) — `getStaticPaths`
  resuelve `relatedLinks` y los pasa por props; marcado actual `ul > li > a`
  con solo el título.
- Estilos: `post-next.css` (91/100, **solo 9 de margen**) — filas con hairline
  + wash; `post.css` 100/100 (prohibido tocar).
- Canónico a reutilizar: modo lista de la feature 9 — `item-html.ts`
  (`src/components/search-results/item-html.ts`, 27 líneas: título enlazado a
  `/posts/[id]` + miniatura `/assets/content/<img>` 112×63 + meta
  `Por <author> • <readtime> min` + descripción con clamp 2 líneas + tags
  píldora) y `search-results.css` (62 líneas: hairline `var(--color-border)`,
  wash `var(--color-surface)` en hover, subrayado del título, `thumb` con
  `--radius-thumb`, media 768px que oculta la miniatura y compacta padding).

## Decisión: resolver propiedades en build desde los Posts existentes

**Se mantiene el frontmatter como `string[]` y se enriquece el view-model
`RelatedLink` con las propiedades que el diseño justifique
(título + img + meta).** El "array de objetos" que pide el humano vive en la
capa de dominio que la vista importa —no en el frontmatter—: `resolveRelatedTitles`
ya recibe `posts` y `related`, así que resolver `img`/`author`/`readtime` por
`href` es un lookup en el mismo `Map` que hoy resuelve el título, sin tocar
schema, entidad ni repositorio. Propiedades decididas: `title` (ya existe),
`img` (miniatura canónica 112×63 con `--radius-thumb`) y meta
(`author` + `readtime`, misma línea `Por X • N min` del héroe del detalle y del
item de búsqueda).

### Alternativas descartadas

1. **Enriquecer el frontmatter a objetos** (`related: [{href,title,img,…}]`).
   Descartada: obliga a cambiar el schema de `content.config.ts`, la entidad
   `Post.related`, `expectRelated` del repositorio y los 4+ frontmatter
   curados; el repositorio está en 98/100 (cualquier validación de objeto lo
   desborda → `blocked` automático); duplica en cada artículo datos
   (`title`, `img`) que ya viven en el Post destino y se desincronizan al
   editar un título; y rompe REQ-20-01..05 y REQ-22-01..07 (todos los tests de
   datos 20/22 habría que reescribirlos, no ajustarlos — precedente REQ-43-06
   solo ampara seguir a la presentación real, no redefinir el esquema).
2. **Reutilizar `item-html.ts` tal cual en el detalle.** Descartada: ese
   generador emite el item completo de búsqueda (descripción + tags + enlace
   `/posts/<id>` con `id` del índice) y es cliente-JS (`list.innerHTML` en el
   controlador); el detalle es prerender estático con props, no DOM
   client-side. Se reutiliza el *lenguaje* (thumb + meta + hairline + wash),
   no el módulo.
3. **Cards con descripción + tags (item completo).** Descartada: la descripción
   con clamp y la fila de tags píldora pertenecen al contexto de búsqueda
   (discriminar entre resultados); los recomendados ya están curados y la card
   debe ser pequeña —título + miniatura + meta bastan y dejan presupuesto de
   líneas—. Además cada propiedad extra es marcado en `[id].astro` (73/100) y
   CSS en `post-next.css` (91/100, 9 de margen): el implementer ya debe
   compactar para cerrar en ≤100 (precedente features 18/20).

## Riesgos y trabas

- `post-next.css` 91/100: la card (thumb + rejilla + responsive) no cabe sin
  compactar reglas existentes; si no cierra, el implementer pide `blocked`
  (regla 12), no supera el techo en silencio. `post.css` 100/100: no se toca.
- `[id].astro` 73/100: el marcado de card (img + body + meta) consume el
  margen; el frontmatter sigue solo con imports y paso de datos (regla 8).
- REQ-22-06 integridad (`related` apunta a `entry.id` existente, sin espacios):
  intacta —el frontmatter no cambia, así que ningún test de datos se toca.
- REQ-43-06 (tests siguen a la presentación real): extender `RelatedLink` con
  campos nuevos puede romper aserciones de forma exacta (`toStrictEqual` sobre
  `{href,title}`) de los tests REQ-23-01/02; la feature de modelo declara el
  ajuste con justificación en el encabezado. Los destinos `/posts/[id]` y los
  REQ-20/22 no cambian.
- Diseño: cards pequeñas en rejilla 2 columnas en desktop (thumb a la
  izquierda, cuerpo título + meta; reutiliza `--radius-thumb`,
  `--color-border`, `--color-surface`, `--font-sans`,
  `--transition-default`), 1 columna a ancho completo en ≤768px (la miniatura
  se oculta como en `search-results.css`, precedente REQ-09-09), cero JS.

## Descomposición

| Complejidad | Features | Criterio |
|-------------|----------|----------|
| Media (dominio + UI) | **2** | Separar modelo-objeto vs. presentación, patrón 18/19 y 20/21 |

- **24 `related-card-model`** (base, primero): extiende `RelatedLink` con
  `img`/`author`/`readtime` y `resolveRelatedTitles` los resuelve desde los
  `posts` (degradado al href/título actual si falta el post, nunca rompe el
  build). Sin UI (sin `design.md`). `depends_on: [23]` (extiende el contrato
  REQ-23-01/02).
- **25 `related-cards-present`** (presentación): `[id].astro` pinta cards
  pequeñas (thumb + título + meta) desde el view-model y `post-next.css` las
  estila con solo tokens, responsive 768px, cero JS, ≤100 líneas. Con
  `design.md` (toca UI). `depends_on: [24]` (pinta las propiedades que la 24
  entrega).
- Cada una independiente y testeable con `node:test` (unidad + inspección).
  `status: pending` en ambas; ninguna requiere dependencias externas.
