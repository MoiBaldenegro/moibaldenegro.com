# Informe de implementación — feature 29 `dependencies-registry`

> 2026-08-13. Implementer. Spec: `specs/29_dependencies-registry/requirements.md`
> (REQ-29-01..06). Sin design.md (sin UI). Cierre de ciclo: pendiente de
> review (APPROVED) para marcar `done`.

## 1. Ciclo rojo/verde (TDD)

### ROJO — test escrito primero, antes de cualquier código

`tests/dependencies-registry.test.mjs` (8 tests contra REQ-29-01..06) escrito
contra la spec antes de crear el registro, el validador y la documentación.
Ejecutado en rojo el 2026-08-13:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'C:\\Users\\Moises\\Desktop\\moibaldenegro.com\\scripts\\validate-dependencies.mjs'
imported from C:\\Users\\Moises\\Desktop\\moibaldenegro.com\\tests\\dependencies-registry.test.mjs
...
# tests 1
# pass 0
# fail 1
```

El fichero de tests no cargaba: el módulo `validate-dependencies.mjs` no
existía (nada implementado) y `docs/dependencies.md` tampoco. ROJO confirmado
antes de implementar (regla test-first del arnés).

### VERDE — tras implementar registro + validador + arnés

```
node --test tests/dependencies-registry.test.mjs
1..8
# tests 8
# pass 8
# fail 0
```

Suite completa: `./init.sh` → `✔ El entorno está perfecto. Podemos empezar a
trabajar.` (formato OK — check-format con el mensaje actualizado —, tests
al 100 %, build de producción OK).

## 2. Qué se implementó (trazabilidad REQ → acceptance)

| REQ | Artefacto |
|-----|-----------|
| REQ-29-01 | `docs/dependencies.md` (nuevo) con formato de bloques `### package` + `- clave: valor`. 4 entradas aprobadas por el humano el 2026-08-13: `astro` ^7.2.0 (dependencies, framework del proyecto), `@astrojs/cloudflare` ^14.2.1 (dependencies, adapter de despliegue Cloudflare Workers), `wrangler` ^4.121.0 (dependencies, CLI de despliegue y generación de tipos) y `@cloudflare/workers-types` ^5.20260812.1 (devDependencies, tipos del runtime). Cada entrada: `version`, `scope`, `approved`, `motivo` (los 4 campos obligatorios). |
| REQ-29-02 | `scripts/validate-dependencies.mjs` (nuevo, 67 líneas ≤ 100, Node stdlib): exporta `validateDependencies(packagePath, registryPath)` que falla cuando una dependencia de package.json (dependencies + devDependencies, astro incluido) no tiene entrada aprobada en el registro. Verificado con fixture temporal: `"nueva-dep" sin registro` → error. |
| REQ-29-03 | El mismo validador falla cuando una entrada del registro no declara los campos obligatorios (`version`, `scope`, `approved`, `motivo`). Verificado con fixture temporal: entrada sin `motivo` → error. Además valida coherencia version/scope contra package.json (defensa del ámbito, Decisión 4 del research). |
| REQ-29-06 | `scripts/check-format.mjs` (editado): importa y ejecuta `validateDependencies()` en el array de errores; `./init.sh` lo ejecuta en cada arranque (comprobación Formato). Mensaje: `FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos`. |
| REQ-29-04/05 | Arnés documentado (los 4 docs): AGENTS.md (fila nueva del mapa §2 + bullet §7), docs/architecture.md (regla 2 ampliada: ningún agente aprueba; aprobación exclusiva del humano materializada en `docs/dependencies.md`, validada por `scripts/validate-dependencies.mjs` vía check-format), docs/conventions.md (sección nueva «## Dependencias»: política, formato de bloques y validador), docs/verification.md (comprobación 3 del init + bullet en «Estado del harness»). Todos contienen «docs/dependencies.md», «decisión exclusiva del humano» y «blocked`. |
| TDD | `tests/dependencies-registry.test.mjs` (nuevo, 8 tests): formato real del registro (REQ-29-01), cobertura mecánica completa de package.json contra el registro (versión y ámbito exactos), fixtures temporales de fallo (REQ-29-02/03), validador en verde con archivos reales, política en los 4 docs (REQ-29-04/05), integración en check-format (REQ-29-06) y límite de 100 líneas del validador. |

## 3. Formato del registro (contrato fijado por el test)

```md
### <package>

- version: <versión exacta de package.json>
- scope: dependencies | devDependencies
- approved: <YYYY-MM-DD de aprobación humana>
- motivo: <texto>
```

El validador parsea los bloques con regex stdlib (`/^###\s+(.+)$/` y
`/^-\s*([a-z]+)\s*:\s*(.+)$/`) y entrega errores en español con la convención
de mensajes del arnés.

## 4. Alcance y restricciones respetadas

- **Una sola feature**: 29. No se tocó package.json, tsconfig ni ningún
  archivo de `src/`. La feature 30 (`cloudflare-types-install`, depends_on 29)
  sigue `pending` y sin tocar.
- **Tokens prohibidos del kit** (REQ-01-05): 0 apariciones de `og-image`,
  `hero`, `tomatesoft`, `cards-data` en los archivos tocados (verificado con
  grep tras el cambio; precedente feature 23). `tests/harness-kit-integrity.test.mjs`
  en verde dentro de la suite.
- **Ningún agente aprueba dependencias**: esta feature solo MATERIALIZA las 4
  aprobaciones humanas del 2026-08-13 (orden del humano); no aprueba nada
  nuevo. La regla queda explícita en los 4 docs del arnés.
- **Límite 100 líneas**: validador 67 líneas; los docs editados mantienen su
  tamaño (architecture.md 81→82 líneas; conventions.md 59→71; verification.md
  +5; AGENTS.md +2).
- Sin design.md (sin UI/presentación), conforme a la Decisión 5 del research y
  a la descripción de la feature.

## 5. Verificación final

```
./init.sh → ✔ El entorno está perfecto. Podemos empezar a trabajar.
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos
tests al 100% (node:test) ✔  —  build de producción (pnpm build) ✔
```

Feature `in_progress` en `feature_list.json` (la marca `done` la aplicará el
líder tras el APPROVED del reviewer).