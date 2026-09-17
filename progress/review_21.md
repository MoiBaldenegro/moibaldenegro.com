# Review — feature 21

**Veredicto:** APPROVED

## Checkpoints
- C1: [x] — Estilos en `src/styles/*.css`; ningún `.astro` contiene `<style>` (`src/pages/posts/[id].astro` sin `<style>`/`style=` verificado por grep; estilos en `src/styles/post-next.css`).
- C2: [x] — Sin lógica JS en UI; frontmatter solo importa y pasa datos (cuerpo solo itera `post.related.map` líneas 63-67; sin `<script>`, cero JS).
- C3: [x] — Ningún componente lee JSON directamente: destinos solo desde entidad `Post` vía `PostsRepository` (`href={href}` de `post.related`, sin `entry.data.related`/`data.related`; `PostsRepository` presente línea 8).
- C4: [x] — Solo tokens de `tokens.css`, sin hardcodeo (`--gap-card`, `--color-text`, `--color-accent`, `--color-accent-hover`, `--color-surface`, `--radius-card`, `--transition-default` todos declarados; sin hex ni `rgb()/rgba()`; BEM `.post__related`, `.post__related-title`, `.post__related-list`, `.post__related-link` + `:hover`).
- C5: [x] — Ningún archivo supera 100 líneas (`[id].astro` 72, `post-next.css` 71, `post.css` intacto en 100).
- C6: [x] — Sin dependencias externas nuevas.
- C7: [x] — `src/data/*.json` válido y tipado (capa de datos de feature 20 intacta).
- C8: [x] — Repositorios validan con errores nombrados sin fallos silenciosos (sin cambios de contrato; suite verde).
- C9: [x] — `./init.sh` termina en verde (verificado por el reviewer: formato OK, tests 100%, build OK).
- C10: [ ]  ← Razón: inspección visual desktop/móvil ≤768px no verificable por el reviewer (pendiente estructural de `CHECKPOINTS.md`, no bloquea; la media `@media (max-width: 768px)` con `.post__related-link { width: 100% }` líneas 58-71 existe).
- C11: [ ]  ← Razón: `feature_list.json` mantiene la feature 21 en `in_progress`; el `done` lo marca el líder tras este APPROVED (estado esperado del flujo).
- C12: [x] — `progress/current.md` documenta la sesión y `progress/impl_21.md` trae evidencia rojo/verde.
- C13: [x] — Sin temporales, `print()` de debug ni TODOs sin contexto.

## Pregunta de revisión
¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final? Sí. `progress/impl_21.md` §Ciclo rojo documenta `tests/related-posts-list.test.mjs` (8 tests) ejecutado sin modificar `[id].astro`/`post-next.css`: 6/8 en fallo (REQ-21-01..06) y solo pasan límite de líneas y convención (estado heredado de feature 19); ningún código de la feature existía antes del rojo. §Ciclo verde documenta 15/15 (regresión REQ-19 + REQ-21) y `./init.sh` verde con `pnpm test` 488/488. El reviewer re-ejecutó `./init.sh` en verde (formato, tests 100%, build).
¿Se saltó una dependencia pendiente? No. `depends_on: [19, 20]` — ambas en `done` en `feature_list.json` (19 `next-post-button`, 20 `related-posts-data`).

## Convivencia y spec
- REQ-21-01/02: sección `<section class="post__related">` con `<h2>Recomendados</h2>` y `<ul>` iterando `post.related`, condicionada a `{post.related && (...)}` (líneas 59-70 de `[id].astro`).
- REQ-21-03: convive con el pie `post__next` (líneas 54-58) condicionado por separado a `{post.next && (...)}`; ambos visibles si coexisten.
- REQ-21-04/05/06/07 y convención (sin `<style>`/JS, `post.css` intacto, breakpoint 768px): verificados en disco y cubiertos por `tests/related-posts-list.test.mjs` (162 líneas), en verde.

## Cambios requeridos (si aplica)
Ninguno.
