# Informe de implementación — feature 70 gsap-dependency-approval

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). El humano autorizó GSAP el 2026-10-09 para el scroll horizontal de las cards
de la portada.

## Ciclo rojo/verde (REQ-70-10)

- Test nuevo `tests/gsap-dependency-approval.test.mjs` (78 líneas) escrito primero.
- ROJO: `ℹ pass 1 / ℹ fail 5`. Solo pasaba REQ-70-07, porque no existe .npmrc.
- VERDE: 6/6. Suite completa 805/805; `./init.sh` en verde;
  `node scripts/validate-dependencies.mjs` sale con 0.

## Cambios

- `pnpm add gsap@3.15.0 --save-exact`: `package.json` → `"gsap": "3.15.0"` (última estable
  según `npm view gsap version`, misma que el informe). El importer raíz de `pnpm-lock.yaml`
  resuelve 3.15.0. Sin `.npmrc` ni registro privado.
- `docs/dependencies.md`:
  - Nota fechada 2026-10-09 con la autorización literal, «APLICADA en la feature 70».
  - Entrada `### gsap` con version 3.15.0, scope dependencies, approved 2026-10-09, motivo
    (portada, feature 72), licencia («Standard 'no charge' license de Webflow,
    https://gsap.com/standard-license, NO OSI», con sus condiciones) y alcance (solo la
    portada, gsap + ScrollTrigger del mismo paquete).
- Ningún archivo de `src/` importa gsap todavía (REQ-70-09); el primer uso llega con la 72.
- Tests legacy ajustados (precedente REQ-43-06):
  - `tests/dependencies-registry-crlf.test.mjs`: APPROVED suma gsap, ahora con 5 entradas.
  - `tests/sitemap-robots-endpoints.test.mjs` (REQ-42-08): la lista de dependencias incluye gsap,
    con nota en la misma línea; sigue en 96 líneas.

## Peso

`gsap.min.js` 72 927 B y `ScrollTrigger.min.js` 44 575 B minificados (unos 45 KB gzip juntos,
según el informe). Solo se cargará en la portada (feature 72).
