# Review — feature 10 `articles-ui-refactor`

**Veredicto:** APPROVED

**Fecha:** 2026-08-10 (reviewer)
**Spec:** `specs/10_articles-ui-refactor/requirements.md` (REQ-10-01..04) + `design.md` (Decisiones 1-3, tabla de tokens)
**Informe del implementer:** `progress/impl_articles-ui-refactor.md`

## Checkpoints (CHECKPOINTS.md, aplicables a la feature)

- C1 Estilos separados de la UI: [x] — `latest-articles.astro` sin `<style>` ni `style=` (test Convención 9/9 y verificación en disco).
- C2 Sin lógica en archivos de UI: [x] — frontmatter solo imports (`../styles/latest-articles.css`, `PostsRepository`) + `const posts = await new PostsRepository().getPosts()`. Sin `readFileSync`/`new URL`/`function`/`if`/`for`.
- C3 Datos vía repositorio: [x] — `getPosts()` de `PostsRepository`; cero `astro:content`/`getCollection` en el componente (REQ-10-04).
- C4 Tokens, no valores sueltos: [x] — `latest-articles.css` 0 hex / 0 `rgb()/rgba()`, colores/radios/transiciones solo `var(--token)`, consume los 8 tokens de la tabla del design.md (test REQ-10-03).
- C5 ≤100 líneas: [x] — componente 24 líneas, hoja 62 líneas (verificadas con `wc -l`). Los archivos de test del repo superan 100 líneas por patrón establecido y aprobado en features 1-9 (observación, no bloqueo).
- C6 Sin dependencias externas: [x] — ninguna añadida.
- C7 Datos del dominio válidos y tipados: [x] — `content.config.ts` (schema Zod con tags transformados) y `posts-repository.ts` (feature 7, intacta) entregan `Post[]` validado.
- C8 Errores nombrados: [x] — `PostsDataError` ya en el repositorio (feature 7); sin fallos silenciosos.
- C9 `./init.sh` verde: [x] — ejecutado por el reviewer: formato ✔, tests 69/69 ✔, build ✔, "El entorno está perfecto" ✔.
- C10 UI correcta: [x] — build y dev server (HTTP 200) renderizan título, autor, "15 min de lectura", descripción y 3 tags, sin `style=` inline.
- C11 `feature_list.json`: [ ] — feature 10 sigue `in_progress`; la marca `done` el líder tras este APPROVED (regla de cierre del arnés).
- C12 `progress/current.md` documentado: [x] — bitácora completa de la sesión (rojo → verde).
- C13 Sin temporales/debug/TODOs: [x] — sin `console.log` ni temporales de la feature; dev server detenido, puerto 4321 libre.

## Verificación por puntos (evidencia en disco)

### Ciclo rojo/verde (pregunta de revisión)
¿Se escribió el test antes del código y en rojo, y quedó verde al final? **Sí.**
- El informe del implementer documenta el ROJO con salida real: `# tests 9 / # pass 1 / # fail 8` (componente sin `posts-repository`, importa `astro:content`, sin hoja CSS, marcado sin mapear `Post`, hoja inexistente ×3) y el VERDE: 9/9, suite 69/69, check-format ✔, build ✔, `./init.sh` → "El entorno está perfecto".
- Corroborado por `git diff src/components/latest-articles.astro`: el estado previo tenía `import { getCollection } from 'astro:content'` y `getCollection('architecture')` directo, sin import de la hoja → el test actual (REQ-10-01/02/04) necesariamente fallaría contra ese código. La recuperación del ROJO es creíble y reproducible.
- El reviewer re-ejecutó la suite completa: **69/69 pass, 0 fail**, `node scripts/check-format.mjs` → "FORMATO ✔", `pnpm build` → "Complete!", `bash ./init.sh` → "El entorno está perfecto".

### REQ-10-01 — componente obtiene artículos desde PostsRepository
- `src/components/latest-articles.astro` (24 líneas): línea 4 `import { PostsRepository } from "../domain/repositories/posts-repository.ts"`, línea 6 `const posts = await new PostsRepository().getPosts()`. Marcado semántico `article`/`h2`/`p`/`span` con `post.title`, `post.author`, `post.readtime`, `post.description`, `post.tags`, "min de lectura" y `#{tag}` (grep + lectura directa). Test `REQ-10-01: …` y `REQ-10-01 (Decisión 1): …` en verde.

### REQ-10-02 — import de la hoja de estilos
- `src/styles/latest-articles.css` existe (62 líneas) e importada en la línea 2 del componente (`../styles/latest-articles.css`). Test `REQ-10-02` en verde.

