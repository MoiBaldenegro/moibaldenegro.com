# Informe de implementación — feature 1 `hero-test-fixture-align`

Fecha: 2026-08-18 (implementer). Spec: `specs/01_hero-test-fixture-align/requirements.md` (REQ-01-01..04).

## Estado inicial

- Suite completa en rojo: **257/258** — el único fallo es
  `tests/hero-profile-repository.test.mjs` (test `REQ-31-01/REQ-31-04: el
  loader por defecto entrega el perfil real de src/data/hero.json`).
- Causa: el fixture `EXPECTED_PROFILE` (línea 34) declaraba
  `image: 'assets/moises-hero.jpg'` (ruta relativa obsoleta, revertida
  manualmente) contra el dato real de `src/data/hero.json`:
  `"image": "/assets/moises-hero.jpg"` (ruta absoluta, aprobada en la feature
  43 con el precedente REQ-43-06: el fixture sigue al dato real).
- `src/` es CORRECTO (humano confirmado): NO se modifica (REQ-01-04).

## Ciclo rojo (evidencia antes del ajuste)

Comando: `node --test tests/hero-profile-repository.test.mjs` (antes de
tocar nada) → exit code 1, **8 pass / 1 fail**:

```
# Subtest: REQ-31-01/REQ-31-04: el loader por defecto entrega el perfil real de src/data/hero.json
not ok 3 - REQ-31-01/REQ-31-04: el loader por defecto entrega el perfil real de src/data/hero.json
  ---
  duration_ms: 1.5528
  type: 'test'
  location: '...tests\hero-profile-repository.test.mjs:60:1'
  failureType: 'testCodeFailure'
  error: |-
    el perfil entregado no coincide
    + actual - expected

      {
        description: 'AI Engineering • Rust • WebAssembly • Full Stack • DevOps • AWS • Azure • Security First • OWASP • Rustacean 🦀',
    +   image: '/assets/moises-hero.jpg',
    -   image: 'assets/moises-hero.jpg',
        name: 'Moisés Baldenegro Melendez',
        username: '@moibaldenegro',
        verified: true
      }

  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  operator: 'deepStrictEqual'
  ...
1..9
# tests 9
# pass 8
# fail 1
```

El diff del assert muestra exactamente la discrepancia: `actual` =
`'/assets/moises-hero.jpg'` (dato real del repositorio) vs `expected` =
`'assets/moises-hero.jpg'` (fixture obsoleto).

## Cambio aplicado (scope mínimo, REQ-01-04)

Un único cambio, SOLO en `tests/hero-profile-repository.test.mjs`, línea 34
(dentro del fixture `EXPECTED_PROFILE`):

```diff
-  image: 'assets/moises-hero.jpg',
+  image: '/assets/moises-hero.jpg',
```

El valor es idéntico al campo `image` de `src/data/hero.json` (REQ-01-01,
REQ-01-02). Ningún archivo de `src/` fue tocado (REQ-01-04).

## Ciclo verde (evidencia después del ajuste)

1. `node --test tests/hero-profile-repository.test.mjs` → exit code 0,
   **9/9 pass, 0 fail** (los 9 tests del archivo: REQ-05-01, REQ-05-02,
   REQ-31-01/REQ-31-04, REQ-31-01 loader inyectable, 3× REQ-31-06,
   REQ-31-03, REQ-31-08):

```
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 100.6713
```

2. Suite completa `bash -c "pnpm test"` → exit code 0, **258/258 pass**:

```
1..258
# tests 258
# suites 0
# pass 258
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 4084.6786
```

3. `node scripts/check-format.mjs` → exit code 0:

```
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos
```

4. `bash ./init.sh` → exit code 0, "El entorno está perfecto" (entorno,
   formato, tests al 100% y build de producción ✔).

## Confirmación de que src/ no fue modificado

`git diff --name-only -- src/` muestra únicamente
`src/styles/hero-card.css` (1 inserción: línea en blanco), que es un cambio
**trivial preexistente** de un ciclo abortado anterior (ya documentado en
`progress/current.md`; el humano confirmó que el código es correcto). Esta
sesión NO tocó ningún archivo de `src/`; los cambios de la sesión son
exclusivamente: `tests/hero-profile-repository.test.mjs` (el ajuste del
fixture), `feature_list.json` (status → in_progress) y
`progress/current.md` (bitácora).

## Estado del backlog

- Feature 1 `hero-test-fixture-align`: `status: "in_progress"` (no se marca
  `done`: espera el APPROVED del reviewer que lanzará el líder).