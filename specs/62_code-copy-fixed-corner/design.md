# Diseño — Botón de copiar fijo en la esquina del bloque de código con scroll horizontal (feature 62 code-copy-fixed-corner)

## Contexto visual

- Bloques de código (pre.astro-code de Shiki) del detalle de artículo con su botón Copiar.
- Estado actual: el botón es hijo absoluto del pre, que tiene overflow-x: auto (post.css); al desplazar horizontalmente un bloque largo el botón se va con el contenido y desaparece por la izquierda.
- Estado deseado: el botón queda siempre en la esquina superior derecha del bloque visible; el scroll horizontal sigue dentro del pre.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | #101018 | fondo del botón (sin cambios) |
| `--color-border` / `--color-border-strong` | rgba blancos | borde del botón (sin cambios) |
| `--color-accent` | #7d68ff | estado copiado (sin cambios) |
| `--radius-thumb` | 10px | radio del botón (sin cambios) |

## Decisiones y constraints

- Decisión 1: envoltorio div.code-block creado por code-copy.ts (el markdown y Shiki no se tocan); position: relative pasa del pre al envoltorio y el botón (top/right 8px) se ancla a él.
- Decisión 2: el envoltorio no añade márgenes ni fondo: margin, borde, radio y scroll siguen en el pre (post.css, article.css), así el aspecto sin scroll es idéntico.
- Decisión 3: idempotencia con dataset.copyReady del pre como hoy (ClientRouter re-ejecuta en astro:page-load).
- Los fakes de tests/code-copy-button.test.mjs (REQ-CC-02/03) se amplían con parentNode/insertBefore y sus aserciones pasan al envoltorio dentro de esta feature.
- Restricciones: sin dependencias, ≤100 líneas por archivo (code-copy.ts tiene 84), estilos en src/styles/code-copy.css, solo tokens.

## Alternativa descartada

- Alternativa considerada: position: sticky del botón dentro del pre.
- Motivo del descarte: el elemento sticky ocupa espacio en el flujo del pre, necesita float o márgenes negativos y no fija de forma fiable el top; el envoltorio es el patrón estándar.
