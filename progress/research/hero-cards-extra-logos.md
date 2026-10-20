# Análisis — feature 103 hero-cards-extra-logos

Fecha: 2026-10-19. Autor: spec_author. Spec: `specs/103_hero-cards-extra-logos/requirements.md` y `design.md`.

## Petición humana (literal, 2026-10-19)

«Haremos unas modificaciones a las cards normales, es mas no son modificaciones son agregados, ahora hay 1 logo con el efecto del hover lo normal esta bien, pero vamos a poner para que puedan recibir 3 logos el que ya esta es obligatorio, pero recibira 2 mas uno, como pequeño icono que se colocara en la esquina superior derecha, y un tercero que se pondra como fondo hasta abajo y con mucha opacidad estos seran standares, y opcionales si no estan simplemente no se muestran y siguen como hasta hoy, puedes probar con la de claude code que tenemos 3 sprites, el claude code, claude y anthropic, como principal tal cual esta, el de claude en pequeño en la esquina y como fondo el de anthropic».

## Qué es

Las cards de icono del hero (`kind` icon: tech y social; no las ricas tipo HTB) aceptan dos logos opcionales más, además del icono principal obligatorio (que no cambia, hover incluido):

1. `cornerIcon`: icono pequeño en la esquina superior derecha.
2. `backgroundIcon`: logo de fondo en la franja inferior, con opacidad muy baja.

Ambos son decorativos (`aria-hidden`), estándar (mismo tamaño y posición en todas las cards) y opcionales: si faltan, la card queda igual que hoy. Prueba: CLAUDE CODE (principal `claude-code` sin cambios, esquina `claude`, fondo `anthropic-wordmark`). GITHUB lleva `github-wordmark` de fondo (decisión del spec_author, revisable).

## Qué toca

