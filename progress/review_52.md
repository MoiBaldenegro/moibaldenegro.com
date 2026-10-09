# Review — feature 52

**Veredicto:** APPROVED

Feature `contrast-badge-kicker`. Spec: `specs/52_contrast-badge-kicker/requirements.md` + `design.md`.
Implementer: el líder, en ese rol por autorización humana explícita. Se revisó con el mismo rigor de siempre.

## Verificación ejecutada por el revisor

- `./init.sh`: exit 0. Entorno, formato, tests al 100 % y build verdes.
- `pnpm test`: exit 0. `tests 710 · pass 710 · fail 0`.
- Contrastes recalculados por mi cuenta con la luminancia relativa de WCAG 2.2 (umbral sRGB 0.04045):
  - #ffffff sobre `--color-verified` #0a6f9e: **5.555:1**. Requisito ≥ 4.5 (REQ-52-02). Antes, con #17b8ff: 2.249:1.
  - #0a6f9e frente a `--color-username-bg` #081a28: **3.180:1**. Requisito ≥ 3 (REQ-52-03).
  - `--color-accent-hover` #9a89ff sobre `--color-hero-top` #25144f: **5.726:1**. Requisito ≥ 4.5 (REQ-52-05). Antes, con accent #7d68ff: 4.100:1.
  - Coinciden con la tabla de `progress/impl_52.md`.
- Dependencias: `depends_on: [36]`. La feature 36 está en `done`.

## Trazabilidad REQ

- REQ-52-01: [x] `src/components/new-hero/new-hero.astro:40` usa `<span aria-hidden="true">✓</span><span class="visually-hidden">Verificado</span>`. La clase `.visually-hidden` es la utilidad global de `src/styles/layout.css:79` (feature 36).
- REQ-52-02 / 03: [x] `src/styles/tokens.css:61` usa `--color-verified: #0a6f9e`, el valor del design. `.verified` en `profile-card.css:42-49` pinta el glifo con `var(--color-text)`.
- REQ-52-04: [x] `src/styles/post-header.css:62` usa `color: var(--color-accent-hover)`. El borde y el color-mix siguen con `--color-accent`, como pide el design.
- REQ-52-05: [x] Ver los cálculos de arriba.
- REQ-52-06: [x] `progress/impl_52.md` documenta el rojo real (pass 3 / fail 3: fallan 52-01, 52-02 y 52-04) antes de tocar producción. También registra el arreglo previo del lector de tokens, que no cuenta como rojo válido. Después, verde con 710/710.
- REQ-52-07: [x] tokens.css tiene 95 líneas, new-hero.astro 59, post-header.css 99 y el test nuevo 56. `tests/post-header-horizontal.test.mjs` tiene 250 líneas, pero ya tenía 245 en HEAD. Es un test histórico ya sobre el límite, y la feature solo ajusta la aserción de REQ-42-03 siguiendo el precedente REQ-43-06.
- REQ-52-08: [x] `./init.sh` y `pnpm test` en verde.

Nota sobre el diff: los cambios de `new-hero.astro` (`<main>` pasa a `<div>`, width/height/fetchpriority) y de `tokens.css` (`--header-height`) son de otras features ya aprobadas. No se re-revisan.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en .astro): [x]
- C2 (sin lógica en la UI): [x] La insignia solo añade marcado.
- C3 (datos vía repositorio): [x] Sin cambios.
- C4 (solo tokens, sin valores sueltos): [x] El hex nuevo vive en tokens.css y post-header.css usa `var()`.
- C5 (≤100 líneas): [x] Los archivos de producción tocados cumplen. Lo del test histórico se explica en REQ-52-07.
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` verde): [x]
- C8 (revisión visual desktop/móvil): [ ] No la ha verificado el revisor; requiere navegador. No bloquea porque los requisitos se verifican de forma estática.
- C9 (feature_list / progress): fuera del alcance de esta revisión por instrucción del líder.
- C10 (sin temporales, debug ni TODOs): [x]

## Observaciones no bloqueantes
1. `tests/post-header-horizontal.test.mjs:154`: el título del test sigue diciendo «usa var(--color-accent) en color y borde», pero la aserción ahora exige `--color-accent-hover` para el texto. Conviene actualizar el título en una próxima feature que toque ese archivo.
2. `tests/contrast-badge-kicker.test.mjs:1-3`: la cabecera dice «REQ-52-01..07», pero no hay test de REQ-52-06. Es correcto, porque es un requisito de proceso que se verifica en impl_52.md, pero se podría aclarar en el comentario.

## Cambios requeridos (si aplica)
Ninguno.
