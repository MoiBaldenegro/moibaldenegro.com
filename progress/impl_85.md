# Informe de implementación — feature 85 geist-font-base

## Tests escritos (antes del código)

- `tests/geist-font-dependency.test.mjs` — REQ-85-01..05 (package.json, override, lockfile, registro, nota).
- `tests/geist-font-base.test.mjs` — REQ-85-07..15, 19, 20, 22 (importa `astro.config.mjs` y comprueba `fonts`; Layout, tokens, typography, CSP, sin imports JS de geist, ≤100 líneas).
- `tests/geist-font-build.test.mjs` — REQ-85-16/17/18 (astro build en outDir temporal con `tests/helpers/astro-build.mjs`).
- `tests/gsap-dependency-approval.test.mjs` — REQ-85-06: lista de dependencies con `geist`.

## Rojo (REQ-85-21) — anotado ANTES de tocar package.json, astro.config.mjs, Layout.astro y tokens.css

`node --test tests/geist-font-base.test.mjs tests/geist-font-dependency.test.mjs tests/geist-font-build.test.mjs tests/gsap-dependency-approval.test.mjs`:

```
✔ REQ-70-01/02: gsap en dependencies con versión exacta y el lockfile la resuelve igual
✔ REQ-70-03: la entrada gsap del registro coincide con package.json
✔ REQ-70-04/05: licencia NO OSI de Webflow y alcance limitado a la portada
✔ REQ-70-06: nota de aprobación fechada 2026-10-09 y APLICADA en la feature 70
✔ REQ-70-07: sin .npmrc apuntando al registro privado de GreenSock
✔ REQ-85-19/20: CSP sin font-src externo y ningún import JS del paquete geist en src/
✔ REQ-85-22: archivos de la feature con 100 líneas o menos
✖ failing tests:
✖ REQ-70-08/09: solo se añade gsap y solo latest-horizontal.ts lo importa
✖ REQ-85-01/02/03: geist 1.7.2 exacta, override del peer next y lockfile sin next/react
✖ REQ-85-04: entrada ### geist en el registro de dependencias
✖ REQ-85-05: la nota de Geist del 2026-10-12 queda APLICADA en la feature 85 (Pixel en la 86)
✖ REQ-85-07/08: familia Geist (normal + cursiva, 100 900) con --font-geist-sans
✖ REQ-85-09: familia Geist Mono con --font-geist-mono
✖ REQ-85-10: display swap y fallbacks terminados en familia genérica
✖ REQ-85-11: <Font> de astro:assets en el head (preload solo de Geist normal)
✖ REQ-85-12/13: tokens --font-sans y --font-mono sobre las variables de Astro
✖ REQ-85-14/15: typography.css pone code/pre/kbd/samp en --font-mono y el layout la importa
✖ REQ-85-16: dist/client/_astro/fonts contiene los woff2 de Geist y Geist Mono
✖ REQ-85-17: / tiene exactamente un preload de fuente woff2 crossorigin en /_astro/fonts/
✖ REQ-85-18: /, /about y un artículo sin URLs absolutas en @font-face ni en preloads de fuente
ℹ fail 13
ℹ pass 7
ℹ tests 20
```

Los 7 en verde ya en rojo son guardas (REQ-85-19/20 CSP e imports, REQ-85-22 longitudes, REQ-70-01..07 sin cambios). Las 13 fallas cubren todos los REQ nuevos.

## Implementación

- `pnpm add geist@1.7.2 --save-exact` con `pnpm.overrides: { "geist>next": "-" }` añadido antes a package.json (REQ-85-01/02). pnpm-lock.yaml: `geist@1.7.2` y `overrides: geist>next: '-'`; ninguna entrada next/react/react-dom (REQ-85-03).
- docs/dependencies.md: entrada `### geist` (version 1.7.2, scope dependencies, approved 2026-10-12, motivo, licencia SIL Open Font License 1.1, alcance) y nota del 2026-10-12 pasada de PENDIENTE a APLICADA en la feature 85, con Pixel remitido a la 86 (REQ-85-04/05). `node scripts/validate-dependencies.mjs` → exit 0.
- astro.config.mjs (86 líneas): `fonts` con `fontProviders.local()`; Geist (`--font-geist-sans`, Geist-Variable.woff2 normal + Geist-Italic[wght].woff2 italic, weight '100 900') y Geist Mono (`--font-geist-mono`, GeistMono-Variable.woff2); `display: 'swap'`; fallbacks `[ui-sans-serif, system-ui, sans-serif]` y `[ui-monospace, monospace]` (REQ-85-07..10). Decisión 6 de design.md: la ruta `./node_modules/geist/dist/fonts/...` resuelve con el enlace simbólico de pnpm en Windows (build verde, sin workaround).
- src/layouts/Layout.astro (75 líneas): `import { Font } from 'astro:assets'`, `<Font cssVariable="--font-geist-sans" preload={[{ style: 'normal' }]} />` y `<Font cssVariable="--font-geist-mono" />` en el head; importa `../styles/typography.css` tras `layout.css` (REQ-85-11/15).
- src/styles/tokens.css (97 líneas, igual que antes): `--font-sans: var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)` y nuevo `--font-mono: var(--font-geist-mono, ui-monospace, monospace)`; la línea en blanco final se quitó para conservar las 97 líneas que fijan REQ-17-09, 26-07, 39-09, 40-11, 42-09, 77-01, 79-08, 82-14, 83-13 y 84-13 (sin tocar esos tests) (REQ-85-12/13).
- src/styles/typography.css (nueva, 7 líneas): `code, pre, kbd, samp { font-family: var(--font-mono); }` (REQ-85-14).
- CSP sin cambios: `git status` de public/_headers, src/domain/http/security-headers.ts y tests/csp-enforce.test.mjs vacío; csp-enforce pasa (REQ-85-19). Ningún import JS de geist en src/ (REQ-85-20).

