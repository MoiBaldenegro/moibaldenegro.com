# Informe de implementación — feature 35 `specs-historico-restore`

- **Fecha:** 2026-08-14 · implementer
- **Spec:** `specs/35_specs-historico-restore/requirements.md` (REQ-35-01..05)
- **Contexto:** la limpieza manual del humano borró `specs/` entera (commit
  `0b7f359`). Solo dos tests leen specs en runtime:
  - `tests/view-transitions.test.mjs` REQ-24-04 → `specs/24_view-transitions/design.md`.
  - `tests/ssr-cloudflare-align.test.mjs` REQ-21-06 → `specs/21_ssr-cloudflare-align/requirements.md` Y feature 21 en `feature_list.json`.
  Esta feature restaura las dos specs (REQ-21-01..06, REQ-24-01..05) y adapta
  REQ-21-06 para verificar la excepción de dependencias contra la spec
  restaurada + `docs/dependencies.md`, porque el backlog del ciclo nuevo ya no
  contiene la feature 21 (REQ-35-03, autorización explícita de la spec).

## 1. Ciclo rojo/verde (evidencia)

### 1.1 ROJO — estado inicial (specs ausentes)

```
$ node --test tests/view-transitions.test.mjs tests/ssr-cloudflare-align.test.mjs
# tests 16
# pass 14
# fail 2
not ok 7 - REQ-21-06: la excepción de dependencias externas queda documentada
  error: 'specs/21_ssr-cloudflare-align/requirements.md: no existe'
not ok 12 - REQ-24-04: el design documenta la excepción de JavaScript de runtime
  error: 'specs/24_view-transitions/design.md no existe (REQ-24-04)'
```

### 1.2 Test actualizado primero (REQ-21-06, autorizado por REQ-35-03)

La spec 35 (REQ-35-03 + acceptance) autoriza explícitamente actualizar REQ-21-06:
"THEN la verificación de la excepción REQ-21-06 SHALL leer la spec restaurada y
el registro de dependencias, WHERE el backlog del ciclo nuevo no contiene la
feature 21". El test dejó de buscar la feature 21 en `feature_list.json` y ahora
verifica contra la spec restaurada (`specs/21_ssr-cloudflare-align/requirements.md`
debe declarar REQ-21-06) y el registro de dependencias
(`docs/dependencies.md` debe documentar las aprobaciones de `@astrojs/cloudflare`
y `wrangler`). Comentario de cabecera del test actualizado para documentar el
cambio. ROJO tras actualizar el test (ya sin la dependencia del backlog):

```
$ node --test tests/ssr-cloudflare-align.test.mjs
not ok 7 - REQ-21-06: la excepción de dependencias externas queda documentada
  error: 'specs/21_ssr-cloudflare-align/requirements.md: no existe'
```

### 1.3 VERDE — specs restauradas desde git

Restauradas byte a byte desde `0b7f359^` (padre del commit de borrado):

| Archivo | Origen | Hash | Verificación |
|---------|--------|------|--------------|
| `specs/21_ssr-cloudflare-align/requirements.md` | `git show 0b7f359^:...` | `a26e8d1…` | diff vacío vs. histórico; validador EARS 0 errores |
| `specs/24_view-transitions/requirements.md` | `git show 0b7f359^:...` | `770c51a…` | diff vacío vs. histórico; validador EARS 0 errores |
| `specs/24_view-transitions/design.md` | `git show 0b7f359^:...` | `91af8ac…` | diff vacío vs. histórico; contiene «Estático por defecto» y la justificación declarativa (REQ-24-04) |

Contenido restaurado:
- **REQ-21-01..06**: output server + adapter cloudflare; `generate-types` con
  `wrangler types`; `.wrangler/` fuera de git; ruta real del adapter
  `dist/client/about/index.html`; IF el build no genera /about THEN el test
  falla; justificación de dependencias del adapter (decisión documentada).
- **REQ-24-01..05**: `ClientRouter` en la cabecera del layout; mecanismo
  canalizado por la feature; pares `transition:name` del design en las cards;
  excepción a «Estático por defecto» documentada (Decisión 3 del design: API
  declarativa de `astro:transitions`, sin JavaScript manual, coste limitado a
  páginas con `transition:*`); verificación por inspección del estado final.

Verificación con el validador real del arnés:

```
$ node --input-type=module -e "...validateRequirements..."
specs/21_ssr-cloudflare-align/requirements.md EARS OK (0 errores)
specs/24_view-transitions/requirements.md EARS OK (0 errores)
```

Tests de la feature:

```
$ node --test tests/view-transitions.test.mjs tests/ssr-cloudflare-align.test.mjs
# tests 16
# pass 16
# fail 0
ok 7 - REQ-21-06: la excepción de dependencias externas queda documentada
ok 12 - REQ-24-04: el design documenta la excepción de JavaScript de runtime
```

## 2. Suite completa y arnés

```
$ node --test "tests/**/*.test.mjs"
# tests 206
# pass 206
# fail 0

$ ./init.sh
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 3. Cobertura REQ-35-XX

| REQ | Cómo se cumple |
|-----|----------------|
| REQ-35-01 | `specs/21_ssr-cloudflare-align/requirements.md` restaurada con REQ-21-01..06 (formato EARS, validador 0 errores). |
| REQ-35-02 | `specs/24_view-transitions/requirements.md` (REQ-24-01..05) y `design.md` restaurados; el design documenta la excepción de JavaScript (Decisión 3). |
| REQ-35-03 | `tests/ssr-cloudflare-align.test.mjs` REQ-21-06 actualizado: lee la spec restaurada + `docs/dependencies.md` (aprobaciones @astrojs/cloudflare y wrangler), sin leer la feature 21 del backlog. |
| REQ-35-04 | Suite completa 206/206 al 100 %; `./init.sh` en verde. |
| REQ-35-05 | Ambas `requirements.md` pasan `validateRequirements` del arnés (EARS estricto: una línea = un SHALL, IDs REQ-<NN>-<xx>, sin verbos vagos). |

## 4. Archivos tocados

1. `tests/ssr-cloudflare-align.test.mjs` — REQ-21-06 actualizado (único cambio
   de test; autorizado explícitamente por REQ-35-03 y la acceptance de la
   feature 35: «pasa en verde sin leer feature 21 del backlog») + comentario de
   cabecera.
2. `specs/21_ssr-cloudflare-align/requirements.md` — nuevo (restaurado desde git).
3. `specs/24_view-transitions/requirements.md` — nuevo (restaurado desde git).
4. `specs/24_view-transitions/design.md` — nuevo (restaurado desde git).

No se tocó `src/` (la spec no lo exige) ni el resto de specs históricas
(01-20, 22-23, 25-32 no se restauran: viven en git y en `progress/impl_*`).
`tests/view-transitions.test.mjs` no se modificó (REQ-24-04 pasa con el design
restaurado).

## 5. Pendiente

Reviewer del líder (`progress/review_35_specs-historico-restore.md`); la
feature 35 queda `in_progress` en `feature_list.json` hasta el APPROVED.
