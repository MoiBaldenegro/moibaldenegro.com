# Review — feature 5

**Veredicto:** APPROVED

Feature: 5 `mxvi-logos-links-data` (Datos y repositorio de los logos MXVI con URL por logo).
Spec: `specs/05_mxvi-logos-links-data/requirements.md` (REQ-05-01..14).
Informe revisado: `progress/impl_mxvi-logos-links-data.md`. Revisión: 2026-11-02, reviewer nivel 1.

## Checkpoints
- C1 (Arquitectura — estilos en `src/styles/`, sin `<style>` en `.astro`): [x] No toca UI ni CSS.
- C2 (Arquitectura — sin lógica en UI): [x] La lógica vive en `src/domain/repositories/mxvi-logos-parse.ts` y `mxvi-logos-repository.ts`; no se toca ningún `.astro`.
- C3 (Arquitectura — datos vía repositorio): [x] `src/data/mxvi-logos.json` solo lo importa `mxvi-logos-repository.ts:8`. El componente todavía no lo consume (eso es REQ-06-01 de la feature 6).
- C4 (Arquitectura — tokens): [x] No aplica (sin CSS).
- C5 (Arquitectura — <=100 líneas): [x] JSON 32, entidad 14, parse 58, repositorio 44, test 99 (`wc -l`); además lo cubre el test REQ-05-14.
- C6 (Arquitectura — sin dependencias nuevas): [x] `package.json` sin cambios (git status).
- C7 (Datos — JSON válido y tipado por entidad): [x] `src/data/mxvi-logos.json` es válido y lo tipa `MxviLogo` (`src/domain/entities/mxvi-logo.ts:4-14`, los 5 campos `readonly`).
- C8 (Datos — errores nombrados, sin fallos silenciosos): [x] `MxviLogosDataError` (`mxvi-logos-parse.ts:7-12`); loader que lanza y JSON inválido (`mxvi-logos-repository.ts:31-42`), array ausente o con número de entradas distinto de 4 (`parse.ts:27-31`), campo ausente/vacío/no texto (`parse.ts:48-54`), href sin `https://` (`parse.ts:39-41`) y viewBox inválido (`parse.ts:42-44`, regex `/^0 0 [1-9]\d* [1-9]\d*$/`). Todos los mensajes llevan el prefijo `mxvi-logos.json:`, y los de entrada incluyen `logos[i]` y el campo.
- C9 (Verificación — `./init.sh` verde): [x] Ejecutado por el reviewer: entorno, formato, tests al 100% y build en verde. `node --test tests/mxvi-logos-data.test.mjs` da 10/10 pass.
- C10 (Verificación — visual desktop/móvil): [x] No aplica: la feature no cambia la UI.
- C11 (Harness — estado de la tarea): [x] La feature 5 está en `in_progress` y la 6 en `pending` con `depends_on: [5]`. La feature 5 no tiene `depends_on`, así que no se saltó ninguna dependencia. El paso a `done` lo hace el líder tras este APPROVED.
- C12 (Harness — progress documentado): [x] `progress/current.md` tiene el plan y la bitácora; el informe de implementación está en `progress/impl_mxvi-logos-links-data.md`.
- C13 (Harness — limpieza): [x] Sin archivos temporales, sin `console.log` de debug y sin TODOs.

## Evidencia TDD
- Rojo: el §3 del informe muestra `ERR_MODULE_NOT_FOUND` de `mxvi-logos-repository.ts` antes de crear el código, y la bitácora de `progress/current.md` confirma el orden test → código. También documenta un rojo intermedio en REQ-05-14 (test de 107 líneas) que se corrigió compactando el test sin quitar aserciones.
- Verde: los 10/10 tests de la feature y `./init.sh` están en verde; el reviewer lo reprodujo.

## Trazabilidad REQ
REQ-05-01..14 están cubiertos en `tests/mxvi-logos-data.test.mjs` (líneas 26-99) y los casos coinciden con los acceptance de `feature_list.json`. Los nombres de archivo en kebab-case (`mxvi-logo.ts`, `mxvi-logos-repository.ts`) se apartan de la tabla de nombres de `docs/conventions.md`, pero siguen la práctica real del repo (`promo-tile.ts`, `promo-tiles-repository.ts`) y la ruta que fija la spec, así que no bloquean.

## Observaciones (no bloqueantes)
1. `mxvi-logos-parse.ts:40,43,51`: el mensaje repite el índice (`el campo "logos[1].viewBox" del logo logos[1] ...`). Es redundante pero cumple REQ-05-11..13; se puede simplificar en otra ocasión.

## Cambios requeridos (si aplica)
Ninguno.
