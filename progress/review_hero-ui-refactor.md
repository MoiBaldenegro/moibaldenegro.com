# Review — feature 9 hero-ui-refactor

**Fecha:** 2026-08-10 · **Reviewer:** agente revisor (nivel 1) · **Estado del backlog:** feature 9 `in_progress`

**Veredicto:** APPROVED

## Verificación punto por punto

### Pregunta de revisión: ¿test escrito antes del código y en rojo, y suite verde al final?

**SÍ.** `progress/impl_hero-ui-refactor.md` (líneas 48-65) documenta el ROJO con salida
completa: `node --test tests/hero-ui-refactor.test.mjs` → `# pass 3 # fail 4`, y los 4 fails
son exactamente los REQ que exigía la spec (REQ-09-01 sin repositorios, REQ-09-02 prop sin
entidad HeroCard, REQ-09-03 `data-color-token={card.id}` en vez de `{card.colorToken}`,
REQ-09-05 hero.data.ts existente). El ROJO es coherente con el estado previo que confirma
el diff de `git diff HEAD` (hero-card.astro importaba `HeroCardData` de hero.data y usaba
`style={...}`; new-hero.astro importaba de `../../data/hero.data`). El VERDE (60/60) lo
re-ejecuté yo mismo en disco (ver abajo). La bitácora de `progress/current.md` línea 33-34
también registra el ciclo.

### REQ-09-01 — NewHero obtiene perfil y tarjetas desde los repositorios — ✔

`src/components/new-hero/new-hero.astro` (90 líneas):
- Línea 8-9: imports de `../../domain/repositories/hero-cards-repository.ts` y
  `../../domain/repositories/hero-profile-repository.ts`.
- Línea 11-12: `new HeroCardsRepository().getCards()` y `new HeroProfileRepository().getProfile()`.
- Línea 81-83: `heroCards.map(card => <HeroCard card={card} />)`.
- Sin imports de `src/data` (grep y test REQ-09-01 lo confirman). El profile se usa
  directamente (image, name, username, verified, description) y las 12 tarjetas se pasan tipadas.

### REQ-09-02 — HeroCard prop tipada con la entidad HeroCard — ✔

`src/components/hero-card.astro` (33 líneas):
- Línea 3: `import type { HeroCard } from "../domain/entities/hero-card.ts"`.
- Línea 5-7: `interface Props { card: HeroCard }`; línea 9: `const { card } = Astro.props`.
- El diff contra HEAD confirma que el tipo cambió de `HeroCardData` (de hero.data) a `HeroCard`
  (entidad del dominio).

### REQ-09-03 — data-color-token sin estilos inline — ✔ (nota del líder resuelta)

- Línea 14: `<article class="hero-card" data-color-token={card.colorToken}>`.
- **Ocurrencia de "style" detectada por el líder (grep -c → 1): VERIFICADA.** La única
  ocurrencia es la línea 2: `import "../styles/hero-card.css";` — es el **import de la hoja
  de estilos** (el substring "styles" contiene "style"), **no** un atributo `style=` ni un
  bloque `<style>`. No es una violación de REQ-09-03.
- `git diff HEAD` confirma la **eliminación del bloque inline** anterior:
  `style={... --card-bg, --icon-rotation, --icon-scale, --icon-width, grid-column, grid-row}`.
  Posiciones y fondos ahora salen de `hero-card.css` vía `[data-color-token=...]` (rules etiquetadas
  con `--color-marca-*`, `--card-column`, `--card-row`; verificado por el test de integración
  REQ-09-03: los 12 colorToken de hero-cards.json tienen su regla en hero-card.css).
- `tests/hero-cards-styles.test.mjs` (feature 4) fue ajustado a la Decisión 2 del design.md
  (línea 160: `data-color-token={card.colorToken}`); los 12 `id` == los 12 `colorToken` en
  `hero-cards.json` (verificado en disco), el mecanismo CSS no cambia.

### REQ-09-04 — Frontmatter solo imports/paso de datos + build con el hero completo — ✔

- Test REQ-09-04 verifica ausencia de `readFileSync`, `new URL(`, `function`, `if(`, `for(`
  en ambos componentes. En disco: frontmatter = imports + 2 const de repositorio; el resto es
  marcado y `heroCards.map(...)` (paso de datos).
- `pnpm build` ejecutado por mí: `1 page(s) built` sin errores (exit 0). `dist/index.html`
  verificado por mí: nombre "Moisés Baldenegro Melendez" ✔, "@moibaldenegro" ✔, 12 `.hero-card` ✔,
  12 `data-color-token` únicos ✔, `style=` inline en todo el HTML: false ✔, títulos REACT/TYPESCRIPT ✔.
- **Ajuste de repositorios (documentado en el informe):** `DEFAULT_DATA_URL` ahora resuelve
  contra `process.cwd()` (`pathToFileURL(join(process.cwd(), 'src', 'data', ...))`) en
  `hero-cards-repository.ts` (línea 14) y `hero-profile-repository.ts` (línea 14). Correcto y
  necesario: el prerender de Astro ejecuta desde `dist/.prerender` donde `import.meta.url` ya no
  resuelve a `src/data`. La API pública (constructor con `dataUrl` opcional), los errores
  nombrados y los tests 5/6 no cambian — verifiqué que `tests/hero-cards-repository.test.mjs` y
  `tests/hero-profile-repository.test.mjs` siguen en verde sin modificación.

### REQ-09-05 — hero.data.ts eliminado — ✔

- `git diff HEAD --stat -- src/data/hero.data.ts`: 284 deleciones; el archivo no existe en
  `src/data/` (solo `hero.json` y `hero-cards.json`).
