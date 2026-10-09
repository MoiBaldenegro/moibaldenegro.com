# Informe de implementación — feature 54 code-copy-status

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/54_code-copy-status/requirements.md` + `design.md`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/code-copy/code-copy.astro` | Una única región `<p class="visually-hidden" role="status" aria-live="polite" data-code-copy-status></p>`, compartida por todos los bloques de la página (REQ-54-01). |
| `src/components/code-copy/code-copy.ts` (81 líneas) | Tras copiar: `announce('Código copiado')`; si falla el portapapeles (y el fallback `execCommand`): `announce('No se pudo copiar el código')` y no se marca como copiado (REQ-54-02/03). En éxito el botón añade `is-copied` y el texto visible `<span class="code-copy__done">Copiado</span>` junto al icono durante `DONE_MS = 2000` (antes 1500 y sin texto) (REQ-54-04). Se conserva el `aria-label` «¡Copiado!» del contrato previo. |
| `src/styles/code-copy.css` (59 líneas) | `.code-copy__done` con `var(--color-accent)` y `var(--font-sans)` (REQ-54-05, design). |
| `tests/code-copy-status.test.mjs` (NUEVO) | Región única, mensajes de éxito y error con document/clipboard simulados, texto visible con `mock.timers` (presente a los 1999 ms, retirado a los 2000 ms) y estilos con tokens. |
| `tests/code-copy-button.test.mjs` | El fake de `document` añade `querySelector: () => null` (el controlador busca la región de estado), con nota del ajuste (precedente REQ-43-06). |

## Ciclo rojo/verde (REQ-54-06)

Rojo: ✖ 54-01 · ✖ 54-02 · ✖ 54-03 · ✖ 54-04 · ✖ 54-05 · ✔ 54-07 (`ℹ pass 1 / ℹ fail 5`).
Tras implementar falló REQ-CC-02 (fake sin `querySelector`) y se ajustó el fake.
Verde — `pnpm test` 722/722 (×2); `./init.sh` verde.

## Fuera de alcance

- audit_a11y.md M5 también señalaba que el botón se desplaza con el scroll horizontal del `pre`; no
  está en los REQ de esta feature y queda anotado.

## Ronda 2 — cambios requeridos de progress/review_54.md

1. **«Copiado» se salía del botón de 30×30 px.** Test nuevo primero, en rojo:
   «REQ-54-04 (ronda 2): el botón copiado crece con el texto…» (✖ «el botón copiado conserva el ancho
   fijo de 30px»). Arreglo en `code-copy.css`: `.code-copy.is-copied { width: auto; padding: 0
   var(--gap-card); white-space: nowrap; }`; como el botón está anclado con `right: 8px`, crece hacia
   la izquierda. Test en verde.
2. **Comprobación visual en navegador** (Chrome headless + DevTools Protocol contra `astro preview`,
   post `/posts/03-principios-solid/`; el estado copiado se aplica con el mismo marcado que pone
   `code-copy.ts`, porque el portapapeles real no está disponible en headless):

| Viewport | Botón en reposo | Botón copiado | Dentro del `pre` | Desborde interno |
|---|---|---|---|---|
| 1280×800 | 30×30, x 1199–1229 | **68×30**, x 1162–1229 | sí | no |
| 375×700 (≤ 768 px) | 30×30, x 327–357 | **68×30**, x 289–357 | sí | no |

   En la captura móvil se ve «⧉ Copiado» dentro del botón con borde de acento, sin tapar el código.
3. Observación no bloqueante aplicada: la región de estado se vacía antes de escribir, para que una
   segunda copia seguida se vuelva a anunciar.

`pnpm test` 723/723 (×2); `./init.sh` verde.
