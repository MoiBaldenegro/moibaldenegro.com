# Informe de implementación — feature 9 hero-ui-refactor

**Fecha:** 2026-08-10 · **Estado del backlog:** feature 9 pendiente → `in_progress` → implementada (pendiente reviewer).

## Resumen

Se conectó la UI del hero a los repositorios del dominio (features 5/6), se sustituyó el
atributo de fondo por `data-color-token={card.colorToken}` con la entidad tipada y sin
estilos inline, y se eliminó `src/data/hero.data.ts` (REQ-09-05). El build de Astro quedó
funcionando con el perfil y las 12 tarjetas (REQ-09-04).

## Alcance (archivos tocados)

| Archivo | Acción | Justificación |
|---------|--------|---------------|
| `tests/hero-ui-refactor.test.mjs` | **Nuevo** | Test red-first de la feature (REQ-09-01..05 + convención ≤100 líneas). |
| `src/components/new-hero/new-hero.astro` | Modificado | Frontmatter: `HeroProfileRepository().getProfile()` + `HeroCardsRepository().getCards()` en vez de `import { heroCards, profile } from "../../data/hero.data"` (REQ-09-01/04, Decisión 1). 91 líneas (≤100). |
| `src/components/hero-card.astro` | Modificado | Prop tipada `card: HeroCard` (entidad del dominio) y `data-color-token={card.colorToken}`, sin `style` (REQ-09-02/03, Decisión 2). 33 líneas. |
| `src/data/hero.data.ts` | **Borrado** | REQ-09-05 (Decisión 3): único punto que lo importaba era la UI (verificado con grep: solo new-hero.astro y hero-card.astro importaban `hero.data`). |
| `src/styles/tokens.css` | Comentario | El comentario de la sección marca referenciaba "paleta real de src/data/hero.data.ts": actualizado al borrar el archivo (el test REQ-09-05 escanea `src/` y exige cero referencias a `hero.data`). |
| `tests/hero-cards-styles.test.mjs` | Ajuste | La Decisión 2 del design.md de la feature 9 fija `data-color-token={card.colorToken}`; el test de la feature 4 verificaba `{card.id}`. Los 12 `id` == los 12 `colorToken`, el mecanismo CSS no cambia. Precedente: la feature 8 ajustó `tests/hero-section-styles.test.mjs` igualmente. |
| `src/domain/repositories/hero-cards-repository.ts` | Ajuste (default) | Ver siguiente sección. |
| `src/domain/repositories/hero-profile-repository.ts` | Ajuste (default) | Ver siguiente sección. |

## Decisión de implementación: resolución del JSON por defecto en los repositorios

El primer build de Astro falló con `HeroCardsDataError: no se pudieron leer las tarjetas
desde "/C:/.../dist/data/hero-cards.json"`: el prerender de Astro ejecuta el bundle desde
`dist/.prerender/chunks/`, donde `import.meta.url` ya no apunta al archivo fuente y
`new URL('../../data/hero-cards.json', import.meta.url)` resuelve a `dist/data/...`

