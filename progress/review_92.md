# Review — feature 92

**Veredicto:** APPROVED

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>`): [x] `htb-card.astro` importa `src/styles/htb-card.css`, la isla importa `htb-stadistics.css`. No hay `<style>` ni `style=`.
- C2 (frontmatter sin lógica): [x] `htb-card.astro` solo importa y desestructura `card`. `hero-grid-card.astro:13` declara el registro literal `{ icon: HeroCard, htb: HtbCard }` y delega en `pickCardComponent`. La isla conserva su frontmatter (credenciales `ENV || env`, `getProfileOrNull()`, `Cache-Control` con `HTB_ISLAND_CACHE_CONTROL`) y solo suma un comentario.
- C3 (datos vía repositorio): [x] La card llega desde `HeroCardsRepository().getCards()` en `new-hero.astro`. El JSON solo gana la entrada htb tras twitch-bottom (REQ-92-01).
- C4 (tokens, sin hardcodear): [x] `#1A2332` y `#9FEF00` aparecen solo en `tokens.css:52-53`. Las dos hojas no tienen hex ni rgb/rgba. Gap, padding y margin van con `var(--gap-card)`. `font-size: 0.75rem` y `letter-spacing: 0.08em` (`htb-stadistics.css:33-34`) son literales tipográficos que el checkpoint no cubre y que ya usan otras hojas (about-*.css, hero-card.css).
- C5 (≤100 líneas): [x] tokens.css 99, hero-card.css 85, htb-stadistics.css 54, htb-stadistics.astro 35, index.astro 24, htb-card.astro 23, htb-card.css 22, hero-grid-card.astro 17.
- C6 (sin dependencias nuevas): [x]
- C7 (JSON válido y tipado; errores nombrados): [x] La entrada htb cumple `HeroRichCard` (feature 90) y la suite de parseo sigue en verde.
- C8 (`./init.sh` verde): [x] Lo ejecuté yo. Formato, tests al 100% y build en verde (EXIT 0).
- C9 (visual desktop y móvil): [x] Comprobado por el implementer, no por mí. Usó Chrome headless con CDP a 1440, 1024 y 375 px: sin scroll horizontal y sin hijos fuera de la card, tanto en estado degradado como con perfil inyectado (`progress/impl_92.md`, sección «Verificación visual»).
- C10 (feature en done y ninguna a medias): [ ] Pendiente del líder. La 92 sigue `in_progress` hasta este APPROVED, y 90 y 91 están `done` (dependencias cumplidas).
- C11 (progress al día, sin temporales ni TODOs): [x] El script de medición está en el scratchpad, fuera del repo.

## Comprobaciones específicas pedidas
- **Registro sin condicionales.** `new-hero.astro` solo hace `heroCards.map(card => <HeroGridCard card={card} />)`, sin `card.kind` ni comparaciones por tipo. La card htb entra por la entrada `htb: HtbCard` del registro de la 91.
- **server:defer y degradación.** `htb-card.astro:19-21` monta `<HtbStadistics server:defer>` con `<p class="hero-card__loading" slot="fallback">Cargando estadísticas de HTB...</p>` dentro del `article.hero-card.hero-card--rich`, y el article es prerenderizado. Sin perfil, `htb-stadistics.astro:33` pinta `Estadísticas no disponibles` dentro del `div.htb-stadistics`, así que la celda no queda vacía. En el build hay un único `data-color-token="htb"` dentro de `.hero-grid` con el fallback. El test REQ-92-10 (build) lo comprueba.
- **Sección suelta retirada.** `git diff src/pages/index.astro` quita el import y el bloque `<HtbStadistics server:defer>`.
- **Tests heredados.** Las adaptaciones son legítimas y todas llevan nota «Ajuste feature 92 … precedente REQ-43-06»:
  - REQ-22-01 y REQ-05-00 se reapuntan a `htb-card.astro` con las mismas tres aserciones. REQ-05-00 suma además la comprobación de `<NewHero/>` en index.
  - REQ-22-05 solo pierde `--container-max`.
  - REQ-37-07 pasa de `margin-block` a `gap` con `var(--gap-card)` en la lista.
  - Los recuentos pasan a 12 de icono + 1 htb y siguen exigiendo una regla CSS por colorToken.
  - REQ-91-07 sigue exigiendo las 12 de icono en orden. El regex `class="hero-card"` exacto deja fuera la rich, y su presencia la cubre REQ-92-10 (build).
  - Los conteos de tokens.css pasan de 97 a 99, y el meta-test REQ-16-09 exige además la cita de `--color-marca-htb`.
  - `hero-card.css` sale de la lista UNCHANGED de geist-pixel, igual que se hizo con Layout.astro en la feature 89.

  El resto de `htb-stadistics-section.test.mjs` queda intacto: `getProfileOrNull`, prohibición de `getProfile()`, `{profile &&`, sin fetch ni console, secretos no interpolados, esquema env y Cache-Control. Ninguna comprobación de seguridad o degradación se debilita.
- **Herencia, reduced-motion y responsive.** `htb-card.css` no redefine radio, sombra, transform ni transition, y no fija `height`. El cuerpo va en flujo con `position: relative; z-index: 5` sobre `::before`/`::after`. Hover, `prefers-reduced-motion` (`hero-card.css:83-84`) y `grid-column/row: auto` a ≤1200 px se heredan de `.hero-card`.
- **Accesibilidad.** El título es `p.card-title`, como en las demás cards (feature 55). Los textos de carga y de degradación son visibles y legibles. No hay iconos decorativos sin aria.
- **TDD.** `progress/impl_92.md` muestra 13 tests, 1 pass y 12 fail en rojo. REQ-92-07 ya pasaba porque protege lo que la isla debía conservar, y eso es correcto. El único ajuste al test propio durante el verde (REQ-92-13 acepta el respaldo `var(--color-marca-htb-accent, var(--color-accent))` por REQ-22-05) está justificado. Verde: 13/13 y suite 967/967.
- **Coherencia acceptance↔REQ.** Los 7 acceptance cubren REQ-92-01..16 según el índice de trazabilidad de `requirements.md`.

## Cambios requeridos (si aplica)
Ninguno.

## Observaciones no bloqueantes
1. `htb-stadistics.css:41` usa `var(--color-marca-htb-accent, var(--color-accent))`. El respaldo nunca se activa porque el token existe, y solo está para satisfacer REQ-22-05. Es aceptable, pero si en el futuro se revisa REQ-22-05 se puede simplificar.
2. La respuesta degradada de la isla se sigue cacheando una hora (comportamiento previo, sin cambio). Lo anoto como contexto para futuras features.
