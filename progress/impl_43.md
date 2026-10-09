# Informe de implementación — feature 43 social-meta-tags

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/43_social-meta-tags/requirements.md` (sin design.md). La carpeta
  `specs/43_hero-back-navigation-fix/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/domain/seo/social.ts` (NUEVO) | `socialMeta(input)` devuelve una lista congelada de `{ property \| name, content }`: og:title, og:description (fallback `SITE_DESCRIPTION`), og:url (= `canonicalUrl`), og:image absoluta (por defecto `/assets/moises-hero.jpg`), og:type (`website`/`article`), og:site_name `moibaldenegro.com`, og:locale `es_MX`; en artículos `article:published_time`/`modified_time` YYYY-MM-DD vía `parseSpanishDate` (modified cae a published si falta); `twitter:card summary_large_image` y `twitter:site @moibaldenegro` (REQ-43-01..05). |
| `src/layouts/Layout.astro` | Props `image`, `type`, `published`, `modified`; `social = socialMeta({...})` con el título compuesto y el mismo site que el canonical; el head pinta `{social.map(... <meta property name content />)}` (Astro omite el atributo `undefined`) (REQ-43-06). |
| `src/pages/posts/[id].astro` | Pasa `image={/assets/content/${img}}`, `type="article"`, `published={post.created}`, `modified={post.updated}`. |
| `tests/social-meta-tags.test.mjs` (NUEVO) | Unitarios de socialMeta y build a outDir temporal (helper): og:title, og:image absoluta y twitter:card en `/` y en un post; og:type article y published_time en el post. |

## Ciclo rojo/verde (REQ-43-07)

Rojo — antes de crear `src/`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\seo\social.ts'
```

Verde — el test nuevo pasa 7/7; `pnpm test` 647/647; `./init.sh` verde.

HTML real del post 01-procesos-memoria: og:title «Procesos y memoria - segundo post OS | moibaldenegro.com»,
og:url = canonical, og:image `https://moibaldenegro.com/assets/content/arch00.webp`, og:type article,
article:published_time 2026-09-19, twitter:card y twitter:site.

## Decisiones revisables por el humano

- `og:locale es_MX` y fechas sin zona horaria (spec). La doc oficial de X no pudo verificarse (402/404).
- 3 posts comparten `arch00.webp` como imagen social: una portada propia por artículo mejora la vista previa.
