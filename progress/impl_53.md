# Informe de implementación — feature 53 link-image-accessible-names

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/53_link-image-accessible-names/requirements.md` + `design.md`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/latest-articles.astro` | Miniatura de la card con `alt=""`: el enlace ya contiene el `h2` con el título, que antes se leía dos veces («Título Título») (REQ-53-01/05). |
| `src/components/search-results/item-html.ts` | Miniatura de resultados con `alt=""` (junto al título enlazado). |
| `src/pages/posts/[id].astro` | Portada `.post__image` con `alt=""` (junto al `h1`) y miniatura de recomendados con `alt=""`. |
| `src/layouts/Layout.astro` | Logo: `alt="Inicio — moibaldenegro.com"` (describe el destino) (REQ-53-02). Enlace a X: `@moibaldenegro<span class="visually-hidden"> (X, sitio externo)</span>` (REQ-53-03). |
| `src/styles/post-next.css` (26 líneas) | `.post__related-item { position: relative }` y `.post__related-link::after { content: ""; position: absolute; inset: 0 }`: toda la fila es clicable, mismo patrón que `search-results.css` (REQ-53-04). |
| `tests/link-image-accessible-names.test.mjs` (NUEVO) | alt vacío en las 4 imágenes, logo, aviso de X, `::after` y build: ninguna card de la portada repite el título en el `alt`. |
| 6 tests heredados | 4 fijaban el texto exacto del enlace a X (`architecture-nav-link`, `navbar-logo-home`, `remove-navbar-logo`, `restore-navbar-home-link`): ahora admiten el `span` visually-hidden. 2 fijaban `alt={post.title}` (`article-card-images` REQ-17-06, `latest-articles-restore` REQ-20-05): ahora `alt=""`, con nota del ajuste, mensajes, títulos y comentarios de cabecera actualizados (precedente REQ-43-06). |

## Ciclo rojo/verde (REQ-53-06)

Rojo: ✖ 53-01 · ✖ 53-02 · ✖ 53-03 · ✖ 53-04 · ✖ 53-05 (build) · ✔ 53-07 (`ℹ pass 1 / ℹ fail 5`).
Tras implementar fallaron los 6 tests heredados (contrato cambiado) y se ajustaron.
Verde — `pnpm test` 716/716 (×2); `./init.sh` verde.
