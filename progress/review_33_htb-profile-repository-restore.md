# Review — feature 33 (htb-profile-repository-restore)

**Veredicto:** APPROVED

## Resumen de verificación

El implementer restauró el contrato canónico del repositorio HTB dañado por el
commit manual `8078975`. Verificación independiente:

1. **Restauración byte a byte**: `git hash-object` del archivo actual coincide
   con el del canónico `8078975^`
   (`5c4d70397f17975bf9198fdbf0d8715f92574b68` = `5c4d70397f17975bf9198fdbf0d8715f92574b68`).
   Ningún otro `src/` fue tocado.
2. **Tests de la feature**: 18/19 en verde; único fail REQ-27-07/10
   (componente `htb-stadistics.astro`, feature 34) — NO bloqueante, el líder lo
   indicó explícitamente.
3. **Suite completa**: 206 tests, 202 pass, 4 fail — los 4 son ajenos a la
   feature 33 (REQ-27-07/10 y REQ-32-04 → feature 34; REQ-21-06 y REQ-24-04 →
   feature 35). El implementer no introdujo fallos nuevos.
4. **Alcance**: `git diff --name-only` = `feature_list.json`,
   `progress/current.md`, `src/domain/repositories/htb-profile-repository.ts`.
   Ningún test modificado; ningún otro archivo de `src/`.
5. **feature_list.json**: feature 33 en `in_progress`, `depends_on: []`
   (sin dependencias pendientes). El cierre a `done` lo gestiona el líder.

## Evidencias (salidas de comandos)

```
$ node --test tests/htb-profile-repository.test.mjs tests/htb-api-graceful-degradation.test.mjs
# tests 19
# pass 18
# fail 1        ← REQ-27-07/10 (componente, feature 34)

$ node --test "tests/**/*.test.mjs"
# tests 206
# pass 202
# fail 4        ← REQ-27-07/10, REQ-32-04 (f34); REQ-21-06, REQ-24-04 (f35)

$ git status --porcelain
 M feature_list.json
 M progress/current.md
 M src/domain/repositories/htb-profile-repository.ts
?? progress/impl_33_htb-profile-repository-restore.md
?? progress/research/revision-general-ciclo30.md
?? specs/33_htb-profile-repository-restore/ ...

$ git hash-object src/domain/repositories/htb-profile-repository.ts
5c4d70397f17975bf9198fdbf0d8715f92574b68
$ git show 8078975^:src/domain/repositories/htb-profile-repository.ts | git hash-object --stdin
5c4d70397f17975bf9198fdbf0d8715f92574b68

$ ./init.sh
✔ node / pnpm / dependencias / harness / formato
✘ tests al 100%  ← 4 fallos ajenos (features 34 y 35), documentados
✔ build de producción (pnpm build)
✘ 1 comprobación(es) fallida(s)  ← solo el bloque de tests, por fallos ajenos
```

## Comprobación REQ por REQ (contra spec/33/requirements.md)

| REQ | Verificación | Resultado |
|-----|--------------|-----------|
| REQ-33-01 | Línea 17: `constructor(token, userId, fetchFn: typeof fetch = fetch)` — tercer argumento inyectable con default global | ✅ |
| REQ-33-02 | Línea 46: `this.fetchFn(\`${HTB_API_URL}/${this.userId}\`, ...)`; test 10 verifica URL = `.../basic/42` | ✅ |
| REQ-33-03 | Línea 48: token solo en `Authorization: Bearer ${this.token}`; test 10 verifica header; sin token en URL ni body | ✅ |
| REQ-33-04 | `HtbProfileDataError` en los 4 modos: (1) sin credenciales → `assertCredentials` L38-42; (2) fetch rechaza → `requestProfile` catch L53-55; (3) HTTP no-ok → `readJson` L59-61; (4) JSON inválido → L63-66 y sin `profile` → `asProfile` L84-91. Tests 13,14,15,16 | ✅ |
| REQ-33-05 | Cero `console.*` (inspección directa + test 18 verde) | ✅ |
| REQ-33-06 | 100 líneas por `split('\n')` (test 19 verde); `wc -l` = 99 newlines | ✅ |
| REQ-33-07 | `getProfileOrNull` L30-36: try/catch → null ante cualquier fallo; REQ-27-01..06 y REQ-27-09 en verde | ✅ |
| REQ-33-08 | `assertCredentials` se ejecuta antes de `requestProfile` (L24-25); test 17 (REQ-22-07) y REQ-27-02 con `calls.length === 0` confirman sin red | ✅ |

## Convenciones

- **Errores nombrados**: `HtbProfileDataError` con `this.name` fijado (L6-11) — `docs/architecture.md` §3 ✅
- **Capas**: repositorio en `src/domain/repositories/`, entidad importada de `src/domain/entities/` — §1 ✅
- **Entidad inmutable**: `htb-profile.ts` sin cambios, `readonly` (test 19 la valida) — §4 ✅
- **Sin dependencias nuevas**: usa `fetch` del runtime, nada en `package.json` — §2 ✅
- **Sin fallos silenciosos**: `getProfile` lanza siempre `HtbProfileDataError`; la degradación a null es explícita y solo en `getProfileOrNull` — §3 ✅
- **≤100 líneas**: cumplido — §12 ✅
- **Ciclo rojo/verde documentado**: `progress/impl_33_...md` registra el rojo (8 fail con la lista exacta de tests) antes del código y el verde posterior (18/19 → 202/206) ✅

## Checkpoints
- C1: [x] — REQ-33-01..08 cumplidos, evidencia en código y tests verdes.
- C2: [x] — Tests de la feature: 18/19 (único fail REQ-27-07/10, feature 34, no bloqueante).
- C3: [ ] — Razón: `./init.sh` deja el bloque de tests en rojo por 4 fallos ajenos documentados (REQ-27-07/10 y REQ-32-04 → feature 34; REQ-21-06 y REQ-24-04 → feature 35). Formato y build en verde. Ningún fallo corresponde a la feature 33.
- C4: [x] — `git diff --name-only` confirma que no se modificaron tests ni otros archivos de `src/`.
- C5: [x] — Feature 33 `in_progress`, `depends_on: []` sin dependencias pendientes.

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
