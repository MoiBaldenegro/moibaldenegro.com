# Análisis — Refactor global de moibaldenegro.com contra la documentación

Fecha: 2026-08-10 · Autor: spec_author (sesión de verificación y cierre de análisis)

> Este informe complementa `progress/research/refactor-completo.md` (análisis de
> descomposición completo, 13 features). Aquí se registra la **verificación
> independiente** del estado real en disco, la validación del backlog existente
> y los hallazgos finales que el líder necesita para arrancar la implementación.

## 1. Corrección al contexto del líder (estado real en disco)

El líder partía de la premisa de bootstrap ("NO existe `feature_list.json`").
El estado real verificado en esta sesión es:

- **`feature_list.json` SÍ existe** (creado hoy 2026-08-10 ~17:13, sin commitear,
  `git status` = untracked) con `project`, `description`, `rules`
  (`one_feature_at_a_time: true`, `require_tests_to_close: true`,
  `valid_status: [pending, in_progress, done, blocked]`) y **13 features en
  `pending`** (ids 1-13). **No contiene ningún `in_progress` ni `done`.**
- **`specs/01_*` … `specs/13_*`** existen y completas (todas con
  `requirements.md` EARS estricto; con `design.md` las que tocan UI: 02, 03, 04,
  08, 09, 10, 11).
- **`progress/research/refactor-completo.md`** ya documenta el análisis de
  descomposición.
- **`node scripts/check-format.mjs` pasa** (FORMATO ✔) sobre el backlog y specs
  actuales.
- **`.opencode/agents/*.md` y `.claude/agents/*.md` (5 c/u) SÍ existen** — el
  test de integridad no falla por agentes.
- **Assets verificados:** `public/assets/moises-hero.jpg` y
  `public/assets/svg/sprite.svg` **SÍ existen**; los datos de `hero.data.ts`
  (`assets/moises-hero.jpg` relativo y `/assets/svg/sprite.svg#<id>`) resuelven
  correctamente en Astro vía `public/`. No falta ningún recurso de imagen/sprite.
  No existe `src/assets/` (Welcome.astro importa `../assets/astro.svg` y
  `../assets/background.svg` → imports rotos en código muerto).

Conclusión: el trabajo de análisis y alta en backlog ya está hecho y es de
calidad. Esta sesión **no duplica features**: verifica, valida trazabilidad y
deja constancia. Crear features duplicadas (14+) violaría la regla de una
feature = un cambio coherente.

## 2. Qué es el proyecto hoy (resumen por capas)

| Capa | Estado real | Violación documentada |
|------|-------------|------------------------|
| Harness | Sin `templates/`, sin script `test` en package.json; test de integridad escanea TODO el repo | init.sh rojo (3 fallos) |
| Datos | `src/data/hero.data.ts` (284 líneas) mezcla tipos + perfil + 12 tarjetas; hex en datos; no es JSON | `src/data` = JSON; ≤100 líneas; tokens |
| Dominio | `src/entities/`, `src/repositories/`, `src/services/` con solo `context.md`; `src/application/*.ts` vacíos; sin `src/domain/` | Estructura `src/domain/{entities,repositories}`; errores nombrados |
| Componentes | `hero-card.astro` con `style={...}` inline; `new-hero.astro` (102 líneas) importa `../../data/hero.data`; `latest-articles.astro` usa `getCollection` en UI; `Welcome.astro` (210 líneas, starter, no importado) | Estilos separados; datos vía repositorio; ≤100 líneas; lógica separada |
| Estilos | `src/styles/hero.css` (782 líneas) mezcla `:root` tokens con valores sueltos (`#101018`, `#25144f`, `#7d68ff`, `#4732a5`…) | Tokens; ≤100 líneas; un archivo por componente |
| Layout | `Layout.astro`: `lang="en"`, título "Astro Basics", `<style>` embebido; navbar duplicada dentro de new-hero | Un solo layout; estilos separados; idioma/título reales |
| Rutas | Solo `/`; navbar enlaza `/about` → 404 | Rutas explícitas; una URL por página |
| Config | `src/config.ts` código muerto (nada lo importa); `src/content.config.ts` correcto (feature previa APPROVED, no se toca) | Código muerto |
| Contenido | `src/content/architecture/00-agilismo.md` válido; colección `architecture` con loader glob + Zod OK | — |

## 3. Decisiones verificadas (confirmo las de refactor-completo.md)

1. **Test de integridad del kit (opción a: acotar el escaneo al kit).** El test
   debe escanear solo los archivos del kit (obligatorios + plantillas), no
   `node_modules/`, `dist/`, `.astro/`, `src/` ni `progress/`. Justificación
   confirmada: escanear todo el repo es inviable (node_modules) y la palabra
   "hero" es semántica del dominio real (renombrar la app = opción b descartada:
   cambia el dominio sin resolver el escaneo de carpetas generadas). Con el
   escaneo acotado no hay fugas.
