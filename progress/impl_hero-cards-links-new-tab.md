# Informe de implementación — feature 110 hero-cards-links-new-tab

Spec: `specs/110_hero-cards-links-new-tab/requirements.md` (REQ-110-01..14) y `design.md`.

> Nota de continuidad: la sesión original se cortó por límite de API después de implementar y medir, y antes de
> escribir este informe. Esta sesión (2026-10-21) no repite trabajo: recupera del scratchpad la evidencia ya
> registrada (`red110.txt`, `cdp110/summary.txt`, `cdp110/final.json`), reproduce el rojo una segunda vez y
> vuelve a ejecutar `./init.sh`. Todo lo citado abajo está en disco.

## Cambios

- `src/domain/hero-card-link.ts` (14 líneas): `cardLinkLabel(title, href)` junto a `isExternalHref`. Arma
  `<título>[ (sitio externo)] (se abre en una pestaña nueva)`; el aviso externo solo si `href` empieza por `https://`.
- `src/components/hero-card.astro` (52 líneas) y `src/components/hero-cards/htb-card.astro` (34): importan
  `cardLinkLabel`, `const label = cardLinkLabel(card.title, card.href);` y el `a.card-link` pasa a
  `target="_blank" rel="noopener noreferrer"` con `{label}` en el `span.visually-hidden`. Se mantienen la clase, el último
  lugar en el article, el `span.card-link__arrow` aria-hidden con ↗ y la ausencia de enlaces anidados (REQ-110-06).
  Sin `<a>` cuando `href` es null (REQ-110-05). Ni JS, ni style inline, ni CSS nuevo (`hero-card-link.css` sin tocar).
- `tests/hero-cards-links-new-tab.test.mjs` (73 líneas, solo `node:` + `../src/` + `./helpers/`): REQ-110-01..06, 09, 10, 12, 13 y 14.
- Tests heredados ajustados con «Ajuste feature 110 (precedente REQ-43-06)» (REQ-110-11):
  `tests/hero-cards-links.test.mjs` (REQ-107-08 y el test de build de la 107: target, noreferrer y aviso; 100 líneas),
  `tests/hero-cards-extra-logos.test.mjs:57` (marcado esperado de las cards con href; 99 líneas) y
  `tests/hero-cards-polish.test.mjs:66` (el import de `cardLinkLabel`, `const label` y su comentario se descartan en la
  comparación con la 99; 100 líneas). No queda ningún test con `rel="noopener"` sin target ni con «(sitio externo)» como final del enlace.
- No se tocan: `src/data/hero-cards.json`, `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`,
  `tests/hack-the-box-sprite.test.mjs` (sha256 iguales a `sha110-before.txt` del scratchpad), about-hero, about-projects
  ni site-footer (`git status` limpio en esas rutas). Umbral de REQ-47-06 sin tocar (sigue en 40 000 B).

## Rojo

1. Rojo original (sesión anterior, `scratchpad/red110.txt`): tests escritos con los componentes aún en el estado de
   la 107 (`rel={external ? 'noopener' : undefined}`, aviso solo « (sitio externo)», sin `cardLinkLabel` en el dominio):
   ```
   ✖ tests\hero-cards-links-new-tab.test.mjs  'test failed'   (el import de cardLinkLabel aún no existía)
   ✖ REQ-107-08 (Ajuste feature 110 ...): AssertionError: src/components/hero-card.astro
       expected: /import \{ cardLinkLabel \} from "(\.\.\/)+domain\/hero-card-link\.ts";/
   ✖ REQ-107-06/07/09/10/11/27 (build): youtube: el último hijo no es el a.card-link esperado
   ✖ REQ-103-09/10/11 (build): youtube con otro marcado
     + ...<a class="card-link" href="https://www.youtube.com/@moibaldenegro" rel="noopener"><span class="visually-hidden">YOUTUBE (sitio externo)</span>...
     - ...<a class="card-link" href="https://www.youtube.com/@moibaldenegro" target="_blank" rel="noopener noreferrer"><span class="visually-hidden">YOUTUBE (sitio externo) (se abre en una pestaña nueva)</span>...
   ```
