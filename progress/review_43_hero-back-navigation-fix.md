# Review — feature 43

**Veredicto:** APPROVED

## Resumen

El fix del hero perdido al volver del detalle (ruta absoluta + persist +
preload) está implementado conforme a `specs/43_hero-back-navigation-fix/`
(REQ-43-01..07 y design.md). Verificado de forma independiente en disco,
con la suite completa en verde y `./init.sh` terminando en
«El entorno está perfecto». No se aprueba con cambios: no hay tests rojos,
no hay dependencias saltadas y el alcance es exactamente el autorizado
(`tokens.css` intacto, 87 líneas).

## Evidencias

1. **Tests de la feature + contratos**
   (`tests/hero-back-navigation.test.mjs`, `hero-profile-repository.test.mjs`,
   `view-transitions.test.mjs`, `layout-refactor.test.mjs`,
   `hero-ui-refactor.test.mjs`):
   `# tests 37 · # pass 37 · # fail 0` (ejecutado en esta revisión).
2. **Suite completa** `node --test "tests/**/*.test.mjs"`:
   `# tests 264 · # pass 264 · # fail 0`.
3. **Audit de tokens**: `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
4. **`./init.sh`**: ✔ AGENTS.md / ✔ feature_list.json / ✔ formato /
   ✔ tests al 100% / ✔ build de producción / ✔ El entorno está perfecto.
5. **Alcance** (`git diff --name-only`): solo
   `feature_list.json`, `progress/current.md`, `new-hero.astro`, `hero.json`,
   `Layout.astro`, `[id].astro`, `layout.css` y
   `hero-profile-repository.test.mjs` (fixture autorizado REQ-43-06);
   nuevos: `tests/hero-back-navigation.test.mjs`, `specs/43_*`,
   `progress/impl_43_*`, `progress/review_43_*` (este informe) y los dos
   research. `tokens.css`: 0 líneas de diff, 87 líneas.
6. **Ciclo rojo/verde** documentado en `progress/impl_43_...md`:
   rojo 7 fail (incluye los 6 tests REQ-43 nuevos + REQ-31-01/04 por el
   fixture ya actualizado) → verde 15/15 y suite 264/264.

## Comprobación requisito por requisito (en disco)

| REQ | Verificación | Estado |
|-----|--------------|--------|
| REQ-43-01 | `src/data/hero.json` L5: `"image": "/assets/moises-hero.jpg"` (ruta absoluta). Asset real: `public/assets/moises-hero.jpg` (152 283 bytes) existe. | ✅ |
| REQ-43-02 | `new-hero.astro` L26-30: `<img transition:persist="hero-profile" src={profile.image} alt={profile.name} />`. | ✅ |
| REQ-43-03 | `[id].astro` L48: `<img transition:persist="hero-profile" src={heroProfile.image} alt={heroProfile.name} />` dentro de `<header class="post__hero">` (L41-49); `heroProfile` leído vía `HeroProfileRepository` (L7, L34), no del JSON directo. | ✅ |
| REQ-43-04 | `Layout.astro` L24: `<link rel="preload" as="image" href={heroProfile.image} />` dentro del `<head>` (L17-26); perfil vía `HeroProfileRepository` (L5, L12). | ✅ |
| REQ-43-05 | `layout.css` L70-72: `.post__hero [data-astro-transition-persist="hero-profile"] { display: none; }` — selector estructural que sigue al atributo (nodo viejo del swap) acotado a `.post__hero` (design Decisión 3). Archivo: 77 líneas (≤100). | ✅ |
| REQ-43-06 | `hero-profile-repository.test.mjs` L39: `image: '/assets/moises-hero.jpg'`; el diff confirma que el único cambio es el valor + comentario REQ-43-06 (el resto del test intacto, 15 tests). | ✅ |
| REQ-43-07 | Copia en L48, DESPUÉS de `img.post__image` (L42) y de `.post__hero-copy` (L43-47); sin `transition:name` (verificado también por el test: `doesNotMatch(copy, /transition:name/)`). El primer img conserva `transition:name={`img-${entry.id}`}` (REQ-24-05/42-08). | ✅ |

**Dependencias**: `depends_on: []` (sin dependencias) y features 33-42
`done`; nada saltado. Feature 43 en `status: "in_progress"` (correcto: la
cierra el líder tras el review); 44 `pending`.

**Convenciones**: ≤100 líneas en todos los archivos (máx. 77 layout.css);
sin `<style>` en ningún `.astro`; sin hex/rgba sueltos (audit ✔); sin JS de
runtime propio (persist/preload declarativos del framework); `prerender =
true` en `[id].astro` L36; datos siempre vía repositorio (Layout y `[id]`
usan `HeroProfileRepository`; el componente hero sigue con `src={profile.image}`).

## Checkpoints

- C1: [x] Respeta `docs/architecture.md` (capas, repos, estilos separados, tokens)
- C2: [x] Respeta `docs/conventions.md` (≤100 líneas, nombres, sin `<style>`, sin runtime JS)
- C3: [x] Test-first evidenciado: test escrito en rojo antes del código (7 fail) y suite verde al final (264/264) — `progress/impl_43_...md`
- C4: [x] Dependencias: `depends_on` vacío; 33-42 done; ninguna dependencia pendiente saltada
- C5: [x] `./init.sh` verde (entorno, formato, tests 100%, build) + audit de tokens ✔

## Riesgo residual documentado (no bloqueante)

Morph de imágenes en back sigue expuesto al bug upstream de Chromium
(331926174/astro#10595); mitigado con persist + preload y pendiente de la
feature 44 (`transition:animate="none"` + preload del post). Documentado en
design.md Decisión 6 y en los research del ciclo 36. Inspección visual en
navegador sigue siendo un checkpoint global pendiente, no atribuible a esta
feature.

Veredicto: APPROVED
