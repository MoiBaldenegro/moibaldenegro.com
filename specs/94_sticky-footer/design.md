# Diseño — Footer pegado abajo en páginas cortas (feature 94 sticky-footer)

## Contexto visual

- Afecta al layout único (body de todas las páginas) y, en la práctica, a la posición del footer de la
  feature 89 en páginas cortas: /search sin término, búsquedas sin resultados, 404, términos sin coincidencias.
- Estado actual: en páginas cortas el footer queda justo tras el contenido y debajo queda un hueco vacío del
  color de fondo hasta el borde inferior del viewport.
- Estado deseado: sticky footer. En páginas cortas el footer toca el borde inferior del viewport (sin hueco);
  en páginas largas sigue al final del contenido, igual que hoy. El footer nunca flota sobre el contenido.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | (sin cambios) | Fondo del body, se conserva |
| `--color-text` | (sin cambios) | Color del body, se conserva |
| `--font-sans` | (sin cambios) | Fuente del body, se conserva |
| `--gap-card` | (sin cambios) | Separación previa del footer (`margin-top` en site-footer.css), se conserva |

`100vh`/`100dvh` son unidades de viewport, no valores de color, espaciado, radio ni sombra; hay precedente
en hero-section.css y latest-horizontal.css (`min-height: 100vh`). No se crean tokens.

## Decisiones y constraints

- Decisión 1: body como columna flex con `min-height: 100vh; min-height: 100dvh;` (fallback + barra de URL
  móvil) y `body > main { flex: 1 0 auto; }`. main absorbe el espacio libre y empuja el footer al fondo sin
  tocar el marcado ni site-footer.css.
- Decisión 2: quitar `height: 100%` de `html, body`. Con alto fijo el contenido largo desborda el body y el
  rectángulo del header sticky queda limitado a un viewport; `min-height` lo sustituye.
- Decisión 3: layout.css se queda en **99 líneas exactas** (compactar `background`/`color`/`font-family` en
  una línea y comentar la feature en línea) para no editar tests/mobile-hamburger-menu.test.mjs, que exige
  `=== 99` y está modificado sin commitear por la feature 93. Bosquejo orientativo:

  ```css
  html, body { margin: 0; width: 100%; }
  body {
    display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; /* feature 94: sticky footer */
    background: var(--color-background); color: var(--color-text); font-family: var(--font-sans);
  }
  body > main { flex: 1 0 auto; }
  ```

- Decisión 4: tests/geist-pixel-extend.test.mjs saca `src/styles/layout.css` de UNCHANGED con la nota
  «Ajuste feature 94 (REQ-94-01..05, precedente REQ-43-06)». site-menu.css sigue en la lista.
- Verificación de navegador (Chrome headless, anotada en progress/impl_sticky-footer.md): a 375, 800 y 1280 px,
  `footer.getBoundingClientRect().bottom` = `innerHeight` (±1 px) en /search, /search?q=zzzz y /404; en un
  post largo y en / el footer empieza tras el main y `scrollHeight` no se reduce; header 65 px a 800/1000/1280 y
  `top` 0 tras `scrollTo(0, 2 * innerHeight)`; menú móvil a 375 abre/cierra sin `scrollWidth > clientWidth`;
  hero y sección horizontal con el mismo alto y pin que antes; navegar con ClientRouter de / a /search deja el
  footer abajo.
- Restricciones: solo CSS, sin JS ni dependencias, sin `position: fixed`, estilos fuera del `.astro`,
  archivos ≤ 100 líneas, no tocar Layout.astro ni site-footer.css (ni nada de la feature 93).

## Alternativa descartada

- `position: fixed; bottom: 0` en el footer: tapa contenido en páginas largas y el footer mide cientos de px;
  no es lo pedido («pegado abajo» cuando sobra espacio).
- `.site-footer { margin-top: auto }` en site-footer.css: pierde la separación mínima `--gap-card * 5` con el
  contenido y obliga a tocar la hoja de la 89; con `main` creciendo se conserva tal cual.
- Hoja nueva importada en Layout.astro: Layout.astro está modificado por la feature 93 sin commitear; se
  evita el solapamiento.
- `min-height: calc(100vh - ...)` en main: depende de la altura del header y del footer (variable por ancho).
