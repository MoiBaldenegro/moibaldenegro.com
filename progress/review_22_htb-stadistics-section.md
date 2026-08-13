# Review — feature 22 `htb-stadistics-section`

**Veredicto:** APPROVED

**Fecha:** 2026-08-12 · reviewer
**Spec:** `specs/22_htb-stadistics-section/requirements.md` (REQ-22-01..08) + `design.md`
**Informe del implementer:** `progress/impl_22_htb-stadistics-section.md`
**Dependencia verificada:** feature 21 `ssr-cloudflare-align` → `done` (depends_on de la 22 cumplida; ninguna dependencia pendiente saltada).

## Pregunta de revisión (¿test antes del código, en rojo, y suite en verde al final?)

**Sí.** El informe documenta el ciclo completo y lo verifiqué independientemente:
- **ROJO (previo a implementar):** `node --test tests/htb-profile-repository.test.mjs tests/htb-stadistics-section.test.mjs` → 12 tests, 3 pass / 9 fail, con evidencia concreta: `ERR_MODULE_NOT_FOUND` (dominio inexistente), fetch directo en el componente, 2 `console.log` + `console.error` con token/id/respuesta, `<p>Usuario: {HTB_USER_ID}</p>`, CSS inexistente (5 tests), lógica en frontmatter.
- **VERDE (final):** ejecutado por mí en disco → `# tests 22 · # pass 22 · # fail 0` (node:test). Suite completa → 181 tests, 179 pass, 2 fail **residuales ajenos** (ver §Residuales).

## Cobertura REQ-22-XX (evidencia en disco)

| REQ | Evidencia verificada |
|-----|----------------------|
| REQ-22-01 | `src/pages/index.astro:13-15` renderiza `<HtbStadistics server:defer>` con `<p slot="fallback">Cargando estadísticas de HTB...</p>`. Test `htb-stadistics-section.test.mjs` "REQ-22-01: la portada renderiza la sección con server:defer y slot de fallback" en verde. `index.astro` NO fue tocado por la feature (mtime 2026-08-11, preexistente). |
| REQ-22-02 | `src/domain/repositories/htb-profile-repository.ts` — clase `HtbProfileRepository(token, userId, fetchFn = fetch)` con fetch inyectable (línea 21); URL constante `https://labs.hackthebox.com/api/v4/user/profile/basic` (línea 7). Test verifica URL `${API}/${userId}` y cabecera `Authorization: Bearer <token>` (test "REQ-22-02/Decisión 2" en verde) y entrega la entidad mapeando los campos reales v4. |
| REQ-22-03 | `readJson()` lanza `HtbProfileDataError` en no-ok (línea 55), JSON inválido (línea 60); `asProfile()` lanza si no hay objeto `profile` (líneas 79-85). 3 tests en verde (401, JSON inválido, sin profile). |
| REQ-22-04 | `requestProfile()` envuelve el fetch en try/catch → `HtbProfileDataError('no se pudo contactar con la API')` (líneas 40-51). Test de fetch rechazado en verde. |
| REQ-22-05 | `src/styles/htb-stadistics.css` (55 líneas) importada desde el componente (línea 4). Consume SOLO los 8 tokens de la tabla del design: `--container-max, --gap-card, --color-surface, --color-border, --radius-card, --color-text, --color-text-secondary, --color-accent`. Sin hex ni rgb()/rgba() (test en verde). Media query 768px al final. BEM `htb-stadistics__*`. |
| REQ-22-06 | Componente sin `fetch` ni `console.*` (grep en disco: 0 coincidencias en `src/components/htb-stadistics.astro` y `src/domain/`). El marcado NO interpola `HTB_API_TOKEN` ni `HTB_USER_ID` (test "REQ-22-06" en verde). Token e id solo en la cabecera Authorization (test del repositorio). |
| REQ-22-07 | `HTB_API_TOKEN` y `HTB_USER_ID` `optional: true` en `astro.config.mjs` (líneas 18 y 23). Sin credenciales, `assertCredentials()` lanza `HtbProfileDataError` (líneas 33-37) → la isla `server:defer` no rompe la portada (ya prerenderizada; fallback permanece). Test "REQ-22-07: sin token o sin id ..." en verde. |
| REQ-22-08 | `astro.config.mjs:15-19` declara `HTB_API_TOKEN: envField.string({ access: 'secret', context: 'server', optional: true })` (idem `HTB_USER_ID` líneas 20-24). Test "REQ-22-07/08: el esquema env declara ambas variables secret/server/optional" en verde. Esquema canónico de la feature 21, sin cambios por la 22 (mtime 2026-08-12 10:10). |
| Decisión 1 | Lógica de red/validación 100% en repositorio; el frontmatter del componente solo importa + `getProfile()` + interpolación (39 líneas). Test "Convención: el componente es ≤100 líneas, sin lógica y sin estilos embebidos" en verde. |
| Decisión 6 | Entidad `HtbProfile` (14 líneas) readonly con nullables; UI muestra "N/D". Tests de campos ausentes → null sin lanzar, en verde. |

## Verificación de herramientas