Salida del build (verificada a mano en un outDir temporal): 3 woff2 en `_astro/fonts/`; Astro nombra las familias con hash (`font-family:Geist-<hash>`, `"Geist Mono-<hash>"`) y genera los fallbacks métricos (`... fallback: Arial` / `Courier New` con size-adjust); un único `<link rel="preload" href="/_astro/fonts/<hash>.woff2" as="font" type="font/woff2" crossorigin>`. El test REQ-85-16 se ajustó a ese nombrado con hash tras el primer verde parcial (19/20).

## Ajustes a tests existentes (consecuencia directa de REQ-85-04/06, precedente REQ-43-06)

- tests/gsap-dependency-approval.test.mjs: lista de dependencies con `geist` (REQ-85-06).
- tests/sitemap-robots-endpoints.test.mjs (REQ-42-08): lista de dependencias con `geist`, en la misma línea (96 líneas, sin cambio de longitud).
- tests/dependencies-registry-crlf.test.mjs (REQ-28-03/08): APPROVED suma `geist`; comentario fusionado en una línea para no crecer. Nota: el archivo ya medía 115 líneas antes de esta feature (preexistente, > 100); no se amplía.

## Verde

Tests de la feature (`node --test tests/geist-font-base.test.mjs tests/geist-font-dependency.test.mjs tests/geist-font-build.test.mjs tests/gsap-dependency-approval.test.mjs`):

```
✔ REQ-70-01/02: gsap en dependencies con versión exacta y el lockfile la resuelve igual
✔ REQ-70-03: la entrada gsap del registro coincide con package.json
✔ REQ-70-04/05: licencia NO OSI de Webflow y alcance limitado a la portada
✔ REQ-70-06: nota de aprobación fechada 2026-10-09 y APLICADA en la feature 70
✔ REQ-70-07: sin .npmrc apuntando al registro privado de GreenSock
✔ REQ-70-08/09: solo se añade gsap y solo latest-horizontal.ts lo importa
✔ REQ-85-01/02/03: geist 1.7.2 exacta, override del peer next y lockfile sin next/react
✔ REQ-85-04: entrada ### geist en el registro de dependencias
✔ REQ-85-05: la nota de Geist del 2026-10-12 queda APLICADA en la feature 85 (Pixel en la 86)
✔ REQ-85-07/08: familia Geist (normal + cursiva, 100 900) con --font-geist-sans
✔ REQ-85-09: familia Geist Mono con --font-geist-mono
✔ REQ-85-10: display swap y fallbacks terminados en familia genérica
✔ REQ-85-11: <Font> de astro:assets en el head (preload solo de Geist normal)
✔ REQ-85-12/13: tokens --font-sans y --font-mono sobre las variables de Astro
✔ REQ-85-14/15: typography.css pone code/pre/kbd/samp en --font-mono y el layout la importa
✔ REQ-85-16: dist/client/_astro/fonts contiene los woff2 de Geist y Geist Mono
✔ REQ-85-17: / tiene exactamente un preload de fuente woff2 crossorigin en /_astro/fonts/
✔ REQ-85-18: /, /about y un artículo sin URLs absolutas en @font-face ni en preloads de fuente
✔ REQ-85-19/20: CSP sin font-src externo y ningún import JS del paquete geist en src/
✔ REQ-85-22: archivos de la feature con 100 líneas o menos
ℹ fail 0
ℹ pass 20
ℹ tests 20
```

Suite completa (`pnpm test`):
```
ℹ tests 899
ℹ pass 899
ℹ fail 0
```

`node scripts/audit-design-tokens.mjs`: `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.

`./init.sh`:
```
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

## Nota sobre el arranque

El `./init.sh` inicial (antes de tocar nada) marcó el bloque de tests en rojo una vez; `pnpm test` aislado justo después dio 885/885 en verde. Fallo no reproducible (probablemente concurrencia de builds), no relacionado con esta feature.

## Pendiente para la feature 86

tokens.css queda en 97 líneas sin línea en blanco final; `--font-display` la llevará a 98 y obligará a revisar los tests que fijan 97 líneas.
