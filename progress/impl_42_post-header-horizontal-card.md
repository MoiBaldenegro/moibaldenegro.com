# Informe de implementación — feature 42 `post-header-horizontal-card`

> Fecha: 2026-08-14. Rol: implementer. Ciclo 34.
> Petición del humano sobre el header de los posts: "la imagen con el título,
> pon aquí la tarjeta como en horizontal, un diseño más atrevido". El header
> vertical (feature 39) pasa a una tarjeta HORIZONTAL con acentos de la
> identidad dark/glow, solo con tokens existentes.

## Alcance (según spec y design.md)

| Archivo | Cambio |
|---------|--------|
| `src/pages/posts/[id].astro` | +1 línea: `p.post__kicker` con `#{post.tags[0]}` dentro de `.post__hero-copy` ANTES de `h1.post__title` (REQ-42-03, design Decisión 2). El kicker es `<p>` (nunca `<div>`: no rompe el regex lazy de REQ-39-02). El resto del marcado intacto: orden DOM imagen → copia, pares `transition:name` en el primer img y el primer h1 (REQ-42-08). Página final: 53 líneas (≤100 ✓), sin `<style>` ni `style=` (convención). Cero cambios de frontmatter: `post.tags[0]` sale directo de la entidad. |
| `src/styles/post-header.css` | Reescrito (99 líneas, ≤100 ✓, REQ-42-09): `.post__hero` pasa a `display: grid` con `grid-template-columns: 1fr 1fr`, `align-items: center` y `gap: 32px` (REQ-42-01/02), conservando el degradado hero (primer layer con `var(--color-hero-*)` — contrato REQ-39-02/03) + wash radial de acento como segundo layer (`color-mix` con `var(--color-accent) 22%`), `var(--radius-card)`, `var(--color-border-strong)`, `var(--shadow-card)` y el glow de `::before` (REQ-42-01). `::after` = acento inferior degradado con `var(--color-accent)` (REQ-42-06). `.post__hero .post__image` con `margin: 0`, `aspect-ratio: 4 / 3` y `box-shadow: 0 0 48px var(--color-glow)` (REQ-42-05); la base `.post__image` de post.css NO se toca (REQ-26-04: el grid acota el ancho). `.post__kicker` = píldora de acento: `color`/`border` con `var(--color-accent)` y `background: color-mix(...)` al 12% (REQ-42-03). `.post__hero .post__title` = `clamp(2.2rem, 4.5vw, 3.6rem)` + `text-wrap: balance` + `text-shadow` con glow (REQ-42-04). `.post__meta` conservada íntegra (REQ-39-04). Media query 768px: apilado `grid-template-columns: 1fr`, imagen 16:9 arriba, kicker/meta ajustados (REQ-42-07, conserva `.post__hero` → REQ-39-07). Sin hex/rgba sueltos (ni en comentarios: audit-design-tokens no los descarta) y TODA declaración de color/borde/sombra con `var(--` (guard REQ-39-09). |
| `tests/post-header-horizontal.test.mjs` | NUEVO (test-first, 12 tests, REQ-42-01..09 + convenciones). Verifica marcado (kicker con `{post.tags[0]}` antes del h1, orden imagen → copia), pares de transición (REQ-42-08), grid de 2 columnas + contrato del panel (REQ-42-01/02), acento `::after` (REQ-42-06), imagen 4:3 + glow + base post.css intacta (REQ-42-05/26-04), kicker con acento y color-mix (REQ-42-03), título clamp (REQ-42-04), MQ 768px apilada (REQ-42-07), ≤100 líneas / sin hex-rgba / tokens.css 87 líneas / guard var() / página ≤100 líneas sin estilos (REQ-42-09, REQ-39-09). |
| `src/styles/post.css`, `tokens.css`, tests existentes | SIN cambios (verificado: REQ-39-01..09, REQ-26-02..07, REQ-24-03/05, REQ-40/41, design-tokens pasan sin modificarse). Orden de imports intacto (REQ-40-01). |

## Ciclo rojo (test-first, evidencia)

Antes de tocar `[id].astro` ni post-header.css, se escribió
`tests/post-header-horizontal.test.mjs` contra la spec y se ejecutó:

```
$ node --test tests/post-header-horizontal.test.mjs
not ok 1 - REQ-42-01/03: el marcado declara la tarjeta horizontal con kicker antes del título
not ok 3 - REQ-42-01/02: .post__hero declara grid de dos columnas con gap conservando el contrato del panel
not ok 4 - REQ-42-06: .post__hero::after declara el acento inferior con var(--color-accent)
not ok 5 - REQ-42-05: .post__hero .post__image declara 4:3, margin 0 y glow; la regla base de post.css permanece intacta
not ok 6 - REQ-42-03: .post__kicker usa var(--color-accent) en color y borde con fondo color-mix
not ok 7 - REQ-42-04: .post__hero .post__title escala con clamp(2.2rem, 4.5vw, 3.6rem)
not ok 8 - REQ-42-07: la media query de 768px apila la tarjeta en una columna
ok 2 - REQ-42-08: el primer h1 y el primer img conservan los pares de transición
ok 9 - REQ-42-09: post-header.css ≤100 líneas y sin hex/rgba sueltos
ok 10 - REQ-42-09: tokens.css conserva 87 líneas sin tokens nuevos
ok 11 - REQ-42-09/REQ-39-09: toda declaración de color/borde/sombra de post-header.css usa var()
ok 12 - Convención: [id].astro sigue ≤100 líneas y sin estilos embebidos
# tests 12
# pass 5
# fail 7
```

