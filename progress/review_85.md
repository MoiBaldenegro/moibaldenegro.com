# Review — feature 85

**Veredicto:** APPROVED

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `.astro` con `<style>`: [x]
  - Nueva hoja `src/styles/typography.css` (7 líneas): `code, pre, kbd, samp { font-family: var(--font-mono); }`.
  - Layout.astro la importa en la línea 4, después de `layout.css` (REQ-85-15).
  - El único `<style>` lo emite el componente `<Font>` de Astro en el HTML, no un `.astro` del proyecto (design.md, restricciones).
- C2 Frontmatter solo con imports y paso de datos: [x]
  - `src/layouts/Layout.astro:4-5` solo añade imports (`typography.css` y `Font` de `astro:assets`).
  - `Layout.astro:41-42`: `<Font cssVariable="--font-geist-sans" preload={[{ style: 'normal' }]} />` y `<Font cssVariable="--font-geist-mono" />` (REQ-85-11).
- C3 Datos vía repositorio: [x]
  - La feature no toca datos.
- C4 Solo tokens: [x]
  - `tokens.css:95-96`: `--font-sans: var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)` sin Inter, y `--font-mono: var(--font-geist-mono, ui-monospace, monospace)` (REQ-85-12/13).
  - `typography.css` solo usa `var(--font-mono)`.
  - `node scripts/audit-design-tokens.mjs`: AUDIT ✔.
- C5 Archivos ≤ 100 líneas: [x]
  - astro.config.mjs 86, Layout.astro 75, tokens.css 97, typography.css 7.
  - Tests: geist-font-base 96, geist-font-build 55, geist-font-dependency 40, gsap-dependency-approval 72, sitemap-robots-endpoints 96.
  - Observación no bloqueante: `tests/dependencies-registry-crlf.test.mjs` mide 115 líneas. Ya medía 115 en HEAD (9a6e6f0) y esta feature no lo hace crecer: solo cambia las líneas 26-27, que suman `geist` a APPROVED. Se trata como legacy, igual que en review_70 y review_81. Lo honesto sería dividirlo en una feature propia.
- C6 Dependencias con discusión previa: [x]
  - `package.json`: `"geist": "1.7.2"`, versión exacta, y `pnpm.overrides {"geist>next": "-"}` (REQ-85-01/02).
  - La entrada `### geist` de `docs/dependencies.md` coincide con package.json. Campos: version 1.7.2, scope dependencies, approved 2026-10-12, motivo, licencia SIL OFL 1.1 y alcance (REQ-85-04).
  - La nota del 2026-10-12 pasa a APLICADA en la feature 85 y remite Pixel a la 86 (REQ-85-05).
  - `node scripts/validate-dependencies.mjs`: exit 0.
  - next/react/react-dom no están instalados:
    - `grep -E "^\s+(next|react|react-dom)@" pnpm-lock.yaml` no da coincidencias.
    - `node_modules/next`, `node_modules/react` y `node_modules/react-dom` no existen.
    - No hay entradas `next@`, `react@` ni `react-dom@` en `node_modules/.pnpm` (REQ-85-03).
  - Ningún archivo de `src/` importa `geist` ni `geist/font*` (REQ-85-20).
- C7 Mismo origen y CSP intacta: [x]
  - `git status` de `public/_headers`, `src/domain/http/security-headers.ts` y `tests/csp-enforce.test.mjs` sale vacío (REQ-85-19).
  - `dist/client/_astro/fonts/` tiene 3 woff2: Geist normal, Geist cursiva y Geist Mono (REQ-85-16).
  - `dist/client/index.html` tiene un único `<link rel="preload" href="/_astro/fonts/3ef2e4bee4a65258.woff2" as="font" type="font/woff2" crossorigin>` (REQ-85-17).
  - Los `@font-face` usan `url("/_astro/fonts/…")` y no hay ninguna URL http(s) ni CDN externo (REQ-85-18).
- C8 `./init.sh` en verde: [x]
  - Pasan entorno, formato, tests al 100% y build de producción. Ejecutado por el reviewer.
- C9 Test-first: [x]
  - `progress/impl_85.md` anota el rojo con 13 fail / 7 pass antes de tocar package.json, astro.config.mjs, Layout.astro y tokens.css (REQ-85-21).
  - Los 7 tests que ya pasaban son guardas.
  - Después: verde 20/20 en los tests de la feature y suite completa 899/899.
- C10 Dependencias de la feature: [x]
  - `depends_on [84]`, y la 84 está en `done`.
- C11 Coherencia acceptance↔REQ: [x]
  - Los 7 criterios de `feature_list.json` (id 85) cubren REQ-85-01..23 según el índice de trazabilidad de requirements.md.
  - Los tests citan los REQ correspondientes.
- C12 Inspección visual desktop/móvil: [ ]
  - No verificada en navegador por el reviewer. No bloqueante, igual que en ciclos anteriores.

## Cambios requeridos (si aplica)
Ninguno.

Para el líder:
1. En la feature 86, `--font-display` llevará tokens.css a 98 líneas. Habrá que ajustar los tests que fijan 97 líneas: REQ-17-09, 26-07, 39-09, 40-11, 42-09, 77-01, 79-08, 82-14, 83-13 y 84-13. Lo anota el implementer en impl_85.md.
2. `tests/dependencies-registry-crlf.test.mjs` (115 líneas, legacy) sigue por encima del límite. Si se quiere cumplir el límite de forma estricta, habría que abrir una feature de división.
