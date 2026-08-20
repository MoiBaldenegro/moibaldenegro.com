# Análisis: logo en el navbar (regresión Home) + salto horizontal al navegar

> Sesión spec_author. Problema A (petición humana, prioridad alta): «El home fue
> reemplazado por el logo, ajusta lo que tengas que ajustar para que quede como
> estaba, era correcto». Problema B (petición humana): «arregla un pequeño
> saltito que se ve por ejemplo al clickar cualquier parte del nav, se ve un
> pequeño movimiento a la derecha, elimínalo».

## 1. Causa raíz verificada — Problema A (logo en el navbar)

Verificado en git y en disco (2026-08-20):

1. `git show 72e5c52:src/layouts/Layout.astro` (estado original «correcto»): el
   navbar es `Home` (texto plano, sin aria-current), `About` y `@moibaldenegro`.
   SIN logo. Confirmado.
2. `git show 686a7cc:src/layouts/Layout.astro` («clean up Layout.astro»): el
   enlace de texto Home fue REEMPLAZADO por el ancla del logo
   (`<a aria-current=... href="/"><img src="/assets/mxvi_logo.webp" width="72"/></a>`)
   seguida de About, Arquitectura, @moibaldenegro y SearchBar. El enlace de
   texto Home desaparece ahí.
3. Estado actual en disco (working tree = HEAD `4888e66`): logo (con
   aria-current para `/`) + Home (SIN aria-current) + About + Arquitectura +
   @moibaldenegro + SearchBar (Layout.astro L36-43).
4. Grep global de `mxvi_logo`: solo aparece en `src/layouts/Layout.astro`
   (y en el artefacto `progress/impl_12_restore-navbar-home-link.md`).
5. El asset `public/assets/mxvi_logo.webp` YA existía en el commit `72e5c52`
   (git log del archivo: aparece en 72e5c52 y se toca en b639d30) aunque el
   navbar no lo usaba: el archivo predata la regresión del navbar.

## 2. Interpretación final del Problema A (D1-D3)

- **D1 — «Como estaba» = enlace de texto Home sin logo en el navbar.** El
  humano dijo que el home «fue reemplazado por el logo» y que el estado previo
  «era correcto»: el estado previo verificado (72e5c52) no tiene logo en el
  navbar. El enlace Home de texto restaurado por la feature 12 es el que debe
  quedar. Se retira el ancla del logo de `Layout.astro`.
- **D2 — El enlace Home asume el rol del logo: `aria-current` de la portada.**
  El ancla del logo era el único marcador de la portada (`aria-current page`
  cuando `pathname === '/'`). Al retirarlo, el enlace Home toma ese rol:
  `aria-current={Astro.url.pathname === '/' ? 'page' : undefined}`. Así se
  conserva el contrato REQ-37-03 (≥2 aria-current con degradado `'page' :
  undefined`; tras el cambio: Home + About + Arquitectura = 3) y el estado
  activo de la portada (estilo `.site-navbar a[aria-current="page"]` de
  layout.css, sin CSS nuevo).
- **D3 — El asset `public/assets/mxvi_logo.webp` se conserva.** Ya existía en
  72e5c52 (predata la regresión) y el humano pidió restaurar el navbar, no
  limpiar assets. Borrarlo sería un cambio destructivo fuera del alcance
  pedido. Tras la retirada queda huérfano en `public/` (se sirve tal cual),
  sin impacto en `src/`.

## 3. Tests afectados por el Problema A (verificación propia)

Revisados los 4 tests señalados por el líder; resultado REAL:

| Test | Aserción sobre el logo | Efecto tras retirar el logo |
|------|------------------------|------------------------------|
| `tests/restore-navbar-home-link.test.mjs` | REQ-12-03 (conserva el ancla del logo) y REQ-12-04 (Home omite aria-current; el logo conserva aria-current) | **ROJO → se ajusta** (único test que cambia) |
| `tests/layout-refactor.test.mjs` | REQ-08-05 espera `/href="\/"\s*>Home/` (enlace de TEXTO Home) — NO referencia el logo | Verde sin cambios |
| `tests/architecture-nav-link.test.mjs` | REQ-08-04 espera `<a...href="/">Home</a>`; REQ-08-02/03 solo About/Arquitectura — NO referencia el logo | Verde sin cambios |
| `tests/visual-polish-refactor.test.mjs` | REQ-37-03: exige comparación de pathname con `/` y ≥2 aria-current con degradado | Verde sin cambios (Home + About + Arquitectura = 3) |

Corrección al contexto del líder: **no son 4 tests los que cambian, sino 1**
(`restore-navbar-home-link.test.mjs`, REQ-12-03/04). Los otros tres quedan en
verde sin tocar nada. El ajuste sigue el precedente REQ-43-06 (los tests
siguen a la presentación real, con justificación documentada en el encabezado
del test): REQ-12-03 pierde la aserción del logo y conserva About, Arquitectura,
@moibaldenegro y SearchBar; REQ-12-04 se invierte: el enlace Home declara
aria-current de la portada y no existe ancla del logo.

