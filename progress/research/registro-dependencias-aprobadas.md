# Análisis — Registro de dependencias aprobadas + tipos de Cloudflare + fix de prerender

> Sesión del spec_author — 2026-08-13. Orden del humano (casi literal): "ha sido
> aceptado el adaptador de cloudflare como dependencia para hacer el despliegue y
> hay que instalar los tipos también, aprovecha para actualizar el arnés para
> posteriormente tener un registro de dependencias aprobadas, ningún agente está
> autorizado para aprobar dependencias, solo pone blocked como hasta ahora,
> únicamente son autorizadas por humanos después de que sean discutidas".

## 1. Qué es

Tres frentes encadenados:

1. **Aprobación humana de dependencias** (hecho consumado): @astrojs/cloudflare
   (^14.2.1), wrangler (^4.121.0) y @cloudflare/workers-types (^5.20260812.1)
   quedan APROBADAS por el humano para el despliegue; además hay que materializar
   los tipos de Cloudflare (worker-configuration.d.ts).
2. **Registro en el arnés**: infraestructura operativa `docs/dependencies.md` +
   validación mecánica, para que a partir de ahora toda dependencia externa de
   package.json esté registrada como aprobada por humano o la feature que la
   introduzca esté `blocked`.
3. **Regla de aprobación**: explicitar en el arnés que NINGÚN agente aprueba
   dependencias (solo marca `blocked`); la aprobación es decisión exclusiva del
   humano tras discusión, materializada en el registro.
4. **Canalización de la edición manual rota**: `src/components/htb-stadistics.astro`
   tiene una edición manual SIN commitear que rompe el build (`./init.sh` en ROJO).

## 2. Qué toca (verificación de hechos en disco)

| Hecho | Verificado | Estado |
|-------|-----------|--------|
| `import { env } from 'cloudflare:workers'` + fallbacks en htb-stadistics.astro | `git status`: `M src/components/htb-stadistics.astro`; líneas 4, 6-7 del archivo actual | ROTO: rompe prerender en node |
| `prerenderEnvironment: 'node'` | astro.config.mjs línea 28 (feature 21) | Confirma causa raíz |
| `worker-configuration.d.ts` ausente | Glob sin resultados; no aparece en git status | tsconfig.json línea 6 lo incluye |
| `.gitignore` no excluye worker-configuration.d.ts | `git check-ignore` exit 1; solo excluye `.wrangler/`, `.astro/`, `dist/`, node_modules, .env | Se debe commitear |
| package.json: deps y devDeps | @astrojs/cloudflare ^14.2.1, wrangler ^4.121.0, astro ^7.2.0; @cloudflare/workers-types ^5.20260812.1 | Aprobadas por humano 2026-08-13 |
| script `generate-types: wrangler types` | package.json línea 14 (REQ-21-02, done) | Listo para usar |
| wrangler.jsonc versionado | Existe en raíz y en `git ls-files` | Generador con contexto de runtime |
| Estado canónico del componente (22+27) | specs/22 y specs/27: `getProfileOrNull()` + `{profile && ...}` + astro:env/server | Documentado y testeado |
| Tests vigentes del componente | htb-stadistics-section.test.mjs y htb-api-graceful-degradation.test.mjs | Ambos fijan el estado canónico; no se tocan en la 28 |
| REQ-11-05 (about-page) hace build real | about-page.test.mjs líneas 213-243 | Es el test que cae con el build roto |

## 3. Riesgos y trabas

- **Build roto en HEAD de trabajo**: ninguna feature puede cerrarse (init.sh
  exige verde) mientras la 28 no revierta la edición manual → la 28 es la
  primera implementable.
- **Registro con validación mecánica**: si `check-format.mjs` integra el
  validador (REQ-29-06), cualquier dependencia nueva sin registro rompe
  `./init.sh` en el acto. Ese es el comportamiento deseado; el riesgo es un
  falso positivo (registro mal parseado) → el validador usa formato de bloques
  `### package` + `- clave: valor` (parseo stdlib robusto con regex).
- **`wrangler types` en Windows/sin red**: genera tipos desde wrangler.jsonc +
  node_modules local; no requiere autenticación para types de runtime. La
  feature 30 fija el contrato con test (existencia, no vacío, referencia al
  runtime) sin depender del contenido exacto generado.
