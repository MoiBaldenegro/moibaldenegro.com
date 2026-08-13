# Informe de implementación — feature 28 htb-stadistics-prerender-fix

> Fecha: 2026-08-13 · Estado: implementada, pendiente de revisión externa
> (el líder lanza al reviewer). Spec: `specs/28_htb-stadistics-prerender-fix/requirements.md`
> (REQ-28-01..06). Análisis de referencia: `progress/research/registro-dependencias-aprobadas.md`.

## 1. Contexto y diagnóstico (verificado en disco)

`./init.sh` estaba en ROJO: la edición manual SIN commitear de
`src/components/htb-stadistics.astro` añadía en el frontmatter:

- `import { env } from 'cloudflare:workers';` (línea 4)
- `const HTB_API_TOKEN = ENV_TOKEN || env.HTB_API_TOKEN;` y
  `const HTB_USER_ID = ENV_ID || env.HTB_USER_ID;` (líneas 6-7)

Con `prerenderEnvironment: 'node'` (feature 21, astro.config.mjs) el prerender
corre en entorno node, donde el módulo virtual `cloudflare:workers` no existe →
`default-prerenderer.js` crashea ("Cannot read properties of undefined (reading
'setInternals')") → `pnpm build` falla → `tests/about-page.test.mjs` REQ-11-05
(build real) falla → suite en ROJO.

Decisión del spec_author (sección 4 del análisis): REVERTIR al estado canónico
de las features 22+27. El fallback de worker es redundante (astro:env/server ya
entrega las envs del worker en runtime con el adapter Cloudflare, REQ-22-08) y
REQ-27-02 ya cubre las envs ausentes (getProfileOrNull → null → la sección no
se renderiza). No se introduce ningún fallback "seguro": REQ-28-04 fija la
ausencia con test.

## 2. Ciclo rojo (evidencia)

Test nuevo red-first `tests/htb-stadistics-prerender-fix.test.mjs` (6 tests)
escrito contra la spec ANTES de tocar el componente. Ejecución en ROJO con el
componente editado manualmente:

```
# Subtest: REQ-28-01: el token y el id se consumen exclusivamente desde astro:env/server
not ok 1 - REQ-28-01: el token y el id se consumen exclusivamente desde astro:env/server
  error: 'el frontmatter no importa HTB_API_TOKEN y HTB_USER_ID juntos desde astro:env/server sin alias (REQ-28-01)'
# Subtest: REQ-28-02: el componente no importa el módulo cloudflare:workers
not ok 2 - REQ-28-02: el componente no importa el módulo cloudflare:workers
  error: 'htb-stadistics.astro importa cloudflare:workers, módulo virtual inexistente en el prerender de node (REQ-28-02)'
# Subtest: REQ-28-04: sin fallbacks de entorno en el frontmatter
not ok 4 - REQ-28-04: sin fallbacks de entorno en el frontmatter
  error: 'el frontmatter reintroduce un fallback con env.HTB_* (REQ-28-04)'
...
1..6
# tests 6
# pass 3
# fail 3
```

Fallan exactamente las 3 aserciones que fijan la ausencia de la edición manual
(REQ-28-01, REQ-28-02, REQ-28-04); pasan ya REQ-28-03, REQ-28-06 y la
convención de ≤100 líneas/sin lógica.

## 3. Implementación — diff conceptual del componente

`src/components/htb-stadistics.astro`: reversión del frontmatter al estado
canónico 22+27 (restaurado el contenido commiteado; `git diff` del componente
queda vacío). El marcado visible de la feature 27 (`{profile && ...}`) NO
cambia; tampoco se tocan `astro.config.mjs` ni el esquema env (workaround de
dev fijado por `tests/astro-config-dev-workaround.test.mjs`).

```diff
 ---
-import { HTB_API_TOKEN as ENV_TOKEN, HTB_USER_ID as ENV_ID } from 'astro:env/server';
-
-import { env } from 'cloudflare:workers';
-
-const HTB_API_TOKEN = ENV_TOKEN || env.HTB_API_TOKEN;
-const HTB_USER_ID = ENV_ID || env.HTB_USER_ID;
-
+import { HTB_API_TOKEN, HTB_USER_ID } from 'astro:env/server';
 import { HtbProfileRepository } from '../domain/repositories/htb-profile-repository.ts';
 import '../styles/htb-stadistics.css';
 
 const profile = await new HtbProfileRepository(HTB_API_TOKEN, HTB_USER_ID).getProfileOrNull();
 ---
```

El resto del archivo (template con `{profile && ...}`, clases
`htb-stadistics__*`) permanece idéntico a la feature 27.

## 4. Ciclo verde (evidencia)

Test de la feature en verde:

```
node --test tests/htb-stadistics-prerender-fix.test.mjs
# tests 6
# pass 6
# fail 0
```

Suite completa (187/187, incluye los 6 del test nuevo sin modificar ninguno de
los tests vigentes — feature 22, feature 27, about-page REQ-11-05):

```
pnpm test
# tests 187
# pass 187
# fail 0
```

`./init.sh` final:

```
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

`pnpm build` termina sin errores con el prerender en node (REQ-28-05) →
REQ-11-05 verde: la causa raíz del crash de `default-prerenderer.js` queda
eliminada.

## 5. Trazabilidad acceptance ↔ REQ

| Acceptance (feature 28) | REQ | Verificación |
|---|---|---|
| Test red-first + verde | REQ-28-02, REQ-28-04 | 3/6 rojo → 6/6 verde |
| Sin cloudflare:workers ni fallbacks; solo astro:env/server | REQ-28-01, REQ-28-02 | Aserciones positivas/negativas del test + git diff vacío |
| getProfileOrNull + marcado `{profile && ...}` | REQ-28-03, REQ-28-06 | Test + tests 22/27 en verde sin tocar |
| htb-stadistics-section y htb-api-graceful-degradation sin modificaciones | REQ-28-03 | `git status`: solo el test nuevo |
| Suite completa y build OK con prerender en node | REQ-28-05 | 187/187 + init.sh verde + REQ-11-05 |

## 6. Alcance y respeto de reglas

- Una sola feature (28): solo se tocó `src/components/htb-stadistics.astro`
  (frontmatter) y se añadió `tests/htb-stadistics-prerender-fix.test.mjs`.
- Test-first cumplido: test en rojo antes del código (evidencia en §2).
- Sin subagentes lanzados; la feature NO se marca `done` (pendiente del
  APPROVED del reviewer que lanza el líder).
- `progress/current.md` actualizado con la feature en curso y el plan.