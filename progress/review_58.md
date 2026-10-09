# Review — feature 58

**Veredicto:** APPROVED

Alcance revisado: `public/site.webmanifest`, `src/layouts/Layout.astro` (solo la
eliminación de `<meta name="generator" content={Astro.generator} />`) y
`tests/manifest-generator-cleanup.test.mjs` (nuevo). El resto del diff de
Layout.astro pertenece a features ya APPROVED y no se re-revisa.

## Pregunta de revisión
- Test-first: `progress/impl_58.md` documenta el rojo previo (`pass 1 / fail 3`:
  58-01, 58-02 y 58-03 en rojo, 58-05 en verde) y el verde final (4/4; suite 747/747). Cumple REQ-58-04.
- Dependencias: `depends_on: [35]` y la 35 está en `done`.

## Requisitos
- REQ-58-01: `public/site.webmanifest:2-3` con `name` y `short_name` = `moibaldenegro.com`; el JSON es válido y el resto no cambia.
- REQ-58-02: no hay `name="generator"` ni `Astro.generator` en `src/` (lo confirma grep).
- REQ-58-03: el test 58-03 hace el build en un outDir temporal y revisa la portada, /about, /search, /404 y todos los posts. En `dist/client` solo coincide «generator» en metadatos binarios de PNG, no en ningún HTML.
- REQ-58-05: Layout.astro tiene 64 líneas, el test 42 y el manifest 20.
- REQ-58-06: `./init.sh` en verde (formato, tests, build) y `pnpm test` con 747/747 en verde, 0 fallos.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>`): [x]
- C2 (frontmatter sin lógica): [x] (la feature solo elimina una línea del head)
- C3 (datos vía repositorios): [x] (no aplica)
- C4 (tokens, sin valores hardcodeados): [x] (no toca CSS)
- C5 (<= 100 líneas): [x]
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` en verde): [x]
- C8 (aspecto en desktop y móvil): [ ]  ← Razón: no se inspeccionó en navegador. El cambio no afecta a la presentación, así que no bloquea.
- C9 (estado del backlog): [ ]  ← Razón: la feature sigue en `in_progress`. El líder la pasa a `done` al cerrar.

## Observación (no bloqueante)
- `theme_color` y `background_color` siguen en `#ffffff`, fuera del alcance de la spec. Como apunta el informe, se puede valorar en una feature futura.

## Cambios requeridos
Ninguno.
