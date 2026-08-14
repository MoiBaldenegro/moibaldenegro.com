# Review — feature 34 (htb-section-degradation-restore)

**Veredicto:** APPROVED

## Resumen de verificación

El implementer restauró la degradación elegante de la sección HTB dañada por el
commit manual `8078975` (que renderizaba la sección SIEMPRE con
`profile?.x ?? 'N/D'` en vez del contrato canónico `{profile && ...}`).
Verificación independiente en disco:

1. **Restauración byte a byte**: `git hash-object src/components/htb-stadistics.astro`
   = `a859ce6b5133e745ce789a04d94af2d74dd7bdd3` = hash del blob canónico
   `8078975^:src/components/htb-stadistics.astro` (idéntico). El diff contra
   HEAD es exactamente el inverso del commit dañino: +`{profile && (`, −línea
   vacía, `profile?.x` → `profile.x` en los 6 campos, +`)}` final.
2. **Tests de la feature**: 14/14 en verde
   (`tests/htb-api-graceful-degradation.test.mjs` +
   `tests/htb-stadistics-prerender-fix.test.mjs`), sin modificar ningún test.
3. **Suite completa**: `node --test "tests/**/*.test.mjs"` → 206 tests, 204
   pass, 2 fail. Los 2 fail son ajenos a la feature 34: REQ-21-06
   (`tests/ssr-cloudflare-align.test.mjs`) y REQ-24-04
   (`tests/view-transitions.test.mjs`), ambos de la feature 35
   (`specs-historico-restore`, pending): fallan porque las specs históricas
   21/24 fueron borradas por la limpieza manual del humano (commit `0b7f359`).
   Ninguno lee `htb-stadistics.astro`.
4. **Alcance**: `git diff --name-only` = `feature_list.json`,
   `progress/current.md`, `src/components/htb-stadistics.astro`,
   `src/domain/repositories/htb-profile-repository.ts` (este último es la
   restauración de la feature 33, ya revisada y APPROVED en
   `progress/review_33_...md`). Ningún test modificado; ningún otro archivo de
   `src/`.
5. **feature_list.json**: feature 34 en `in_progress`, `depends_on: [33]` con
   la feature 33 en `done` (todas las dependencias satisfechas). El cierre a
   `done` lo gestiona el líder tras esta review.

## Evidencias (salidas de comandos)

```
$ git hash-object src/components/htb-stadistics.astro
a859ce6b5133e745ce789a04d94af2d74dd7bdd3
$ git show 8078975^:src/components/htb-stadistics.astro | git hash-object --stdin
a859ce6b5133e745ce789a04d94af2d74dd7bdd3

$ node --test tests/htb-api-graceful-degradation.test.mjs tests/htb-stadistics-prerender-fix.test.mjs
# tests 14
# pass 14
# fail 0

$ node --test "tests/**/*.test.mjs"
# tests 206
# pass 204
# fail 2        ← REQ-21-06, REQ-24-04 (feature 35, ajenos)

$ git diff --name-only -- tests/    (vacío: ningún test tocado)

$ ./init.sh
✔ node / pnpm / dependencias / harness / formato
✔ build de producción (pnpm build)
✘ tests al 100%  ← solo REQ-21-06 y REQ-24-04 (feature 35), documentados
```

## Comprobación REQ por REQ (contra specs/34_htb-section-degradation-restore/)

| REQ | Verificación | Resultado |
|-----|--------------|-----------|
| REQ-34-01 | Línea 13: `{profile && (` abre el bloque condicional; cierra en línea 45 con `)}`. Test REQ-27-08/REQ-32-04 fijan la regex `\{profile\s*&&` → verde | ✅ |
| REQ-34-02 | Todo el contenido de la sección (`<section>` completo) vive dentro del bloque `{profile && ...}`: con `getProfileOrNull()` → null no se renderiza nada del contenido | ✅ |
| REQ-34-03 | Los seis campos (Nombre, Nivel, Puntos, Owns, País, Miembro desde) muestran `?? 'N/D'` individual: `profile.name`, `profile.rank`, `profile.points`, `profile.userOwns`, `profile.systemOwns`, `profile.countryName`, `profile.joinedDate` (L21-41) | ✅ |
| REQ-34-04 | Frontmatter (L1-11): solo imports (astro:env/server con alias, cloudflare:workers, HtbProfileRepository, hoja CSS), dos `const` de alias de envs con fallback `||` y la llamada `await ...getProfileOrNull()`. Cero `console.*` (test REQ-32-04) y cero `function/if/for/try` (tests REQ-27-07/10 y REQ-32-04) | ✅ |
| REQ-34-05 | 45 líneas (≤100; test «Convención» verde) | ✅ |
| REQ-34-06 | El perfil se consume únicamente vía `getProfileOrNull()` (L10); sin `getProfile()` (test REQ-27-10) | ✅ |

## Convenciones

- **Estilos separados**: el `.astro` no contiene `<style>`; la hoja
  `src/styles/htb-stadistics.css` no fue tocada por esta feature (no aparece en
  `git status`) y consume solo tokens (`--container-max`, `--gap-card`,
  `--color-surface`, `--color-border`, `--radius-card`, `--color-text`,
  `--color-text-secondary`, `--color-accent`) — sin hex/rgba sueltos
  (`docs/architecture.md` §6/§7) ✅
- **Lógica separada de la UI**: frontmatter solo imports + consts + llamada al
  repositorio (§8) ✅
- **Capas**: el componente importa el repositorio desde
  `src/domain/repositories/` (§1, flujo de datos) ✅
- **≤100 líneas**: cumplido (§12) ✅
- **Sin dependencias nuevas** (§2) ✅
- **Indentación tabs → 2 espacios**: NO se tocó (se canaliza a la feature 37,
  REQ-37-05), conforme a la Restricción de la spec 34 y a la descripción de la
  feature — sin cambios fuera de alcance ✅
- **Ciclo rojo/verde documentado**: `progress/impl_34_...md` registra el ROJO
  previo al código (14 tests, 12 pass, 2 fail con los mensajes exactos
  REQ-27-07/10 y REQ-32-04) y el VERDE posterior (14/14; suite 204/206). Los
  tests no se escribieron en esta feature porque ya existían de las features
  27/32 y NO fueron modificados: la evidencia rojo/verde es la exigida por el
  arnés para una restauración de contrato ✅

## Checkpoints
- C1: [x] — Sin `<style>` en el `.astro`; estilos en `src/styles/htb-stadistics.css` (intacta, solo tokens).
- C2: [x] — Sin lógica JS en UI; frontmatter solo imports/consts/llamada; sin `console.*`.
- C3: [ ] — Razón: `./init.sh` deja el bloque de tests en rojo por 2 fallos ajenos documentados (REQ-21-06 y REQ-24-04 → feature 35, specs históricas borradas por el humano en `0b7f359`). Formato y build en verde. Ningún fallo corresponde a la feature 34; sus 14 tests pasan.
- C4: [x] — `git diff --name-only` confirma que no se modificaron tests ni otros archivos de `src/` (el único otro archivo de `src/` modificado es de la feature 33, ya aprobada).
- C5: [x] — Feature 34 en `in_progress`, `depends_on: [33]` en `done`; sin dependencias pendientes saltadas.

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
