# Informe de implementación — feature 50 youtube-embed-hardening

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/50_youtube-embed-hardening/requirements.md` (sin design.md).

## Cambios

| Archivo | Cambio |
|---|---|
| `src/content/posts/architecture/02-principios.md` (único iframe de los posts) | `src` → `https://www.youtube-nocookie.com/embed/DyDfgMOUjCI` (modo de privacidad mejorada) (REQ-50-01); `loading="lazy"` y `referrerpolicy="strict-origin-when-cross-origin"` (REQ-50-02); `allow` sin `autoplay` (REQ-50-03); `title` conservado (REQ-50-04). El contenedor ya fija `aspect-ratio: 16/9` (sin CLS). |
| `tests/youtube-embed-hardening.test.mjs` (NUEVO) | Recorre todos los `.md` de `src/content/posts`, extrae cada `<iframe` (multilínea) y verifica dominio, atributos, `allow` y `title`; guarda de que exista al menos un iframe. |

La CSP Report-Only de la feature 40 ya permitía `frame-src https://www.youtube-nocookie.com`.

## Límite de 100 líneas (REQ-50-06)

`02-principios.md` es contenido: pasa de 173 a 175 líneas (la etiqueta del iframe pasa de 6 a 8
líneas al añadir `loading` y `referrerpolicy`). El límite de `docs/architecture.md` se ha aplicado al código y no al
contenido markdown en las features que ya modificaron posts (39, 45); el test REQ-50-06 comprueba que
el bloque del iframe sigue siendo compacto (≤ 8 líneas).

## Ciclo rojo/verde (REQ-50-05)

La primera versión del helper `attr` del test perdió una barra invertida (`\s` en un template literal)
y REQ-50-03 pasaba vacío; se reescribió con `String.fromCharCode` antes de observar el rojo real:
✖ 50-01 · ✖ 50-02 · ✖ 50-03 · ✔ 50-04 (title ya presente) · ✔ 50-06 (`ℹ pass 3 / ℹ fail 3`).
Verde — 6/6; `pnpm test` 699/699 (×2); `./init.sh` verde. HTML real del post con el iframe endurecido.

## Ronda 2 — cambios requeridos de progress/review_50.md

1. El test REQ-50-06 se renombra a «el bloque del iframe sigue siendo compacto (como máximo 8 líneas)» y su comentario dice lo que pasó de verdad (6 → 8 líneas por los dos atributos nuevos) y por qué el límite de 100 líneas no aplica al markdown.
2. Este informe corrige la cifra: 02-principios.md pasa de 173 a 175 líneas.

`pnpm test` y `./init.sh` en verde tras el cambio.
