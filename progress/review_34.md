# Review — feature 34

**Veredicto:** APPROVED

Alcance: feature 34 `not-found-page` (specs/34_not-found-page/). Archivos revisados:
`src/components/search-results/term-route.ts` (L34-42), `src/components/not-found/not-found.astro`,
`src/styles/not-found.css`, `src/pages/404.astro`, `src/pages/[...term].astro`, `src/pages/search.astro`,
`src/layouts/Layout.astro` (prop `noindex`, L10-14 y L29), `tests/not-found-page.test.mjs`,
`tests/root-term-search.test.mjs` (solo REQ-07-07, L205-211). Los cambios de favicon en Layout.astro y
los de selectores de limpiar en root-term-search.test.mjs son de las features 31/33, ya aprobadas: no se re-revisan.

## Requisitos

- REQ-34-01: [x] `404.astro` L6 `prerender = true`, usa Layout + NotFound; `not-found.astro` L7 h1 «Página no encontrada», L10-11 enlaces a `/` y `/search` con los textos del design.
- REQ-34-02/03: [x] `statusForTermPath` (term-route.ts L38-42), función pura; 404 con primer segmento `posts` o extensión en el último segmento, 200 en el resto. Tests L35-45.
- REQ-34-04: [x] `[...term].astro` L27-28 fija `Astro.response.status`; L32-40 alterna NotFound/resultados. Verificado en runtime con `astro dev`: `/wp-login.php` 404, `/posts/no-existe` 404, `/404` 404 (con h1 «Página no encontrada»); `/docker` y `/arquitecturax` 200 con «Búsqueda por término».
- REQ-34-05: [x] Layout.astro L29 `{noindex && <meta name="robots" content="noindex" />}`; el test de build (L74-90) confirma que `/` y un post no lo llevan.
- REQ-34-06: [x] `404.astro` L9, `search.astro` L24, `[...term].astro` L31 pasan `noindex`; en runtime las tres respuestas llevan el meta.
- REQ-34-07: [x] el frontmatter de `[...term].astro` no tiene `if`; el estado sale de `statusForTermPath`, y la alternancia es un ternario en la plantilla.
- REQ-34-08: [x] `not-found.css` usa solo tokens para colores, radio y espaciados (`--color-*`, `--radius-card`, `--gap-card`, `--container-max`). Hay dos literales, `font-size: 1.75rem` (L18) y `1px` de borde (L11), que siguen el precedente de `search-results.css` L8 y `latest-articles.css` L14/L26; no hay token tipográfico de tamaño equivalente.
- REQ-34-09: [x] `progress/impl_34.md` documenta el rojo (`SyntaxError ... does not provide an export named 'statusForTermPath'`, pass 0 / fail 1) antes de tocar `src/` y el verde posterior (9/9; suite 590/590).
- REQ-34-10: [x] líneas: term-route.ts 42, not-found.astro 14, not-found.css 36, 404.astro 11, [...term].astro 40, search.astro 30, Layout.astro 46, test 96.
- REQ-34-11: [x] `./init.sh` en verde (entorno, formato, tests al 100 %, build), ejecutado por el reviewer (exit 0).

Dependencias (`depends_on`): no aplican / todas en `done` según el backlog actual; no se ha saltado ninguna dependencia pendiente.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 (frontmatter solo imports y datos; lógica en .ts): [x] — `statusForTermPath` está en un módulo .ts; el frontmatter solo asigna.
- C3 (sin lectura directa de JSON): [x] — los posts siguen pasando por `PostsRepository`.
- C4 (tokens, sin valores hardcodeados): [x] — mismo criterio que REQ-34-08 (los literales de font-size y borde de 1px siguen el precedente del repo).
- C5 (≤100 líneas): [x]
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` en verde): [x]
- C8 (visual desktop/móvil): [ ] ← No se ha hecho inspección visual en el navegador. Sí se ha comprobado el HTML y el status servidos por el dev server.
- C9 (sin temporales ni debug): [x] — el test de build usa un outDir en `os.tmpdir()` y lo borra en `finally`.

## Observaciones (no bloqueantes)
1. El padding de `.not-found` (`calc(var(--gap-card) * 3)` / `* 4` = 42px/56px) no coincide del todo con `.search-page` (48px/64px); el ancho y el margen sí coinciden, como pide design.md. Es una diferencia estética menor.
2. Tal como reconoce el informe, los términos con punto (p. ej. `/node.js`) pasan a dar 404; lo exige la definición de REQ-34-02.
3. `not-found.astro` declara `<main>`; la feature 38 lo moverá al Layout.

## Cambios requeridos (si aplica)
Ninguno.
