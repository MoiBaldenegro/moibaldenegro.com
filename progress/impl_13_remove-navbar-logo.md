# Informe de implementación — feature 13 (remove-navbar-logo)

> Implementer. Fecha: 2026-08-20. Spec: `specs/13_remove-navbar-logo/`
> (REQ-13-01..06) + design.md. Causa raíz: `progress/research/navbar-home-logo-jump.md`
> (Problema A: «el home fue reemplazado por el logo, ajusta lo que tengas que
> ajustar para que quede como estaba, era correcto»).

## Resumen

El navbar de `src/layouts/Layout.astro` tenía el ancla del logo
(`<a aria-current=... href="/"><img src="/assets/mxvi_logo.webp" width="72"/></a>`)
como marcador de la portada y el enlace de texto Home restaurado por la feature
12 SIN aria-current. La petición humana restaura el estado «como estaba»
(commit 72e5c52: Home de texto plano, sin logo): se retiró el ancla del logo y
el enlace Home asumió el marcador de la portada
(`aria-current={Astro.url.pathname === '/' ? 'page' : undefined}`, degradado a
undefined fuera de `/`). Se ajustaron SOLO las aserciones REQ-12-03/04 de
`tests/restore-navbar-home-link.test.mjs` (precedente REQ-43-06, justificación
en el encabezado); el resto de tests de navbar (REQ-08-04/05, REQ-37-03) quedan
verdes sin cambios. El asset `public/assets/mxvi_logo.webp` se conserva (ya
existía en 72e5c52, predata la regresión; fuera de alcance borrarlo).

## Ciclo rojo (evidencia previa a la implementación)

Test-first: primero se escribieron `tests/remove-navbar-logo.test.mjs`
(REQ-13-01..06) y se ajustó `tests/restore-navbar-home-link.test.mjs`
(REQ-12-03/04 al contrato real). Ejecución en rojo contra el Layout sin
implementar (el logo seguía en el navbar y Home sin aria-current):

```
$ node --test tests/remove-navbar-logo.test.mjs tests/restore-navbar-home-link.test.mjs
not ok 1 - REQ-13-01/03: ... sin el ancla del logo
  error: 'el navbar conserva el ancla del logo (REQ-13-01)'
not ok 2 - REQ-13-02: el enlace Home asume el aria-current de la portada; ningún otro enlace la marca
  error: 'el enlace Home no declara aria-current de la portada con degradado a undefined (REQ-13-02)'
ok 3 - REQ-13-04: Layout.astro no supera las 100 líneas ...
ok 4 - REQ-13-05: restore-navbar-home-link.test.mjs ajusta REQ-12-03/04 con justificación en el encabezado
not ok 5 - REQ-13-06: ningún archivo de src/ referencia mxvi_logo.webp
  error: 'hay archivos de src/ que referencian mxvi_logo.webp (REQ-13-06): src/layouts/Layout.astro'
not ok 8 - REQ-12-03: la navbar conserva About, Arquitectura, @moibaldenegro y la barra sin el ancla del logo
  error: 'el navbar conserva el ancla del logo tras la retirada (REQ-12-03)'
not ok 9 - REQ-12-04: el enlace Home declara aria-current de la portada; no existe ancla del logo
  error: 'el enlace Home no declara el aria-current de la portada (REQ-12-04)'
# tests 10
# pass 5
# fail 5
```

(Nota: en la primera pasada el test REQ-13-05 asercionaba el patrón aria-current
sin escapar dentro del archivo inspeccionado y fallaba por el regex escapado
del propio archivo; se corrigió la aserción a verificar el mensaje de fallo
plano `'el enlace Home no declara el aria-current de la portada (REQ-12-04)'`
— el rojo quedó acotado a la brecha de implementación: 5/5 fallos por el logo
presente y el Home sin aria-current.)

## Cambio implementado

`src/layouts/Layout.astro` — retirada del ancla del logo y traslado del
marcador de la portada al Home (L36-40 del navbar):

```diff
       <nav>
-        <a aria-current={Astro.url.pathname === '/' ? 'page' : undefined} href="/">
-          <img src="/assets/mxvi_logo.webp" alt="Logo de moibaldenegro.com" width="72"/>
-        </a>
-        <a href="/">Home</a>
+        <a aria-current={Astro.url.pathname === '/' ? 'page' : undefined} href="/">Home</a>
         <a aria-current={Astro.url.pathname === '/about' || Astro.url.pathname === '/about/' ? 'page' : undefined} href="/about">About</a>
         <a aria-current={Astro.url.pathname === '/arquitectura' || Astro.url.pathname === '/arquitectura/' ? 'page' : undefined} href="/arquitectura">Arquitectura</a>
         <a href="https://x.com/moibaldenegro">@moibaldenegro</a>
         <SearchBar />
```

- REQ-13-01/03: el navbar enlaza la portada solo con el Home de texto; se
  conservan About, Arquitectura, @moibaldenegro y la barra de búsqueda.
- REQ-13-02: el Home declara `aria-current={Astro.url.pathname === '/' ?
  'page' : undefined}` (único marcador de la portada; degradado a undefined).
