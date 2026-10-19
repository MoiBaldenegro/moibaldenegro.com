# Review — feature 93

**Veredicto:** APPROVED

Alcance: solo el `git diff` de la 93 (ronda 3). Spec: specs/93_system-design-nav-link/requirements.md (REQ-93-01..40)
y design.md. Informe vigente: progress/impl_system-design-nav-link.md, sección «Ronda 3».
Literales humanos (2026-10-16): «si vas a tocar el menu hamburguesa mete diseño de sistemas igual si cabe… ponlo
completo también» y «pon una apertura suave tmb por que se abre y se cierra de golpe horrible ese menu hamburguesa».
Los dos quedan atendidos.

## Estado de la suite y su causa

- `./init.sh` (árbol de trabajo): entorno, formato y build en verde; el bloque de tests sale **rojo**.
  `pnpm test` da 1037 tests, 1033 pass y 4 fail:
  - REQ-33-05 (falta `public/assets/content/design00.webp`);
  - REQ-95-06/07/12;
  - REQ-30-13;
  - REQ-96-04/05.
- **No son de la 93. Lo comprobé por mi cuenta.** Hice un worktree limpio de HEAD (cc6bec9) en el scratchpad, con
  junction a node_modules y copia de `.env`, y ejecuté `pnpm build` y `node --test`. Los mismos 4 tests fallan igual.
  - La causa es el post del humano `src/content/posts/systems-design/00-systems-design-template.md`. Le falta la
    imagen de portada y pasa a ser el artículo más reciente, así que la portada ya no enlaza los 3 posts que esperan
    esos tests.
  - En el worktree falló además REQ-30-04 (wrangler types). Es cosa del entorno del worktree: en el árbol real pasa.
- El resto de la suite pasa al 100 %. Por indicación del líder, estos 4 fallos no cuentan contra la 93. Tampoco
  cuenta el 404 de `/assets/content/design00.webp`, el único error que dio la consola en todas las cargas.
- Lo que queda pendiente es del humano: añadir `public/assets/content/design00.webp` y decidir si el post plantilla
  debe publicarse, o reapuntar los tests de portada.

## Evidencia TDD (pregunta de revisión)

- El informe de la ronda 3 (líneas 284-304) documenta el rojo del test nuevo antes del código: pass 4 / fail 10, con
  las 4 guardas de regresión (02/03, 04/21/22, 13 y 37) en verde. Siguen dos rojos más tras medir:
  - pass 13 / fail 2 (REQ-93-34/36);
  - pass 14 / fail 1 (REQ-93-34, `transition: color`).
- Después viene el verde, 15/15, y la suite completa queda roja solo por los 4 fallos ajenos. Lo he reproducido.
- `depends_on: []`: no tiene dependencias pendientes.
- Tests heredados reapuntados con la nota «Ajuste feature 93 (precedente REQ-43-06)» (REQ-93-25):
  - tests/mobile-hamburger-menu.test.mjs:45;
  - tests/header-height-64.test.mjs:28;
  - tests/header-anchor-offset-mobile.test.mjs:14;
  - tests/geist-pixel-extend.test.mjs:27;
  - tests/sticky-footer.test.mjs:59. Aquí REQ-94-11 conserva lo que protegía la 94: la hoja no toca body, main ni
    el footer.

## Verificación independiente (Chrome headless + CDP, DPR 1, scrollbar real)

- Servidor y scripts:
  - Servidor propio: `pnpm build` y `pnpm preview --port 4396`. Lo paré al terminar; el dev server de :4321 no se tocó.
  - Scripts en el scratchpad: `rv93.mjs` (barrido), `rv93b.mjs` (animación desde scroll 0 y ClientRouter) y
    `rv93nojs.mjs` (sin JS).
  - Datos en `rv93*.json` y capturas en `rv93shots/`.
- **Barrido por ancho.** Medí `/` y `/posts/00-agilismo/` a 375, 768, 800, 850, 900, 969, 970, 1024 y 1280:
  - Desborde horizontal 0 en el header y en el documento en todos los anchos. Con el panel abierto, desborde 0 en el
    panel y en el documento.
  - Header de 65 px cerrado en todos los anchos, y también con el menú abierto (el contenido de `main` no se mueve:
    top 65 → 65).
  - Hasta 969 px: botón ☰, enlaces ocultos, panel cerrado `visibility: hidden` y opacity 0. Con el panel abierto se ve
    «Diseño de sistemas» en 1 línea.
  - Desde 970 px: sin botón, y «Diseño de sistemas» en la barra en 1 línea (139 × 19).
  - El enlace no tiene hijos ni aria-label.
- **aria-current.**
  - `page` en `/diseno-de-sistemas` y en `/diseno-de-sistemas/`, que responden 200 con 1 artículo.
  - Ausente en `/` y en `/arquitectura`.
- **Animación a 375 y 900 px.** Muestreé con rAF durante 600 ms, unas 38 muestras por acción.
  - Apertura: 15 valores intermedios de opacity (p. ej. 0,938 con translateY −0,5 px).
  - Visibility pasa a `visible` desde la primera muestra y el foco llega a `/about` durante la transición
    (REQ-93-34).
  - transitionend en la apertura: opacity y transform.
  - Cierre por botón, Escape, clic fuera y foco fuera: 15 valores intermedios cada uno, con visibility `visible`
    durante todo el cierre y `hidden` al final. transitionend en opacity, transform y visibility.
  - Header fijo en 65 px durante toda la animación.
  - aria-expanded: true al abrir, false al cerrar.
  - Escape devuelve el foco a `.site-menu__toggle`.