2. **`latest-articles` → `PostsRepository`**: `getCollection` es acceso a datos;
   la arquitectura exige repositorios del dominio. La colección de Astro se
   considera fuente de contenido (no se duplica a JSON), el repositorio la
   envuelve y entrega entidades `Post`.
3. **Navbar → layout único** (`Layout.astro`), con estilos en `layout.css`.
4. **Ruta `/about`** se crea (la navbar la referencia) con contenido SOLO de los
   datos reales del perfil (sin inventar biografía).
5. **Colores de tarjetas → tokens de marca**: el JSON guarda `colorToken` y el
   CSS mapea vía `data-color-token`; sin hex en datos.
6. **`src/application/`, `src/services/` y `src/ui/`** no existen en la
   arquitectura → se eliminan en la limpieza final (feature 12).
7. **`hero.data.ts`** se migra a `hero.json` + `hero-cards.json` (features 5-6)
   y se borra en la feature 9 (último punto que lo importa) para no romper el
   build entre features.
8. **`README.md`** del starter se reescribe al final (feature 13).

## 4. Verificación de trazabilidad (specs ↔ acceptance ↔ REQ)

Revisadas las 13 specs: cada `requirements.md` usa EARS estricto validado por
`scripts/validate-specs.mjs` (check-format ✔). Los `acceptance` de
`feature_list.json` citan explícitamente los REQ (p. ej. feature 1 → REQ-01-01…
REQ-01-06; feature 5 → REQ-05-01…REQ-05-05) y cada acceptance es convertible en
un test (tests node:test declarados por feature en las specs). Sin brechas
detectadas de trazabilidad.

## 5. Estado del harness (evidencia ejecutada en esta sesión)

```
node scripts/check-format.mjs        → FORMATO ✔ (exit 0)
node --test tests/harness-kit-integrity.test.mjs → 3 FAIL (0 pass)
```

Fallos confirmados del test de integridad:
1. `REQ-17-01/02` — archivos obligatorios ausentes: `templates/feature_list.json`,
   `templates/current.md`, `templates/history.md` (falta toda la carpeta `templates/`).
2. `REQ-17-03/05` — fuga de tokens de app (el token `hero` está en `src/` y
   `progress/impl_content-config.md`; además el escaneo incluye node_modules/dist).
3. `REQ-17-04` — `ENOENT: templates/feature_list.json` (confirmado).

`package.json` no tiene script `test` → `pnpm test` falla. `pnpm build` pasa.

## 6. Orden de implementación propuesto (id = orden)

1. **harness-kit-mount** — base: templates/, script test, fix del test de
   integridad → `./init.sh` verde por primera vez.
2. **design-tokens** — `src/styles/tokens.css` + test (base de estilos).
3-4. **hero-section-styles** y **hero-cards-styles** — extraer hero.css en hojas
   por componente con tokens (dependen de 2).
5-7. **hero-profile-domain**, **hero-cards-domain**, **posts-domain** — capa de
   datos/dominio (JSON + entidades + repositorios con `*DataError`).
8. **layout-refactor** — idioma es, título real, estilos separados, navbar
   compartida (depende de 2).
9-10. **hero-ui-refactor** y **articles-ui-refactor** — conectar UI a
   repositorios, eliminar inline styles y `hero.data.ts`.
11. **about-page** — ruta `/about` (depende de 5 y 8).
12. **cleanup-dead-code** — borrar config.ts, application/, context.md,
    Welcome.astro, src/ui/ + guardián `scripts/audit-design-tokens.mjs`.
13. **project-readme** — README real.

Cierre de cada feature: test en rojo contra la spec (TDD), implementación,
`./init.sh` verde, `progress/impl_<feature>.md` + review APPROVED.

## 7. Riesgos y trabas

- **Build roto entre features:** mitigado — `hero.data.ts` se borra solo en la 9
  cuando nada lo importa; cada feature cierra con build verde.
- **hero.css (782 líneas) al repartir:** las hojas nuevas se verifican con tests
  (≤100 líneas, sin hex/rgba) escritos en rojo primero.
- **Navbar duplicada entre features 8 y 9:** regresión visual menor aceptable;
  la 9 elimina la copia del hero.
- **Test de integridad:** el fix (feature 1) es imprescindible antes de tocar
  cualquier CSS con la palabra "hero".
- **`scripts/audit-design-tokens.mjs` (feature 12):** verbo `audit-` está en la
  lista cerrada de conventions.md; ruta y acceptance declarados en la spec.

## 8. Conclusión para el líder

El backlog está listo para implementar: `feature_list.json` válido con 13
features `pending` (id 1 = base del harness), 13 specs EARS completas con
trazabilidad, informe previo de descomposición y este informe de verificación.
Puede lanzar al implementer con la feature 1 (`harness-kit-mount`).
