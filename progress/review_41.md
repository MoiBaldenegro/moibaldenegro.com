# Review — feature 41

**Veredicto:** APPROVED

Feature: `astro-security-upgrade`. Spec: `specs/41_astro-security-upgrade/requirements.md` (sin design.md;
`specs/41_post-reading-width-restore/` es histórica y no aplica). Implementa el líder en rol de implementer
(autorización humana explícita), revisado con el mismo rigor. `depends_on`: no tiene, así que no se saltó
ninguna dependencia pendiente.

## Pregunta de revisión (test-first)
- Rojo previo documentado en `progress/impl_41.md` §«Ciclo rojo/verde»: 0/3 con `astro ^7.2.0`; tras corregir
  el parser del lockfile se re-verificó en rojo contra el estado anterior (git stash) antes de aplicar la subida.
- Verde: `./init.sh` ejecutado por el revisor (2026-10-08). Las dos primeras ejecuciones fallaron en «tests al
  100 %». Al aislar `pnpm test` (6 corridas), el único fallo observado fue el flake preexistente
  `REQ-25-07: el escaneo de src/ no encuentra cadenas GOL` (1 de 6; tiene feature propia, la 59). Las 3
  ejecuciones siguientes de `./init.sh` salieron todas en verde. Suite 631/631 y los 3 tests REQ-41 pasan.

## Política de dependencias
- Aprobación humana registrada en `docs/dependencies.md`, sección «Aprobaciones de cambio de versión»
  (2026-10-08, «sí lo autorizo», CVE GHSA-26w7-cxv4-gfx2).
- `git diff HEAD -- package.json` muestra que solo cambian 3 líneas: `@astrojs/cloudflare ^14.2.1→^14.3.4`,
  `astro ^7.2.0→^7.3.8` y `wrangler ^4.121.0→^4.149.0`. `@cloudflare/workers-types` no cambia y no hay
  paquetes nuevos. El importer raíz de `pnpm-lock.yaml` (líneas 9-23) lo refleja; el resto del diff del lockfile
  son dependencias transitivas de esa subida.
- Las entradas `###` de los 3 paquetes tienen la versión de package.json y `approved: 2026-10-08`. El validador
  (check-format) está en verde.

## Trazabilidad REQ → evidencia
- REQ-41-01: `package.json` `"astro": "^7.3.8"`. Lo cubre el test REQ-41-01.
- REQ-41-02: el lockfile resuelve `astro` a `7.3.8(esbuild@0.28.2)(yaml@2.9.1)`. Lo cubre el test REQ-41-02.
- REQ-41-03: `docs/dependencies.md` registra versión y fecha para los 3 paquetes. Lo cubre el test REQ-41-03.
- REQ-41-04: `pnpm audit --audit-level critical` da exit 0 («2 vulnerabilities found, Severity: 2 high», 0 critical).
- REQ-41-05: no aplica, porque la aprobación existe.
- REQ-41-06: `pnpm build` está en verde dentro de `./init.sh`.
- REQ-41-07: el rojo previo está documentado (ver arriba).
- REQ-41-08: `tests/astro-security-upgrade.test.mjs` tiene 61 líneas, `docs/dependencies.md` 53 y `package.json` 29.
  El lockfile es generado y no se cuenta.
- REQ-41-09: `./init.sh` está en verde (excluido el flake ajeno REQ-25-07).

## Checkpoints
- C1 (estilos en src/styles, sin `<style>`): [x]. No se toca UI.
- C2 (sin lógica en UI): [x]. No se toca UI.
- C3 (datos vía repositorios): [x]. No aplica.
- C4 (tokens, sin valores sueltos): [x]. No aplica.
- C5 (≤100 líneas): [x]
- C6 (dependencias con discusión y aprobación humana previa): [x]
- C7 (`./init.sh` verde): [x]. El flake REQ-25-07 es ajeno y preexistente.
- C8 (visual desktop/móvil): [ ]. No hay cambio de UI. Queda sin inspección en navegador; no bloquea.
- C9 (feature_list en done): [ ]. Lo cierra el líder tras este veredicto.
- C10 (progress al día): [x]
- C11 (sin temporales, debug ni TODOs): [x]

## Observaciones no bloqueantes
1. `docs/dependencies.md`: la intro de «Aprobaciones de cambio de versión» dice «pendientes de aplicar», pero la
   única nota ya figura como APLICADA. Conviene ajustar la redacción en una feature futura.
2. Peer warning: wrangler 4.149.0 pide `@cloudflare/workers-types@^5.20261006.1` (el repo tiene
   `^5.20260812.1`). Fue bien no subirla, porque está fuera de la aprobación. Hay que proponérsela al humano.
3. Quedan 2 avisos high (`http-cache-semantics` sin parche publicado y `source-map-js` solo en build).
   Están fuera del alcance de REQ-41-04, que solo exige 0 critical.
4. El test comprueba la versión resuelta en el lockfile solo para astro, no para el adapter ni para wrangler.
   Es suficiente para la spec.

## Cambios requeridos
Ninguno.