### REQ-10-03 — hoja solo tokens, ≤100 líneas
- `tests/articles-ui-refactor.test.mjs` (9 tests) verifica: ≤100 líneas (62 reales), sin hex (`/#[0-9a-fA-F]{3,8}\b/`) ni `rgb()/rgba()` (con comentarios excluidos), colores/radios/transiciones con `var(--...)`, y presencia de los 8 tokens de la tabla del design.md (`--color-surface`, `--color-text`, `--color-text-secondary`, `--color-border`, `--color-accent`, `--radius-card`, `--gap-card`, `--transition-default`). Los 9 pass en mi ejecución. Los 10 tokens usados por la hoja existen en `src/styles/tokens.css` (verificado con script).

### REQ-10-04 — astro:content solo en el repositorio
- `grep "astro:content|getCollection" src/` → solo en `src/config.ts` (código muerto, lo elimina la feature 12 — fuera de scope), `src/content.config.ts` (definición de colección, correcto) y `src/domain/repositories/posts-repository.ts` (líneas 37-38, única vía de acceso — feature 7). El componente no contiene `astro:content` ni `getCollection` (test REQ-10-04 en verde).

### Acceptance de feature_list.json (feature 10)
1. [x] `latest-articles.astro` importa PostsRepository y no importa astro:content → verificado en disco y por diff.
2. [x] `src/styles/latest-articles.css` existe e importada por el componente.
3. [x] `tests/articles-ui-refactor.test.mjs` (9/9) verifica hoja ≤100 líneas y sin valores sueltos.
4. [x] Build renderiza título/autor/tiempo/descripción/tags — verificado yo en `dist/index.html`: "Agilismo, diseño y fragilidad", "Moises Baldenegro Melendez", "15 min de lectura", "conceptos fundamentales", 3 tags `#arquitectura #agilismo #software-design` (sin duplicar `#`: el schema de content.config.ts limpia el `#` del dato fuente y el componente añade uno). CSS de la tarjeta en el bundle (`_astro/index.DJVOk3kH.css` con `latest-articles__card` y `var(--color-surface)`).

### Verificación visual (dev server, ejecutada por el reviewer)
- `pnpm dev --port 4321` en background → HTTP 200; página renderiza sección `latest-articles`, título, autor, "15 min de lectura", descripción y tags `#arquitectura #agilismo #software-design`, sin `style=` inline en la sección. Server detenido al terminar (puerto 4321 libre).

### Alcance (`git status`)
- Cambios de la feature: `src/components/latest-articles.astro` (M), `src/styles/latest-articles.css` (?, nueva), `tests/articles-ui-refactor.test.mjs` (?, nuevo), `progress/impl_articles-ui-refactor.md` (?, nuevo). Sin tocar archivos de otras features: `posts-repository.ts`, `content.config.ts`, `tokens.css` y resto del dominio quedan intactos. El resto de archivos listados en `git status` pertenecen a features previas (1-9) y a la sesión concurrente, fuera del alcance de esta revisión.

## Cambios requeridos

Ninguno.

## Observaciones (no bloqueantes)

1. La sesión concurrente refinó test (6→9), componente (wrapper `latest-articles__list`) y hoja (paddings) durante la implementación; el estado en disco es consistente con la spec y en verde. Disco = fuente de verdad. Coexistencia de dos informes (`progress/impl_articles-ui-refactor.md` y `progress/impl_10_articles-ui-refactor.md`) y de `progress/impl_harness-kit-mount.md`/`impl_01_harness-kit-mount.md`: artefactos de la sesión concurrente que se conservan como bitácora; no afectan al código.
2. El informe del implementer indica "28 líneas" para el componente y "58 líneas" para la hoja; en disco son 24 y 62 (refinados por la sesión concurrente). Diferencia documental menor: ambos valores cumplen el límite y los tests verifican el estado real.
3. `src/config.ts` (dead code con import de `astro:content`) permanece en el repo: su eliminación está planificada en la feature 12 (cleanup-dead-code), fuera del scope de la feature 10. REQ-10-04 se refiere al componente y se cumple.
4. Los 7/10 archivos de test del repo superan 100 líneas (patrón aprobado en features previas); el límite de architecture.md §12 se aplica al código de la aplicación, y los archivos nuevos de esta feature (componente 24, CSS 62) lo cumplen.
5. El bundle CSS contiene valores hex: provienen de `tokens.css` (donde los tokens se definen por diseño). `latest-articles.css` fuente no tiene ninguno (REQ-10-03 verificado).

## Conclusión

La feature 10 cumple REQ-10-01..04 y las 4 acceptance de `feature_list.json`. Evidencia rojo/verde documentada y reproducible (verificada por el reviewer: 69/69, check-format, build, init.sh, dev server HTTP 200 con los 5 campos renderizados). Convenciones respetadas: datos vía repositorio, estilos separados, lógica fuera de la UI, tokens, BEM ligero, ≤100 líneas. **APROBADO**.