2. Rojo reproducido en esta sesión (`scratchpad/red110b.txt`): se cambió temporalmente en hero-card.astro
   `target="_blank" rel="noopener noreferrer"` por `rel="noopener"` y se ejecutó `node --test tests/hero-cards-links-new-tab.test.mjs`:
   ```
   ✖ REQ-110-01/02/06: ... AssertionError: src/components/hero-card.astro: el a.card-link no es el último hijo esperado
   ✖ REQ-110-01/03/05/06/13 (build): ... AssertionError: youtube: el último hijo no es el a.card-link esperado
   ℹ pass 5   ℹ fail 2
   ```
   Archivo restaurado desde copia (sha256 `bca107b8…7837` antes = después) y `pnpm build` repetido para no dejar un `dist/` desfasado.

## Verde

`./init.sh` → código 0, «✔ tests al 100% (node:test)», «✔ build de producción», «El entorno está perfecto».
`pnpm test` (`scratchpad/green110.txt`): `ℹ tests 1154 ℹ pass 1154 ℹ fail 0`; los 7 tests REQ-110 en ✔.

Incidencia: el primer `./init.sh` de esta sesión falló el build con `EPERM ... rmSync dist\client` porque seguían vivos
los servidores de la sesión cortada (`astro preview --port 4613`, PIDs 47468/44932, y `cdp110/srv.mjs` en :4611, PID 15324).
Se pararon solo esos tres; el `pnpm dev` de :4321 (PIDs 9024/34400) no se tocó. Al terminar no queda ningún servidor
propio levantado.

## Peso (REQ-110-13/14)

| Build | dist/client/index.html |
|---|---|
| Antes (base de la 109, `rev109/dist-final`) | 39 781 B |
| Después (build de la CDP, `cdp110/dist-final`) | 39 899 B |
| Después (build final de esta sesión) | 39 895 B |

+114/+118 B (dos enlaces). Cabe por debajo de 40 000 B: REQ-110-14 no aplica y el umbral de REQ-47-06 no cambia.

## Verificación Chrome headless + CDP (REQ-110-07/08/09)

Script `scratchpad/cdp110/m110.mjs`; base = build de la 109 en :4611, final = `astro preview` en :4613. Por ancho:
`Target.setDiscoverTargets` + clic en el centro de la card y Enter con foco; a 375 px se borró por CDP la regla
`:not([data-show-on-mobile])` de la 106. Errores: `Runtime.exceptionThrown`, `console.error`, `Log.entryAdded` error,
`Network.loadingFailed` y respuestas >= 400.

| Ancho | a[target] (base) | article sin `<a>` | GITHUB: targetCreated | YOUTUBE: targetCreated | URL original tras clic | Errores |
|---|---|---|---|---|---|---|
| 375 | 2 (0) | 13 | https://github.com/MoiBaldenegro | https://www.youtube.com/@moibaldenegro | http://localhost:4613/ | 0 |
| 800 | 2 (0) | 13 | idem | idem | idem | 0 |
| 1024 | 2 (0) | 13 | idem | idem | idem | 0 |
| 1280 | 2 (0) | 13 | idem | idem | idem | 0 |
| 1600 | 2 (0) | 13 | idem | idem | idem | 0 |

En los cinco anchos y en las dos cards: nombre accesible (texto del enlace sin la flecha aria-hidden, medido con textContent, no con el árbol AX) «GITHUB (sitio externo) (se abre en una pestaña nueva)» /
«YOUTUBE (sitio externo) (se abre en una pestaña nueva)», `target=_blank`, `rel="noopener noreferrer"`, el enlace es el último
hijo, el hit-test del centro cae en el `a`, flecha ↗ aria-hidden, la cobertura del enlace es la card entera (1,1,1,1),
flecha en reposo/hover/foco igual a la base, 1 tabulación por card (base 1), foco con `outline: solid 2px rgb(125, 104, 255)`
y offset −4px, flecha a 13/13 px (≤ 1200) y 15/15 px (≥ 1280) como en la 107. Enter con foco también abre la pestaña nueva
con el href y la portada sigue en su URL. `errors final 0`.

Capturas (REQ-110-09): `progress/research/hero110/{github,youtube}-{375,800,1024,1280,1600}.png` y sus variantes `-focus.png`.

## Archivos tocados por la 110 (todos <= 100 líneas)

`src/domain/hero-card-link.ts`, `src/components/hero-card.astro`, `src/components/hero-cards/htb-card.astro`,
`tests/hero-cards-links-new-tab.test.mjs`, `tests/hero-cards-links.test.mjs`, `tests/hero-cards-extra-logos.test.mjs`,
`tests/hero-cards-polish.test.mjs`, `progress/research/hero110/`, `progress/current.md` y este informe.
(El `git diff` de los componentes contra HEAD incluye también cambios de las features 106-111, que siguen sin commit.)
