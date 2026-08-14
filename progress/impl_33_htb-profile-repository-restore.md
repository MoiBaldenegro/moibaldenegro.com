# Informe de implementación — feature 33 (htb-profile-repository-restore)

**Fecha:** 2026-08-14
**Estado:** implementada, pendiente de reviewer (NO marcada `done` por el implementer).
**Archivo tocado:** `src/domain/repositories/htb-profile-repository.ts` (único archivo de `src/` modificado; ningún test modificado).

## Contexto

El commit manual `8078975` dañó el repositorio HTB: perdió el tercer argumento
del constructor con fetch inyectable (default = fetch global), añadió 5
`console.log` (incluido el `Response` completo con cookies de sesión de HTB) y
superó las 100 líneas (106). Era la causa raíz de 8 de los 11 fallos de la
suite: los tests 1, 2, 3, 4, 10 y 11 de `tests/htb-profile-repository.test.mjs`
y REQ-27-01 (más REQ-27-07/10, que pertenece a la feature 34, componente).

## Fuentes del contrato canónico

- Spec: `specs/33_htb-profile-repository-restore/requirements.md` (REQ-33-01..08).
- Estado canónico: `git show 8078975^:src/domain/repositories/htb-profile-repository.ts`
  (padre del commit dañino) — verificado idéntico al contrato de las features
  22/27 (los tests REQ-22-02..07 y REQ-27-01..10 no se modificaron y validan el
  contrato completo: URL con id, token solo en Authorization, `HtbProfileDataError`
  en los 4 modos de fallo, `getProfileOrNull` degradando a null, sin console.*, ≤100 líneas).

## Ciclo ROJO (antes de tocar el código)

Comando:

```
node --test tests/htb-profile-repository.test.mjs tests/htb-api-graceful-degradation.test.mjs
```

Resultado: **19 tests, 11 pass, 8 fail** — exactamente los 8 fallos documentados:

```
not ok 1 - REQ-27-01: getProfileOrNull devuelve el perfil mapeado cuando la API responde
not ok 8 - REQ-27-07/10: el componente usa getProfileOrNull y no invoca la vía que lanza   ← feature 34 (componente)
not ok 9 - REQ-22-02: entrega el perfil esperado mapeando los campos de la API v4          ← test 1
not ok 10 - REQ-22-02/Decisión 2: el token y el id se usan solo en la cabecera de autorización ← test 2
not ok 11 - Decisión 6: si falta full_name usa el campo name                                ← test 3
not ok 12 - Decisión 6: los campos ausentes llegan a null para mostrar "N/D" sin lanzar    ← test 4
not ok 18 - REQ-22-02/Decisión 2: el repositorio no registra secretos en consola          ← test 10
not ok 19 - REQ-22-02: entidad y repositorio no superan las 100 líneas                     ← test 11
# tests 19
# pass 11
# fail 8
```

Evidencia adicional del rojo: el repositorio roto usaba el `fetch` global real y
contactó `https://labs.hackthebox.com` (respuestas 401 con `set-cookie` volcadas
por los `console.log`), confirmando la fuga de logs de red/secretos en consola.

## Restauración (diff aplicado)

`git diff src/domain/repositories/htb-profile-repository.ts` — 5 inserciones,
11 eliminaciones (restauración byte a byte del canónico `8078975^`):

```diff
 export class HtbProfileRepository {
   private readonly token: string | undefined;
   private readonly userId: string | undefined;
+  private readonly fetchFn: typeof fetch;

-  constructor(token: string | undefined, userId: string | undefined) {
+  constructor(token: string | undefined, userId: string | undefined, fetchFn: typeof fetch = fetch) {
     this.token = token;
     this.userId = userId;
+    this.fetchFn = fetchFn;
   }

   async getProfile(): Promise<HtbProfile> {
-    console.log("LOG NUMERO DOS");
     this.assertCredentials();
     const response = await this.requestProfile();
     return parseHtbProfile(await this.readJson(response));
@@
   // Vía degradada (REQ-27-01..06): cualquier modo de fallo resuelve a null.
   async getProfileOrNull(): Promise<HtbProfile | null> {
-    console.log("LOG NUMERO UNO");
     try {
-      const profile = await this.getProfile();
-      console.log(profile);
-      return profile;
+      return await this.getProfile();
     } catch {
       return null;
     }
@@
   private async requestProfile(): Promise<Response> {
-    console.log("LOG NUMERO TRES");
     try {
-      const res = await fetch(`${HTB_API_URL}/${this.userId}`, {
+      return await this.fetchFn(`${HTB_API_URL}/${this.userId}`, {
         headers: {
           Authorization: `Bearer ${this.token}`,
           Accept: 'application/json',
           'User-Agent': 'moibaldenegro.com',
         },
       });
-
-      console.log(res);
-      return  res;
     } catch {
       throw new HtbProfileDataError('HTB API: no se pudo contactar con la API');
     }
```

Contrato resultante (verificado): constructor `(token, userId, fetchFn = fetch)`
→ REQ-33-01; URL `${HTB_API_URL}/${userId}` con el id → REQ-33-02; token solo en
`Authorization: Bearer ...` → REQ-33-03; `HtbProfileDataError` en los 4 modos de
fallo (sin credenciales sin tocar red, fetch que falla, HTTP no-ok, JSON inválido/
sin perfil) → REQ-33-04/08; cero `console.*` → REQ-33-05; 100 líneas → REQ-33-06;
`getProfileOrNull` → null ante cualquier fallo → REQ-33-07. `htb-stadistics.astro`
sigue construyendo con 2 argumentos (usa el default global) — sin cambios allí.

## Ciclo VERDE

Tests de la feature:

```
node --test tests/htb-profile-repository.test.mjs tests/htb-api-graceful-degradation.test.mjs
# tests 19
# pass 18
# fail 1
```

Los 6 tests de `htb-profile-repository.test.mjs` y REQ-27-01 en verde. El único
fail restante es REQ-27-07/10 (el componente `htb-stadistics.astro` no usa
`{profile && ...}`), perteneciente a la feature 34 (`htb-section-degradation-restore`)
— fuera del scope de esta feature; no se tocó.

Suite completa:

```
node --test "tests/**/*.test.mjs"
# tests 206
# pass 202
# fail 4
```

Los 4 fallos restantes son todos de features ajenas:
- `REQ-27-07/10` y `REQ-32-04` → feature 34 (componente `htb-stadistics.astro`).
- `REQ-21-06` y `REQ-24-04` → feature 35 (specs históricas 21/24 borradas).

## init.sh

```
./init.sh
✔ node instalado / pnpm instalado / dependencias instaladas
✔ AGENTS.md / feature_list.json / progress/current.md existen
✔ formato de feature_list.json y progress/current.md
✘ tests al 100% (node:test)   ← solo los 4 fallos ajenos documentados arriba
✔ build de producción (pnpm build)
✘ 1 comprobación(es) fallida(s)
```

El único bloque en rojo es el de tests, por los 4 fallos ajenos (REQ-27-07/10,
REQ-32-04, REQ-21-06, REQ-24-04) de las features 34 y 35, documentados en la
feature 33 y en `progress/research/revision-general-ciclo30.md`. Formato y build
en verde. `feature_list.json` quedó con la feature 33 en `in_progress` (el cierre
lo gestiona el líder tras el reviewer).
