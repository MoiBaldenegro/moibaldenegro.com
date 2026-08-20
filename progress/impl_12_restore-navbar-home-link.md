# Informe de implementación — feature 12 (restore-navbar-home-link)

> Implementer. Fecha: 2026-08-20. Spec: `specs/12_restore-navbar-home-link/`
> (REQ-12-01..06) + contrato REQ-08-04/05 de `specs/08_architecture-nav-link/`.
> Causa raíz: `progress/research/iframe-video-styles.md` §2/D6/§4.

## Resumen

Regresión preexistente: el navbar de `src/layouts/Layout.astro` había perdido
el enlace de texto Home (solo quedaba el ancla del logo → `/`) al añadir el
enlace Arquitectura y en reescrituras manuales posteriores (686a7cc/319bdcd).
Los tests REQ-08-04 (`tests/architecture-nav-link.test.mjs`) y REQ-08-05
(`tests/layout-refactor.test.mjs`) estaban en rojo. Se restauró el cambio
mínimo — `<a href="/">Home</a>` plano entre el ancla del logo y About — y se
añadieron los tests de inspección de la spec (REQ-12-01..05).

## Ciclo rojo (evidencia previa a la implementación)

### Tests preexistentes en rojo (test-first cumplido por la regresión)

```
$ node --test tests/architecture-nav-link.test.mjs tests/layout-refactor.test.mjs
...
# Subtest: REQ-08-04: se conservan Home, About, @moibaldenegro y la barra de búsqueda
not ok 3 - REQ-08-04: se conservan Home, About, @moibaldenegro y la barra de búsqueda
  error: 'el enlace Home se perdió al añadir Arquitectura (REQ-08-04)'
# Subtest: REQ-08-05: la navbar compartida vive en el layout único
not ok 10 - REQ-08-05: la navbar compartida vive en el layout único
  error: 'falta el enlace Home en la navbar del layout (REQ-08-05)'
1..11
# tests 11
# pass 9
# fail 2
```

### Tests de inspección nuevos en rojo (`tests/restore-navbar-home-link.test.mjs`)

```
$ node --test tests/restore-navbar-home-link.test.mjs
# Subtest: REQ-12-01: el navbar incluye un enlace de texto Home con destino / antes de About
not ok 1 - ... error: 'el navbar no incluye el enlace de texto Home hacia / (REQ-12-01)'
# Subtest: REQ-12-02: el enlace Home no define clase ni estilo propios y hereda los estilos del navbar
not ok 2 - ... error: 'no se encuentra el enlace Home (REQ-12-02)'
# Subtest: REQ-12-03: la restauración conserva el ancla del logo, About, Arquitectura, @moibaldenegro y la barra
ok 3 - REQ-12-03 ... (verde esperado: el resto del navbar existe)
# Subtest: REQ-12-04: el enlace Home omite aria-current y el ancla del logo conserva aria-current de la portada
not ok 4 - ... error: 'no se encuentra el enlace Home (REQ-12-04)'
# Subtest: REQ-12-05: Layout.astro no supera las 100 líneas tras la restauración
ok 5 - REQ-12-05 ... (verde esperado: 48 líneas ≤ 100)
1..5
# tests 5
# pass 2
# fail 3
```

## Cambio implementado

`src/layouts/Layout.astro` — una sola línea añadida (línea 39), entre el ancla
del logo y About, según design.md (Decisión 3: Home → About → Arquitectura →
@moibaldenegro → SearchBar):

```diff
         <a aria-current={Astro.url.pathname === '/' ? 'page' : undefined} href="/">
           <img src="/assets/mxvi_logo.webp" alt="Logo de moibaldenegro.com" width="72"/>
         </a>
+        <a href="/">Home</a>
         <a aria-current={Astro.url.pathname === '/about' || Astro.url.pathname === '/about/' ? 'page' : undefined} href="/about">About</a>
```

- Enlace plano: sin clase, sin style, sin aria-current (REQ-12-02/04; el ancla
  del logo ya marca la portada con `aria-current="page"` — estado
  pre-regresión 72e5c52, Decisión 2 del design.md).
- Sin `<style>` nuevo, sin CSS, sin JS, sin dependencias.
- `Layout.astro` pasa de 48 a 49 líneas (REQ-12-05, ≤100).
- `layout.css` no se toca: el enlace hereda `.site-navbar a` y
  `a[aria-current="page"]` (REQ-12-02).

## Ciclo verde (evidencia posterior)

### Tests de la feature (3 archivos, 16/16 pass)

```
$ node --test tests/restore-navbar-home-link.test.mjs tests/architecture-nav-link.test.mjs tests/layout-refactor.test.mjs
1..16
# tests 16
# pass 16
# fail 0
```

### Suite completa del arnés

```
$ pnpm test
1..424
# tests 424
# pass 424
# fail 0
# duration_ms 3767.64
```

(419 tests preexistentes + 5 nuevos de la feature 12 = 424; 0 fail.)

### `./init.sh` completo

```
--- Herramientas y dependencias ---
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)
--- Archivos del harness ---
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

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/layouts/Layout.astro` | +1 línea: `<a href="/">Home</a>` en el navbar (línea 39) |
| `tests/restore-navbar-home-link.test.mjs` | Nuevo: tests de inspección REQ-12-01..05 |
| `feature_list.json` | Feature 12: `pending` → `in_progress` |
| `progress/current.md` | Bitácora de la sesión |

## Trazabilidad acceptance ↔ REQ

- Acceptance 1 (REQ-12-01/03/06): REQ-08-04/05 en verde + REQ-12-01/03 en el
  test nuevo.
- Acceptance 2 (REQ-12-02): test nuevo `REQ-12-02` (sin clase/style, sin
  `<style>` en Layout.astro, layout.css estiliza navbar y estado activo).
- Acceptance 3 (REQ-12-04): test nuevo `REQ-12-04` (Home sin aria-current;
  logo conserva `aria-current` de `/`).
- Acceptance 4 (REQ-12-05): test nuevo `REQ-12-05` (49 líneas ≤ 100).
- Acceptance 5 (`require_tests_to_close`): `./init.sh` verde al cierre.

Sin salida de scope: no se tocó la feature 10 (in_progress), ni CSS, ni JS,
ni otras rutas.