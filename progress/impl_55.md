# Informe de implementación — feature 55 home-heading-hierarchy

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/55_home-heading-hierarchy/requirements.md` + `design.md`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/hero-card.astro` | `<h3>{card.title}</h3>` → `<p class="card-title">{card.title}</p>` (REQ-55-01); el `svg` declara `aria-hidden="true" focusable="false"` (REQ-55-03). |
| `src/components/latest-articles.astro` | El título de cada card pasa de `h2` a `h3` con la misma clase y el mismo `transition:name` (REQ-55-02). |
| `src/styles/hero-card.css` (79 líneas) | `.card-header h3` → `.card-title` (base y media query) con las mismas declaraciones: el cambio es invisible (REQ-55-05, design). `latest-articles.css` (98 líneas): `.latest-articles__title` declara `margin: 0.83em 0` (ronda 2; ver abajo). |
| `tests/home-heading-hierarchy.test.mjs` (NUEVO) | Inspección de marcado y estilos + build: la secuencia de `h1`–`h6` de la portada empieza por `h1` y nunca sube más de un nivel. |
| `tests/view-transitions.test.mjs` (REQ-24-03) | Busca `<h3 class="latest-articles__title">` (antes `h2`), con nota del ajuste (precedente REQ-43-06); variable renombrada a `cardTitle`. |
| `tests/link-image-accessible-names.test.mjs` (REQ-53-05, feature 53) | Lee el título de la card como `h3`. |

Secuencia resultante en la portada: `h1` (nombre) → `h2` «Últimos artículos» → `h3` por card. La
sección de HTB (`h2`) llega como server island después.

## Ciclo rojo/verde (REQ-55-06)

Rojo: ✖ 55-01 · ✖ 55-02 · ✖ 55-03 · ✖ 55-05 · ✖ 55-04 (build) · ✔ 55-07 (`ℹ pass 1 / ℹ fail 5`).
Tras implementar fallaron REQ-24-03 y REQ-53-05 (buscaban `h2`) y se ajustaron.
Verde — `pnpm test` 729/729 (×2); `./init.sh` verde.

## Ronda 2 — cambios requeridos de progress/review_55.md

1. **El margen del título venía de la hoja por defecto del navegador** (0.83em en h2, 1em en h3), así que cada card crecía ~7 px al pasar a h3. Primero la aserción nueva en REQ-55-05, en rojo (`el margen del título depende del nivel del encabezado`); después `.latest-articles__title { margin: 0.83em 0; }`: el valor que tenía el h2, declarado en la clase. En em, escala con el `font-size` de la media query móvil igual que antes.
2. **Verificación en Chrome headless** (CDP contra `astro preview`): el título es `H3` con margen 17,928 px a 1280 px y 15,272 px a 375 px, idéntico al margen por defecto de un `h2` con el mismo `font-size` (17,928 / 15,272 px). Apariencia sin cambios.
3. El test heredado REQ-30-08 fijaba `latest-articles.css` en 97 líneas; pasa a 98 con la justificación (precedente REQ-43-06), también en su comentario de cabecera.

`pnpm test` 729/729 (×2); `./init.sh` verde.
