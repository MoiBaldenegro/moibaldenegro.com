# Review — feature 44

**Veredicto:** APPROVED

Feature: `article-json-ld` (spec `specs/44_article-json-ld/requirements.md`; se ignoró
`specs/44_performance-jank-reduction/`, que es histórica). Revisada a nivel 1 contra la spec,
`docs/architecture.md`, `docs/conventions.md` y `CHECKPOINTS.md`. Implementó el líder en el rol
de implementer con autorización humana explícita; se revisó con el mismo rigor.

## Dependencias
- `depends_on: [35]` y la 35 está en `done`. No se saltó ninguna dependencia pendiente.

## Trazabilidad REQ → evidencia
- REQ-44-01: `src/domain/seo/json-ld.ts:24-26` (`@context`, `@type`, `headline`); test REQ-44-01.
- REQ-44-02: `json-ld.ts:22,29-30` (`parseSpanishDate`; `dateModified` usa `datePublished` si no
  hay fecha); test REQ-44-02 (`2026-09-19` / `2026-10-01`).
- REQ-44-03: `json-ld.ts:31` (author Person con `new URL('/about', site)`); test con `deepEqual`.
- REQ-44-04: `json-ld.ts:28,33` (image absoluta y mainEntityOfPage = canonical con barra final,
  reutiliza `canonicalUrl` de `head.ts`); test REQ-44-04.
- REQ-44-05: `json-ld.ts:39-41` (`</script` -> `<\/script`, sin distinguir mayúsculas). El test
  comprueba que el resultado no contiene `</script`, que sí contiene el escape y que `JSON.parse`
  devuelve el título original.
- REQ-44-06: `src/pages/posts/[id].astro:42` (const `jsonLd`) y `:63` (`<script type="application/ld+json"
  is:inline set:html={jsonLd}>`). El test de build recorre todos los posts y exige exactamente un
  ld+json parseable con `@type` BlogPosting. Comprobado también a mano en `dist/client/posts/00-agilismo/index.html`:
  un único `ld+json` correcto, con URLs absolutas sobre `https://moibaldenegro.com`.
- REQ-44-07: `progress/impl_44.md` (sección «Ciclo rojo/verde») recoge el rojo
  `ERR_MODULE_NOT_FOUND ... src\domain\seo\json-ld.ts` antes de crear el código de producción.
- REQ-44-08: `json-ld.ts` 41 líneas, `[id].astro` 86 líneas, `tests/article-json-ld.test.mjs` 73 líneas.
- REQ-44-09: `./init.sh` ejecutado por el reviewer y terminado en verde: entorno, formato,
  tests al 100 % y build. En esta corrida no apareció el flake de la feature 59.

## Ajuste de los 6 tests heredados
`code-copy-button`, `next-post-button`, `related-card-model`, `related-cards-present`,
`related-posts-list` y `related-titles-design-align` sustituyen `/<script/i` por
`/<script(?![^>]*type="application\/ld\+json")/i`, y cada cambio lleva un comentario que lo justifica.
La búsqueda hacia delante negativa solo deja pasar etiquetas `<script` que llevan
`type="application/ld+json"` dentro de la propia etiqueta. `<script>`, `<script type="module">`
y `<script is:inline>` siguen fallando, así que la prohibición de JS de runtime en la página
del post no se debilita. Se mantienen los mensajes de error y el resto de aserciones
(`client:`, `<style`, `style=`). Correcto.

## Checkpoints
- C1 (estilos solo en `src/styles`, sin `<style>` en `.astro`): [x]
- C2 (lógica fuera de la UI): [x]. El frontmatter solo llama a funciones puras del dominio, igual que con `resolveRelatedTitles`.
- C3 (datos vía repositorio): [x]. `post` llega de `PostsRepository` vía props.
- C4 (tokens, sin valores hardcodeados): [x]. No se toca CSS.
- C5 (máx. 100 líneas): [x]
- C6 (sin dependencias externas): [x]. Solo stdlib y módulos propios.
- C7 (`./init.sh` verde): [x]
- C8 (estático por defecto): [x]. El ld+json son datos, no JS ejecutable.
- C9 (test-first documentado en `progress/impl_44.md`): [x]
- C10 (dependencias en `done`): [x]
- C11 (visual desktop/móvil): [ ]. No se ha verificado en el navegador. Esta feature no cambia nada visible, así que no bloquea.

## Observaciones no bloqueantes
1. `src/domain/seo/json-ld.ts:3-4`: el comentario dice que añadir hora y zona horaria es
   «decisión del humano». Según `progress/impl_44.md`, el humano ya decidió («pon lo que consideres
   mejor») y se mantiene `YYYY-MM-DD`. Conviene actualizar el comentario en una sesión futura.
2. Si `created` no se puede parsear, `parseSpanishDate` devuelve `''` y `datePublished` saldría
   vacío. Con los datos actuales no pasa (lo garantiza el test de build). Es un caso límite que
   habría que vigilar en el repositorio, no en esta feature.

## Cambios requeridos
Ninguno.
