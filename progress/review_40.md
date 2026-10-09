# Review — feature 40

**Veredicto:** APPROVED

Feature: `security-headers`. Spec: `specs/40_security-headers/requirements.md` (sin design.md).
Implementa el líder en rol de implementer (autorización humana explícita), revisado con el mismo rigor.
`depends_on`: no tiene, así que no se saltó ninguna dependencia pendiente.

## Pregunta de revisión (test-first)
- Rojo previo documentado en `progress/impl_40.md` §«Ciclo rojo/verde»: `ERR_MODULE_NOT_FOUND`
  sobre `src/domain/http/security-headers.ts` y `fail 1` antes de crear `src/` (REQ-40-07).
- Verde: `./init.sh` ejecutado por el revisor (2026-10-08). Entorno, formato, tests al 100 % y build
  pasaron sin fallos. El flake preexistente de REQ-25-07 no apareció.

## Trazabilidad REQ → evidencia
- REQ-40-01/06: `src/domain/http/security-headers.ts:8-17` declara `SECURITY_HEADERS` con `Object.freeze`, 5 cabeceras
  y la CSP Report-Only literal de la spec. El test (`tests/security-headers.test.mjs:39-43`) usa `deepEqual`,
  comprueba `isFrozen` y el valor exacto de la CSP.
- REQ-40-02: `public/_headers:4-9` contiene la regla `/*` con valores idénticos. El test parsea el archivo y aplica `deepEqual` contra
  el valor esperado (por tanto «exactamente», sin cabeceras extra) (`:45-48`).
- REQ-40-03: `src/middleware.ts:7` aplica `onRequest` → `withSecurityHeaders(await next())`. El test usa un `next()` simulado (`:50-53`)
  y cubre también `Response.redirect`, que tiene las cabeceras inmutables (`:61-66`). La rama `catch` de
  `security-headers.ts:27-30` copia la respuesta con `new Response(body, response)` y conserva el estado y `Location`.
- REQ-40-04: el filtro `!response.headers.has(name)` (`security-headers.ts:23`) no sobrescribe valores ni los
  duplica. El test comprueba `Referrer-Policy: no-referrer` (`:55-59`).
- REQ-40-05: el test hace el build sobre un outDir temporal mediante el helper serializado y verifica `/*` y `/_astro/*` con
  `Cache-Control: public, max-age=31536000, immutable` (`:68-79`).
- REQ-40-08: los archivos tienen 33, 7, 9 y 84 líneas. Hay test de inspección (`:81-84`).
- REQ-40-09: `./init.sh` en verde.

## Checkpoints
- C1 (estilos fuera de `.astro`): [x]. No toca UI.
- C2 (lógica fuera de la UI): [x]. La lógica está en `src/domain/http/`; el middleware solo delega.
- C3 (datos vía repositorio): [x]. No aplica, la feature no lee JSON.
- C4 (tokens): [x]. No aplica, no hay CSS.
- C5 (≤100 líneas): [x]
- C6 (sin dependencias externas): [x]. Solo `import type` de `astro`, que ya es dependencia aprobada.
- C7 (datos JSON válidos y errores nombrados): [x]. No aplica.
- C8 (`./init.sh` verde): [x]
- C9 (visual desktop/móvil): [ ]. No aplica, la feature no tiene UI. No es bloqueante.
- C10 (feature en `done`): [ ]. Sigue `in_progress` hasta que el líder la cierre tras este APPROVED.
- C11 (progress documentado): [x]. Existe `progress/impl_40.md`.
- C12 (sin temporales ni debug): [x]. El test borra su outDir temporal en el `finally`.

## Observaciones (no bloqueantes)
1. Nombre `security-headers.ts`: `docs/conventions.md` pide camelCase para utilidades `.ts`, pero el
   repo ya usa kebab-case en `src/domain/` (`latest-posts.ts`, `related-titles.ts`). Es coherente con lo que hay.
2. HSTS, «Always Use HTTPS» y la verificación con `curl -I` en producción quedan como tareas operativas
   pendientes, documentadas en `impl_40.md`. Están fuera del alcance del código.

## Cambios requeridos
Ninguno.
