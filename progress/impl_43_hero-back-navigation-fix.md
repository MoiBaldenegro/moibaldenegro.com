# Informe de implementación — Feature 43 hero-back-navigation-fix

> Fecha: 2026-08-14 · Rol: implementer · Spec: `specs/43_hero-back-navigation-fix/`
> (requirements.md REQ-43-01..07 + design.md) · Análisis previos:
> `progress/research/fix-imagen-hero-y-rendimiento-ciclo36.md` y
> `progress/research/view-transitions-imagen-perdida.md`.

## Problema

Al volver del detalle (`/posts/[id]`) a la portada (`/`), la imagen del hero se
perdía (404 `GET /posts/assets/moises-hero.jpg`): `src/data/hero.json` declara
`"image": "assets/moises-hero.jpg"` (ruta RELATIVA) y el `<ClientRouter />`
re-parsea la portada con DOMParser antes de cambiar la URL, resolviendo la ruta
contra `/posts/`.

## Cambios implementados (scope REQ-43-01..07, sin tocar tokens.css)

1. **`src/data/hero.json`** — `"image": "assets/moises-hero.jpg"` →
   `"/assets/moises-hero.jpg"` (REQ-43-01). El dato real existe en
   `public/assets/moises-hero.jpg`.
2. **`src/components/new-hero/new-hero.astro`** — el `<img>` del hero declara
   `transition:persist="hero-profile"` conservando `src={profile.image}` y
   `alt={profile.name}` (REQ-43-02).
3. **`src/pages/posts/[id].astro`** — import de `HeroProfileRepository`, const
   `heroProfile = new HeroProfileRepository().getProfile()` y copia OCULTA del
   hero al final de `.post__hero` (después de `img.post__image` y de
   `.post__hero-copy`): `<img transition:persist="hero-profile"
   src={heroProfile.image} alt={heroProfile.name} />`, SIN `transition:name`
   (REQ-43-03/07). El primer `<img>` de la página sigue siendo
   `img.post__image` con `transition:name={`img-${entry.id}`}` (REQ-24-05/42-08).
4. **`src/layouts/Layout.astro`** — `<link rel="preload" as="image"
   href={heroProfile.image} />` en el `<head>`, con `heroProfile` leído vía
   `HeroProfileRepository` (chrome compartido, REQ-43-04, design Decisión 5).
5. **`src/styles/layout.css`** — regla estructural
   `.post__hero [data-astro-transition-persist="hero-profile"] { display: none; }`
   (REQ-43-05): sigue al atributo (viaja con el nodo viejo en el swap) y está
   acotada a `.post__hero` (solo existe en el detalle). Sin `hidden` ni
   `aria-hidden` (viajarían con el nodo y romperían el hero). layout.css: 77
   líneas (≤100, REQ-08-06).

## Tests

- **`tests/hero-profile-repository.test.mjs`** — cambio AUTORIZADO REQ-43-06:
  `EXPECTED_PROFILE.image` pasa de `'assets/moises-hero.jpg'` a
  `'/assets/moises-hero.jpg'` (el fixture sigue al dato real; el resto del test
  intacto, 15 tests).
- **`tests/hero-back-navigation.test.mjs`** — NUEVO (test-first): 6 tests que
  verifican REQ-43-01 (hero.json absoluto + asset real), REQ-43-02 (persist en
  el hero de la portada), REQ-43-03/07 (copia oculta con persist, mismo src,
  sin transition:name, después de img.post__image y .post__hero-copy),
  REQ-43-04 (preload en el head vía perfil del repositorio), REQ-43-05 (regla
  display:none en layout.css + ≤100 líneas) y REQ-43-06 (el repositorio entrega
  la ruta absoluta).

## Ciclo rojo/verde

### ROJO (antes de implementar; solo tests, sin código)

```
$ node --test tests/hero-back-navigation.test.mjs tests/hero-profile-repository.test.mjs
not ok 1 - REQ-43-01: hero.json declara la ruta absoluta y el archivo real existe
not ok 2 - REQ-43-02: el img del hero de la portada declara transition:persist="hero-profile"
not ok 3 - REQ-43-03/07: el detalle incluye la copia oculta con persist, sin transition:name y tras la copia
not ok 4 - REQ-43-04: el head del layout pre-carga la imagen del hero con rel="preload" as="image"
not ok 5 - REQ-43-05: layout.css oculta la copia persistida bajo .post__hero con display: none
not ok 6 - REQ-43-06: el repositorio entrega el perfil real con la ruta absoluta
not ok 9 - REQ-31-01/REQ-31-04: el loader por defecto entrega el perfil real de src/data/hero.json
# pass 8
# fail 7
```

(El test REQ-31-01/04 falla en rojo porque el fixture ya se actualizó al valor
absoluto autorizado pero hero.json seguía relativo.)

### VERDE (después de implementar)

```
$ node --test tests/hero-back-navigation.test.mjs tests/hero-profile-repository.test.mjs
ok 1 - REQ-43-01 ... ok 6 - REQ-43-06 ... ok 9 - REQ-31-01/REQ-31-04 ...
# tests 15
# pass 15
# fail 0

$ node --test "tests/**/*.test.mjs"
# tests 264   (258 previos + 6 nuevos de REQ-43)
# pass 264
# fail 0

$ node scripts/audit-design-tokens.mjs
AUDIT ✔ ningún color fuera de tokens.css en src/styles

$ ./init.sh
✔ node instalado / ✔ pnpm instalado / ✔ dependencias instaladas
✔ AGENTS.md existe / ✔ feature_list.json existe / ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test) / ✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

### Regresión (tests que NO se modifican, pasan sin cambios)

view-transitions (REQ-24-03/05), post-header-horizontal (REQ-42-01/08),
post-page-styles (REQ-26-02..07), layout-refactor (REQ-08-01..06),
hero-ui-refactor (REQ-09), hero-cards-styles, hero-section-styles,
design-tokens, post-readability (REQ-40/41): 74/74 verdes; suite completa
264/264.

## Verificación en el build (dist/)

- Portada `dist/client/index.html`: `<link rel="preload" as="image"
  href="/assets/moises-hero.jpg">` en el head y
  `<img data-astro-transition-persist="hero-profile" src="/assets/moises-hero.jpg"
  alt="Moisés Baldenegro Melendez">`.
- Detalle `dist/client/posts/00-agilismo/index.html`: preload del hero en el
  head; `.post__hero` con `img.post__image` (con `data-astro-transition-scope`
  → `view-transition-name: img-00-agilismo` en el CSS compilado) → copia →
  copia oculta `<img data-astro-transition-persist="hero-profile"
  src="/assets/moises-hero.jpg" ...>` al final; la regla
  `.post__hero [data-astro-transition-persist=hero-profile]{display:none}`
  presente en el CSS compilado.

## Límites del scope

- No se tocaron `tokens.css` (87 líneas), ni los pares `transition:name`
  img/title (REQ-24-03/05, REQ-42-08), ni los hovers, ni la navbar (feature 44
  los tocará después). Solo los archivos listados en la spec 43.
- Layout.astro y layout.css ya contienen lo de la feature 43; la 44 añadirá
  sobre ellos `transition:animate`, slot head y preload del post.
- feature_list.json: feature 43 en `status: "in_progress"` (NO marcada done;
  la cierra el líder tras el review).
