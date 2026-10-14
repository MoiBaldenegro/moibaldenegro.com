# Review — feature 90

**Veredicto:** APPROVED

## Verificación

- Spec `specs/90_hero-card-kinds-domain/requirements.md` (sin design.md: no toca UI). Hay trazabilidad REQ -> acceptance (REQ-90-01..12 -> acceptance 1..5 de `feature_list.json`) y es coherente: cada acceptance cubre los REQ que cita.
- `depends_on: []`: no hay dependencias pendientes.
- `./init.sh`: exit 0. Formato, tests al 100 %, build y «El entorno está perfecto» en verde (ejecutado por el reviewer).
- Rojo/verde: `progress/impl_90.md` §Rojo documenta el `SyntaxError` por la falta del export `HERO_CARD_KINDS` y 3 fallos (pass 9 / fail 3) antes de tocar la entidad y el parser (REQ-90-11). §Verde documenta 21/21 en los dos tests de la feature, 946/946 en `pnpm test` y `./init.sh` con exit 0 (REQ-90-12).

## Cumplimiento por REQ

- REQ-90-01: `src/domain/entities/hero-card.ts:9-11` define `HERO_CARD_KINDS = ['icon', 'htb'] as const` y define `HeroCardKind` a partir de ese array.
- REQ-90-02: `HeroCard` conserva sus 9 campos readonly y añade `readonly kind: 'icon'` (línea 16).
- REQ-90-03: `HeroRichCard` (líneas 27-34) declara 6 campos readonly, con `kind: Exclude<HeroCardKind, 'icon'>`.
- REQ-90-04: `getCards(): HeroGridCard[]` (`hero-cards-repository.ts:32`). El parser usa `data.map`, así que se mantiene el orden del JSON.
- REQ-90-05: `readKind` (`hero-cards-parse.ts:31-32`) devuelve `icon` cuando falta el campo kind.
- REQ-90-06: un kind fuera del catálogo lanza un error con el índice y el valor (`hero-cards-parse.ts:34-37`).
- REQ-90-07: `parseRichCard` comprueba los 5 campos de texto con `expectString`, y el mensaje incluye el índice y el campo.
- REQ-90-08: el parser tiene 94 líneas y el repositorio 49. `HeroCardsDataError` se re-exporta, así que los importadores existentes no cambian.
- REQ-90-09: `git diff` no muestra cambios en `src/data/`. El test comprueba que hay 12 tarjetas y que ninguna lleva `kind`.
- REQ-90-10: el fixture `EXPECTED_CARDS` lleva `kind: 'icon'` en las 12 entradas. El ajuste de la expectativa REQ-31-02 (`{ ...injectedCard, kind: 'icon' }`) sigue la misma regla (precedente REQ-43-06) y es correcto.

## Checkpoints
- Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (no se toca UI)
- Sin lógica en archivos de UI: [x]
- Ningún componente lee JSON directamente: [x] (la lectura sigue en el repositorio)
- Tokens sin valores hardcodeados: [x] (no aplica, no hay cambios de CSS)
- Archivos <= 100 líneas: [x] (src: 38 / 94 / 49). `tests/hero-card-kinds-domain.test.mjs` tiene 128 líneas, con el precedente de 61 archivos de `tests/` que ya pasan de 100.
- Sin dependencias externas: [x]
- `src/data/*.json` válido y tipado por entidades: [x]
- Repositorios con errores nombrados, sin fallos silenciosos: [x]
- `./init.sh` en verde: [x]
- Página correcta en desktop y móvil: [x] (sin cambio visual: el JSON no cambia y el build sale en verde; no hay inspección en navegador)
- `feature_list.json` con la tarea en `done`: [ ]  ← La feature sigue en `in_progress`. Este cierre lo hace el líder después de este APPROVED; no bloquea.
- `progress/current.md` documenta la sesión: [x]
- Sin temporales, debug ni TODOs sin contexto: [x]

## Observaciones (no bloquean)

1. `src/components/new-hero/new-hero.astro:54` pasa cada `HeroGridCard` a `hero-card.astro`, cuya prop está tipada como `card: HeroCard` (`src/components/hero-card.astro:6`). En tiempo de ejecución no hay problema, porque las 12 tarjetas son de icono. A nivel de tipos sí hay un hueco, y el arnés no lo detecta porque no ejecuta `astro check`. Lo resuelve la feature 91 (despachador `hero-grid-card.astro`), que está fuera del alcance de esta. Ya está anotado en `progress/impl_90.md` §Notas.

## Cambios requeridos (si aplica)

Ninguno.
