# Análisis — sticky footer (feature 94 sticky-footer)

> spec_author, 2026-10-14. Spec: specs/94_sticky-footer/ (requirements.md + design.md).

## Petición

Petición humana 2026-10-14 (literal): «el footer no se mantiene pegado abajo hay unos casos como por ejemplo
cuando no hay ninguna busqueda y queda libre el espacio se esta pasando hacia arriba fijalo siempre abajo».
Ya estaba anotado en progress/current.md como pendiente humano (b): «hueco bajo el footer en páginas cortas como
/search (sticky footer, requiere tocar body en layout.css)».

## Qué es

Un **sticky footer** (no `position: fixed`): cuando el contenido de la página es más bajo que el viewport
(/search sin término, búsqueda sin resultados, 404, términos sin coincidencias), el footer de la feature 89
queda pegado al borde inferior del viewport sin hueco debajo; cuando el contenido es más alto, el footer sigue
al final del contenido como hoy. Solo CSS, sin JS ni dependencias.

## Causa

- `src/styles/layout.css` línea 6: `html, body { margin: 0; width: 100%; height: 100%; }` y `body` es un bloque
  normal. `main` no crece, así que en páginas cortas el footer (`margin-top: calc(var(--gap-card) * 5)` en
  site-footer.css) queda justo tras el contenido y el resto del viewport queda vacío debajo.
- Además, `height: 100%` fija el alto del body al viewport: el contenido largo desborda el body. Es justo el
  patrón que suele romper `position: sticky` en hijos directos del body (el header); hay que comprobar que el
  header sigue pegado arriba tras quitarlo (y que no empeora).

## Solución propuesta (detalle en design.md)

En layout.css, sin cambiar el número de líneas (99):
1. `html, body { margin: 0; width: 100%; }` (fuera `height: 100%`).
2. `body` como columna flex: `display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh;`
   (100vh como fallback y 100dvh para la barra de URL móvil).
3. `body > main { flex: 1 0 auto; }`: el main crece y empuja el footer al fondo.
site-footer.css, Layout.astro y site-footer.astro no se tocan.

## Qué toca

- Capas: solo presentación (CSS global del layout único). Sin datos, repositorios, dominio ni rutas.
- Archivos: src/styles/layout.css (ajuste), tests/sticky-footer.test.mjs (nuevo),
  tests/geist-pixel-extend.test.mjs (sacar layout.css de UNCHANGED con nota, precedente REQ-43-06).
- Hijos directos del body: skip-link (absolute, fuera del flujo), header sticky, los `<script>` de SiteMenu y
  SearchEscape (sin caja), main y footer. Con flex column todos se estiran al ancho; nada usa `margin: auto`
  horizontal como hijo directo del body.

## Riesgos y trabas

- **Límite de 99 líneas en layout.css**: tests/mobile-hamburger-menu.test.mjs exige `lines(layout.css) === 99`
  y ese test está modificado sin commitear por la feature 93. Para no mezclar, la 94 deja layout.css en 99
  líneas exactas (compactando el bloque body) y **no edita** mobile-hamburger-menu.test.mjs. Si no cabe,
  el implementer para y reporta blocked.
- **Congelado de layout.css** en tests/geist-pixel-extend.test.mjs (UNCHANGED frente a HEAD): hay que sacar
  layout.css de la lista con nota «Ajuste feature 94 (precedente REQ-43-06)». site-menu.css sigue congelada.
- **Margenes que dejan de colapsar**: en flex los márgenes de main/footer no colapsan con los de sus hijos;
  puede variar algún píxel de separación al final de las páginas. Verificar visualmente home, post y /about.
- **Header sticky**: verificar que tras hacer scroll en una página larga el header sigue en top 0 y mide 65 px
  a 800/1000/1280 (REQ-77). Con `max-height: 500px` sigue static (REQ-51-04).
