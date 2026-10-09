# Informe de implementación — feature 41 astro-security-upgrade

- Fecha: 2026-10-08
- Aprobación humana: «sí lo autorizo» (2026-10-08), registrada en docs/dependencies.md.
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/41_astro-security-upgrade/requirements.md` (sin design.md). La carpeta
  `specs/41_post-reading-width-restore/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `package.json` / `pnpm-lock.yaml` | `pnpm add astro@^7.3.8 @astrojs/cloudflare@^14.3.4 wrangler@^4.149.0` (últimas 7.x / 14.x / 4.x en el registro): astro 7.2.0 → 7.3.8, adapter 14.2.1 → 14.3.4, wrangler 4.121.0 → 4.149.0 (REQ-41-01/02). |
| `docs/dependencies.md` | Las entradas `###` de los 3 paquetes pasan a la versión nueva con `approved: 2026-10-08`; la nota de aprobación se marca como APLICADA (REQ-41-03). `scripts/validate-dependencies.mjs` (vía check-format) en verde. |
| `tests/astro-security-upgrade.test.mjs` (NUEVO) | Rango de astro ≥ 7.2.8, versión resuelta en el importer raíz del lockfile ≥ 7.2.8, registro = package.json + fecha de aprobación para los 3 paquetes y subida real del adapter y wrangler. |

## pnpm audit (REQ-41-04)

- Antes (audit_perf_security.md A1): 29 avisos — 1 critical, 13 high, 11 moderate, 4 low.
- Después: `pnpm audit --audit-level critical` → **exit 0**. `pnpm audit` completo: **2 high, 0 critical**:
  - `http-cache-semantics <=4.2.0` (vía astro): sin versión parcheada publicada («Patched: <0.0.0»).
  - `source-map-js <1.2.2` (vía @astrojs/cloudflare > vite > postcss): herramienta de build/dev, no llega al Worker.

## Build y suite (REQ-41-06/09)

`pnpm build` ✔ con astro 7.3.8. `./init.sh`: formato ✔, build ✔; tests 633/633 en verde salvo el
flake preexistente REQ-25-07 (tmp-audit.css), que aparece de forma intermitente (1 de 3 corridas) y
tiene feature propia (59). No hay ningún fallo atribuible a la actualización.

## Ciclo rojo/verde (REQ-41-07)

Rojo antes de tocar dependencias: 0/3 (`astro ^7.2.0`). El parser del lockfile de la primera versión
del test tenía un bug (no encontraba la línea): se reescribió por líneas y se volvió a verificar en
rojo **contra el estado anterior** (git stash de package.json, lockfile y registro): REQ-41-01 falla
con `astro ^7.2.0`, REQ-41-02 y 41-03 también. Con la actualización: 3/3.

## Pendientes para el humano

- Peer warning: wrangler 4.149.0 pide `@cloudflare/workers-types@^5.20261006.1` y el repo tiene
  `^5.20260812.1`. No se sube: la aprobación cubre solo astro, el adapter y wrangler. Es una dependencia
  de tipos (devDependencies); build y tests no se ven afectados.
