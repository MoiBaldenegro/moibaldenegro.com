# Review — feature 106

**Veredicto:** APPROVED

Alcance: solo la feature 106, ronda 2 (atributo condicional), según la lista de archivos de
`progress/impl_hero-cards-mobile-visibility.md`. No se han evaluado la 107/108 ni los cambios ajenos del humano
(`public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`).

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x]. La única regla nueva está en `src/styles/hero-section.css:67`, dentro del `@media (max-width: 768px)` que ya existía (líneas 65-68).
- C2 Sin lógica en la UI: [x]. El frontmatter de `hero-card.astro` y `htb-card.astro` no cambia. El atributo usa `card.showOnMobile ? 'true' : undefined` en el template (línea 15), que es una expresión de presentación, igual que el `String(...)` de la ronda 1.
- C3 Datos vía repositorio: [x]. `showOnMobile` se valida en el parse con `readBoolean` (`hero-cards-fields-parse.ts:35-37`). Si falta, toma `false` en las de icono (`hero-cards-parse.ts:51`) y `true` en las ricas (`:64`).
- C4 Tokens, sin valores sueltos: [x]. La regla solo pone `display: none`. No se tocan `tokens.css` ni `hero-card.css`.
- C5 Archivos de 100 líneas o menos: [x]. `hero-cards-parse.ts` tiene 65, `hero-cards-fields-parse.ts` 59, `hero-section.css` 68, `hero-card.astro` 41, `htb-card.astro` 25, `entities/hero-card.ts` 50 y el test 88.
- C6 Sin dependencias externas: [x].
- C7 JSON válido y tipado: [x]. Las 15 cards declaran `showOnMobile` y solo `htb` vale `true` (comprobado con un script).
- C8 Errores con nombre: [x]. `HeroCardsDataError` incluye el archivo, el índice y el campo (REQ-106-05).
- C9 `./init.sh` en verde: [x]. Exit 0: herramientas, harness, formato, tests al 100 % (0 ✖) y build.
- C10 Se ve bien en desktop y en móvil, sin errores de consola: [x]. Ver la verificación CDP de abajo.
- C11 TDD (rojo y luego verde): [x]. En el informe constan el rojo de la ronda 1 (8 de 9 en ✖) y el de la ronda 2 (7 tests en ✖ en los 6 archivos afectados), y después el verde con 1107 de 1107.
- C12 Dependencias: [x]. La feature 106 no tiene `depends_on`.
- C13 Tests heredados con la nota «Ajuste feature 106 (precedente REQ-43-06)» y la misma intención: [x]. Revisé el diff de los 8 archivos. `hero-cards-extra-logos` vuelve a exigir exactamente el marcado anterior, sin el atributo, así que además cubre REQ-106-18.
- C14 Ajenos intactos y mosaico sin cambios: [x]. `git diff HEAD` sale vacío para `hero-grid-layout.ts` y `hero-grid-template.ts`, y también para `tests/search-index-lazy-load.test.mjs`.

## REQ-106-19 / REQ-47-06
- El umbral sigue en `size < 40000` (`tests/search-index-lazy-load.test.mjs:97`) y el archivo no tiene cambios respecto a HEAD.
- Peso medido de `dist/client/index.html` tras el build de `./init.sh`: **39 802 B**, con un margen de 198 B.

## Verificación independiente (Chrome headless + CDP)
Mis scripts están en el scratchpad, en `rv106/rv.mjs`. Usé `pnpm preview --port 4518` y lo paré al terminar. El `pnpm dev` de :4321 sigue en marcha sin tocar. Viewport `<w>x1000`, DPR 1. Para comparar uso `cdp106/base.json`, la línea base de antes de la feature.

| Ancho | Hijos visibles de .hero-grid | Separación | Títulos de cards en el AX tree | Foco con Tab (60 pulsaciones) en cards / en ocultas | Δ máx. frente a la base | scrollW/clientW (documento y hero) | Errores |
|--:|--|--|--:|--|--:|--|--:|
| 375 | perfil (97–730.3) + HTB (744.3–934.3) | 14 px = `--gap-card` | 1 (solo HACK THE BOX) | 0 / 0 | — | 365/365, 347/347 | 0 |
| 800 | 16 (perfil + 15) | igual que la base | 15 | 0 / 0 | 0 px | 790/790, 751/751 | 0 |
| 1024 | 16 | igual que la base | 15 | 0 / 0 | 0 px | 1014/1014, 963/963 | 0 |
| 1280 | 16 | igual que la base | 15 | 0 / 0 | 0 px | 1270/1270, 1207/1207 | 0 |
| 1600 | 16 | igual que la base | 15 | 0 / 0 | 0 px | 1590/1590, 1500/1500 | 0 |

- En el DOM, `data-show-on-mobile="true"` aparece solo en `htb`. Las 14 cards de icono no llevan el atributo.
- Las capturas `progress/research/hero106/hero-375.png` (perfil + HTB, sin huecos) y `hero-800.png` (las 15 en 6 columnas) coinciden con lo medido.
- Nota: una primera pasada con un servidor estático propio dio 404 en `/_server-islands/HtbStadistics`, porque ese servidor no ejecuta la parte de servidor. Con `pnpm preview` no hay errores, así que no es un fallo de la feature.

## Cambios requeridos (si aplica)
Ninguno.
