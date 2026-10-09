# Informe de implementación — feature 39 single-h1-headings

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/39_single-h1-headings/requirements.md` + `design.md`. La carpeta
  `specs/39_post-page-redesign/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| 7 posts (`00-agilismo`, `01-diseño_detallado`, `02-principios`, `04-ciclo-de-vida-y-arquitectura`, `05-diseno-arquitectonico-vs-diseno-detallado`, `os/00-prueba-os`, `os/01-procesos-memoria`) | La línea inicial `# NN. …` pasa a `## NN. …` con el mismo texto (REQ-39-01/02). Una línea por archivo; sin cambiar finales de línea. `03-principios_solid.md` no tenía `#` (su diff es de la feature 33). |
| `src/pages/about.astro` | El segundo `<h1>` pasa a `<p class="about__intro">{SITE_DESCRIPTION}</p>`: atiende además la observación del reviewer de la 35 (una sola fuente del texto, `src/domain/seo/head.ts`) (REQ-39-04/05). |
| `src/styles/about.css` (52 líneas) | `.about__intro`: `color: var(--color-text-secondary)`, `font-family: var(--font-sans)`, 1.2rem, `margin: var(--gap-card) 0 0` (REQ-39-06, design.md). |
| `tests/single-h1-headings.test.mjs` (NUEVO) | Guarda de markdown (ignora bloques cercados ``` / ~~~), textos de los 7 `##`, `p.about__intro` + regla con tokens, y build (outDir temporal vía `tests/helpers/astro-build.mjs`): un único `<h1` en cada post y en /about. |

## Ciclo rojo/verde (REQ-39-07)

Rojo — antes de tocar contenido y `src/`:

```
✖ REQ-39-01 · ✖ REQ-39-02 · ✖ REQ-39-05/06 · ✖ REQ-39-03/04 (build) · ✔ REQ-39-08
ℹ pass 1 / ℹ fail 4
```

Verde — el test nuevo pasa 5/5; `pnpm test`: 621/621. `./init.sh`: formato ✔, tests ✔, build ✔.
