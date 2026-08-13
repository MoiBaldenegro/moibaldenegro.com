# Informe de implementación — feature 22 `htb-stadistics-section`

**Fecha:** 2026-08-12 · implementer
**Spec:** `specs/22_htb-stadistics-section/requirements.md` (REQ-22-01..08) + `design.md`
**Contexto:** `progress/research/refactor-post-manual.md` D4 + riesgo R3 (secretos en logs)

## Ciclo rojo/verde

### ROJO (antes de implementar)

`node --test tests/htb-profile-repository.test.mjs tests/htb-stadistics-section.test.mjs`

```
# tests 12
# pass 3
# fail 9
```

Evidencia por test:
- `not ok 1 - tests\htb-profile-repository.test.mjs` — `ERR_MODULE_NOT_FOUND: Cannot find module
  '...\src\domain\repositories\htb-profile-repository.ts'` (el dominio no existía).
- `not ok 3 - REQ-22-01: el componente importa el repositorio de dominio (no hace fetch)` — el
  componente hacía `fetch(url, ...)` directo en el frontmatter.
- `not ok 4 - REQ-22-06: el componente no tiene console.* y no interpola secretos en la salida` —
  `console.log('HTB_API_TOKEN:'...)`, `console.log('HTB_USER_ID:', ...)`, `console.log('HTB profile
  response:', data)`, `console.error('Error fetching HTB data:', error)` y `<p>Usuario: {HTB_USER_ID}</p>`.
- `not ok 5..9 - REQ-22-05` — `src/styles/htb-stadistics.css` no existía (5 tests en rojo).
- `not ok 12 - Convención` — componente con funciones lógica (getText/getNumber, try/catch, fetch).
- Pasaron solo: `server:defer` + slot fallback ya presentes en index.astro, esquema env canónico
  (feature 21) y tokens.css en 96 líneas.

### VERDE (después de implementar)

```
# tests 22
# pass 22
# fail 0
```

## Cobertura REQ-22-XX

| REQ | Cómo se cumple | Verificado por |
|-----|----------------|----------------|
| REQ-22-01 | `src/pages/index.astro` renderiza `<HtbStadistics server:defer>` con `<p slot="fallback">Cargando estadísticas de HTB...</p>` (ya existente; se conserva). | `tests/htb-stadistics-section.test.mjs` (server:defer + slot + texto) |
| REQ-22-02 | `HtbProfileRepository(token, userId, fetchFn = fetch)` con fetch inyectable entrega la entidad `HtbProfile` mapeando los campos reales de la API v4 (Decisión 6). El test verifica URL `${API}/…/{userId}` y `Authorization: Bearer <token>`. | `tests/htb-profile-repository.test.mjs` (entrega + cabecera) |
| REQ-22-03 | Respuesta no-ok (401), JSON inválido o sin objeto `profile` → `HtbProfileDataError`. | 3 tests (no-ok, JSON inválido, sin profile) |
| REQ-22-04 | Fetch que rechaza → `HtbProfileDataError`. | test de fetch fallido |
| REQ-22-05 | `src/styles/htb-stadistics.css` (54 líneas) importada por el componente; consume SOLO los 8 tokens de la tabla del design (`--color-surface/text/text-secondary/border/accent/radius-card/gap-card/container-max`); sin hex ni rgb()/rgba(); media query al final; BEM `htb-stadistics__*`. | tests de la hoja (existe/importa, ≤100 líneas, sin colores sueltos, var(), tabla de tokens) |
| REQ-22-06 | Componente sin `fetch` ni `console.*`; token e id solo en la cabecera Authorization (test del repositorio); el marcado NO interpola `HTB_API_TOKEN` ni `HTB_USER_ID` (se eliminó `<p>Usuario: {HTB_USER_ID}</p>`). | tests REQ-22-06 + test de cabecera |
| REQ-22-07 | `HTB_API_TOKEN` y `HTB_USER_ID` son `optional` en el esquema env (canónico de la feature 21). Sin credenciales, `getProfile()` lanza `HtbProfileDataError` → la isla `server:defer` no rompe la página (la portada ya fue prerenderizada; el slot de fallback permanece). | test de repo sin token/id + test del esquema `optional` |
| REQ-22-08 | `astro.config.mjs` declara `HTB_API_TOKEN` con `access: 'secret'` y `context: 'server'` (canónico de la 21; sin cambios — el test lo garantiza para ambas variables). | test del esquema env |

## Archivos tocados

| Archivo | Acción |
|---------|--------|
| `tests/htb-profile-repository.test.mjs` | nuevo (11 tests de dominio) |
| `tests/htb-stadistics-section.test.mjs` | nuevo (11 tests de sección/UI/estructura) |
| `src/domain/entities/htb-profile.ts` | nuevo — `interface HtbProfile` readonly con nullables (13 líneas) |
| `src/domain/repositories/htb-profile-repository.ts` | nuevo — clase + `HtbProfileDataError` (94 líneas) |
| `src/components/htb-stadistics.astro` | reescrito — solo imports + `getProfile()` + interpolación (38 líneas) |
| `src/styles/htb-stadistics.css` | nuevo (54 líneas) |
| `feature_list.json` | status `in_progress` (pendiente de reviewer) |
| `progress/current.md` | sesión actual |

**NO tocados:** `tokens.css` (96 líneas intactas, sin tokens nuevos), `astro.config.mjs` (esquema ya canónico de la feature 21), `src/pages/index.astro` (ya tenía `server:defer` + fallback), dominio posts/JSONs/latest-articles, `src/pages/posts/[id].astro`, docs del kit.

## Verificación final

```
node scripts/check-format.mjs        → FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos
node scripts/audit-design-tokens.mjs → AUDIT ✔ ningún color fuera de tokens.css en src/styles
pnpm test                            → # tests 181 · # pass 179 · # fail 2
```

Los 2 fail residuales son AJENOS a esta feature (idénticos a los de las features 20/21):
- `REQ-11-05` — build abortado por `src/pages/posts/[id].astro` (MISSING_EXPORT `markdownPostRepository`) → pendiente de la feature 24.
- `REQ-01-05` — fuga de token prohibido en docs del kit → feature 23.

`pnpm build` → falla SOLO en `[id].astro` (MISSING_EXPORT), mismo punto único documentado en 20/21; nada relacionado con htb-stadistics.

## Confirmación de secretos

`grep -n "console\." src/components/htb-stadistics.astro src/domain/repositories/htb-profile-repository.ts`
→ **sin resultados** (0 coincidencias). No queda ningún `console.log`/`console.error` con marca de
token, id ni respuesta en el componente ni en el repositorio. El token y el id solo se usan en la
cabecera `Authorization` (`Bearer ${this.token}`) dentro del repositorio; el marcado no los interpola.

## Nota de comportamiento (fallback)

Con el esquema env `optional` y `server:defer`, si faltan las variables o la API falla, el
repositorio lanza `HtbProfileDataError` durante el render de la isla diferida: la portada ya fue
entregada prerenderizada y el slot de fallback ("Cargando estadísticas de HTB...") permanece —
la página no se rompe (REQ-22-07, Decisión 3 del design).