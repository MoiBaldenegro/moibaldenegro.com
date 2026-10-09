# Informe de implementación — feature 33 broken-resources-fix

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/33_broken-resources-fix/requirements.md` (sin design.md).

## Cambios

| Archivo | Cambio |
|---|---|
| `src/layouts/Layout.astro` | Se quitan las 2 líneas `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` (archivo inexistente en public/) y la duplicada `<link rel="icon" href="/favicon.ico">` (ya cubierta por `rel="shortcut icon"`). Quedan una vez: favicon-96x96.png, favicon.ico, apple-touch-icon.png y site.webmanifest (REQ-33-01..03). El reordenamiento del head es de la feature 35. |
| `src/content/posts/architecture/03-principios_solid.md` | `img: arch03.webp` → `img: arch00.webp`, portada existente hasta que el humano aporte una propia (REQ-33-04). |
| `tests/broken-resources-fix.test.mjs` (NUEVO) | Guardas: sin favicon.svg, hrefs de favicon/manifest únicos, toda ruta local href/src del Layout existe en public/, img de cada post existe en public/assets/content/ (recorre src/content/posts recursivamente), Layout ≤100 líneas. |

`tests/related-posts-data.test.mjs:35` usa `arch03.webp` solo como fixture de un test unitario (no lee
el post real): no se toca.

## Ciclo rojo/verde (REQ-33-06)

Rojo — `node --test tests/broken-resources-fix.test.mjs` antes de tocar `src/`:

```
✖ REQ-33-01: Layout.astro no referencia /favicon.svg
✖ REQ-33-02: cada favicon y el manifest se declaran una sola vez
✖ REQ-33-03: cada ruta local de href/src del Layout existe en public/
✖ REQ-33-04: el post de SOLID usa arch00.webp, que existe
✖ REQ-33-05: el img de cada post existe en public/assets/content/
✔ REQ-33-07: Layout.astro no supera 100 líneas
ℹ pass 1 / ℹ fail 5
```

Verde — `pnpm test`: `ℹ pass 581 · ℹ fail 0`. `./init.sh`: formato ✔, tests ✔, build ✔. En
`dist/client/index.html` ya solo queda una mención a favicon (`/favicon.ico` aparte de los PNG).

## Pendiente del humano

- Aportar un `arch03.webp` propio para el post de SOLID si se quiere una portada distinta.