Ajuste mínimo en ambos repositorios: el `DEFAULT_DATA_URL` se resuelve contra la raíz del
proyecto (`pathToFileURL(join(process.cwd(), 'src', 'data', ...))`), que es el cwd del
build, del dev server y de los tests. La API pública no cambia (el constructor sigue
aceptando un `dataUrl` opcional, usado por los tests de error de las features 5/6), los
mensajes de error y `HeroCardsDataError`/`HeroProfileDataError` no cambian, y los tests
5/6 siguen verdes sin modificación. Sin este ajuste, REQ-09-04 (build sin errores) es
imposible de cumplir. Alternativa descartada: inyectar la ruta desde el frontmatter de
new-hero.astro — metería lógica de resolución en la UI y violaría REQ-09-04 ("frontmatter
solo imports y paso de datos").

Verificación de que nadie más importaba `hero.data` antes del borrado (grep en el repo):
solo `src/components/new-hero/new-hero.astro` (línea 8) y `src/components/hero-card.astro`
(línea 3) tenían imports reales; el resto eran comentarios de tests/historial/docs.

## Ciclo rojo/verde (evidencia)

### ROJO — `node --test tests/hero-ui-refactor.test.mjs` (estado previo, sin implementar)

```
not ok 1 - REQ-09-01: NewHero obtiene perfil y tarjetas desde los repositorios del dominio
not ok 2 - REQ-09-02: HeroCard recibe la tarjeta como prop tipada con la entidad HeroCard
not ok 3 - REQ-09-03: HeroCard aplica el fondo con data-color-token y sin estilos inline
ok 4 - REQ-09-03 (integración): cada colorToken de hero-cards.json tiene su regla en hero-card.css
ok 5 - REQ-09-04: el frontmatter de los componentes del hero se limita a imports y paso de datos
not ok 6 - REQ-09-05: src/data/hero.data.ts ya no existe y nada lo importa en src/
ok 7 - Convención: los componentes del hero no superan las 100 líneas
# pass 3
# fail 4
```

Los 4 falls son exactamente los REQ que exige la spec (new-hero/hero-card importan
`hero.data`; hero-card usa el tipo `HeroCardData` y `data-color-token={card.id}`;
`hero.data.ts` existe). Los 3 ok son invariantes que ya se cumplían (CSS de la feature 4
con los 12 tokens, frontmatter sin lógica, ≤100 líneas).

### VERDE — suite completa `node --test "tests/**/*.test.mjs"`

```
# tests 60
# pass 60
# fail 0
```

- Test de la feature: 7/7 (REQ-09-01, 02, 03, 03-integración, 04, 05, convención).
- Features 1-8 intactas: 53/53 siguen en verde (incluido `hero-cards-styles` con el
  ajuste `data-color-token={card.colorToken}`).
- `tests/hero-cards-repository.test.mjs` y `tests/hero-profile-repository.test.mjs`
  (features 5/6) verdes sin modificación, pese al ajuste del default.

### Puerta de entrada — `./init.sh`

```
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Verificación del build (REQ-09-04)

`pnpm build` → `1 page(s) built in 776ms` **sin errores**. Verificación de
`dist/index.html` (node -e):

```
profile name: true            profile username: true
verified badge: true          descripción: true
total tarjetas (.hero-card): 12
data-color-token count: 12 {"react":1,"html":1,"node":1,"github":1,"youtube":1,
  "twitch":1,"typescript":1,"css":1,"node-bottom":1,"github-bottom":1,
  "youtube-bottom":1,"twitch-bottom":1}
style= en todo el html: false
titles: REACT, HTML, NODE JS, GITHUB ACTIONS, YOUTUBE, TWITCH, TYPESCRIPT, CSS
```

Los títulos repetidos de las variantes bottom (NODE JS, GITHUB ACTIONS, YOUTUBE,
TWITCH) son los datos reales de `hero-cards.json` (feature 6), no una regresión.

## Verificación visual (dev server)

`pnpm dev` (background) → `HTTP 200` en `/`. Parseo del HTML servido:

```
tarjetas renderizadas: 12
tokens únicos: 12 ["react","html","node","github","youtube","twitch","typescript",
  "css","node-bottom","github-bottom","youtube-bottom","twitch-bottom"]
nombre: true
username: true
style= inline: false
```

El hero se ve igual que antes del refactor: fondo/cuadrícula de `hero-section.css`,
perfil de `profile-card.css` y 12 tarjetas con fondos/posiciones/rotaciones desde
`hero-card.css` vía `data-color-token`. Dev server detenido tras la verificación.

## Cumplimiento de REQ y convenciones

| REQ | Cómo se cumple |
|-----|----------------|
| REQ-09-01 | `new-hero.astro` construye `HeroProfileRepository`/`HeroCardsRepository` y obtiene `profile` + `heroCards` en el frontmatter; sin imports de `src/data` (verificado por test). |
| REQ-09-02 | `hero-card.astro` declara `interface Props { card: HeroCard }` con `import type { HeroCard } from "../domain/entities/hero-card.ts"`. |
| REQ-09-03 | `<article class="hero-card" data-color-token={card.colorToken}>`; test verifica ausencia de `style=` y `<style>`. |
| REQ-09-04 | Frontmatter solo imports + `const` de datos (test verifica: sin `readFileSync`, `new URL(`, funciones/if/for). Build genera el hero completo sin errores. |
| REQ-09-05 | `src/data/hero.data.ts` borrado; el test escanea todo `src/` y exige cero referencias a `hero.data` (solo quedan comentarios históricos fuera de `src/`). |

Convenciones: estilos separados (sin inline styles), datos vía repositorio, frontmatter
solo imports/paso de datos, ≤100 líneas (new-hero.astro 91, hero-card.astro 33, repositorios
94/84), errores nombrados intactos, sin dependencias externas.

## Pendiente

Revisión externa del reviewer (la lanza el líder).