El rojo queda acotado a REQ-42-01..07 (lo que la feature implementa); los
contratos conservados (REQ-42-08/09, guard var() y convenciones) pasan ya en
rojo, confirmando que los tests existentes no se romperían.

## Ciclo verde (evidencia)

Tras implementar el marcado (kicker) y la hoja:

1. Test de la feature — `node --test tests/post-header-horizontal.test.mjs`:

```
# tests 12
# pass 12
# fail 0
```

2. Suite completa — `node --test "tests/**/*.test.mjs"`:

```
# tests 258
# pass 258
# fail 0
```

(246 de la suite previa + 12 nuevos; todos los tests existentes — post-header
REQ-39, post-page-styles REQ-26, view-transitions REQ-24, post-readability
REQ-40/41, design-tokens — pasan SIN modificaciones.)

3. Auditoría de tokens — `node scripts/audit-design-tokens.mjs`:

```
AUDIT ✔ ningún color fuera de tokens.css en src/styles
```

4. Formato — `node scripts/check-format.mjs`:

```
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos
```

5. Harness completo — `./init.sh`:

```
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Verificación en el build (dist/)

Página renderizada `dist/client/posts/00-agilismo/index.html`:

- **Tarjeta horizontal (desktop)**: `.post__hero{...grid-template-columns:1fr 1fr;align-items:center;gap:32px;...background:linear-gradient(160deg, var(--color-hero-top)...), radial-gradient(circle at 78% 0%, color-mix(in srgb, var(--color-accent) 22%, transparent)...)...}` — imagen col 1, copia col 2.
- **Kicker**: `<div class="post__hero-copy"><p class="post__kicker">#arquitectura</p><h1 ... class="post__title">...` — píldora con la primera tag ANTES del título (también en `dist/client/posts/01-diseño-detallado/index.html`).
- **Imagen 4:3 con halo**: `.post__hero .post__image{aspect-ratio:4/3;border-color:var(--color-border-strong);box-shadow:0 0 48px var(--color-glow);margin:0}`.
- **Título gigante**: `.post__hero .post__title{...font-size:clamp(2.2rem,4.5vw,3.6rem);...text-shadow:0 0 32px var(--color-glow);text-wrap:balance}`.
- **Acento inferior**: `.post__hero:after{...background:linear-gradient(90deg, var(--color-accent), transparent 70%);...height:3px;...bottom:0;left:0;right:0}`.
- **Apilado móvil** (media query del build `@media (width<=768px)`): `...post__hero{grid-template-columns:1fr;padding:20px}.post__hero .post__image{aspect-ratio:16/9}.post__kicker{padding:3px 10px;font-size:.75rem}.post__meta{padding:4px 10px}` — imagen 16:9 arriba, copia debajo.
- Base `.post__image` de post.css intacta en el build (width 100%, 16/9, REQ-26-04).

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature 42) | REQ | Evidencia |
|---|---|---|
| Marcado: img antes de copia, kicker `{post.tags[0]}` antes de h1, ≤100 líneas, sin estilos | REQ-42-01/03/08 | test 1 verde + build + [id].astro 53 líneas |
| Primer h1/img con pares; view-transitions sin modificar | REQ-42-08 | test 2 verde + suite 258/258 |
| `.post__hero` grid 2 columnas + gap + contrato panel + glow ::before | REQ-42-01/02 | test 3 verde |
| `::after` acento inferior con var(--color-accent) | REQ-42-06 | test 4 verde + build |
| `.post__hero .post__image` margin 0, 4/3, glow; base post.css intacta | REQ-42-05/26-04 | test 5 verde + build |
| `.post__kicker` accent color/border + color-mix; título clamp | REQ-42-03/04 | tests 6-7 verdes + build |
| MQ 768px apilada con `.post__hero` | REQ-42-07 / REQ-39-07 | test 8 verde + build (width<=768px) |
| ≤100 líneas, sin hex/rgba, tokens.css 87, guard var() | REQ-42-09 / REQ-39-09 | tests 9-11 verdes + audit + wc -l (99/87) |
| Test nuevo verde + existentes sin modificar + check-format + suite | acceptance 9 | suite 258/258 + FORMATO ✔ + init.sh |

## Estado del harness

- `feature_list.json`: feature 42 en `status: "in_progress"` (NO marcada done;
  se cerrará solo con `progress/review_42_*.md` APPROVED).
- `progress/current.md`: documentada la sesión (feature, plan, resultado).
- Sin dependencias nuevas, sin JS de runtime, sin tocar `dist/` a mano, sin
  modificar `post.css`, `tokens.css` ni ningún test existente.