- `node --test tests/htb-profile-repository.test.mjs tests/htb-stadistics-section.test.mjs` → **22/22 pass**.
- `node scripts/check-format.mjs` → **FORMATO ✔**.
- `node scripts/audit-design-tokens.mjs` → **AUDIT ✔ (ningún color fuera de tokens.css en src/styles)**.
- `pnpm test` (suite completa) → **179 pass / 2 fail**.
- `pnpm build` → falla SOLO en `src/pages/posts/[id].astro:3` (`MISSING_EXPORT markdownPostRepository`, hallazgo canalizado a la feature 24). Nada relacionado con htb-stadistics.
- `./init.sh` → 2 comprobaciones en rojo, ambas residuales ajenas (ver abajo).

## Residuales (ajenos a la feature 22, documentados en 20/21 y pendientes de 23/24)

| Test | Causa | Dueño |
|------|-------|-------|
| REQ-01-05 (harness-kit-integrity) | `harness-kit/docs/architecture.md: fuga "og-image"` | feature 23 `harness-docs-alignment` (pending) |
| REQ-11-05 (about-page) | build abortado por `[id].astro` MISSING_EXPORT | feature 24 / hallazgo `[id].astro` (pending) |

Ambos son idénticos al estado aprobado en las reviews 20 y 21; la feature 22 no introduce ningún rojo nuevo.

## Archivos tocados vs alcance permitido

Dentro de alcance (verificado por contenido y mtime, ventana 2026-08-12 18:53-18:54):

| Archivo | Acción | Líneas |
|---------|--------|--------|
| `tests/htb-profile-repository.test.mjs` | nuevo | 176 |
| `tests/htb-stadistics-section.test.mjs` | nuevo | 216 |
| `src/domain/entities/htb-profile.ts` | nuevo | 14 |
| `src/domain/repositories/htb-profile-repository.ts` | nuevo | 95 |
| `src/components/htb-stadistics.astro` | reescrito (canónico) | 39 |
| `src/styles/htb-stadistics.css` | nuevo | 55 |
| `specs/22_htb-stadistics-section/` | spec (creada por spec_author) | — |
| `feature_list.json` / `progress/current.md` / `progress/impl_22*` | estado del arnés | — |

NO tocados (verificado):
- `src/pages/index.astro` (mtime 2026-08-11, ya canónico con `server:defer` + fallback), `astro.config.mjs` (mtime 10:10, feature 21), `src/styles/tokens.css` (mtime 2026-08-11, 96 líneas — sin tokens nuevos; test "REQ-22-05: tokens.css no añade tokens nuevos" en verde).
- Fuera de alcance intactos: dominio posts/JSONs/latest-articles (features 18-20, mtimes 17:14-18:31 previos a esta ventana), `tests/about-page.test.mjs` (feature 21, 18:43), docs del kit (features 23, pendiente), `src/pages/posts/[id].astro` (hallazgo aparte), GOL 14-16.

## Confirmación de secretos (0 fugas en logs)

- `grep -rn "console\." src/components/htb-stadistics.astro src/domain/` → **0 coincidencias**.
- El test "REQ-22-02/Decisión 2: el repositorio no registra secretos en consola" (lee el archivo sin comentarios) en verde.
- El marcado no interpola `HTB_API_TOKEN` ni `HTB_USER_ID` (test REQ-22-06 en verde). Clasificación `secret` del esquema env preservada (Decisión 2 del design).
- El token de prueba del test es literal `'TOK'` (fake), no un secreto real.

## Observaciones

1. **Fallo silencioso del env ausente:** `assertCredentials()` lanza `HtbProfileDataError` si faltan token/id — comportamiento correcto (no silencioso). El comportamiento runtime de la isla `server:defer` con el error (la portada prerenderizada ya está servida y el slot de fallback permanece) es el documentado en el design (Decisión 3/4) y en la nota de `impl_22`; la verificación visual en navegador queda pendiente del checkpoint de inspección (no bloquea: contrato de REQ-22-07 cubierto a nivel repositorio + esquema optional).
2. **Nombres kebab-case en entidades/repositorios** (`htb-profile.ts`, `htb-profile-repository.ts`): convención.md sugiere PascalCase para `.ts`, pero el precedente del repo (hero-profile.ts, post.ts, hero-cards-repository.ts, features 5-7/18-19) es kebab-case — consistente con el codebase; no bloquea.
3. **Tests >100 líneas** (176/216): límite de la regla 12 aplica a código (`src/`), precedente de todos los tests del arnés; el test verifica el límite sobre las entidades/repositorios/componente/hoja (95/14/39/55 líneas, todos ≤100).
4. `./init.sh` queda en rojo por los 2 residuales de 23/24: mismo estado aceptado en las reviews 20 y 21; la feature 22 no añade rojo propio.
5. La clasificación de `HTB_USER_ID` como `secret` se mantiene pese a ser semipúblico (Decisión 2) — correcto para evitar futuras fugas.

## Checkpoints

- C1: [x] · C2: [x] · C3: [x] · C4: [x] · C5: [x] · C6: [x] · C7: [x] · C8: [x]
- C9 (init.sh verde): [ ] ← residuales ajenos 23/24 (REQ-01-05, REQ-11-05/[id].astro)
- C10 (inspección visual navegador): [ ] ← pendiente de verificación humana
- C11 (feature en done): [ ] ← la marca el líder tras esta review
- C12: [x] · C13: [x]