# Informe de implementación — feature 45 ascii-post-slugs

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/45_ascii-post-slugs/requirements.md` (sin design.md).

## Cambios

| Archivo | Cambio |
|---|---|
| `03-principios_solid.md`, `01-diseño_detallado.md`, `04-ciclo-de-vida-y-arquitectura.md` | Slugs `03-principios-solid`, `01-diseno-detallado`, `04-ciclo-de-vida-y-arquitectura` (REQ-45-01/02). |
| Todos los `.md` de `src/content/posts` | `next`/`related` actualizados a los slugs nuevos (REQ-45-03). |
| `05-diseno-arquitectonico-vs-diseno-detallado.md` | **Defecto preexistente**: `next: /posts/04-principios-solid` apuntaba a un slug inexistente (el botón «Siguiente» llevaba a la 404). Se corrige a `/posts/03-principios-solid`, el destino que indica su nombre. REQ-45-03 lo exige. |
| `astro.config.mjs` | `redirects` con `{ status: 301, destination }` desde `/posts/03-principios solid`, `/posts/01-diseño-detallado` y `/posts/02-ciclo-de-vida-y-arquitectura` (REQ-45-04). |
| `tests/ascii-post-slugs.test.mjs` (NUEVO) | Patrón de slug, los 3 slugs nuevos, next/related a slugs existentes, las 3 redirecciones y que ningún otro test cite los slugs antiguos. |
| 8 tests heredados | Slugs antiguos → nuevos con la nota del ajuste en la cabecera (feature 45, precedente REQ-43-06) (REQ-45-05). En los fixtures de **codificación** (`seo-head-base` REQ-35-03 y `sitemap-robots-endpoints` REQ-42-06) se usa un slug ficticio `slug con espacio` para conservar la cobertura de `%20`; el build de la 42 ya espera `/posts/03-principios-solid/`. |

## Verificación en ejecución real (astro preview, workerd local)

| Petición | Resultado |
|---|---|
| `/posts/03-principios%20solid` | 301 → `/posts/03-principios-solid` |
| `/posts/01-dise%C3%B1o-detallado` | 301 → `/posts/01-diseno-detallado` |
| `/posts/02-ciclo-de-vida-y-arquitectura` | 301 → `/posts/04-ciclo-de-vida-y-arquitectura` |
| `/posts/03-principios-solid/` | 200 |
| `/posts/no-existe` | 404 (feature 34), con `X-Frame-Options: DENY` y `Referrer-Policy` del middleware (feature 40) |
| `/robots.txt` | 200 (feature 42) |

## Ciclo rojo/verde (REQ-45-06)

Rojo — antes de tocar contenido y config:

```
✖ REQ-45-01 · ✖ REQ-45-02 · ✖ REQ-45-03 · ✖ REQ-45-04 · ✖ REQ-45-05 · ✔ REQ-45-07
ℹ pass 1 / ℹ fail 5
```

Verde — el test nuevo pasa 6/6; `pnpm test` 667/667 en 4 corridas. Una corrida intermedia falló
en REQ-11-05 (about-page reconstruye `dist/` mientras la preview de la verificación de arriba seguía
sirviéndolo); no se reprodujo tras cerrarse la preview. `./init.sh` verde.

## Ronda 2 — cambios requeridos de progress/review_45.md

Los comentarios de cabecera de `tests/next-post-data.test.mjs:19`, `tests/next-related-hrefs-fix.test.mjs:15`
y `tests/next-related-hrefs-reales.test.mjs:11` seguían describiendo `03-principios-solid` como el slug
«con espacio» tras el reemplazo mecánico. Ahora dicen «03-principios-solid (antes con espacio; ASCII
desde la feature 45)», sin el literal antiguo (REQ-45-05 sigue en verde). Solo cambian comentarios.
`./init.sh` verde.
