# Review — feature 26 `post-page-styles`

**Veredicto:** APPROVED

Fecha: 2026-08-13. Revisado por el reviewer del arnés en disco, de forma
independiente y exhaustiva (reproducción completa de tests, build e init.sh).

- Spec: `specs/26_post-page-styles/requirements.md` (REQ-26-01..08) + `design.md`
  (Decisiones 1-5).
- Informe del implementer: `progress/impl_26_post-page-styles.md`.
- Análisis previo: `progress/research/estilos-posts-y-gol-removal.md`.

## Checkpoints

- C1: [x] Estilos en `src/styles/*.css`; ningún `.astro` contiene `<style>` ni
  `style=`. `post.css` (99 líneas) importada desde la página; verificado por
  test estructural y en disco.
- C2: [x] Sin lógica JS en UI. `[id].astro` ganó solo el import
  `../../styles/post.css` (38 → 39 líneas); el frontmatter no añade lógica
  nueva (la de `getStaticPaths` es de la feature 24, ya aprobada).
- C3: [x] Datos vía repositorio. La página consume `PostsRepository` (feature
  24); la 26 no introduce lectura directa de JSON (`test` lo asevera).
- C4: [x] Tokens, no valores sueltos. `node scripts/audit-design-tokens.mjs`
  → exit 0 ("ningún color fuera de tokens.css"); test REQ-26-05 verifica
  `var()` en color/background/border/border-radius/transition.
- C5: [x] ≤100 líneas en los archivos de la feature: `post.css` 99,
  `[id].astro` 39, `latest-articles.css` no tocado. El test
  `tests/post-page-styles.test.mjs` tiene 256 líneas, precedente sistemático
  del arnés (about-page.test.mjs 267, gol-performance.test.mjs 291,
  game-of-life-background.test.mjs 365 — todos APPROVED).
- [x] `./init.sh` termina en verde — reproducido por el reviewer:
  `✔ El entorno está perfecto.`
- [ ] La página se ve correcta en desktop/móvil — no verificable sin inspección
  visual en navegador (igual que en reviews previas).
- [ ] `feature_list.json` con la feature 26 en `done` — queda `in_progress`;
  el líder la marca `done` tras esta revisión (patrón del arnés).
- [x] `progress/current.md` documenta la sesión; `progress/history.md` al día;
  sin temporales ni debug.

## Pregunta de revisión (test-first)

