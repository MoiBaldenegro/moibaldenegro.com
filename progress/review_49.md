# Review — feature 49

**Veredicto:** APPROVED

Alcance revisado: `src/domain/http/cache-policy.ts` (nuevo), `public/_headers` (regla `/assets/*`),
`src/components/htb-stadistics.astro` (Cache-Control de la isla), `tests/static-cache-headers.test.mjs`
(nuevo). Implementado por el líder en rol de implementer (autorización humana); revisado con el mismo rigor.

## Requisitos

- REQ-49-01: [x] `public/_headers:13-14` declara `/assets/*` con `Cache-Control: public, max-age=604800`.
- REQ-49-02: [x] `cache-policy.ts:7-8` exporta `ASSETS_CACHE_CONTROL` y `HTB_ISLAND_CACHE_CONTROL`.
- REQ-49-03: [x] `htb-stadistics.astro:5` importa la constante y `:13` hace
  `Astro.response.headers.set('Cache-Control', HTB_ISLAND_CACHE_CONTROL)`. Una sola línea, sin lógica
  nueva en el frontmatter; las guardas de las features 22 y 32 sobre el frontmatter siguen en verde.
- REQ-49-04: [x] la regla `/*` (`public/_headers:4-9`) no tiene Cache-Control; lo comprueba el test
  `static-cache-headers.test.mjs:42-48`. El informe documenta `/about/` con `max-age=0, must-revalidate` en preview.
- REQ-49-05: [x] comprobado en el build real: `dist/client/_headers` contiene `/_astro/*` (immutable, líneas 1-2),
  la regla `/*` de seguridad y `/assets/*` (líneas 16-17). El test `:50-62` construye en un outDir temporal y lo limpia.
- REQ-49-06: [x] `progress/impl_49.md` registra el rojo (`ERR_MODULE_NOT_FOUND ... cache-policy.ts`) antes del código y el verde (6/6).
- REQ-49-07: [x] cache-policy.ts 8 líneas, htb-stadistics.astro 48, _headers 14, test 68.
- REQ-49-08: [x] `./init.sh` termina en verde (formato, tests, build) y `pnpm test` da 693/693, 0 fallos.

Dependencias: `depends_on: [40]` y la 40 está en `done`.

## Checkpoints
- C1 Estilos fuera de los `.astro`: [x] no se añade `<style>`.
- C2 Sin lógica en la UI: [x] la isla solo fija una cabecera con una constante de dominio.
- C3 Datos vía repositorio: [x] sin cambios (sigue usando `HtbProfileRepository`).
- C4 Tokens: [x] no aplica (no hay CSS).
- C5 Máx. 100 líneas: [x]
- C6 Sin dependencias externas: [x]
- C7 `./init.sh` en verde: [x] (ejecutado en esta revisión, exit 0)
- C8 Verificación visual en desktop y móvil: [ ] no aplica, la feature no toca UI.
- C9 Sin temporales, debug ni TODOs: [x]

## Observaciones (no bloqueantes)
1. Como dice el informe, si la API de HTB falla, la respuesta vacía de la isla también queda cacheada
   una hora. Es coherente con la degradación elegante actual. Si se quiere evitar, se puede tratar en
   otra feature (por ejemplo, fijar la cabecera solo cuando `profile` existe).
2. El valor `public, max-age=604800` aparece en dos sitios: la constante y `public/_headers`. Ese
   archivo es estático y no puede importar la constante. El test REQ-49-01 compara los dos valores,
   así que si uno cambia sin el otro, el test lo detecta.

## Cambios requeridos (si aplica)
Ninguno.
