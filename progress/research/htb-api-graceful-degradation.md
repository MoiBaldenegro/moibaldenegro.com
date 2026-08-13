# Análisis — degradación elegante de la sección HTB (feature 27)

## Problema

La página se rompe cuando la API de Hack The Box falla. Es aceptable que la API
falle; NO que la página se rompa. Stack trace real del dev server:

```
HTB API: no se pudo contactar con la API
  at HtbProfileRepository.requestProfile (src/domain/repositories/htb-profile-repository.ts:49)
  at HtbProfileRepository.getProfile (src/domain/repositories/htb-profile-repository.ts:29)
  at null.<anonymous> (src/components/htb-stadistics.astro:6)
  ... at AstroComponentInstance.Component [as factory] (astro/dist/core/server-islands/endpoint.js:153)
```

Mecánica del fallo: `src/pages/index.astro` renderiza `<HtbStadistics server:defer>`
(isla de servidor diferida; la portada es prerender). El navegador pide la isla
aparte; cuando el render de la isla lanza, el endpoint responde 500 y la app se
ve rota (el slot de fallback "Cargando..." ya no es suficiente porque la isla
falla al resolver).

## Qué toca (capas y rutas)

| Archivo | Rol actual | Cambio previsto (feature 27) |
|---------|-----------|------------------------------|
| `src/domain/repositories/htb-profile-repository.ts` (95 líneas) | `getProfile()` lanza `HtbProfileDataError` en 5 modos de fallo | Añadir método `getProfileOrNull(): Promise<HtbProfile \| null>` que captura y devuelve `null`; `getProfile()` intacto; archivo comprimido a ≤100 líneas |
| `src/components/htb-stadistics.astro` (39 líneas) | `const profile = await ...getProfile()` sin manejo de error → 500 | Llamar `getProfileOrNull()`; template condiciona la sección a `{profile && ...}` (sin `if`/`try`/`for`/`function` para no romper el test de convención) |
| `src/domain/entities/htb-profile.ts` (14 líneas) | Entidad inmutable `HtbProfile` | Sin cambios |
| `src/pages/index.astro` (16 líneas) | `server:defer` + slot fallback | Sin cambios |
| `src/styles/htb-stadistics.css` (55 líneas) y `tokens.css` (87 líneas) | Hoja de la sección, tokens | Sin cambios: la opción "no renderizar" no necesita CSS ni tokens nuevos |
| `tests/htb-stadistics-section.test.mjs` (216 líneas) | Test REQ-22-01..08 | 1 aserción afectada: `/getProfile\(\)/` → `/getProfileOrNull\(\)/` (justificada); resto intacto |
| `tests/htb-profile-repository.test.mjs` (176 líneas) | Test REQ-22-02..04, Decisión 6 | Sin cambios (getProfile conserva el lanzamiento; repo ≤100 líneas sigue verificado) |
| `tests/htb-api-graceful-degradation.test.mjs` | — | Nuevo, red-first: 5 modos de fallo → `null`; éxito → perfil; getProfile sigue lanzando; componente usa getProfileOrNull sin lógica |

## Los cinco modos de fallo (ninguno debe producir 500)

1. Envs faltantes: `assertCredentials()` lanza `HtbProfileDataError` (REQ-22-07
   lo exigía "sin romper la página"; en la práctica la isla tira 500).
2. Red caída: `requestProfile()` catch → `HtbProfileDataError`.
3. HTTP no-ok: `readJson()` → `HtbProfileDataError`.
4. JSON inválido: `readJson()` → `HtbProfileDataError`.
5. Respuesta sin perfil válido: `asProfile()` → `HtbProfileDataError`.

Como todos los caminos lanzan el mismo error nombrado, `getProfileOrNull()`
capturando `HtbProfileDataError` (o catch genérico, equivalente en la práctica)
cubre el 100% de las vías → la isla nunca responde 500 por datos.

## Riesgos y trabas

- **Límite 100 líneas del repositorio**: 95 + ~8 del método = ~103. La
  implementación debe comprimir el comentario de cabecera y líneas en blanco
  (el test REQ-22-02 lo verifica). No crear módulo nuevo solo para 6 líneas:
  un método degradado es responsabilidad del mismo repositorio.
- **Test vigente roto por diseño**: la aserción `getProfile()` en el componente
  (test REQ-22-01/02) falla al migrar a `getProfileOrNull()` — actualización
  única y justificada; el contrato del repositorio queda verificado por el test
  del repositorio (sin tocar).
- **No añadir lógica al componente**: el condicional del template debe usar
  `{profile && ...}` (la regex del test prohíbe `if (`, `try {`, `for (`,
  `function`).
- **Sin console.\***: ni componente (REQ-22-06) ni repositorio (Decisión 2).
- **Sin tokens/CSS nuevos**: tokens.css al límite (87 líneas en disco);
  precedente features 17/24/26.

## Decisión de estado visual (documentada en design.md, Decisión 1)

**Ocultar la sección (no renderizar)** cuando el perfil es `null`, en vez de un
estado "no disponible": más sutil, cero CSS/tokens nuevos, sin contenido
inventado (Decisión 6 del design 22) y el slot de fallback ya comunica la carga.

## Salida del ciclo

- `specs/27_htb-api-graceful-degradation/requirements.md` (REQ-27-01..10)
- `specs/27_htb-api-graceful-degradation/design.md` (Decisiones 1-6)
- Alta en `feature_list.json`: id 27, `depends_on: [22]`, status pending
