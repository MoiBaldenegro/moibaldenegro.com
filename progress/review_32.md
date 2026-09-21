# Review — feature 32

**Veredicto:** APPROVED

## Checkpoints
- C1: [x] Estilos en `src/styles/*.css`; ningún `.astro` contiene `<style>` (grep `<style` en `latest-articles.astro` = 0).
- C2: [x] Sin lógica JS en UI; frontmatter solo importa y pasa datos (`latest-articles.astro` líneas 1-6: imports + `slice(0,3)`; lógica en `latest-articles-scroll.ts`).
- C3: [x] Ningún componente lee JSON directamente (vía `PostsRepository`, sin cambios).
- C4: [x] Tokens, no valores sueltos (test REQ-32-09: sin hex ni `rgb()/rgba()` en `latest-articles.css`; `latest-articles-scroll.ts` sin CSS).
- C5: [x] ≤100 líneas por archivo (scroll.ts 85, astro 39, css 94 — verificados con `node -e` y test REQ-32-10).
- C6: [x] Sin dependencias nuevas (`gsap` pre-existente de la 28; `package.json` sin cambios).
- C7: [x] Datos/entidades intactos (la 32 no toca `src/data/` ni repositorios; suite verde).
- C8: [x] Repos con errores nombrados intactos (no se toca `posts-repository.ts` 100/100).
- C9: [x] `./init.sh` en verde (verificado por el revisor: formato ✔, tests 100% ✔, build ✔).
- C10: [ ] Página visual en desktop/móvil sin errores de consola ← Razón: pendiente de inspección humana en navegador; el reviewer no dispone de navegador.
- C11: [ ] `feature_list.json` con la 32 en `done` ← Razón: la 32 sigue en `in_progress`; el paso a `done` lo hace el líder al cierre (no bloquea el veredicto técnico).
- C12: [x] `progress/current.md` documenta la sesión; evidencia rojo/verde en `progress/impl_32.md`.
- C13: [x] Sin temporales, debug ni TODOs (diff limpio: solo `latest-articles-scroll.ts` + `pin-spacer-scroll-fix.test.mjs` + spec + research).

## Pregunta de revisión
- ¿Test antes del código, en rojo, y suite verde al final? Sí. `progress/impl_32.md` documenta el rojo (`SyntaxError: ... does not provide an export named 'clampPinDistance'`, tests 1 / pass 0) antes del código y el verde posterior (`pin-spacer-scroll-fix` 9/9, 29/30/31 + navegación 47/47, `pnpm test` 587/587, `./init.sh` verde; re-verificado por el revisor: 9/9 + `init.sh` verde).
- ¿Dependencias en `done`? Sí: la 32 declara `depends_on: [31]` y la 31 está en `done` (`28/29/30/31` done; la 10 `in_progress` no es dependencia de la 32).

## Puntos críticos (regresión humana: hueco gigante + scroll roto)
1. Spacer acotado — OK. `distance()` usa `clampPinDistance(track.scrollWidth, window.innerWidth)` (`latest-articles-scroll.ts:67`) con tope `min(raw, 3*viewport)`; `end: () => \`+=${distance()}\`` (`:76`) deriva del recorrido acotado. Test unitario lo atrapa funcionalmente: `clampPinDistance(20000,1280)=3840 < viewportDistance=18720` (`tests/pin-spacer-scroll-fix.test.mjs:74-78`). El spacer máximo queda en ~3 viewports + 100vh de sección: acotado, no desproporcionado.
2. Scroll vertical — OK. Eliminado `invalidateOnRefresh: true` (diff confirma su retirada) y el `ScrollTrigger.refresh()` incondicional; refresco vigilado (`:83-84`: inmediato solo si `readyState==='complete'`, si no una sola vez en `load` con `{ once: true }`). Tests lo atrapan: `doesNotMatch invalidateOnRefresh`, `doesNotMatch` refresh desnudo a inicio de línea, `match` listener `load` (`test.mjs:96-111`). Sin patrón de bucle (un refresh por init como máximo; `x`/`end` funcionales se evalúan una vez por trigger sin `invalidateOnRefresh`).
3. Conserva 29/30/31 — OK. `pin: true` + `scrub: true` + `x` (`:69,77-78`, NO carrusel: sin `scroll-snap`, sin `<button>`); full-bleed (`latest-articles.css:8-10`: `100vw` + `calc(50% - 50vw)`); enganche temprano `start: 'top bottom'` (`:75`); centrado (`:33-36`: `min-height: 100vh` + flex + `justify-content: center`); pares `title-${post.id}`/`img-${post.id}` + `slice(0,3)` (`latest-articles.astro:12,20,22`); live-search (`landingHidden`, `data-landing-sections`, `astro:page-load` + `getAll().kill()`); reduced-motion (`:62`, test REQ-32-06); sin JS (grid base visible, test REQ-32-07).
4. Tests no existenciales — OK. Aserciones sobre valores (`2400/1200→1200`, `20000/1280→3840`, `100000/1000/2→2000`, `end+=3840`) y sobre configuración prohibida/esperada vía regex con código despojado de comentarios, no mera existencia de archivos.

## Notas (no bloqueantes)
- El diff vs `HEAD` incluye también cambios de 30/31 (full-bleed, `viewportDistance`, `start: 'top bottom'`, centrado) porque esas features están `done` pero sin commit; `impl_32.md` dice "CSS sin cambios", lo que es cierto solo dentro del alcance de la 32 (el CSS lo aportaron 30/31). Sin impacto en el veredicto: el estado acumulado es el revisado y queda verde.
- `overflow: hidden` en `.latest-articles--scroll` se conserva (el research lo listaba como agravante); es el recorte horizontal necesario de la pista y no bloquea el scroll vertical del documento. No se exige su retirada en la spec.
- `feature_list.json` y `progress/current.md` + `history.md` + `research/gsap-horizontal-cards.md` aparecen modificados en el working tree por el ciclo del líder/implementer; fuera del alcance de la 32 y sin efecto en el veredicto.

## Cambios requeridos (si aplica)
Ninguno.
