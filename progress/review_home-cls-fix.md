# Review — feature 104

**Veredicto:** APPROVED

Reviewer nivel 1, 2026-10-20. Alcance: solo la 104, con los archivos del informe
`progress/impl_home-cls-fix.md`. No revisé los cambios de 101-103, que ya están en done, ni los ajenos
del humano: `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md` y
`tests/hack-the-box-sprite.test.mjs`.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `<style>` en un .astro: [x]. La hoja nueva es
  `src/styles/latest-horizontal-reserve.css`. `latest-horizontal.astro:4` solo añade un import y sigue
  teniendo un único `<script>`.
- C2 Sin lógica en la UI, sin JS nuevo y sin dependencias: [x]. El frontmatter solo tiene imports y
  `package.json` no cambia.
- C3 Tokens y sin valores sueltos: [x]. Las longitudes salen de `--gap-card` y `--container-max`. La
  fórmula de `--latest-card-width` y `--latest-pair-inset` (reserve.css:13-14) es una copia literal de
  `latest-horizontal.css:11-12`, tal como permite REQ-104-07. No hay opacity, transform ni colores, y
  `audit-design-tokens` pasa.
- C4 Archivos de 100 líneas o menos: [x]. `latest-horizontal-reserve.css` tiene 43, `latest-horizontal.astro`
  13 y `tests/home-cls-fix.test.mjs` 99. Los scripts de `cls104/scripts/` tienen 61 como máximo. El .md de
  research tiene 103, como en los research anteriores, que no son código.
- C5 Congelados de REQ-96-39 intactos: [x]. `git diff --stat HEAD` sobre latest-articles.css,
  latest-horizontal.css, latest-cards-motion.css, latest-articles.astro, src/domain/latest-horizontal.ts
  y src/components/latest-horizontal/*.ts solo muestra el import de `latest-horizontal.astro`, que la
  spec permite.
- C6 TDD: [x]. El informe recoge el rojo en TAP: 8 de 10 fallan antes de crear la hoja. Los 2 que pasan
  desde el principio (REQ-104-15/16) son guardas de congelados y de texto, y el informe lo justifica.
  Después recoge el verde: 10/10 y la suite 1085/1085.
- C7 `./init.sh` en verde: [x]. Lo ejecuté yo: formato, tests al 100 % y build OK, exit 0.
- C8 Dependencias: [x]. La feature 104 no tiene `depends_on`.
- C9 REQ-96-51 fiel al código: [x]. `cards-sync.ts:28-38` decide con `cardPhase(enters[i], exits[i])`,
  es decir, solo con progress, y el comentario de la línea 30 dice explícitamente que isActive no se usa.
  La línea nueva («con trigger.progress (cardPhase de cards-sync.ts)») y la cabecera «Ajuste de texto
  feature 104» de `specs/96_latest-cards-gsap-motion/requirements.md` lo reflejan.
- C10 La página es correcta en escritorio y móvil sin errores de consola: [x]. Lo verifiqué con CDP, más
  abajo.

## Verificación independiente (Chrome headless + CDP)

Usé el build de `./init.sh` servido con un `astro preview --port 4371` propio, que ya está parado. El
`pnpm dev` de :4321 (pid 34400) sigue intacto. Copié los scripts de `progress/research/cls104/scripts/`
al scratchpad (`rv104/`) y añadí `edge.mjs`.

- REQ-104-09/10, CLS (observer layout-shift buffered, 3 s):
  - 1280×800: carga limpia 0, recarga al fondo (y 2275) 0, recarga a mitad (y 1510) 0, history.back al
    fondo 0 y a mitad 0.
  - 1600×900: 0 en los 5 casos (al fondo y 2401, a mitad y 1584).
  - En los 10 casos scrollY se conserva y no hay errores de consola. La medición de partida que da el
    informe era 0,4837 a 1280×800 y 0,4074 a 1600×900.
- REQ-104-08, traza por frame:
  - 1280: el frame sin envoltorio mide docH 3075 y footTop 410, igual que los 112 frames con envoltorio.
  - 1600: los 2 frames sin envoltorio miden 3301 y 531, igual que los 111 frames con envoltorio.
  - Diferencia: 0 px en los dos anchos.
- Estado antes de init, en DOMContentLoaded con JS:
  - A 1201 y 1280 px la reserva ya aplica: la lista está en flex y el margin-bottom es 572,7 y 610,25 px.
    El docH antes y después de init coincide (3037 y 3075).
  - A 1200 px y con reduced motion a 1280 no aplica: la lista está en grid, el margin-bottom es 0 y el
    docH es 4611 y 4532.
- REQ-104-11: CLS 0 y 0 entradas al recorrer la portada a 375, 768, 1024, 1280 y 1600 px.
- REQ-104-12, sin JS:
  - docH 4532 a 1280 y 4957 a 1600.
  - La lista queda en grid (apilado), sin clase horizontal ni envoltorio.
- REQ-104-13: docH y caja de la sección iguales al árbol de partida:
  - 375 px: 6667 y [9, 3822, 347, 1791].
  - 1024 px: 4255.
  - 1280 px con reduced motion: 4532.
- REQ-104-14: tras init, el margin-bottom computado es 0px y el envoltorio mide 1410 = 800 + 610.
- REQ-104-17, regresiones de la 96 (rv96 main, rest, r6 y r49-50):
  - 3 cards y 3 posts en el footer a 375, 768, 1024 y 1280, sin scroll horizontal.
  - Pin presente a 1280.
  - Entrada lateral: tx 72/60/78 con opacity 0, y luego 0/1. Al fondo, salida con opacity 0.
  - Reduced motion a 375 y 1280: 33 de 33 muestras sin estilo inline, 0 ScrollTrigger y sin pin.
  - REQ-96-49: margen derecho de la card 3 = 31,75 = left del título.
  - REQ-96-50: tras recarga y tras history.back, left de la card 1 = 31,75.
  - REQ-96-52: okReload y okBack en todas las posiciones a 1280 y 375. El activeOk = false en 1510 es el
    mismo caso conocido que documentó el reviewer de la 96: la x de borde de la 76, no un xPercent.
  - ScrollTrigger estable en idas y vueltas con el ClientRouter: 5→0→5→0→5 a 1280 y 3→0→3→0→3 a 375,
    más la vuelta de r6 tras el clic en la card 3, que da ok.
  - Errores de consola: 0 en todos los scripts.

## Observaciones (no bloquean)

1. El riesgo residual aceptado en el análisis §5 sigue presente: si el JS está habilitado pero el módulo
   falla, queda la fila con el hueco del recorrido.
2. Si LATEST_POSTS_LIMIT crece, hará falta la regla del nuevo n en reserve.css:40-42. REQ-104-06 ya hace
   fallar el test si falta, así que está cubierto.

## Cambios requeridos (si aplica)
Ninguno.