| Capa | Archivo | Estado actual | Cambio |
|------|---------|---------------|--------|
| Datos | `src/data/hero-cards.json` | 15 entradas, una línea por card | `cornerIcon`/`backgroundIcon` solo en claude-code y github |
| Entidad | `src/domain/entities/hero-card.ts` (43 líneas) | `HeroCard` readonly | 2 campos opcionales readonly `?: string` |
| Parse | `src/domain/repositories/hero-cards-parse.ts` (94 líneas) | `parseIconCard` sin opcionales de texto | validar prefijo `/assets/svg/sprite.svg#` + id no vacío; omitir la clave si falta. Riesgo: pasa de 100 líneas; compactar o sacar `expectType/expectString/expectNumber` a un módulo hermano |
| Componente | `src/components/hero-card.astro` (24 líneas) | header + `.card-icon` | render condicional de `.card-backdrop` (antes de `.card-icon`) y `.card-corner` (después) |
| Estilos | `src/styles/hero-card.css` (99 líneas) | sin margen | NO se toca; hoja nueva `src/styles/hero-card-accents.css` importada por `hero-card.astro` |
| Tokens | `src/styles/tokens.css` (99 líneas) | sin margen | NO se toca: la opacidad es una custom property local `--card-backdrop-opacity` (precedente `--icon-scale`/`--icon-width`); la opacidad no es un grupo de tokens de `docs/architecture.md` (colores, espaciados, radios, sombras, tipografías) |
| Sprite | `public/assets/svg/sprite.svg` | cambio del humano sin commitear: añade `github-wordmark` (viewBox 249.1x67.5, fill #fff) y `anthropic-wordmark` (182x24, fill #ffff) | NO se toca (es del humano) |

Symbols usados: `claude-code` (24x24, #D97757), `claude` (24x24, #D97757), `anthropic-wordmark`, `github` (blanco), `github-wordmark`. Todos existen.

## Patrón de validación del sprite

El parse no valida hoy que el `icon` exista en el sprite (el repositorio se ejecuta en workerd y no lee `public/`). La validación de existencia se hace en test (precedente `tests/hero-cards-unique-tech.test.mjs`, `SPRITE = '/assets/svg/sprite.svg#'`): REQ-103-05 la exige en el test nuevo leyendo el sprite con `node:fs`. El parse solo valida forma (REQ-103-03).

## Riesgos y trabas

1. **REQ-101-17 rompe**: `tests/hero-cards-polish.test.mjs:86` exige `git diff 0c786e4 -- src/data/hero-cards.json` vacío. Ajuste necesario (precedente REQ-43-06): comparar el JSON parseado sin `cornerIcon`/`backgroundIcon` contra `git show 0c786e4:src/data/hero-cards.json`, manteniendo el diff vacío para `hero-grid-layout.ts` y `hero-grid-template.ts`. El archivo tiene 100 líneas: el ajuste no puede sumar líneas netas (REQ-103-27).
2. **deepEqual de fixtures** (`tests/hero-card-kinds-domain.test.mjs`, `tests/hero-cards-repository.test.mjs:75`): si el parse añadiese `cornerIcon: undefined`, el deepEqual de fixtures sin esos campos cambia de forma; por eso REQ-103-02 exige omitir la clave. `REQ-31-02` (expected = JSON con spread) sigue en verde si el parse copia los campos tal cual.
3. **Choque esquina/título**: CLAUDE CODE y GITHUB son tiles 2x2 (`specs/99_hero-os-panel-mosaic/design.md`), unos 196 px de ancho a 1280. «CLAUDE CODE» a 0,95rem/0,08em mide unos 120 px; con el header reservado (`right` 46 px) queda 128 px útil: cabe justo. Si el título parte en dos líneas no hay solape (se acepta, sin elipsis). Lo mide la CDP (REQ-103-22).
4. **Hojas que miran los tests de la 101**: `heroSheets()` solo incluye `hero-card.css` y `hero-card-icons.css`. La hoja nueva se llama `hero-card-accents.css` para no entrar en las reglas de icono de la 101 ni en REQ-97-19; tiene sus propias guardas (REQ-103-12/13).
5. **Hover**: el `filter: contrast(1.4)` de `.hero-card:hover` afecta a toda la card, logos extra incluidos; se acepta (el fondo se ve algo más en hover). Los logos extra no tienen transform ni transición propia.
6. Sin JS, sin style inline, sin dependencias, sin cambios de mosaico (`hero-grid-layout.ts`, `hero-grid-template.ts`).

## Valores por defecto (revisables por el humano, no bloquean)

- Icono de esquina: 22x22 px a top 16 px / right 16 px en >= 1201 px; 18x18 px a top 14 px / right 14 px en <= 1200 px. Header reservado: `right` 46 px (>= 1201) y 40 px (<= 1200).
- Logo de fondo: franja `left`/`right` 22 px (14 px en <= 1200), `bottom` var(--gap-card), alto 40 px (28 px en <= 1200), svg al 100 % de la franja (preserveAspectRatio por defecto, centrado), `--card-backdrop-opacity: 0.1`.
- GITHUB con `github-wordmark` de fondo y sin icono de esquina (mismo tratamiento que Anthropic: símbolo principal + wordmark de fondo); si el humano no lo quiere, se borra el campo y la card vuelve a ser igual que hoy.
- Logos extra estáticos en hover.

## Descomposición

Complejidad media (datos + UI), pero el entregable es atómico y cada parte por separado no es observable (los campos sin render no tienen efecto, el render sin campos no se ve): **1 feature** (103). Cabe en <= 100 líneas por archivo con la hoja nueva y la compactación del parse.

## Ajuste por la revisión 1 (CHANGES_REQUESTED, 2026-10-19)

- Hallazgo del reviewer (`progress/review_hero-cards-extra-logos.md`): el rectángulo del icono principal cubre el wordmark de fondo el 51-84 % (CLAUDE CODE) y el 54-91 % (GITHUB) a 800/1024/1280/1600 px. A 1280 px solo se lee «AN».
- Causa: `.card-backdrop` estaba en z-index 0 y antes de `.card-icon` en el DOM, así que se pintaba debajo. En escritorio, el icono principal (`--icon-width` de 115 px a escala 5, `hero-card.css:45-48`) cubre casi toda la tile 2x2.
- Opciones: (a) subir el z-index del fondo por encima del icono; (b) mover la franja al centro o arriba, o alinearla a la izquierda; (c) reducir el icono. (c) obliga a tocar `hero-card.css`, que REQ-103-29 prohíbe. (b) no garantiza que el fondo quede libre: el icono cubre casi toda la card y la franja se acercaría al título. **Se elige (a)**: `.card-backdrop` a z-index 2, entre el icono principal (sin z-index) y la esquina (3) y el header (4). Franja, tamaño, alineación, opacidad 0.1 y orden en el DOM no cambian.
- Requisitos nuevos o ajustados: REQ-103-31 (z-index 2, verificable al parsear el CSS; en rojo hoy, que está a 0), REQ-103-32 (CDP, rejilla 20x5 con `elementsFromPoint`: el fondo sale como capa superior en >= 60 % de los puntos a los cinco anchos en CLAUDE CODE y GITHUB) y REQ-103-33 (contraste AA del título frente al color compuesto). REQ-103-24 pasa a exigir solape 0 sin alternativa. REQ-103-26 exige regenerar las capturas.
- Riesgo: a 0.1 de opacidad, sobre las zonas claras del pixel art el wordmark sigue tenue. Si el humano quiere que se lea más, puede subir `--card-backdrop-opacity`. A 0.16 el título seguiría por encima de 7:1 sobre #5C2A1C.
- Valores por defecto revisables: z-index 2 y umbral de visibilidad >= 60 %.
