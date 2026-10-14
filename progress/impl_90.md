# Implementación — feature 90 hero-card-kinds-domain

Spec: `specs/90_hero-card-kinds-domain/requirements.md` (sin design.md: no toca UI). Análisis: `progress/research/hero-extensible-cards.md`.

## Rojo (REQ-90-11)

Tests escritos antes de tocar la entidad o el parser: `tests/hero-card-kinds-domain.test.mjs` (nuevo, REQ-90-01..09) y el fixture `EXPECTED_CARDS` de `tests/hero-cards-repository.test.mjs` con `kind: 'icon'` (REQ-90-10).

`node --test tests/hero-card-kinds-domain.test.mjs tests/hero-cards-repository.test.mjs`:

```
SyntaxError: The requested module '../src/domain/entities/hero-card.ts' does not provide an export named 'HERO_CARD_KINDS'
✖ tests\hero-card-kinds-domain.test.mjs
✖ REQ-31-02/REQ-31-05: el loader por defecto entrega las 12 tarjetas reales
  AssertionError [ERR_ASSERTION]: las tarjetas entregadas no coinciden
✖ REQ-31-02: el repositorio lee a través del loader inyectable, no del filesystem
ℹ tests 12
ℹ pass 9
ℹ fail 3
```

## Cambios

- `src/domain/entities/hero-card.ts` (38 líneas): `HERO_CARD_KINDS = ['icon', 'htb'] as const`, `HeroCardKind = (typeof HERO_CARD_KINDS)[number]`, `HeroCard` conserva sus 9 campos readonly y gana `readonly kind: 'icon'`, nueva `HeroRichCard` (id, kind `Exclude<HeroCardKind, 'icon'>`, title, colorToken, gridColumn, gridRow) y unión `HeroGridCard`.
- `src/domain/repositories/hero-cards-parse.ts` (nuevo, 94 líneas): `HeroCardsDataError` y `parseHeroCards` (kind ausente = icon; kind fuera del catálogo lanza con índice y valor; campo de texto ausente lanza con índice y nombre del campo). Patrón `about-parse.ts`.
- `src/domain/repositories/hero-cards-repository.ts` (49 líneas): `getCards(): HeroGridCard[]` delega en el parser; re-exporta `HeroCardsDataError` (los importadores existentes no cambian).
- `tests/hero-cards-repository.test.mjs`: fixture `EXPECTED_CARDS` con `kind: 'icon'` y, por la misma regla (el test sigue al dato entregado, precedente REQ-43-06), la expectativa del test REQ-31-02 del loader inyectado pasa a `{ ...injectedCard, kind: 'icon' }`; la entrada inyectada no cambia.
- `src/data/hero-cards.json`: sin cambios (REQ-90-09).

Notas:
- `new-hero.astro` sigue pasando cada tarjeta a `hero-card.astro` (tipado `HeroCard`); con el JSON actual todas son de icono. El despachador por tipo es la feature 91 (fuera de scope).
- El test nuevo mide 128 líneas; los archivos de `tests/` ya superan las 100 líneas con precedente (p. ej. `search-landing-live-transition.test.mjs`, 394). Los archivos de `src/` quedan todos por debajo de 100.

## Verde (REQ-90-12)

- `node --test tests/hero-card-kinds-domain.test.mjs tests/hero-cards-repository.test.mjs`: `ℹ tests 21 / ℹ pass 21 / ℹ fail 0`.
- `pnpm test`: `ℹ tests 946 / ℹ pass 946 / ℹ fail 0`.
- `./init.sh` (exit 0): formato ✔, tests al 100% ✔, build de producción ✔, «El entorno está perfecto».
