# Diseño — feature 92 htb-hero-card

## Contexto visual

- Estado actual: «Estadísticas de Hack The Box» es una sección suelta al final de la portada (`index.astro`, `server:defer`), con h2, intro y 6 stats en lista de dos columnas.
- Estado deseado: una card más del grid bento del hero, en la celda hoy vacía a la derecha de TWITCH inferior (columnas 9-12, filas 9-10, ≈380 x 204 px), con el mismo radio, borde, sombra, degradado y hover que las demás, y 3 stats compactas con funcionalidad en runtime (server island).

```
fila 9-10:  [ TWITCH (1 / span 8)                     ][ HACK THE BOX (9 / span 4) ]
                                                        NIVEL     Pro Hacker
                                                        PUNTOS    1234
                                                        OWNS      120 user / 80 root
```

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-htb` (nuevo) | `#1A2332` | Fondo de la card (`--card-bg`), navy de marca HTB |
| `--color-marca-htb-accent` (nuevo) | `#9FEF00` | Valores de las stats (verde de marca HTB) |
| `--color-text`, `--color-text-secondary` | existentes | Título y etiquetas |
| `--color-border` | existente | Separadores de la lista |
| `--gap-card`, `--radius-card`, `--shadow-card-rest`, `--shadow-card-hover`, `--transition-default` | existentes | Heredados de `.hero-card` |
| `--font-display`, `--font-mono` | existentes | Título (vía `.hero-card .card-title`) y valores |

## Decisiones y constraints

- Decisión 1 (celda): `9 / span 4` x `9 / span 2` cierra el rectángulo del bento sin mover ninguna tarjeta. Reversible: una regla en `hero-card.css` y dos campos del JSON.
- Decisión 2 (stats): Nivel, Puntos y Owns (user / root). Nombre se retira por redundante con la tarjeta de perfil; País y Miembro desde por espacio. Reversible: un `<li>` por stat.
- Decisión 3 (island): `htb-card.astro` es prerenderizada y es el ítem del grid; dentro monta `<HtbStadistics server:defer>` con `<p slot="fallback">Cargando estadísticas de HTB...</p>`. `server:defer` no se puede aplicar a un componente dinámico del registro, por eso va estático dentro de la card. La celda existe desde el HTML estático: sin saltos de layout al llegar la isla.
- Decisión 4 (nombres): se conservan `htb-stadistics.astro` (isla) y `htb-stadistics.css` (lista compacta) porque los tests de degradación, prerender y caché fijan esa ruta; la raíz pasa de `section` a `div.htb-stadistics` y desaparecen el h2 y la intro (el título es `p.card-title`, coherente con la feature 55).
- Decisión 5 (degradación): `{profile && (<ul ...>)}` y `{!profile && <p class="htb-stadistics__empty">Estadísticas no disponibles</p>}`: la card nunca deja un hueco en el grid.
- Decisión 6 (capas): el contenido de la card va en flujo con `position: relative; z-index` por encima de `::before`/`::after` de `.hero-card` y con padding superior que libera el `card-header` absoluto; así crece en alto en ≤1200 px (filas `minmax(..., auto)`) sin recortarse.
- Decisión 7 (tests heredados a reapuntar, REQ-92-14): REQ-22-01 de `htb-stadistics-section.test.mjs` y REQ-05-00 de `search-landing-live-transition.test.mjs` (`server:defer` + fallback pasan de `index.astro` a `htb-card.astro`); el token `--container-max` de REQ-22-05 (la card no es contenedor de página); REQ-37-07 de `visual-polish-refactor.test.mjs` (`margin-block` de sección); recuento de 12 tarjetas de `hero-cards-repository.test.mjs` y `hero-ui-refactor.test.mjs` (pasa a 12 de icono + 1 htb). Se mantienen intactas getProfileOrNull, sin lógica, `{profile &&`, Cache-Control y credenciales.
- Restricciones: sin dependencias, ≤100 líneas por archivo, sin `<style>` ni `style=` inline, solo tokens, reduced-motion heredado, cero JS de cliente propio (solo el script de la isla de Astro).

## Alternativa descartada

- Alternativa: `server:defer` sobre la card completa resuelta por el registro.
- Motivo del descarte: Astro necesita un import estático para registrar la isla; además la celda quedaría vacía en el HTML estático hasta que responda la isla.
- Alternativa: mantener las 6 stats ampliando la card a 3 filas.
- Motivo del descarte: abre una fila 11 con 8 columnas vacías y rompe el bento; requiere mover tarjetas existentes (decisión humana no pedida).