- Sin CSS nuevo (el Home hereda `.site-navbar a[aria-current="page"]` de
  layout.css), sin `<style>`, sin JS.
- `Layout.astro` pasa de 49 a 46 líneas (REQ-13-04, ≤100).
- REQ-13-06: ningún archivo de `src/` referencia `mxvi_logo.webp` (grep
  verificado: el asset solo queda en `public/`, servido tal cual).

## Ajuste de tests (REQ-13-05, precedente REQ-43-06)

`tests/restore-navbar-home-link.test.mjs`: el encabezado documenta la
justificación del ajuste (feature 13 remove-navbar-logo, precedente REQ-43-06:
el test de inspección sigue a la presentación real). REQ-12-03 pasa de exigir
el ancla del logo a exigir su ausencia; REQ-12-04 se invierte: el Home declara
el aria-current de la portada y no existe ancla del logo. Los tests
`layout-refactor` (REQ-08-05), `architecture-nav-link` (REQ-08-04) y
`visual-polish-refactor` (REQ-37-03) NO se tocaron y quedan verdes sin cambios
(verificado: no referencian el logo).

## Ciclo verde (evidencia posterior)

### Tests de la feature + tests de navbar no tocados (5 archivos, 32/32)

```
$ node --test tests/remove-navbar-logo.test.mjs tests/restore-navbar-home-link.test.mjs tests/layout-refactor.test.mjs tests/architecture-nav-link.test.mjs tests/visual-polish-refactor.test.mjs
# tests 32
# pass 32
# fail 0
```

### Suite completa del arnés

```
$ ./init.sh
--- Herramientas y dependencias ---
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)
--- Archivos del harness ---
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

(429 tests, 0 fail — 5 nuevos de la feature 13.)

## Incidente ambiental (fuera del scope de la feature)

Durante la verificación, `./init.sh` falló 2 veces (tests REQ-11 y build) porque
`src/styles/article.css` aparecía reescrito en el working tree con variantes
experimentales (width 60%/100%/180%, border-radius 12px, min-height 500px,
clase muerta `.article`) — blob inexistente en git, CRLF, con mtimes
15:19:36/15:21:40/15:22:25/15:22:51 que coinciden al segundo con escrituras del
workerd del dev server activo (`pnpm run dev` desde las 13:01, pid 23112/25288)
en `.wrangler/state/` (mismo directorio que escribe `pnpm build`). Ningún test
ni script del repo escribe article.css (verificado por grep). No fue causado por
esta feature (yo no toqué article.css; el baseline inicial estaba verde y el
diff de mi cambio no lo incluye). Resolución: `git checkout -- src/styles/article.css`
(restaura HEAD, la versión correcta de la feature 11) y verificación de
estabilidad durante 150 s sin nuevas escrituras; `./init.sh` posterior en verde
y el archivo sigue limpio. Nota para el líder: el dev server activo
(no `--background`) es anterior a los commits 573fcef/4888e66 y comparte
`.wrangler/state/` con el build; conviene reiniciarlo antes de la revisión
visual (puede servir contenido stale).

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/layouts/Layout.astro` | Retirada del ancla del logo; Home con `aria-current` de la portada (46 líneas) |
| `tests/remove-navbar-logo.test.mjs` | Nuevo: tests de inspección REQ-13-01..06 |
| `tests/restore-navbar-home-link.test.mjs` | REQ-12-03/04 ajustados al contrato real + justificación en el encabezado (REQ-13-05) |
| `feature_list.json` | Feature 13: `pending` → `in_progress` |
| `progress/current.md` | Bitácora de la sesión |

## Trazabilidad acceptance ↔ REQ

- Acceptance 1 (REQ-13-01/03): `REQ-13-01/03` del test nuevo (sin `<img>` del
  asset; Home hacia `/` antes de About; conserva About/Arquitectura/
  @moibaldenegro/SearchBar).
- Acceptance 2 (REQ-13-02): `REQ-13-02` del test nuevo (Home con
  `aria-current={... === '/' ? 'page' : undefined}`; exactamente 1 marcador de
  la portada en el navbar).
- Acceptance 3 (REQ-13-06): `REQ-13-06` del test nuevo (recorrido recursivo de
  `src/`: ningún archivo referencia `mxvi_logo.webp`).
- Acceptance 4 (REQ-13-04): `REQ-13-04` del test nuevo (46 líneas ≤ 100).
- Acceptance 5 (REQ-13-05): `REQ-13-05` del test nuevo (encabezado con
  `feature 13 remove-navbar-logo` y `REQ-43-06`; REQ-12-03 exige ausencia del
  logo; REQ-12-04 exige el aria-current del Home; desaparece la aserción
  antigua).
- Acceptance 6 (`require_tests_to_close`): `./init.sh` verde al cierre;
  layout-refactor REQ-08-05, architecture-nav-link REQ-08-04 y
  visual-polish-refactor REQ-37-03 sin cambios.

Sin salida de scope: no se tocó la feature 14 (pendiente), ni CSS, ni JS, ni
otras rutas; `public/assets/mxvi_logo.webp` se conserva.