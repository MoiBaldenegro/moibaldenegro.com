# Review — feature 6 hero-cards-domain

- **Fecha:** 2026-08-10
- **Agente:** reviewer
- **Spec:** `specs/06_hero-cards-domain/requirements.md` (REQ-06-01..06)
- **Informe del implementer:** `progress/impl_hero-cards-domain.md`
- **Design.md:** no aplica (feature de dominio, no toca UI; `specs/06_hero-cards-domain/` solo contiene `requirements.md` — verificado con glob).

**Veredicto:** APPROVED

## Verificación por puntos (evidencia)

### 1. Spec y acceptance (feature_list.json, feature id 6, 4 acceptance)
- A1 «src/data/hero-cards.json existe con las 12 tarjetas actuales y sin valores hex en los fondos (REQ-06-01, REQ-06-04)» → cubierto por tests `REQ-06-01` y `REQ-06-04` (líneas 58 y 89 de `tests/hero-cards-repository.test.mjs`).
- A2 «tests/hero-cards-repository.test.mjs pasa en verde y entrega 12 entidades HeroCard (REQ-06-02, REQ-06-03)» → cubierto por tests `REQ-06-02` y `REQ-06-03` (líneas 71 y 84).
- A3 «El test verifica que con un hero-cards.json malformado el repositorio lanza HeroCardsDataError (REQ-06-05)» → cubierto por 4 tests `REQ-06-05` (líneas 117, 126, 135, 144): ausente, JSON inválido, forma inválida y tarjeta inválida.
- A4 «La entidad y el repositorio no superan 100 líneas cada uno (REQ-06-06)» → cubierto por test `REQ-06-06` (línea 154).
- Trazabilidad acceptance↔REQ completa. Sin acceptance sin test y sin test huérfano.

### 2. Evidencia rojo/verde (`progress/impl_hero-cards-domain.md`)
- ROJO documentado: `ERR_MODULE_NOT_FOUND ...\src\domain\repositories\hero-cards-repository.ts` con `# pass 0 / # fail 1`. Coherente con el disco: el test importa el módulo del repositorio (línea 21 del test) y la verificación previa documenta que el archivo no existía. No reproductible sin deshacer la implementación (prohibido al reviewer), pero la evidencia es realista, coincide con la bitácora de `progress/current.md` y con el patrón verificado en features 3 y 5.
- VERDE documentado: test feature 9/9 → re-ejecutado por el reviewer: los 9 casos de la feature (tests 12-20 del listado TAP) pasan; suite completa **39/39**.
- Pregunta de revisión: ¿test escrito antes del código y en rojo, suite verde al final? → **Sí**, evidencia documentada coherente con el disco; suite re-ejecutada en verde.

### 3. REQ-06-01 / REQ-06-04 — datos en JSON, colorToken sin hex
- `src/data/hero-cards.json`: 12 tarjetas. Comparadas campo a campo contra `src/data/hero.data.ts` (líneas 42-284): ids, títulos, iconos, gridColumn, gridRow, rotate, scale e iconWidth **idénticos** en las 12.
- Sin campo `background` en ninguna tarjeta; grep de `#[0-9a-fA-F]{3,8}` en `hero-cards.json` → 0 coincidencias (los únicos hex del repo siguen en `hero.data.ts`, intacto, que lo borra la feature 9).
- Los 12 `colorToken` (react, html, node, github, youtube, twitch, typescript, css, node-bottom, github-bottom, youtube-bottom, twitch-bottom) mapean a tokens existentes en `src/styles/tokens.css` (líneas 39-50): `--color-marca-react` … `--color-marca-css`, con los valores exactos de la paleta de `hero.data.ts`. ✔

### 4. REQ-06-02 — entidad HeroCard
- `src/domain/entities/hero-card.ts` (17 líneas): `interface HeroCard` con los 9 campos **readonly** (id, title, colorToken, icon, gridColumn, gridRow, rotate, scale, iconWidth). Inmutable (principio 4 de `docs/architecture.md`). ✔

### 5. REQ-06-03 / REQ-06-05 — repositorio y errores
- `src/domain/repositories/hero-cards-repository.ts` (89 líneas): `HeroCardsRepository` lee el JSON con `node:fs` (`readFileSync`) y entrega `HeroCard[]`; `getCards()` nunca falla en silencio.
- `HeroCardsDataError extends Error` con `this.name = 'HeroCardsDataError'` (líneas 11-16); mensajes en español en todos los lanzamientos (lectura, JSON inválido, no-arreglo, tarjeta no-objeto, campo con tipo incorrecto). Errores nombrados, clase PascalCase + sufijo `Error` (convención de `docs/conventions.md`).
- Patrón de validación (asCard/expectString/expectNumber) idéntico al de `hero-profile-repository.ts` (feature 5, aprobada). ✔