¿Se escribió el test antes del código y en rojo, y la suite quedó en verde al
final? **Sí.** `tests/post-page-styles.test.mjs` se escribió antes de crear la
hoja; el informe documenta el ROJO (11 tests, 2 pass / 9 fail: "post.css no
existe", "no importa ../styles/post.css"). Estado final reproducido: 11/11 en
verde, suite 169/169, build OK, `./init.sh` "El entorno está perfecto".
La incidencia de la ruta de import (`../` vs `../../`) fue detectada por el
build dentro de `tests/about-page.test.mjs` (REQ-11-05) y corregida; queda
evidenciada en el informe (§1.3, §3).

Dependencias saltadas: ninguna. La feature 26 no declara `depends_on` en
`feature_list.json` (formato aceptado por el validador); sus dependencias
conceptuales están `done`: feature 24 (adaptación de `[id].astro` a
`PostsRepository` y `transition:name`) y feature 25 (estado final de
tokens.css, 87 líneas).

## Tabla REQ-26-XX con evidencia

| REQ | Contrato | Evidencia |
|-----|----------|-----------|
| REQ-26-01 | Test escrito antes de la implementación, sin navegador, verifica estructura y contrato | `tests/post-page-styles.test.mjs` (11 subtests estructurales, patrón about-page). ROJO documentado en `impl_26` §1.2 (2 pass/9 fail por hoja e import ausentes); VERDE reproducido 11/11. |
| REQ-26-02 | `[id].astro` importa `src/styles/post.css` | `[id].astro:2` → `import "../../styles/post.css";` (ruta correcta desde `src/pages/posts/`). Build real lo resuelve: regla inlined en `dist/client/posts/00-agilismo/index.html` y `01-diseño-detallado/index.html`. |
| REQ-26-03 | La hoja estiliza contenedor, título, meta, imagen y tipografía del contenido bajo las clases existentes | `post.css:5` (`.post`), `:17` (`.post__title`), `:24` (`.post__meta`), `:32` (`.post__image`), `:44-93` (scoping `.post__content h2/h3/p/ul/ol/li/a/code/pre`). Clases verificadas contra el marcado real de la página (`test` REQ-26-03 asevera `<main class="post">`, `article.post__content`, `post__title/meta/image`). |
| REQ-26-04 | Imagen 16:9, cover, `var(--radius-card)`, `var(--color-border)` | `.post__image` (post.css:32-40): `width: 100%`, `aspect-ratio: 16 / 9`, `object-fit: cover`, `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border)`, `margin: var(--gap-card) 0 32px`, `display: block` (precedente REQ-17-02..05). Verificado con grep en el CSS compilado. |
| REQ-26-05 | Colores/radios/bordes/transiciones solo desde tokens; tipografía/layout literales del componente | Test REQ-26-05 recorre las declaraciones de `color/background/border/border-radius/box-shadow/transition` y exige `var()`; las 10 tokens de la tabla del design.md se consumen (test lo asevera). Tipografía, paddings y `max-width: 760px` literales (precedente about/latest). `audit-design-tokens.mjs` exit 0. |
| REQ-26-06 | Máximo 100 líneas, sin hex ni rgba sueltos | `post.css` = 99 líneas (wc -l reproducido con el mismo conteo del test: sin contar la última línea vacía). Sin `#[0-9a-fA-F]` ni `rgba?\(` (test REQ-26-06, inspección visual, auditor). |
| REQ-26-07 | tokens.css sin cambios ni tokens nuevos | `tokens.css` = 87 líneas (estado canónico post-feature 25, alineado con `tests/article-card-images.test.mjs` REQ-17-09: 87). Sin `--post-*`, `--text-*`, `--font-size-*`, `--line-height-*`, `--reading-*` (test REQ-26-07). El acceptance original decía "96 líneas" por escribirse antes de REQ-25-03; el test documenta la alineación y el espíritu del REQ (sin cambios) se cumple. |
| REQ-26-08 | Suite y build en verde | Reproducido por el reviewer: `pnpm test` 169/169 (0 fail), `pnpm build` OK (3 páginas: `/index.html`, `/about`, `/posts/00-agilismo`, `/posts/01-diseño-detallado`), `./init.sh` "El entorno está perfecto". |

## Archivos tocados vs alcance permitido

| Archivo | Cambio | Alcance |
|---------|--------|---------|
| `tests/post-page-styles.test.mjs` | Nuevo (11 tests) | ✅ Permitido (REQ-26-01; test del patrón arnés) |
| `src/styles/post.css` | Nuevo (99 líneas) | ✅ Permitido (REQ-26-02/03/04/05/06) |
| `src/pages/posts/[id].astro` | +1 línea de import (38 → 39) | ✅ Permitido (REQ-26-02; sin lógica nueva, sin `<style>`, ≤100) |
| `feature_list.json` | `status: "in_progress"` para la 26 | ✅ Bookkeeping del arnés |
| `progress/current.md` | Sección "Feature en curso" | ✅ Bookkeeping del arnés |

No tocados (verificado): `src/styles/tokens.css` (87 líneas — el cambio a 87
viene de la feature 25, no de la 26), `src/styles/layout.css`,
`Layout.astro`, `latest-articles.astro` (sin enlace `/posts`: REQ-20-06
intacto, verificado con grep), dominio/repos, features 18-25. El árbol de
trabajo acumula los cambios ya revisados de las features 18-25.

## Observaciones finales

1. **Nota menor de documentación (no bloqueante):** `impl_26` §1.1 dice "12
   subtests" pero el archivo declara 11 `test()` (la salida del propio informe
   muestra `# tests 11`). No afecta al contrato ni a la verificación.
2. **Build en paralelo (nota del reviewer):** al lanzar `pnpm test` y
   `pnpm build` simultáneamente el build falló con `Cannot find module ...
   .prerender/chunks/...` porque REQ-11-05 (`tests/about-page.test.mjs`)
   ejecuta un `astro build` interno → dos builds concurrentes sobre `dist/`.
   En ejecución serial (orden del arnés: tests → build) todo pasa; **no es un
   defecto de la feature**. Confirmado con `rm -rf dist && pnpm build` OK.
3. El CSS compilado conserva la regla de la imagen (16:9, cover, tokens) en
   ambas rutas de post generadas — evidencia de que el import y la hoja
   entran en el bundle de producción real.
4. Decisión 4 del design (enlace a `/posts` desde `latest-articles` FUERA de
   alcance) respetada: el componente sigue sin `href` a `/posts` (REQ-20-06).

## Conclusión

La feature 26 cumple las 8 REQ de la spec, las convenciones de arquitectura y
el ciclo rojo/verde del arnés. Veredicto: **APPROVED**.