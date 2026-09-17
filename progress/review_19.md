# Review — feature 19

**Veredicto:** APPROVED

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x] — `[id].astro:6` importa `../../styles/post-next.css`; sin `<style>` ni `style=` (verificado en disco y por test de convención).
- C2 (sin lógica JS en UI; frontmatter solo imports/paso de datos; cero JS runtime): [x] — sin `<script>`; pie estático `{post.next && (...)}` (`[id].astro:54-58`); `getStaticPaths` conserva el patrón previo vía `PostsRepository`.
- C3 (datos vía repositorio, sin leer JSON/colección directamente): [x] — destino `href={post.next}` (`[id].astro:56`); sin `entry.data.next`/`data.next`; `getCollection` solo empareja `entry.id` ↔ `post.id` (`[id].astro:20-21`).
- C4 (solo tokens de `tokens.css`, sin hardcode): [x] — `post-next.css` usa `var(--gap-card)`, `var(--color-accent)`, `var(--color-surface)`, `var(--radius-card)`, `var(--transition-default)`, `var(--color-accent-hover)`, todos declarados en `tokens.css`; sin hex ni `rgb()`; resto son keywords no tokenizables (`flex`, `none`, `100%`, `center`).
- C5 (≤100 líneas por archivo; BEM; responsive 768px; `post.css` intacto): [x] — `[id].astro` 60 líneas, `post-next.css` 36 líneas; clases `.post__next`/`.post__next-link` coherentes con el BEM `__` existente de la página; `@media (max-width: 768px)` con `width: 100%` (`post-next.css:27-36`); `post.css` intacto en 100 líneas.
- C6 (sin dependencias nuevas; spec EARS contra `acceptance`): [x] — REQ-19-01..06 cubiertos por `tests/next-post-button.test.mjs` (7 tests); `design.md` D1-D4 respetados (hoja nueva, `post.css` no tocado). Nota no bloqueante: el `design.md` menciona el texto como "Siguiente artículo →" pero el SHALL normativo (REQ-19-01 y `acceptance`) exige solo "Siguiente artículo", que es lo implementado.
- C7 (ciclo rojo/verde documentado en `progress/impl_19.md`): [x] — rojo 0/7 antes del código (`post-next.css` inexistente, sin texto `Siguiente artículo`), verde 7/7 tras implementar.
- C8 (dependencias en `done`): [x] — `depends_on: [18]` y feature 18 `next-post-data` está en `done` en `feature_list.json`.
- C9 (`./init.sh` verde): [x] — primera ejecución dio tests en rojo de forma transitoria; reejecutado: entorno ✔, formato ✔, tests 473/473 ✔ (`pnpm test` EXIT 0), build ✔ — "El entorno está perfecto."
- C10 (CHECKPOINTS visual `desktop/móvil` + `done` en `feature_list.json`): [ ] ← Razón: la inspección visual en navegador queda pendiente por definición del propio `CHECKPOINTS.md` (no verificable por el reviewer) y la feature sigue en `in_progress` a la espera de este APPROVED; ninguno de los dos puntos es un defecto del implementador.

## Cambios requeridos (si aplica)
Ninguno.