- **Tokens prohibidos del kit**: docs/dependencies.md y los docs editados no
  deben contener los tokens del kit (og-image, hero, tomatesoft, cards-data) —
  REQ-01-05 los audita en tests/harness-kit-integrity. Ninguno aparece en los
  textos propuestos.
- **Límite 100 líneas**: scripts/validate-dependencies.mjs debe apuntar a ≤100
  líneas (precedente validate-progress 22 líneas, validate-specs 81).

## 4. Decisiones

1. **Descomposición en 3 features** (complejidad media-alta, 3 frentes):
   - **28 htb-stadistics-prerender-fix** (sin depends_on): revierte la edición
     manual al estado canónico 22+27 (quitar `cloudflare:workers` y los
     fallbacks; el marcado `{profile && ...}` NO cambia). Primera implementable:
     es la única que devuelve `./init.sh` a verde.
   - **29 dependencies-registry** (sin depends_on): registro
     `docs/dependencies.md` (formato bloques; 4 entradas aprobadas 2026-08-13:
     astro, @astrojs/cloudflare, wrangler, @cloudflare/workers-types) +
     `scripts/validate-dependencies.mjs` integrado en `check-format.mjs` +
     test red-first + documentación del arnés (AGENTS.md §7, architecture regla
     2, conventions, verification).
   - **30 cloudflare-types-install** (depends_on [29]): genera y commitea
     `worker-configuration.d.ts` vía `pnpm generate-types` con test red-first.
     Depende de 29 para que el registro (la regla) exista antes de operar con
     las dependencias aprobadas (coherencia del arnés).
2. **La 28 REVIERTE, no introduce fallback seguro**:
   - astro:env/server + schema ENV (REQ-22-08) ya entrega las envs del worker
     en runtime con el adapter; `ENV_TOKEN || env.HTB_API_TOKEN` es redundante.
   - El caso "envs ausentes" ya está cubierto por REQ-27-02 (getProfileOrNull →
     null → sección no renderiza).
   - El fallback seguro (import dinámico del módulo virtual en capa no evaluada
     en prerender) exigiría lógica en frontmatter (regla 8) o un módulo frágil
     con try/catch de import; sin beneficio real → descartado.
   - El prerender corre en node: cualquier referenciación estática del módulo
     virtual cloudflare:workers evaluada durante el prerender de la isla
     crashea; la especificación queda fijada con test de ausencia (REQ-28-04).
3. **worker-configuration.d.ts se commitea**: tsconfig lo incluye, .gitignore no
   lo excluye y wrangler.jsonc (versionado) lo genera de forma idempotente.
   A diferencia de `.astro/` (caché), es contrato de tipos del proyecto.
4. **El registro cubre dependencies + devDependencies** de package.json (astro
   incluido, framework del proyecto: registro completo = validación mecánica
   total). Sin registro → `check-format` falla → la feature que introdujo la
   dependencia debe estar `blocked` (flujo actual del arnés).
5. **Sin design.md** en las 3 features: ninguna toca UI/presentación (la 28
   solo cambia el frontmatter; el marcado visible de la 27 permanece).

## 5. Features dadas de alta

| id | name | depends_on | Orden de implementación |
|----|------|-----------|--------------------------|
| 28 | htb-stadistics-prerender-fix | — | 1.º (build a verde) |
| 29 | dependencies-registry | — | 2.º (arné) |
| 30 | cloudflare-types-install | [29] | 3.º (tipos bajo registro) |

Regla de selección del arnés: pending de menor id con depends_on done → 28 → 29
→ 30. Es el orden correcto: nadie puede cerrar 29/30 mientras el build esté
roto (require_tests_to_close + init.sh verde).

## 6. Hallazgos adicionales

- La feature 27 ya dejó el componente canónico; la edición manual del humano
  (fallback de worker) era una solución a un problema que la 27 ya resuelve por
  diseño (null-safe). No hay brecha funcional adicional.
- `tests/astro-config-dev-workaround.test.mjs` (workaround de dev vite, fijado
  por el humano) es independiente de estas features: ninguna de las 28-30 toca
  astro.config.mjs ni el esquema env.
- `wrangler.jsonc` no declara variables de entorno: las envs (HTB_API_TOKEN,
  HTB_USER_ID) se inyectan en el despliegue del worker; el esquema
  astro:env/server las hace secret/server/optional (REQ-22-08).