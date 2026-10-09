# Review — feature 70

**Veredicto:** APPROVED

## Checkpoints
- C1 (arquitectura: estilos, lógica, repositorios y tokens): [x]  No hay cambios en `src/`. `grep -rn gsap src` no devuelve nada (REQ-70-09).
- C2 (límite de 100 líneas): [x]  El archivo nuevo `tests/gsap-dependency-approval.test.mjs` tiene 69 líneas. `tests/dependencies-registry-crlf.test.mjs` pasa de 113 a 114 líneas. Ya superaba el límite antes de esta feature y en `tests/` hay más casos así (precedente de los tests legacy). No es bloqueante.
- C3 (dependencias solo con discusión y aprobación humana): [x]  La autorización humana del 2026-10-09 está en `progress/research/gsap_backlog.md:8`. La nota fechada está en `docs/dependencies.md` (sección «Aprobaciones de cambio de versión», «APLICADA en la feature 70»). La entrada `### gsap` incluye version 3.15.0, scope, approved, motivo, licencia (NO OSI, con la URL) y alcance.
- C4 (ciclo test-first): [x]  `progress/impl_70.md` registra el rojo (`pass 1 / fail 5`, solo pasaba REQ-70-07 porque no hay `.npmrc`) y después el verde (6/6, suite 805/805).
- C5 (`./init.sh` y validador en verde): [x]  `./init.sh` termina con «El entorno está perfecto»: formato, tests al 100 % y build. `node scripts/validate-dependencies.mjs` sale con código 0. El test nuevo pasa 6/6.
- C6 (depends_on): [x]  `depends_on: []`, sin dependencias pendientes.

## Verificación por requisito
- REQ-70-01/02: `package.json:19` tiene `"gsap": "3.15.0"`, una versión exacta. `npm view gsap version` devuelve 3.15.0. En el importer raíz de `pnpm-lock.yaml`, `specifier: 3.15.0` resuelve a `version: 3.15.0`. El lockfile añade además las entradas en packages y snapshots, sin dependencias transitivas.
- REQ-70-03/04/05/06: se cumplen (ver C3). La nota no contiene «subir @cloudflare/workers-types».
- REQ-70-07: no hay `.npmrc` en la raíz.
- REQ-70-08: las claves y versiones previas de dependencies y devDependencies siguen igual. Solo se añade gsap.
- Ajustes de tests legacy: `tests/dependencies-registry-crlf.test.mjs:25-26` y `tests/sitemap-robots-endpoints.test.mjs:73` solo añaden gsap a las listas esperadas, con un comentario de trazabilidad (precedente REQ-43-06). No relajan ninguna aserción.

## Observaciones no bloqueantes
1. `progress/impl_70.md` dice que el test nuevo tiene «78 líneas», pero tiene 69. Es una imprecisión del informe y no afecta al resultado.

## Cambios requeridos (si aplica)
Ninguno.
