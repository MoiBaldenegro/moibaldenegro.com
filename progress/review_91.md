# Review — feature 91

**Veredicto:** APPROVED

Feature 91 hero-card-registry. Spec: `specs/91_hero-card-registry/requirements.md` + `design.md`. Informe: `progress/impl_91.md`. Dependencia: 90 está en `done` (`depends_on: [90]`).

## Pregunta de revisión (test-first)

- Rojo: `progress/impl_91.md` §Rojo registra `tests/hero-card-registry.test.mjs` en rojo (`ERR_MODULE_NOT_FOUND` de `src/domain/hero-card-registry.ts`) antes de crear el módulo, el despachador o tocar `new-hero.astro` (REQ-91-09).
- Verde: `node --test` 8/8, `pnpm test` 954/954 y `./init.sh` exit 0. Lo he comprobado al volver a ejecutar `./init.sh`: entorno, formato, tests al 100 % y build de producción en verde (REQ-91-10).

## Trazabilidad REQ / acceptance / código

- REQ-91-01/02: `src/domain/hero-card-registry.ts:16-23` `pickCardComponent<T>` devuelve `registry[kind]`; si es `undefined`, lanza `HeroCardKindError` (`:8-13`, `name` fijado y el kind en el mensaje). El test usa objetos simples y cubre la entrada ausente, el registro vacío y la clave presente con valor `undefined`.
- REQ-91-03/04: `src/components/hero-cards/hero-grid-card.astro` (16 líneas) tiene `card: HeroGridCard`, un único literal `const registry = { icon: HeroCard }`, `pickCardComponent(registry, card.kind)` y `<Component card={card} />`, sin `<style>` ni `style=`.
- REQ-91-05: el diff de `src/components/new-hero/new-hero.astro` toca solo 2 líneas (import y `<HeroGridCard card={card} />` en el map). No hay `card.kind` ni comparaciones por tipo.
- REQ-91-06: `src/components/hero-card.astro` no cambia (`git diff` vacío). Conserva `article.hero-card` con `data-color-token={card.colorToken}` y `card: HeroCard`.
- REQ-91-07: test de build sobre `dist/client/index.html`. Lo he comprobado a mano: los `article` son hijos directos de `.hero-grid` (tras el profile card), sin envoltorio ni `astro-island`. Se cumple la Decisión 3 y no hay regresión visual ni de accesibilidad: el marcado es el mismo, con `svg aria-hidden="true" focusable="false"`.
- REQ-91-08: `src/styles/hero-section.css`, `hero-card.css` y `src/data/hero-cards.json` no tienen diff. El test fija la geometría en los 3 breakpoints.
- Extensibilidad: con la receta del design.md, un tipo nuevo solo exige una entrada en el registro de `hero-grid-card.astro`. `new-hero.astro` no se toca.

## Checkpoints
- C1 (estilos en `src/styles`, sin `<style>`): [x]
- C2 (frontmatter solo imports y paso de datos; la lógica está en `src/domain/hero-card-registry.ts`): [x]
- C3 (datos vía repositorio): [x] (`new-hero.astro` sigue usando `HeroCardsRepository`)
- C4 (tokens, sin valores hardcodeados): [x] (no hay CSS nuevo)
- C5 (<= 100 líneas): [x]. Los archivos de src tienen 23, 16 y 58 líneas. `tests/hero-card-registry.test.mjs` tiene 101 líneas; hay precedente aceptado en la review de la 90 (muchos archivos de `tests/` pasan de 100).
- C6 (sin dependencias externas): [x]
- C7 (JSON válido y tipado): [x]
- C8 (errores nombrados `*Error`): [x] (`HeroCardKindError`)
- C9 (`./init.sh` verde): [x]
- C10 (vista desktop/móvil en navegador): [ ]. Sin inspección visual en navegador. Mitigado: el HTML de build es idéntico en estructura y el CSS no cambia.
- C11 (feature en `done`): [ ]. Sigue en `in_progress`, como corresponde hasta el cierre por el líder tras este APPROVED.
- C12 (`progress/current.md` documenta la sesión): [x]
- C13 (sin temporales, debug ni TODOs): [x]

## Observaciones (no bloqueantes)
1. `hero-grid-card.astro:15` pasa `card: HeroGridCard` (unión) a `hero-card.astro`, que tipa `HeroCard`. El proyecto no ejecuta `astro check` y en runtime el registro garantiza la correspondencia. Está documentado en `impl_91.md`. Conviene tenerlo presente en la 92 al registrar `htb`.

## Cambios requeridos (si aplica)
Ninguno.
