# Review — feature 29

**Veredicto:** APPROVED

## Punto crítico (corrección del humano): scroll-driven vs carrusel

SCROLL-DRIVEN confirmado; ningún patrón carrusel detectado:

- `src/components/latest-articles-scroll.ts:52-63`: `gsap.to(track, { x: …, scrollTrigger: { trigger: section, pin: true, scrub: true, invalidateOnRefresh: true } })` — el scroll vertical conduce la traslación horizontal (pin + scrub, REQ-29-01/04).
- Sin `scroll-snap` como mecanismo: la única aparición de la cadena en el módulo son comentarios de cabecera (`latest-articles-scroll.ts:3`); el test `tests/horizontal-scroll-gsap-cards.test.mjs:107-112` lo blinda con `doesNotMatch /scroll-snap|scrollSnap/` sobre el código sin comentarios. `src/styles/latest-articles.css` no contiene `scroll-snap`.
- Sin navegación por botones/puntos: ni `latest-articles.astro` ni `latest-articles-scroll.ts` ni `latest-articles.css` declaran `<button>`, dots ni paginación (los `<button>` del repo pertenecen a `search-results`/`search-bar`, features 3/4, intactos).
- Sin animación de entrada desvinculada del scroll: no hay `gsap.from`, `IntersectionObserver`, `setInterval` ni `requestAnimationFrame` en los archivos de la feature; el único tween es el `gsap.to` con `scrub` — sin scroll no hay movimiento (design.md D2).
- Función pura `trackShift` (`latest-articles-scroll.ts:21-25`) verificada por test unitario: progreso 0 → 0, 0.5 → mitad, 1 → recorrido completo, con sujeción a [0, 1].

## Pregunta de revisión

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final? **Sí.** Evidencia en `progress/impl_29.md`: rojo previo `ERR_MODULE_NOT_FOUND: Cannot find module '.../latest-articles-scroll.ts'` solo con el test; verde posterior `tests 11 / pass 11 / fail 0`; suite completa `557/557` + build vía `./init.sh` (re-verificado por este reviewer el 2026-09-21: `./init.sh` termina en verde, tests al 100%, build OK). Dependencias: `depends_on [28]` con feature 28 en `done` — no se salta ninguna dependencia pendiente.

## Checkpoints

- C1 (estilos en `src/styles/*.css`, ningún `.astro` con `<style>`): [x]
- C2 (sin lógica JS en UI; frontmatter solo imports y paso de datos): [x] — `latest-articles.astro:1-6` solo 2 imports + `.slice(0, 3)`; lógica en `latest-articles-scroll.ts`
- C3 (ningún componente lee JSON directo; todo vía repositorios): [x] — `PostsRepository` intacto, sin cambios
- C4 (tokens de `tokens.css`, sin hardcodeados): [x] — test REQ-29-09 en verde; reglas nuevas (26-28, 82) solo `overflow`/`flex`/proporciones de layout, sin hex ni `rgb()/rgba()`
- C5 (≤100 líneas por archivo): [x] — `latest-articles-scroll.ts` 65/100, `latest-articles.astro` 39/100, `latest-articles.css` 83/100
- C6 (sin dependencias externas nuevas): [x] — `gsap` + `ScrollTrigger` desde el paquete `gsap` ya aprobado en `docs/dependencies.md:45-49` (feature 28); `package.json` sin cambios
- C7 (datos válidos; repositorios con errores nombrados, sin fallos silenciosos): [x] — capa de datos no tocada, suite en verde
- C8 (`./init.sh` en verde, tests al 100%, build): [x] — verificado por este reviewer
- C9 (página correcta en desktop y móvil ≤768px sin errores en consola): [ ]  ← Razón: pendiente de inspección visual humana en navegador (los tests verifican el contrato por inspección + unidades, no el render; ver `progress/impl_29.md` notas para el reviewer)
- C10 (`feature_list.json` con la tarea en `done`, ninguna otra a medias): [ ]  ← Razón: la feature 29 sigue en `in_progress`; el paso a `done` lo ejecuta el líder tras este APPROVED (no es defecto de la implementación)
- C11 (`progress/current.md` documenta la sesión, `history.md` al día): [x]
- C12 (sin temporales, `print()` de debug ni TODOs sin contexto): [x]

## Detalle de verificación en disco

1. Import `gsap` + `ScrollTrigger` del paquete dado de alta (`latest-articles-scroll.ts:13-14`, `registerPlugin` en línea 44; test REQ-29-02 en verde). ✅
2. Listener `astro:page-load` con limpieza de triggers (`latest-articles.astro:36-39` registra `initLatestScroll` vía `addEventListener`, sin llamada directa — test REQ-29-03 lo aserciona con `doesNotMatch /\n\s*initLatestScroll\s*\(/`; `ScrollTrigger.getAll().forEach(t => t.kill())` en línea 45). ✅
3. `prefers-reduced-motion` (`matchMedia('(prefers-reduced-motion: reduce)')` línea 48 + `shouldBuildTrigger` líneas 29-31; test REQ-29-05 en verde). ✅
4. Degradado sin JS (sección renderizada en HTML estático, sin `hidden`; base `display: grid` en `latest-articles.css:19-22`; modificador `--scroll` solo añadido con JS en línea 50; test REQ-29-06 en verde). ✅
5. Pares `title-<id>`/`img-<id>` intactos (`latest-articles.astro:20,22`; test REQ-29-07 en verde). ✅
6. Convivencia live-search (`landingHidden` vía ancestro `data-landing-sections` líneas 35-38, `shouldBuildTrigger` bloquea en modo resultados, `ScrollTrigger.refresh()` línea 64, no-op seguro `initLatestScroll(null, null)`; test REQ-29-08 en verde). ✅
7. JS de runtime justificado como excepción a estático por defecto (REQ-29-01, design.md D1/D3). ✅

## Cambios requeridos (si aplica)

Ninguno.