- `grep -rn "hero\.data" src/` ejecutado por mí: **cero coincidencias** (exit 1). El comentario
  de `src/styles/tokens.css` (línea 38-39) fue actualizado a "migrada a src/data/hero-cards.json
  en la feature 6" — sin referencias muertas.
- Test REQ-09-05 escanea recursivamente `src/` y exige cero referencias a `hero.data`: en verde.

### Trazabilidad acceptance ↔ REQ (feature_list.json, feature 9)

| Acceptance | REQ | Estado |
|---|---|---|
| new-hero obtiene de repositorios y no importa de src/data | REQ-09-01 | ✔ verificado en disco + test |
| hero-card recibe prop tipada y sin atributos style | REQ-09-02, REQ-09-03 | ✔ verificado en disco + test |
| tests/hero-ui-refactor.test.mjs verifica que hero.data.ts no existe | REQ-09-05 | ✔ test 6/6 en verde |
| Build genera hero con perfil + 12 tarjetas sin errores | REQ-09-04 | ✔ pnpm build + dist/index.html |

### Convenciones (docs/architecture.md, docs/conventions.md)

- **Estilos separados:** los componentes solo importan sus hojas; cero `style=`/`<style>`.
- **Lógica separada de la UI:** frontmatter = imports + paso de datos; repositorios intactos
  con errores nombrados (`HeroCardsDataError`, `HeroProfileDataError`), sin fallos silenciosos.
- **Datos vía repositorio:** new-hero no lee JSON directamente.
- **Tokens:** fondos vía `data-color-token` → `--color-marca-*`; sin hex en la UI ni en los datos.
- **≤100 líneas:** new-hero.astro 90, hero-card.astro 33, hero-cards-repository.ts 94,
  hero-profile-repository.ts 84, entidades 17/10. (El informe dice 91 para new-hero.astro;
  `wc -l` da 90 — diferencia por nueva línea final, no material.)
- **Sin dependencias externas, sin debug prints** (grep `console.log` en feature 9: cero).

## Comandos ejecutados por el reviewer (todos en verde)

| Comando | Resultado |
|---|---|
| `node --test "tests/**/*.test.mjs"` | `# tests 60, # pass 60, # fail 0` |
| `node scripts/check-format.mjs` | FORMATO ✔ (exit 0) |
| `pnpm build` | `1 page(s) built in 844ms` sin errores (exit 0) |
| `bash ./init.sh` | "✔ El entorno está perfecto. Podemos empezar a trabajar." (exit 0) |
| `pnpm dev` + curl `/` | HTTP 200; 12 tarjetas, 12 tokens únicos, nombre/username presentes, `style=`: false; server detenido |

## Checkpoints

- C1 (estilos separados de la UI): [x] — verificado en los 2 componentes del hero y en el diff.
- C2 (sin lógica en UI): [x] — test REQ-09-04 + inspección en disco.
- C3 (datos vía repositorio): [x] — new-hero usa ambos repositorios.
- C4 (tokens, sin valores sueltos): [x] — data-color-token → --color-marca-*; CSS de features 3/4 aprobado.
- C5 (≤100 líneas): [x] — 90/33/94/84/17/10.
- C6 (sin dependencias externas): [x] — sin cambios en package.json en esta feature.
- C7 (datos válidos y entidades los tipan): [x] — 12 tarjetas + perfil validados por los repositorios.
- C8 (errores nombrados, sin fallos silenciosos): [x] — HeroCardsDataError/HeroProfileDataError intactos.
- C9 (./init.sh verde): [x] — ejecutado por mí.
- C10 (UI correcta sin errores en consola): [x] — dev server HTTP 200 con 12 tarjetas; sin regresión visual del hero (fondo/pérfil/tarjetas desde las hojas aprobadas en features 3/4).
- C11 (feature_list en done): [ ] — la feature sigue `in_progress`; es el estado correcto mientras la revisión no se cierra. El líder la marca `done` al cerrar el ciclo. No bloquea.
- C12 (current.md documenta / history.md al día): [x] — current.md documenta la sesión; history.md se actualiza al cierre de ciclo (pendiente deliberado).
- C13 (sin temporales ni debug): [x] — sin prints ni archivos temporales en el repo.

## Observaciones (no bloqueantes)

1. **Sesión concurrente:** existen artefactos ajenos a esta feature en `progress/`
   (`impl_content-config.md`, `review_content-config.md`, `impl_01_harness-kit-mount.md`,
   `impl_02_design-tokens.md`, `impl_03_hero-section-styles.md`, `impl_harness-kit-mount.md`,
   `impl_hero-cards-domain.md`, `impl_hero-cards-styles.md`, `impl_hero-profile-domain.md`,
   `impl_layout-refactor.md`, `impl_posts-domain.md`, `progress/research/`) y otros nombre de
   features duplicados con slug distinto. Son bitácora de otras sesiones; no afectan al
   contenido verificado de la feature 9 y no impiden la aprobación. Conviene que el líder
   consolide nombres al cerrar el refactor.
2. `<a href="">` vacío en `hero-card.astro` (línea 25): **preexistente** (aparece como contexto
   sin cambios en `git diff HEAD`), fuera del alcance de la feature 9. Se puede tratar en una
   feature posterior si aplica.
3. Diferencia menor 90 vs 91 líneas de new-hero.astro entre `wc -l` y el informe: conteo de
   nueva línea final; no material (≤100 en ambos conteos).

## Conclusión

Los 5 REQ de la spec (REQ-09-01..05) se cumplen con evidencia en disco, el ciclo rojo/verde
está documentado con salidas reales y fue re-verificado por mí (60/60, check-format, build,
init.sh, dev server), y el alcance del diff coincide con lo declarado. La única ocurrencia de
"style" en hero-card.astro es el import de la hoja de estilos, no un atributo inline. No hay
cambios requeridos. **APPROVED.**