## 4. Causa raíz verificada — Problema B (salto horizontal al navegar)

1. El Layout usa `<ClientRouter />` (feature 24): al hacer clic en el nav se
   navega con View Transitions entre páginas de alturas distintas (portada
   larga vs. /about corta vs. /arquitectura según resultados).
2. `layout.css` L62-64 estiliza el scrollbar global con
   `::-webkit-scrollbar { width: 10px }` + thumb/track con tokens. El scrollbar
   SOLO aparece cuando el contenido desborda el viewport.
3. `html, body { width: 100%; height: 100% }` y el navbar centrado con
   `width: min(var(--container-max), 95%); margin: auto` → al aparecer o
   desaparecer el scrollbar (10px), el viewport se estrecha o ensancha y el
   contenido centrado se desplaza ~5px a la derecha o a la izquierda. Ese es el
   «saltito» percibido al navegar.
4. Candidatos descartados (verificados en CSS): `a:focus-visible` (outline, no
   desplaza layout), `.search-bar__input:focus` (solo border-color, mismo 1px),
   subrayado `::after` (crece desde left). El scrollbar intermitente es la única
   causa estructural que cambia el ancho del viewport.

## 5. Decisión del Problema B (D4 + alternativa descartada)

- **D4 — `html { scrollbar-gutter: stable; }` en `layout.css`.** Reserva
  permanentemente el hueco del scrollbar vertical: el scrollbar deja de
  aparecer/desaparecer entre páginas y el ancho del viewport se mantiene
  estable durante la navegación. Soporte: Chrome/Edge 94+, Firefox 97+,
  Safari 18.2+. Sin JS de runtime (estático por defecto), sin tokens nuevos
  (es propiedad de layout, no de color/radio/transición), layout.css pasa de
  69 a ~70 líneas (≤100 OK). Las reglas `::-webkit-scrollbar` existentes se
  conservan (el hueco reservado muestra el track deshabilitado cuando no hay
  overflow — comportamiento esperado).
- **Alternativa descartada — `html { overflow-y: scroll }`:** fuerza el
  scrollbar siempre visible. Regresión estética (track permanente en páginas
  cortas) y no-op con los overlay scrollbars de macOS (donde el scrollbar nunca
  ocupa espacio) → comportamiento inconsistente entre plataformas.
- **Degradación (REQ-14-04):** navegadores sin `scrollbar-gutter` (Safari
  < 18.2) conservan el comportamiento actual; el defecto queda limitado a ese
  navegador, sin romper nada.

## 6. Alcance / fuera de alcance

Dentro:
- A: `src/layouts/Layout.astro` (retirar ancla del logo; aria-current al Home);
  `tests/restore-navbar-home-link.test.mjs` (REQ-12-03/04 ajustados con
  justificación).
- B: `src/styles/layout.css` (regla de reserva del hueco) + test de inspección.

Fuera de alcance:
- Feature 10 (`client-init-on-navigation`, in_progress): no se toca; el salto
  no es un bug de re-inicialización de scripts.
- Borrar `public/assets/mxvi_logo.webp` (D3) y cualquier otro cambio de diseño
  del navbar (orden, estilos, SearchBar, Arquitectura: se conservan intactos).
- JS de runtime para el Problema B (estático por defecto).

## 7. Riesgos

- **R1 — Regresión de accesibilidad:** si el Home no asumiera el aria-current,
  la portada perdería el marcador de página activa y REQ-37-03 (≥2) podría
  caer a 2 (About + Arquitectura, sin `/` en las comparaciones: el test exige
  `paths.includes('/')`). Mitigado por D2: el Home toma exactamente la
  condición del logo.
- **R2 — Ajuste de tests sin justificación:** el arnés exige tests en verde
  para cerrar (require_tests_to_close); tocar el test de la feature 12 sin
  documentar el porqué rompería la trazabilidad. Mitigado: REQ-13-05 exige el
  ajuste con justificación en el encabezado (precedente REQ-43-06).
- **R3 — layout.css cerca del límite:** 69 + 1 línea = 70; el test REQ-08-06
  (≤100 líneas, solo tokens) sigue en verde. La nueva regla no es
  color/radio/transición → no afecta la aserción de tokens.

## 8. Features creadas

- **13 `remove-navbar-logo`** (depende de 12, done): retirar el ancla del logo;
  Home de texto con aria-current de la portada; ajustar REQ-12-03/04.
  Spec: `specs/13_remove-navbar-logo/requirements.md` + design.md (toca UI).
- **14 `fix-navbar-jump`**: reserva del hueco del scrollbar (`scrollbar-gutter:
  stable`) en layout.css; test de inspección. Spec:
  `specs/14_fix-navbar-jump/requirements.md` + design.md (toca presentación;
  precedente de la feature 11: CSS-only lleva design.md).