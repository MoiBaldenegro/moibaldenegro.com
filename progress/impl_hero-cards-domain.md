# Informe de implementación — feature 6 hero-cards-domain

- **Fecha:** 2026-08-10
- **Agente:** implementer
- **Spec:** `specs/06_hero-cards-domain/requirements.md` (REQ-06-01..06)
- **Diseño aplicado:** Decisión 1 de `specs/04_hero-cards-styles/design.md` — el JSON guarda `colorToken` (sufijo del token de marca `--color-marca-<token>`) y la UI lo aplicará en la feature 9.

## Verificación previa (sesión concurrente)

Comprobado en disco antes de tocar nada: no existían `src/data/hero-cards.json`,
`src/domain/entities/hero-card.ts`, `src/domain/repositories/hero-cards-repository.ts`,
`tests/hero-cards-repository.test.mjs` ni `progress/impl_hero-cards-domain.md` /
`progress/review_hero-cards-domain.md` → implementación desde cero con ciclo rojo/verde completo.

## Ciclo ROJO

Test escrito PRIMERO contra la spec: `tests/hero-cards-repository.test.mjs` (9 casos:
REQ-06-01 archivo con 12 tarjetas e ids actuales; REQ-06-02 entidad HeroCard readonly con
los 9 campos; REQ-06-03 entrega de las 12 entidades; REQ-06-04 colorToken sin hex y token
existente en tokens.css; REQ-06-05 ausente/malformado/forma inválida/tarjeta inválida →
`HeroCardsDataError`; REQ-06-06 ≤100 líneas).

Salida en rojo (el import del repositorio no existe):

```
$ pnpm node --test tests/hero-cards-repository.test.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'...\src\domain\repositories\hero-cards-repository.ts'
imported from ...\tests\hero-cards-repository.test.mjs
# pass 0
# fail 1
```

## Implementación

- `src/data/hero-cards.json` — las 12 tarjetas reales actuales (mismos ids, títulos,
  iconos, posiciones de grid, rotate, scale e iconWidth que `src/data/hero.data.ts`),
  con el campo `colorToken` en lugar del `background` hex (REQ-06-01, REQ-06-04).
  colorTokens: react, html, node, github, youtube, twitch, typescript, css,
  node-bottom, github-bottom, youtube-bottom, twitch-bottom — todos con su token
  `--color-marca-<token>` existente en `src/styles/tokens.css`.
- `src/domain/entities/hero-card.ts` — `interface HeroCard` (17 líneas), todos los
  campos readonly: id, title, colorToken, icon, gridColumn, gridRow, rotate, scale,
  iconWidth (REQ-06-02).
- `src/domain/repositories/hero-cards-repository.ts` — `HeroCardsRepository` (89
  líneas) + clase `HeroCardsDataError` (name `HeroCardsDataError`, mensajes en
  español). Lee el JSON con `node:fs`, valida el arreglo y los 9 campos de cada
  tarjeta; cualquier ausencia, JSON inválido, forma inválida o campo con tipo
  incorrecto lanza el error nombrado (REQ-06-03, REQ-06-05). Patrón idéntico al de
  `hero-profile-repository.ts` (feature 5).
- `src/data/hero.data.ts` NO se tocó: lo borrará la feature 9 (la UI aún lo importa).

## Ciclo VERDE

Test de la feature:

```
$ pnpm node --test tests/hero-cards-repository.test.mjs
# pass 9
# fail 0
# duration_ms 113.4102
```

Suite completa:

```
$ pnpm test
# tests 39
# pass 39
# fail 0
```

(30 tests previos + 9 nuevos; 0 regresiones.)

Formato y puerta de entrada:

```
$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

$ ./init.sh
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Alcance / límites

- Feature única: dominio de tarjetas. No se tocó UI, estilos, ni `hero.data.ts`
  (feature 9). No se añadieron dependencias. Entidad y repositorio cumplen el
  límite de 100 líneas (REQ-06-06: 17 y 89 respectivamente).

Pendiente: revisión del reviewer (el líder la lanza).
