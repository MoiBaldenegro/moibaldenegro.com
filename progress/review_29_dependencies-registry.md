# Review — feature 29 `dependencies-registry`

**Veredicto:** APPROVED

> Reviewer — 2026-08-13. Spec: `specs/29_dependencies-registry/requirements.md`
> (REQ-29-01..06). Informe: `progress/impl_29_dependencies-registry.md`.
> Análisis: `progress/research/registro-dependencias-aprobadas.md` (Decisiones
> 3-5: registro cubre dependencies+devDependencies con astro incluido;
> worker-configuration.d.ts es de la feature 30; sin design.md).

## Comprobaciones con evidencia

### 1. REQ-29-01 — `docs/dependencies.md` existe con el formato de bloques (4 entradas)

Verificado leyendo el archivo (42 líneas): cabecera de política + formato
`### <package>` + `- clave: valor`. Las 4 entradas tienen los 4 campos
obligatorios (`version`, `scope`, `approved`, `motivo`), versiones y ámbitos
exactos de `package.json`, fecha `2026-08-13` y motivo:

| Entrada | version | scope | package.json |
|---------|---------|-------|--------------|
| astro | ^7.2.0 | dependencies | ^7.2.0 ✓ |
| @astrojs/cloudflare | ^14.2.1 | dependencies | ^14.2.1 ✓ |
| wrangler | ^4.121.0 | dependencies | ^4.121.0 ✓ |
| @cloudflare/workers-types | ^5.20260812.1 | devDependencies | ^5.20260812.1 ✓ |

### 2. REQ-29-02/03 — validador `scripts/validate-dependencies.mjs`

66 líneas (≤100), solo Node stdlib (`node:fs`, `node:url`), nombre con prefijo
`validate-` (lista cerrada de convenciones). Exporta `parseRegistry` y
`validateDependencies(packagePath, registryPath)`. Recorre dependencies +
devDependencies y falla si: falta entrada, version distinta de package.json o
scope distinto. Segundo recorrido: falla si una entrada no declara algún campo
obligatorio. Verificado con `node --test tests/dependencies-registry.test.mjs`
(8/8 en verde), incluidos los fixtures temporales de fallo (tests 3 y 4:
`sin-registro` → error; entrada sin `motivo` → error).

### 3. REQ-29-06 — integración en check-format + init.sh

`scripts/check-format.mjs` (20 líneas) importa y ejecuta
`validateDependencies()` en el array de errores y actualiza el mensaje a
`FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos`.
`./init.sh` ejecuta `node scripts/check-format.mjs` en la comprobación
«Formato» (líneas 52-57). Ejecutado en esta review: `FORMATO ✔ ...` sin
errores.

### 4. REQ-29-04/05 — política de aprobación explícita en el arnés

Verificado en los 4 documentos (test 6 lo fija con los tres marcadores
`docs/dependencies.md`, `decisión exclusiva del humano`, `blocked`):

- `AGENTS.md` → `git diff`: +1 fila en mapa §2 + §7 ampliado («ningún agente
  aprueba dependencias; la aprobación es decisión exclusiva del humano tras
  discusión y se materializa en docs/dependencies.md (validado por
  scripts/validate-dependencies.mjs vía scripts/check-format.mjs)»).
- `docs/architecture.md` → regla 2 ampliada (1 línea, mismo contenido).
- `docs/conventions.md` → sección nueva «## Dependencias» (12 líneas) con
  política, formato de bloques y validador.
- `docs/verification.md` → comprobación 3 del init + bullet en «Estado del
  harness».

### 5. init.sh — ejecutado por el reviewer

```
✔ node instalado / pnpm / node_modules / AGENTS.md / feature_list.json / progress/current.md
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Suite completa a verde. Tests específicos ejecutados en esta review: 15/15
(dependencies-registry 8/8 + harness-kit-integrity 7/7).

### 6. Tokens prohibidos del kit (REQ-01-05)

Grep de `og-image|tomatesoft|cards-data` en `scripts/*.mjs` → 0 resultados.
Grep de `og-image|hero|tomatesoft|cards-data` en `docs/*.md` y `AGENTS.md` →
0 resultados. `tests/harness-kit-integrity.test.mjs` en verde (REQ-01-05).
`docs/dependencies.md` no forma parte de los archivos del kit auditados
(OBLIGATORY_FILES) pero tampoco contiene tokens.

### 7. Ciclo rojo/verde (pregunta de revisión)

Evidencia en `progress/impl_29_dependencies-registry.md` §1: el test
`tests/dependencies-registry.test.mjs` se escribió primero y se ejecutó en
rojo el 2026-08-13 (`ERR_MODULE_NOT_FOUND: Cannot find module
'scripts/validate-dependencies.mjs'`, `# tests 1 / # fail 1`) antes de crear
el validador, el registro y la documentación; tras implementar, verde 8/8.
En esta review el test vuelve a correr en verde (8/8) y la suite completa
pasa con `./init.sh`.

### 8. Trazabilidad acceptance ↔ REQ (feature 29)

| Acceptance | REQ | Evidencia |
|-----------|-----|-----------|
| Test red-first... (A1) | REQ-29-02/03 | Informe §1 rojo/verde; tests 3/4 con fixtures |
| docs/dependencies.md con 4 entradas completas (A2) | REQ-29-01 | Comprobación 1 + test 1 |
| Validador falla sin registro y sin campos (A3) | REQ-29-02/03 | Comprobación 2 + tests 3/4 |
| check-format integra validación; init.sh la ejecuta (A4) | REQ-29-06 | Comprobación 3, test 7 |
| 4 docs documentan política (A5) | REQ-29-04/05 | Comprobación 4, test 6 |
| Suite verde + entorno perfecto (A6) | REQ-29-06 | Comprobación 5 (init.sh ejecutado) |

### 9. Dependencias y alcance

- Feature 29 sin `depends_on` (≡ `[]` según validate-feature-list): ninguna
  dependencia pendiente saltada. Feature 30 (`cloudflare-types-install`,
  depends_on [29]) sigue `pending` y sin tocar; solo se tocaron archivos del
  arnés (AGENTS.md, docs/*.md, scripts/check-format.mjs, docs/dependencies.md,
  tests/dependencies-registry.test.mjs, scripts/validate-dependencies.mjs) —
  sin cambios en package.json, tsconfig ni src/. Una sola feature por sesión.
- Límite 100 líneas: validador 66; check-format 20; docs editados dentro de
  sus tamaños previos (architecture.md 81→81, conventions.md 59→71,
  verification.md +5).
- Sin design.md: correcto, sin UI/presentación (Decisión 5 del research).

## Checkpoints

- C1: [x] — Sin código de app; validador ≤100 líneas y stdlib; sin
  dependencias nuevas introducidas.
- C2: [x] — Sin cambios en datos; repositorios y errores nombrados intactos.
- C3: [x] — `./init.sh` verde ejecutado por el reviewer (formato, tests 100%,
  build OK).
- C4: [ ] ← No aplica: sin UI en esta feature (sin design.md; ninguna
  presentación cambia).
- C5: [x] — `progress/current.md` documenta la sesión y la 29 queda
  `in_progress` a la espera de que el líder la marque `done` tras este
  APPROVED; ninguna otra feature a medias (28 done, 30 pending).

## Cambios requeridos

Ninguno.