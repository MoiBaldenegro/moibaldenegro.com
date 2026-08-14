# Informe de implementación — feature 34 (htb-section-degradation-restore)

**Fecha:** 2026-08-14
**Estado:** implementada, pendiente de reviewer (NO marcada `done` por el implementer).
**Archivo tocado:** `src/components/htb-stadistics.astro` (único archivo de `src/` modificado; ningún test modificado; `htb-profile-repository.ts` intacto).

## Contexto

El commit manual `8078975` dañó también el componente `htb-stadistics.astro`:
eliminó el condicional canónico `{profile && (...)}` y dejó la sección
renderizándose SIEMPRE con `profile?.x ?? 'N/D'`, rompiendo el contrato de
degradación elegante de las features 27/32 (sin perfil → la sección no
renderiza su contenido). Era la causa de 2 de los 4 fallos restantes de la
suite tras la feature 33: REQ-27-07/10 en
`tests/htb-api-graceful-degradation.test.mjs` y REQ-32-04 en
`tests/htb-stadistics-prerender-fix.test.mjs` (ambos fijan con regex
`\{profile\s*&&`).

## Fuentes del contrato canónico

- Spec: `specs/34_htb-section-degradation-restore/requirements.md`
  (REQ-34-01..06) y `design.md` (Decisión 1: `{profile && (<section ...>)}`;
  Decisión 2: fallback individual `?? 'N/D'`; Decisión 3: frontmatter solo
  imports/alias de envs/getProfileOrNull).
- Estado canónico: `git show 8078975^:src/components/htb-stadistics.astro`
  (padre del commit dañino) — mismo criterio de restauración que la feature 33
  para `htb-profile-repository.ts`.
- Nota: la indentación tabs→2 espacios de este componente NO se toca aquí: se
  canaliza en la feature 37 `visual-polish-refactor` (REQ-37-05), como indica
  la spec 34 (Restricción) y la descripción de la feature.

## Ciclo ROJO (antes de tocar el código)

Comando:

```
node --test tests/htb-api-graceful-degradation.test.mjs tests/htb-stadistics-prerender-fix.test.mjs
```

Resultado: **14 tests, 12 pass, 2 fail** — exactamente los 2 fallos esperados
de esta feature:

```
not ok 8 - REQ-27-07/10: el componente usa getProfileOrNull y no invoca la vía que lanza
  error: 'el template no condiciona la sección al perfil con {profile && ...} (REQ-27-08)'
not ok 12 - REQ-32-04: conserva getProfileOrNull() con los valores resueltos y {profile && ...}
  error: 'el template no condiciona la sección al perfil con {profile && ...} (REQ-32-04)'
# tests 14
# pass 12
# fail 2
```

El resto (REQ-27-01..06/09, REQ-32-01..03/07, convención ≤100 líneas) ya
pasaba: el daño del commit manual estaba solo en el template condicional.

## Restauración (diff aplicado)

`git show 8078975^:src/components/htb-stadistics.astro > src/components/htb-stadistics.astro`
— restauración byte a byte del canónico: 9 inserciones / 8 eliminaciones
(diff exactamente inverso al commit dañino):

```diff
 const HTB_API_TOKEN = ENV_TOKEN || env.HTB_API_TOKEN;
 const HTB_USER_ID = ENV_ID || env.HTB_USER_ID;
 
-
 const profile = await new HtbProfileRepository(HTB_API_TOKEN, HTB_USER_ID).getProfileOrNull();
 ---
 
+{profile && (
 	<section class="htb-stadistics">
 		<h2 class="htb-stadistics__title">Estadísticas de Hack The Box</h2>
 		<p class="htb-stadistics__intro">Resumen de mi cuenta en la plataforma.</p>
@@
-				<span class="htb-stadistics__value">{profile?.name ?? 'N/D'}</span>
+				<span class="htb-stadistics__value">{profile.name ?? 'N/D'}</span>
 		... (mismo cambio en los seis campos: se quita el `?.` innecesario,
 		el perfil ya está garantizado dentro del bloque {profile && ...})
-	</section>
\ No newline at end of file
+	</section>
+)}
\ No newline at end of file
```

Contrato resultante (verificado): `{profile && (...)}` → REQ-34-01/02 y
REQ-27-08/REQ-32-04; seis campos con `?? 'N/D'` individual → REQ-34-03
(Decisión 6 de la feature 22); frontmatter solo con imports (astro:env/server
alias ENV_TOKEN/ENV_ID + cloudflare:workers + repositorio + hoja CSS), alias
de envs con fallback y `getProfileOrNull()` — sin console.* ni lógica de
negocio → REQ-34-04/06 y REQ-22-06/REQ-32-04; 44 líneas → REQ-34-05.

Evidencia de identidad: `git hash-object src/components/htb-stadistics.astro`
= `a859ce6b5133e745ce789a04d94af2d74dd7bdd3` = hash del blob canónico
`8078975^:src/components/htb-stadistics.astro`.

## Ciclo VERDE

Tests de la feature:

```
node --test tests/htb-api-graceful-degradation.test.mjs tests/htb-stadistics-prerender-fix.test.mjs
# tests 14
# pass 14
# fail 0
```

Suite completa:

```
node --test "tests/**/*.test.mjs"
# tests 206
# pass 204
# fail 2
```

Los 2 fallos restantes son de la feature 35 `specs-historico-restore` (ajena,
NO tocada): `REQ-21-06` (tests/ssr-cloudflare-align.test.mjs) y `REQ-24-04`
(tests/view-transitions.test.mjs) — specs históricas 21/24 borradas por la
limpieza manual del humano (commit 0b7f359), pendientes de restaurar. Antes de
esta feature la suite tenía 4 fail (REQ-27-07/10, REQ-32-04, REQ-21-06,
REQ-24-04); ahora quedan solo los 2 ajenos.

## init.sh

```
./init.sh
✔ node instalado / pnpm instalado / dependencias instaladas
✔ AGENTS.md / feature_list.json / progress/current.md existen
✔ formato de feature_list.json y progress/current.md
✘ tests al 100% (node:test)   ← solo los 2 fallos ajenos de la feature 35
✔ build de producción (pnpm build)
✘ 1 comprobación(es) fallida(s)
```

El único bloque en rojo es el de tests, por los 2 fallos ajenos documentados
(REQ-21-06 y REQ-24-04, feature 35). Formato y build en verde.
`feature_list.json` quedó con la feature 34 en `in_progress` (el cierre lo
gestiona el líder tras el reviewer).
