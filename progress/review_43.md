# Review — feature 43

**Veredicto:** APPROVED

Feature 43 `social-meta-tags`. Spec: `specs/43_social-meta-tags/requirements.md`.
Implementado por el líder en rol de implementer (autorización humana explícita);
revisado con el mismo rigor que el implementer. Fecha: 2026-10-08.

## Verificación contra la spec

- REQ-43-01: `src/domain/seo/social.ts:31-39` emite og:title, og:description (fallback
  `SITE_DESCRIPTION`), og:url, og:image, og:type, og:site_name (`BRAND`), og:locale `es_MX`.
  Test `REQ-43-01` en `tests/social-meta-tags.test.mjs:24-31`. OK.
- REQ-43-02: og:url = `canonicalUrl(pathname, site)` (línea 34), el mismo helper que usa el
  `<link rel="canonical">` del Layout con el mismo `site`; og:image absoluta con
  `new URL(..., site)` (línea 35). OK.
- REQ-43-03: twitter:card `summary_large_image` y twitter:site `@moibaldenegro` (línea 46). OK.
- REQ-43-04: con `type === 'article'`, fechas vía `parseSpanishDate` (YYYY-MM-DD); modified
  cae a published si falta (líneas 40-45). `src/pages/posts/[id].astro:44` pasa
  `type="article"`, `published={post.created}`, `modified={post.updated}` (campo tipado en
  `src/domain/entities/post.ts:26`). OK.
- REQ-43-05: `DEFAULT_SOCIAL_IMAGE = '/assets/moises-hero.jpg'`; el archivo existe en
  `public/assets/`. OK.
- REQ-43-06: `src/layouts/Layout.astro:41` pinta las metas en el head de todas las páginas
  (un solo layout). Comprobado en el HTML real de `dist/` (post 00-agilismo): 11 metas
  correctas, sin atributos `name`/`property` sobrantes. Test de build en el test nuevo. OK.
- REQ-43-07: `progress/impl_43.md` documenta el rojo (`ERR_MODULE_NOT_FOUND` de
  `social.ts` antes de crear `src/`) y el verde (7/7, 647/647, `./init.sh` verde). OK.
- REQ-43-08: social.ts 48, Layout.astro 65, [id].astro 82, test 79 líneas. OK.
- REQ-43-09: `./init.sh` ejecutado por el reviewer: verde completo (formato, tests al 100%,
  build). No apareció el flake preexistente de la feature 59. OK.

## Arquitectura y convenciones

- Lógica en módulo `.ts` puro de `src/domain/seo/`; el frontmatter del Layout solo invoca la
  función y pasa datos (mismo patrón que `canonicalUrl`/`composeTitle` ya aprobado en 34/35).
- Lista devuelta congelada (`Object.freeze`), sin dependencias externas, sin `<style>`, sin
  JS de runtime, sin tokens afectados.
- Dependencias: `depends_on: [35]`, la 35 está en `done`.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 (sin lógica en UI; frontmatter solo importa y pasa datos): [x]
- C3 (datos vía repositorio): [x]  (el post llega desde `PostsRepository`)
- C4 (tokens, sin valores hardcodeados): [x]  (no toca CSS)
- C5 (máx. 100 líneas): [x]
- C6 (sin dependencias externas nuevas): [x]
- C7 (`./init.sh` verde): [x]
- C8 (vista desktop/móvil): [ ]  ← no aplica visualmente (sin cambio de UI); no inspeccionado en navegador.
- C9 (feature en `done`): [ ]  ← sigue `in_progress`; el cierre lo hace el líder tras este APPROVED.
- C10 (progress documentado): [x]
- C11 (sin temporales ni debug): [x]  (el test de build limpia su outDir en `finally`)

## Observaciones no bloqueantes

1. `og:locale es_MX` y fechas sin zona horaria son decisiones revisables por el humano,
   ya anotadas en la spec y en `impl_43.md`.
2. Varios posts comparten `arch00.webp` como imagen social; una portada por artículo
   mejoraría la vista previa (contenido, no código).

## Cambios requeridos (si aplica)

Ninguno.
