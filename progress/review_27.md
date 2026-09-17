# Review — feature 27

**Veredicto:** APPROVED

## Checkpoints
- C1 (REQ-27-01 — href desconocido se omite sin lanzar): [x] — `src/domain/related-titles.ts:27-30` usa `flatMap` con `if (!post) return []`; `tests/anchor-nunca-url.test.mjs:65-86` verifica `doesNotThrow` en mixto y solo-desconocidos (`deepEqual []`) y que el item conocido conserva href/título.
- C2 (REQ-27-02 — conocidos devuelven un item por href con el título del Post): [x] — `src/domain/related-titles.ts:30` construye `{ href, title: post.title, ... }` desde el `Map` por `/posts/${post.id}` (`:26`); `tests/anchor-nunca-url.test.mjs:88-98` verifica 2/2 títulos y `null → []`.
- C3 (REQ-27-03 — ningún texto de anchor contiene /posts/): [x] — marcado intacto `href={item.href}` / `>{item.title}<` con `doesNotMatch` de `>{href}<` y `>{item.href}<` (`tests/anchor-nunca-url.test.mjs:100-127`) más barrido funcional `!item.title.includes('/posts/')`; el filtrado de C1 garantiza que un typo futuro no pinta la ruta.
- C4 (REQ-27-04 — ≤100 líneas, sin tocar .astro ni CSS): [x] — `src/domain/related-titles.ts` tiene 32 líneas (≤100); la feature solo toca ese módulo + tests (nuevo `tests/anchor-nunca-url.test.mjs` + ajuste `tests/related-card-model.test.mjs`); los diffs de `src/pages/posts/[id].astro` y `src/styles/post-next.css` en el árbol pertenecen al ciclo 23-25 sin commitear, sin cambios atribuibles a la 27 como declara `progress/impl_27.md`.
- C5 (ajuste REQ-24-03 con justificación): [x] — `tests/related-card-model.test.mjs:28-32` documenta el precedente REQ-43-06 en encabezado (degradado → filtrado) y `:119-128` invierte la aserción a `deepEqual []` conservando `doesNotThrow`; destinos conocidos (`REQ-24-02`) sin cambios.
- C6 (ciclo rojo→verde + ./init.sh): [x] — `progress/impl_27.md` documenta ROJO previo (`2 pass / 2 fail`: `2 !== 1` y título `/posts/no-existe`) y VERDE posterior (subset 27/27); re-verificado por el revisor: `./init.sh` en verde (formato + tests 100% + build OK).
- C7 (arquitectura/convenciones + depends_on + CHECKPOINTS.md): [x] — sin `<style>`, sin lógica en `.astro` (frontmatter solo importa/pasa datos), sin lectura directa de JSON, sin tokens nuevos ni dependencias, sin JS de runtime; el filtrado es contrato explícito REQ-27-01 que conserva el no-throw de REQ-24-03 (integridad auditada por REQ-26-05), no un fallo silencioso; `depends_on: [26]` todo en `done` (`feature_list.json:485-488`, feature 26 `done` en línea 471); CHECKPOINTS.md: arquitectura/datos en verde, `./init.sh` verde, inspección visual desktop/móvil pendiente (preexistente, no bloquea), feature 27 en `in_progress` a la espera de este APPROVED (correcto según protocolo).

## Cambios requeridos (si aplica)
Ninguno.
