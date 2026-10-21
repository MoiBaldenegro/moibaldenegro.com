# Diseño — feature 112 hero-rich-card-logos

## Contexto visual

- Componente: card HTB del hero (`src/components/hero-cards/htb-card.astro`, kind htb), hoy solo título + estadísticas (isla server:defer) + liga opcional.
- Deseado: debajo del contenido, el cubo `#htb` en la posición del icono principal de las cards de icono (abajo-derecha, rotado y escalado, con el mismo efecto de hover) y el wordmark `#htb-wordmark` como logo de fondo abajo-izquierda; ambos tenues para que el contenido siga mandando.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-htb` | #1A2332 | Fondo de la card (sin cambio) |
| `--color-marca-htb-accent` | #9FEF00 | Color del contenido (sin cambio); el sprite trae su propio relleno |
| `--transition-default` | (tokens.css) | Transición del hover heredada de `.card-icon svg` |

Sin tokens nuevos: opacidad y geometría del logo son locales, mismo criterio que 103/105/108/109.

## Decisiones y constraints (valores por defecto revisables)

- Decisión 1 — reutilizar el mecanismo de las cards de icono: la rica declara `icon`, `backgroundIcon` y `backgroundIconSize` en hero-cards.json (el humano autoriza tocar la card htb) y un componente compartido `hero-card-art.astro` pinta `.card-backdrop` + `.card-icon` para ambos tipos. El hover, la posición (`right 4px; bottom 32px`), el 110px de <= 768 px y la geometría del fondo salen de hero-card.css y hero-card-accents.css sin duplicar reglas.
- Decisión 2 — cubo tenue: `.hero-card--rich .card-icon { opacity: 0.16; pointer-events: none; }`. En las de icono el logo es el protagonista; aquí es fondo («fondo opaco abajo del contenido»).
- Decisión 3 — geometría del cubo por token htb (en htb-card.css; hero-card.css está en 99 líneas): `--icon-width 150px; --icon-rotation -8deg; --icon-scale 6` en > 1200 px (la HTB ocupa la celda grande); `--icon-scale 3` en <= 1200 px.
- Decisión 4 — wordmark `sm` (left 16px/10px, width 60 %, abajo-izquierda, opacidad común 0.06) con ratio `300 / 58.8`: complementa al cubo de la derecha sin apilarse. Si el glifo no toca el borde inferior (<= 2 px), margen negativo por ratio como anthropic-wordmark (105).
- Decisión 5 — capas: `.card-backdrop` (z 0) < `.card-icon` (por DOM) < `.hero-card__body` (z 5) < `a.card-link` (z 6); el header (z 4) sigue por encima de los logos.
- Contraste estimado en reposo (cubo al 0.16 sobre #1A2332 ≈ rgb(47,68,42)): blanco ~10:1, #9FEF00 ~7:1; se mide por CDP también en hover (`filter: contrast(1.4)`).
- Móvil (showOnMobile true): a 375 px la card mide min-height 190px; cubo a 110px y wordmark al 60 % del ancho, recortados por el overflow de la card.
- Restricciones: sin JS, sin `<style>` ni style inline, tokens, <= 100 líneas por archivo, test-first, sprite de solo lectura.

## Alternativa descartada

- CSS propio de la card HTB con `<svg>` y transform duplicados: duplica el hover y la geometría de hero-card.css y diverge con el tiempo.
- Wordmark `md` (todo el ancho): se apila con el cubo en la esquina inferior derecha y ensucia la zona de estadísticas; queda como alternativa si el humano la prefiere.
