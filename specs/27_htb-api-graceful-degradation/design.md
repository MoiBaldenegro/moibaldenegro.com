# Diseño — htb-api-graceful-degradation

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La portada (`src/pages/index.astro`): la isla `server:defer` de la sección de estadísticas de Hack The Box (`src/components/htb-stadistics.astro`). El navegador pide la isla aparte; hoy, cuando `getProfile()` lanza `HtbProfileDataError`, el endpoint de la isla responde 500 y la página se ve rota (stack trace en `src/domain/repositories/htb-profile-repository.ts:49` → `getProfile` → `htb-stadistics.astro:6`).
- ¿Estado actual y estado deseado? Actual: el frontmatter hace `await new HtbProfileRepository(HTB_API_TOKEN, HTB_USER_ID).getProfile();` sin manejo de error; cualquiera de los cinco modos de fallo (envs ausentes, red caída, HTTP no-ok, JSON inválido, perfil inválido) revienta la isla. Deseado: la degradación vive en la capa de dominio (el repositorio entrega `null` en vez de lanzar) y, cuando el perfil es `null`, la sección simplemente no se renderiza — la portada queda intacta sin errores.

## Tokens usados (solo de los tokens existentes del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| (ninguno) | — | La opción de "no renderizar" no necesita CSS nuevo: si el perfil es `null` la sección no se pinta y no hay estado visual adicional. `src/styles/htb-stadistics.css` y los 8 tokens de su tabla (design 22) permanecen intactos. |

> **No se añaden tokens ni estilos**: `tokens.css` está al límite (96/100 en el design 22; 87 líneas en disco tras la feature 26) y la hoja de la sección no requiere reglas nuevas para la ausencia. La decisión visual explícita es que un widget de datos externo caído desaparece, no anuncia su caída.

## Decisiones y constraints

- Decisión 1 (estado visual: Ocultar vs "No disponible"): **la sección no se renderiza cuando el perfil es `null`** (opción "ocultar"). Motivos: (a) es el estado más sutil y alineado con "estático por defecto" y con la Decisión 6 del design 22 ("sin inventar contenido": un mensaje de no-disponible sería copia nueva que no viene de la API); (b) cero CSS y cero tokens nuevos (tokens.css al límite, precedente features 17/24/26); (c) el slot de fallback "Cargando estadísticas de HTB..." (Decisión 3, design 22) ya comunica el estado de carga mientras la isla resuelve; (d) en un sitio personal, una dependencia externa caída debe desaparecer de la página, no ocupar espacio anunciando su fallo.
- Decisión 2 (capa de la degradación): la contención del error vive en el **dominio**: nuevo método `getProfileOrNull(): Promise<HtbProfile | null>` en `HtbProfileRepository` (misma fuente de datos, contrato aditivo). El frontmatter del componente solo cambia la llamada: `new HtbProfileRepository(...).getProfileOrNull()` — sin `try`/`if` en la UI (regla 8 de `docs/architecture.md`; el test de convención de la feature 22 prohíbe `try {`, `if (`, `for (`, `function` en el componente).
- Decisión 3 (contención del error): `getProfileOrNull` captura el error y devuelve `null`; como todos los caminos internos de `getProfile()` lanzan el mismo `HtbProfileDataError` (assertCredentials, fetch catch, HTTP no-ok, JSON inválido, perfil inválido), la captura es total y ninguna vía escapa. `getProfile()` **no cambia**: sigue lanzando `HtbProfileDataError` (contrato REQ-22-02..04; los tests de `htb-profile-repository.test.mjs` quedan verdes sin tocar).
- Decisión 4 (límite 100 líneas del repositorio): el archivo está en 95 líneas; el método añade ~8. La implementación comprime el comentario de cabecera (3 líneas → 1) y elimina líneas en blanco sobrantes para mantenerse ≤100 (lo verifica el test REQ-22-02 existente). No se crea un módulo nuevo: un método degradado es responsabilidad del mismo repositorio ("un repositorio = una fuente de datos").
- Decisión 5 (tests vigentes afectados — actualización justificada): el test "REQ-22-01/02: el componente importa el repositorio" de `tests/htb-stadistics-section.test.mjs` exige la subcadena `getProfile()` en el componente; al pasar a `getProfileOrNull()` esa aserción queda roja. La feature actualiza **solo esa aserción** (`/getProfile()/` → `/getProfileOrNull()/`) con justificación documentada en esta spec: el componente ya no invoca la vía que lanza, y el contrato de `getProfile()` (REQ-22-02..04) se sigue verificando íntegro en `tests/htb-profile-repository.test.mjs`. Ninguna otra aserción de la feature 22 se toca: server:defer, slot de fallback, sin fetch, sin console.*, hoja CSS con tokens, esquema env y convención (≤100 líneas, sin if/try/for/function) siguen verdes — el condicional del template usa la expresión `{profile && ...}` (Astro idiomático), que no dispara la regex de lógica.
- Decisión 6 (verificación del no-500): el test de la feature se escribe en rojo primero y cubre los cinco modos de fallo a nivel de dominio (cada uno resuelve a `null`); estructuralmente se verifica que el componente ya no invoca `getProfile()` (única vía que lanza), con lo que la isla no puede responder 500 por datos. El cierre exige suite completa en verde + `pnpm build` OK (precedente REQ-25-08/REQ-26-08).
- Restricciones del proyecto aplicables: capas claras (regla 1), errores explícitos con la excepción justificada del acceso degradado (regla 3), lógica separada de la UI (regla 8), ≤100 líneas (regla 12), tokens (regla 6), sin dependencias externas (regla 2), sin `console.*` (REQ-22-06, Decisión 2 del design 22).

## Alternativa descartada

- Alternativa considerada 1: `try/catch` en el frontmatter del componente.
  Motivo del descarte: viola "Lógica separada de la UI" (regla 8) y el test de convención de la feature 22 lo prohíbe explícitamente (patrón `try {` en el componente); además duplicaría la política de degradación en la capa de presentación.
- Alternativa considerada 2: estado visual "No disponible" (mensaje sutil con la card existente).
  Motivo del descarte: requiere marcado y reglas CSS nuevas (aunque solo con tokens existentes), añade copia que no proviene de la API (contra la Decisión 6 del design 22) y la ausencia total es más sutil y sin coste de mantenimiento.
- Alternativa considerada 3: que `getProfile()` devuelva `null` en vez de lanzar.
  Motivo del descarte: rompe el contrato REQ-22-02..04 y los tests `htb-profile-repository.test.mjs` (REQ-22-03/04/07 esperan rechazo con `HtbProfileDataError`); silenciar la vía canónica contradice la regla 3 ("un fallo silencioso es un bug disfrazado"). La vía que lanza se conserva; la vía degradada es un acceso nuevo y explícito.
