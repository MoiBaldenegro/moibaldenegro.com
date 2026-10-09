# Informe de implementación — feature 34 not-found-page

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/34_not-found-page/requirements.md` + `design.md`. (La carpeta histórica
  `specs/34_htb-section-degradation-restore/` es de otra feature 34 anterior; no se toca.)

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/search-results/term-route.ts` | `statusForTermPath(pathname): 200 \| 404`: 404 si el primer segmento es `posts` o el último tiene extensión (`/\.[a-z0-9]+$/i`); 200 en otro caso (REQ-34-02/03). Función pura. |
| `src/components/not-found/not-found.astro` (NUEVO) | `<main class="not-found">` con tarjeta, h1 «Página no encontrada», texto del design y enlaces «Volver al inicio» (/) y «Buscar artículos» (/search). Importa `not-found.css`, sin `<style>` (REQ-34-01/08). |
| `src/styles/not-found.css` (NUEVO) | Mismo ancho que `.search-page`; colores, radio y espaciados solo con tokens (`--color-text`, `--color-text-secondary`, `--color-accent`, `--color-surface`, `--color-border`, `--radius-card`, `--gap-card`, `--container-max`) (REQ-34-08). |
| `src/pages/404.astro` (NUEVO) | `prerender = true`, Layout con `noindex` + NotFound (REQ-34-01/06). |
| `src/pages/[...term].astro` | `status = statusForTermPath(pathname)`; `Astro.response.status = status`; el título y el cuerpo alternan con un ternario en la plantilla (NotFound vs. resultados), sin `if` en el frontmatter; Layout con `noindex` (REQ-34-04/06/07). |
| `src/pages/search.astro` | Layout con `noindex` (REQ-34-06). |
| `src/layouts/Layout.astro` | Prop opcional `noindex` → `{noindex && <meta name="robots" content="noindex" />}` (REQ-34-05). |
| `tests/not-found-page.test.mjs` (NUEVO) | Unitarios de statusForTermPath, inspección de páginas/componente/hoja y un build real a un **outDir temporal** (`os.tmpdir()`), para no pisar `dist/` mientras about-page y otros tests de build corren en paralelo. |
| `tests/root-term-search.test.mjs` | REQ-07-07: la regex del título acepta el ternario (contrato cambiado por REQ-34-04). |

## Ciclo rojo/verde (REQ-34-09)

Rojo — `node --test tests/not-found-page.test.mjs` antes de tocar `src/`:

```
SyntaxError: The requested module '../src/components/search-results/term-route.ts' does not provide an export named 'statusForTermPath'
ℹ pass 0 / ℹ fail 1
```

Verde — el test nuevo pasa 9/9 (el build temporal tarda unos 3 s); `pnpm test`: 590/590 tras
actualizar REQ-07-07. `./init.sh`: formato ✔, tests ✔, build ✔.

## Notas

- Términos con punto (p. ej. `/node.js`) pasan a ser 404 por definición de REQ-34-02; la búsqueda
  sigue disponible en `/search?q=node.js`.
- `not-found.astro` usa `<main>`: la feature 38 moverá el `main` único al Layout.