- **Hero y sección horizontal** (min-height 100vh, sticky + GSAP de latest-horizontal): verificar que no cambia
  su alto ni su pin.
- **Menú móvil** a 375 px: abrir/cerrar sin cambio de layout.
- **ClientRouter**: tras navegar de una página larga a /search el footer queda abajo (CSS puro, sin JS).

## Solapamiento con la feature 93 (blocked)

- La 93 (system-design-nav-link) está blocked esperando decisión humana y deja en el árbol, sin commitear:
  src/layouts/Layout.astro, src/styles/nav-label.css, el post 05, tests/mobile-hamburger-menu.test.mjs y
  tests/system-design-nav-link.test.mjs.
- La 94 **no toca** ninguno de esos archivos y **no depende** de la 93. Comparten solo la *posibilidad*: una de
  las salidas del bloqueo de la 93 es tocar layout.css (gap del nav o ancho de la búsqueda). Si ocurre, quien
  llegue segundo reconcilia layout.css y el `=== 99` de mobile-hamburger-menu.test.mjs.
- Los tests de la 94 no comparan Layout.astro contra HEAD (está modificado por la 93); el commit de la 94 debe
  incluir solo sus archivos (decisión del líder).

## Descomposición

Complejidad simple (un archivo CSS + test): **1 feature**, id 94 `sticky-footer`, pending, sin depends_on
(la 89 ya está done; no hace falta declararla porque no es implementable antes). Cabe en ≤ 100 líneas.

## Ronda 2 — corrección por regresión del header (spec_author, 2026-10-14)

Decisión humana (literal): «oye pero rompiste el header ya no se va nunca se queda pegado». Interpretación del
líder: el humano quiere el comportamiento del header anterior a la 94 (HEAD~1 de 268e9ad): pegado arriba durante
el primer viewport y luego se va con la página.

- **Causa** (medida por el implementer, progress/impl_sticky-footer.md, «Ronda 2»): quitar `height: 100%` del reset
  hizo crecer el body con el contenido, que es el bloque contenedor del header sticky, así que el header ya no se va
  nunca. Antes, con el body fijado a un viewport (800 px), el header se iba a partir de scrollY 735: top 0 tras 500 px
  y top −1265 tras 2000 px en / y en /posts/04-ciclo-de-vida-y-arquitectura a 375/800/1280 px.
- **Cambios en la spec**:
  - REQ-94-04 reescrito: el reset `html, body` **declara** `height: 100%` (se revoca quitarlo).
  - REQ-94-08 reescrito: header con top 0 tras `scrollTo(0, 500)` y −1265 (±1) tras `scrollTo(0, 2000)` en / y en el
    post 04 a 375/800/1280 px con 800 px de alto, igual que antes de la 94 (antes pedía top 0 tras dos viewports).
  - REQ-94-14 nuevo (sale del antiguo REQ-94-08): header de 65 px a 800/1000/1280.
  - REQ-94-12 precisa que en la ronda 2 el test que se ve en rojo es el de REQ-94-04 invertido.
  - Se mantienen: sticky footer con body flex column + min-height 100vh/100dvh + `body > main { flex: 1 0 auto }`;
    footer pegado abajo en /search, /search?q=zzzz y /404 (diferencia 0 con el borde del viewport) y tras el
    contenido en las largas; layout.css en 99 líneas exactas.
- **Para el implementer**: invertir en tests/sticky-footer.test.mjs el test de REQ-94-04 (el reset declara
  `height: 100%`) y verlo en rojo; luego el cambio de una línea en layout.css (sin superar 99 líneas; el comentario de
  la línea 6 que cita REQ-94-04 se ajusta en la misma línea). El arreglo ya se verificó en el navegador inyectando la
  regla (tabla de la Ronda 2): header igual que HEAD~1 y sticky footer intacto.
- Riesgo: ninguno nuevo; el hero, el pin horizontal, track-dom.ts y scrollHeight no dependen de la altura del body
  (medido en la Ronda 2).
