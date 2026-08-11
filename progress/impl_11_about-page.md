# Informe de implementación — feature 11 about-page

- **Feature:** 11 — about-page ("Crear la página /about con el perfil del autor")
- **Implementer:** agente implementador
- **Fecha:** 2026-08-10
- **Spec:** `specs/11_about-page/requirements.md` (REQ-11-01..05) + `specs/11_about-page/design.md`
- **Estado en `feature_list.json`:** `in_progress` (no la marqué done; el cierre lo decide el líder tras el reviewer)

## 1. Ciclo rojo/verde (test-first, OBLIGATORIO)

### ROJO — `node --test tests/about-page.test.mjs` (antes de implementar)

Escribí PRIMERO `tests/about-page.test.mjs` contra la spec (REQ-11-01..05) y el
design.md (Decisiones 1-3 y tabla de 8 tokens). Salida capturada (extracto):

```
not ok 1 - REQ-11-01: src/pages/about.astro existe
  error: 'src/pages/about.astro no existe (REQ-11-01)'
not ok 2 - REQ-11-02: la página usa el layout único y le pasa su propio título
  error: 'src/pages/about.astro no existe (REQ-11-01)'
...
not ok 6 - REQ-11-04: about.css no supera 100 líneas
  error: 'src/styles/about.css no existe (REQ-11-04)'
...
not ok 10 - REQ-11-05: el build genera la ruta /about en dist/
  error: 'dist/ no contiene la ruta /about generada por el build (REQ-11-05)'
...
1..11
# tests 11
# pass 0
# fail 11
```

11/11 tests en rojo (0 pass, 11 fail): la página no existe, la hoja no existe y
`dist/` (presente en disco por builds previos) no contiene la ruta /about.

### VERDE (implementación + verificación progresiva)

1. Implementé `src/pages/about.astro` y `src/styles/about.css`.
2. Test de la feature (pre-build): 10/11 ✔ — único fallo REQ-11-05 porque el
   build aún no se había ejecutado. Añadí `background: var(--color-background)`
   a `.about` (la tabla del design.md lista `--color-background` como "Fondo de
   la página" y el test exige consumir los 8 tokens de la tabla, patrón
   heredado de `tests/articles-ui-refactor.test.mjs`).
3. `pnpm build` → éxito:

```
generating static routes
  ├─ /about/index.html  (+10ms)
  ├─ /index.html  (+9ms)
✓ 2 page(s) built in 753ms
Complete!
```

4. Test de la feature post-build: **11/11 ✔** (`# pass 11`, `# fail 0`).
5. Suite completa: `node --test "tests/**/*.test.mjs"` → **80/80 ✔**
   (69 tests previos + 11 nuevos; `# pass 80`, `# fail 0`, `# skipped 0`).
6. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.
7. `./init.sh` (Git Bash) → todas las comprobaciones ✔:

```
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 2. Archivos creados y por qué

| Archivo | Por qué |
|---------|---------|
| `src/pages/about.astro` (17 líneas) | REQ-11-01/02/03: expone la ruta /about, usa el layout único con `title="About — moibaldenegro.com"` (Decisión 2) y muestra los datos reales del perfil vía repositorio (Decisión 1: solo name/username/description, el mínimo exigido; no inventé contenido). Frontmatter solo imports + `const profile = new HeroProfileRepository().getProfile()`. |
| `src/styles/about.css` (43 líneas) | REQ-11-04: estilos separados de la UI, BEM ligero (bloque `.about`, elementos `.about__profile/.about__name/.about__username/.about__description`), solo tokens, media query móvil al final (≤100 líneas). |
| `tests/about-page.test.mjs` (237 líneas) | Test-first: verifica REQ-11-01..05 y las convenciones (página ≤100 líneas, sin lógica, sin estilos embebidos, sin acceso directo a `src/data`). |

No toqué: `Layout.astro` (feature 8), dominio (features 5-7), hero/articles
(features 9-10), arnés (features 1, 12-13), ni la navbar (ya enlaza /about).

## 3. Tokens usados (tabla del design.md, todos consumidos)

| Token | Uso en about.css |
|-------|-----------------|
| `--color-background` | Fondo de la página (`.about`) |
| `--color-surface` | Tarjeta de perfil (`.about__profile`) |
| `--color-text` | Nombre y descripción |
| `--color-text-secondary` | Username |
| `--color-border` | Borde de la tarjeta |
| `--radius-card` | Radio de la tarjeta |
| `--gap-card` | Espaciado de la cuadrícula del perfil |
| `--container-max` | Ancho del contenido |

0 hex/rgba hardcodeados en la hoja (verificado por test y por el CSS).

## 4. Verificación de la ruta /about en el build (REQ-11-05)

`astro.config.mjs` no define `build.format`, así que Astro 7 usa el formato por
defecto `directory` y la ruta se genera como **`dist/about/index.html`**
(no `dist/about.html`) — confirmado en la salida del build (`├─ /about/index.html`)
y en disco. La verificación es doble:

1. **En el build:** la salida de `pnpm build` lista la ruta generada y terminé
   con "2 page(s) built" y "Complete!"; comprobé en disco
   `dist/about/index.html` y su contenido renderizado (title "About —
   moibaldenegro.com" con U+2014 verificado por code point, `lang="es"`, navbar
   con enlace `/about`, `<h1>` con "Moisés Baldenegro Melendez", `<p>` con
   "@moibaldenegro" y la descripción real, CSS de about en el bundle).
2. **En el test (REQ-11-05):** el test acepta `dist/about.html` **o**
   `dist/about/index.html` y solo asevera cuando `dist/` existe (dist/ es un
   artefacto gitignored que solo aparece tras un build; en un run de tests sin
   build previo la verificación queda en el paso de build, documentado así en
   el propio test). En la fase verde pasó 11/11 con dist presente tras el build.

## 5. Desviaciones justificadas

- **Ruta de build `dist/about/index.html` en lugar de `dist/about.html`:** no es
  una desviación de spec (REQ-11-05 solo exige que el build genere la ruta
  /about); es el comportamiento por defecto de Astro sin `build.format`. El
  test cubre ambas formas y el informe documenta la forma real generada.
- **`background: var(--color-background)` en `.about`:** el body ya lo aplica
  vía layout.css, pero la tabla del design.md asignó `--color-background` a
  "Fondo de la página"; consumirlo en la propia página hace que la hoja use los
  8 tokens de la tabla (patrón de verificación heredado de features previas) y
  mantiene la página autocontenida en su fondo.
- **verified/image no renderizados:** Decisión 1 del design.md limita el
  contenido a los datos reales del perfil y el mínimo exigido por el acceptance
  (REQ-11-03) es name/username/description; se optó por el mínimo para no
  ampliar el scope (feature 9 ya muestra verified/image en el hero).

## 6. Resultado final

`./init.sh` → **"El entorno está perfecto"** (formato ✔, 80/80 tests ✔, build ✔).
Listo para que el líder lance al reviewer.