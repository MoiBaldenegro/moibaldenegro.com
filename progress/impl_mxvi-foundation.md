# Implementación — feature 10 `mxvi-foundation`

Primera fase del refactor del sitio al design system MXVI. Spec:
`specs/10_mxvi-foundation/requirements.md` (REQ-10-01..11) y `design.md`. Fecha: 2026-11-11.

## 1. Archivos tocados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `tests/mxvi-foundation.test.mjs` | Nuevo, escrito antes del código: 8 tests para REQ-10-01..10 | 79 |
| `scripts/sync-mxvi.mjs` | Nuevo (stdlib): copia `components.css` y las hojas que importa desde GitHub (commit resuelto) o desde una carpeta local, y escribe `manifest.json` con sha256 | 83 |
| `src/styles/mxvi/` | Copia sincronizada: `components.css`, 33 hojas en `components/` (todas ≤ 96 líneas) y `manifest.json` (origen `github:MoiBaldenegro/mxvi-design-system@5fd0c29`) | — |
| `src/layouts/Layout.astro` | Importa `../styles/mxvi/components.css` después de tokens, layout y typography | 81 |

Sin tokens nuevos: las hojas leen los tokens existentes de `src/styles/tokens.css`
(verificado por REQ-10-08). Sin dependencias ni JavaScript de runtime.

## 2. Evidencia del rojo

`node --test tests/mxvi-foundation.test.mjs` antes del código: `pass 0`, `fail 8`
(REQ-10-01, 03/04, 05, 06/07, 08, 09, 10 y 02/03).

## 3. Verde

- `node --test tests/mxvi-foundation.test.mjs`: `pass 8`, `fail 0`.
- `./init.sh` en verde: 87/87 tests, build OK.

## 4. Regresión visual (REQ-10-11)

Capturas de página completa (reduced motion) de home, about, `/posts/00-agilismo/`,
búsqueda y 404 a 390, 768 y 1440 px, antes y después: 0.000 % de píxeles distintos
en las 15 capturas.

## 5. Notas de entorno

- Los tests importan `.ts` directamente: requieren un Node con type stripping por
  defecto (24.x usado aquí; 22.12 falla igual que antes del cambio).
- `pnpm build` requiere la variable `IN_MAINTENANCE` (env schema de Astro).