### 6. REQ-06-06 y límite de líneas
- Entidad: 17 líneas; repositorio: 89 líneas. Ambos ≤100 (verificado en disco y por el test). ✔

### 7. Arquitectura y convenciones
- Capas correctas: `src/data/*.json` → `src/domain/entities/` → `src/domain/repositories/` según `docs/architecture.md` (tabla de carpetas y flujo de datos).
- Repositorio = única vía de acceso al JSON del dominio; el test usa directorios temporales (`mkdtempSync`) para los casos de error, sin tocar el JSON real.
- Sin dependencias nuevas: solo `node:fs` (stdlib); `package.json` sin cambios de esta feature.
- Sin `console.log`/`debugger`/`TODO` en `src/domain` (grep: 0 coincidencias); los temporales de test se limpian en `finally`.

### 8. Ejecuciones del reviewer (reenviadas desde cero)
| Comando | Resultado |
|---|---|
| `node --test "tests/**/*.test.mjs"` | **39 tests / 39 pass / 0 fail** (30 previos + 9 de la feature; tests 12-20) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` |
| `pnpm build` | `✓ Complete!` (1 página, 730ms) |
| `bash ./init.sh` | `✔ El entorno está perfecto. Podemos empezar a trabajar.` |

### 9. Alcance (git status)
- Feature 6 tocó solo: `src/data/hero-cards.json`, `src/domain/` (entidad + repositorio), `tests/hero-cards-repository.test.mjs`, `progress/impl_hero-cards-domain.md` (todos untracked).
- `src/data/hero.data.ts` **intacto** (no aparece en `git status` como modificado; sus 12 hex siguen ahí, los borrará la feature 9). ✔
- Los `M`/`D` de `package.json`, `tests/harness-kit-integrity.test.mjs`, `hero-card.astro`, `new-hero.astro` y `hero.css` son de features 1-4 ya aprobadas (sesión concurrente previa): **observación, no bloqueo** — sin mezcla de cambios de la feature 6 en ellos.

## Checkpoints
- C1: [x] — Feature de dominio, no toca UI/estilos.
- C2: [x] — Sin lógica en archivos de UI (no toca componentes).
- C3: [x] — HeroCardsRepository creado como única vía al JSON de tarjetas (la conexión de la UI es feature 9, fuera de alcance).
- C4: [x] — colorToken sin hex; los 12 mapean a `--color-marca-*` existentes en tokens.css.
- C5: [x] — Entidad 17 líneas, repositorio 89 líneas (≤100).
- C6: [x] — Sin dependencias externas (solo node:fs).
- C7: [x] — hero-cards.json válido y tipado por la entidad HeroCard.
- C8: [x] — HeroCardsDataError nombrado en todos los fallos; sin fallos silenciosos.
- C9: [x] — `./init.sh` verde, re-ejecutado por el reviewer.
- C10: [ ] — No aplica a esta feature (dominio); la verificación visual desktop/móvil corresponde a las features 4/9.
- C11: [ ] — status de feature 6 sigue `in_progress` en feature_list.json; lo pasa a `done` el líder al cerrar (flujo del arnés).
- C12: [x] — `progress/current.md` y `progress/impl_hero-cards-domain.md` documentan la sesión.
- C13: [x] — Sin temporales, sin print/debug, sin TODOs (grep en src/domain: 0 coincidencias).

## Cambios requeridos
Ninguno.

## Observaciones
- La evidencia del ciclo rojo no se puede re-ejecutar sin revertir la implementación (prohibido al reviewer); la documentada es coherente con el disco y con el patrón de las features 3 y 5 ya verificadas.
- `hero.data.ts` (284 líneas, con hex) sigue existiendo a propósito: la feature 9 lo borrará cuando la UI se conecte a los repositorios.
- Restos de la sesión concurrente (M/D de features 1-4 no commitadas): ajenos a esta feature, sin impacto en su alcance.

## Conclusión
Los 6 requisitos REQ-06-01..06 se cumplen y las 4 acceptance de la feature 6 tienen test verde. Suite completa 39/39, check-format, build e `./init.sh` en verde. Veredicto: **APPROVED**.