- **Menú cerrado.**
  - Fuera del orden de tabulación: `focus()` falla en todos los enlaces, el input y los botones del panel.
  - Fuera del árbol de accesibilidad (`Accessibility.getFullAXTree`): el link «Diseño de sistemas» y «@moibaldenegro
    (X, sitio externo)» solo aparecen con el menú abierto.
  - En `/search?q=rust` la X del buscador queda `hidden` y no es enfocable con el panel cerrado.
- **prefers-reduced-motion: reduce (emulado).** `transition-property: none` y 0 valores intermedios; se abre y se
  cierra al instante, sin transitionend, y el foco va a `/about`.
- **ClientRouter.** Hice `/` → clic en una card → post → `history.back()`.
  - `window.__mark93` sobrevive, así que no hubo recarga completa.
  - En cada página el menú arranca cerrado (`data-menu=closed`, hidden, aria-expanded false).
  - Apertura y cierre animan de nuevo a la ida y a la vuelta (15 valores intermedios) y el foco vuelve a `/about`.
- **Sin JS** (`setScriptExecutionDisabled`) a 375, 768, 900 y 969 px: header envuelto (165 / 123 px), sin desborde
  horizontal y enlace en 1 línea. A 970 px, barra de 65 px.
- **Consola.** 0 excepciones y 0 console.error; solo el 404 ajeno de design00.webp.
- **Observación preexistente, no de la 93.**
  - Lo que se ve: tras desplazarse más de un viewport (o al volver con el ClientRouter, que restaura el scroll), el
    header sale de pantalla y el botón ☰ no se ve.
  - La causa: `html, body { height: 100% }` (layout.css:6, REQ-94-04) limita el sticky a un viewport.
  - Ya estaba así en la 94. Desde scroll 0 todo funciona como se ha descrito.

## Checkpoints

- Estilos en `src/styles/*.css`, sin `<style>` en .astro: [x]
  - La apertura suave va solo en site-menu.css, como pide REQ-93-37.
- Sin lógica JS en la UI; el frontmatter solo importa y pasa datos: [x]
  - site-menu.ts solo cambia el literal de matchMedia (línea 28).
- Ningún componente lee JSON directamente: [x]
- Tokens, sin valores sueltos: [x]
  - La transición usa var(--transition-default).
  - `translateY(-0.5rem)` es un literal en rem, como permite design.md.
  - Sin colores literales; tokens.css no se toca.
- Archivos de código ≤ 100 líneas: [x]
  - Layout.astro 79, layout.css 99 (REQ-93-24), site-menu.css 89, search-bar.css 90 y site-menu.ts 78.
  - tests/system-design-nav-link.test.mjs tiene 128 líneas, en línea con el precedente de los tests del repo (más de 60
    superan 100).
- Sin dependencias externas: [x]
- `src/data/*.json` válido y repositorios con errores nombrados: [x]
  - La 93 no los toca.
- `./init.sh` en verde: [ ]
  - Razón: 4 tests en rojo, todos ajenos a la 93 (ver «Estado de la suite»). El build está en verde y el resto de la
    suite al 100 %.
  - El líder indicó que no cuentan contra la feature.
- Página correcta en desktop y móvil sin errores de consola: [x]
  - Ver la verificación independiente; el único error es el 404 ajeno.
- `feature_list.json` con la tarea en done: [ ]
  - Sigue `in_progress`, como corresponde: el cierre lo hace el líder tras este APPROVED.
- `progress/current.md` documenta la sesión: [x]
- Sin temporales, debug ni TODOs: [x]
  - nav-label.css está borrado y en `src` no queda ninguna mención a nav-label ni a site-menu__label-rest.

## Requisitos verificados

- **REQ-93-01..08:** enlace, aria-current, ruta con estado 200, menú conservado, sin hijos, sin aria-label y
  nav-label.css borrado.
- **REQ-93-09..13:**
  - 969/970 en layout.css (líneas 73 y 99), site-menu.css (líneas 12 y 81), search-bar.css (línea 78) y
    site-menu.ts (línea 28);
  - nowrap en layout.css:34;
  - el resto de media queries de src/styles sin cambios.
- **REQ-93-14..20:** mediciones de arriba. A 970 px no hay corte ni desborde.
- **REQ-93-21/22:** el tag ya está en HEAD y la 93 no toca src/content.
- **REQ-93-23/24:** 79 y 99 líneas.
- **REQ-93-25:** notas de reapunte presentes.
- **REQ-93-26 y REQ-93-39:** el informe trae la tabla, los rojos y 24 capturas en progress/research/nav93/impl/.
- **REQ-93-27..38:** verificados en el navegador.
  - REQ-93-30: la regla abierta (site-menu.css:56-63) omite visibility en su transition. Así visibility pasa a
    `visible` al instante al abrir y la transición se aplica al cerrar, que es lo que pide el requisito.
  - Esa desviación de design.md está justificada y medida en el informe, líneas 263-282.
- **REQ-93-40:** docs/conventions.md, líneas 66-68.

## Cambios requeridos (si aplica)

Ninguno para la feature 93.

Notas para el líder (no bloquean):
1. La suite seguirá en rojo mientras falte `public/assets/content/design00.webp` y el post plantilla siga siendo el
   más reciente. Lo tiene que decidir el humano (commit cc6bec9).
2. Opcional (spec_author): alinear design.md con las dos correcciones medidas.
   - La regla abierta va sin visibility en `transition`.
   - Los enlaces del panel llevan `transition: color var(--transition-default)`.
   - La X del buscador lleva `visibility: inherit` con el panel cerrado.
