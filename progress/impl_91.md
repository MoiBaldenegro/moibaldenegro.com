# Implementación — feature 91 hero-card-registry

Spec: `specs/91_hero-card-registry/requirements.md` + `design.md`. Análisis: `progress/research/hero-extensible-cards.md`.

## Rojo (REQ-91-09)

Test escrito antes de crear el módulo de dominio, el despachador o tocar `new-hero.astro`: `tests/hero-card-registry.test.mjs` (REQ-91-01..08).

`node --test tests/hero-card-registry.test.mjs`:

```
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/Moises/Desktop/moibaldenegro.com/src/domain/hero-card-registry.ts'
✖ tests\hero-card-registry.test.mjs (45.8114ms)
ℹ tests 1
ℹ pass 0
ℹ fail 1
```

## Cambios

- `src/domain/hero-card-registry.ts` (nuevo, 23 líneas): `HeroCardKindError` (mensaje en español con el kind) y `pickCardComponent<T>(registry, kind)`, que devuelve la entrada del registro o lanza si no existe (REQ-91-01/02).
- `src/components/hero-cards/hero-grid-card.astro` (nuevo, 16 líneas): prop `card: HeroGridCard`, registro literal `const registry = { icon: HeroCard }` en el frontmatter, `pickCardComponent(registry, card.kind)` y `<Component card={card} />` sin envoltorio (el componente elegido es el ítem directo del grid, Decisión 3). Sin `<style>` ni `style=` (REQ-91-03/04).
- `src/components/new-hero/new-hero.astro` (58 líneas): importa `HeroGridCard` y la usa en el map con `card={card}`; sin condicionales por tipo (REQ-91-05). Diff de 2 líneas.
- `src/components/hero-card.astro`, `src/styles/hero-section.css`, `src/styles/hero-card.css`, `src/data/hero-cards.json`: sin cambios (REQ-91-06/08).

Tests del nuevo archivo:
- REQ-91-01/02: con objetos simples (devuelve la entrada; kind ausente o `undefined` lanza `HeroCardKindError` con el kind en el mensaje).
- REQ-91-03/04/05/06: inspección de fuentes (tipos, import de `pickCardComponent` y `../hero-card.astro`, un único objeto literal con `icon: HeroCard`, `card={card}`, sin `card.kind` ni comparaciones en `new-hero.astro`).
- REQ-91-07: build real (`tests/helpers/astro-build.mjs`) y en `dist/client/index.html` los `data-color-token` de los `article.hero-card` del `.hero-grid` coinciden en orden con los 12 de `hero-cards.json`.
- REQ-91-08: aserción de la geometría de `.hero-grid` en sus tres breakpoints (12/95px, 6/minmax(140px), 1/minmax(190px)); el archivo no está modificado en git.

Notas:
- El archivo de test mide 101 líneas (los tests ya superan las 100 con precedente, ver impl_90); los archivos de `src/` quedan muy por debajo.
- Tipado: `card` (unión `HeroGridCard`) se pasa a un componente que tipa `HeroCard`; el proyecto no ejecuta `astro check` y en runtime el registro garantiza la correspondencia kind→componente. Con el JSON actual solo hay tarjetas `icon`.
- Sin cambio visual: el HTML de las 12 tarjetas es el mismo marcado de `hero-card.astro`.

## Verde (REQ-91-10)

- `node --test tests/hero-card-registry.test.mjs`: `ℹ tests 8 / ℹ pass 8 / ℹ fail 0`.
- `pnpm test`: `ℹ tests 954 / ℹ pass 954 / ℹ fail 0`.
- `./init.sh` (exit 0): formato ✔, tests al 100% ✔, build de producción ✔, «El entorno está perfecto. Podemos empezar a trabajar.»
