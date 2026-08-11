# Análisis — Refactor completo de moibaldenegro.com

Fecha: 2026-08-10 · Autor: spec_author

## 1. Estado actual (verificado en disco)

Sitio personal Astro 7.2.0 (pnpm) cuyo código conserva la estructura del starter
kit de Astro + un diseño "hero" a medio construir. Resumen verificado:

| Área | Estado real |
|------|-------------|
| `feature_list.json` | **NO existe** → init.sh falla |
| `specs/_template/{requirements,design}.md` | **Ya existen** (repositorio del kit genérico) |
| `templates/` (feature_list.json, current.md, history.md) | **NO existen** → el test de integridad falla |
| `.opencode/agents/*.md` y `.claude/agents/*.md` (5 c/u) | **Ya existen** |
| `CHECKPOINTS.md`, `README.md`, `KICKOFF.md`, `CLAUDE.md` | Ya existen (README es el del starter, desactualizado) |
| `scripts/` (check-format, validate-*) | Existen y funcionan |
| `tests/harness-kit-integrity.test.mjs` | Existe, **recorre TODO el repo** buscando tokens de app |
| `package.json` | **Sin script `test`** → `./init.sh` falla en tests |
| `src/pages/index.astro` | OK (NewHero + LatestArticles + Layout), 11 líneas |
| `src/layouts/Layout.astro` | Starter: `lang="en"`, título "Astro Basics", `<style>` embebido, sin navbar |
| `src/components/Welcome.astro` | Starter (210 líneas, estilos embebidos, links a astro.build); **no importado**; importa `../assets/astro.svg` y `../assets/background.svg` que **no existen** (no hay `src/assets/`) → código muerto |
| `src/components/new-hero/new-hero.astro` | 102 líneas, importa datos de `../../data/hero.data` directo (viola datos vía repositorio) |
| `src/components/hero-card.astro` | Estilos inline `style={...}` con `--card-bg` etc. (viola estilos separados) |
| `src/components/latest-articles.astro` | `getCollection('architecture')` directo en la UI (viola datos vía repositorio) |
| `src/data/hero.data.ts` | 284 líneas (viola 100), tipos + datos mezclados, hex en datos, NO es JSON |
| `src/application/{read-post,read-hero-cards}.ts` | Vacíos (0 líneas) |
| `src/entities/`, `src/repositories/`, `src/services/` | Solo `context.md` (notas) |
| `src/config.ts` | Código muerto (ubicación no reconocida por Astro, nada lo importa) |
| `src/content.config.ts` | Válido (sesión previa aprobada): colección `architecture` con loader glob + Zod |
| `src/content/architecture/00-agilismo.md` | Contenido real (56 líneas) |
| `src/styles/hero.css` | **782 líneas** (viola 100), tokens locales en `:root` + muchos valores sueltos |
| `src/ui/` | Vacía |
| `public/` | favicon.svg, favicon.ico, assets/moises-hero.jpg, assets/svg/sprite.svg (todo referenciado o válido) |
| `dist/`, `.astro/` | Generados; en `.gitignore` |

Corrección al contexto recibido: los agentes (`.opencode/agents/` y
`.claude/agents/`), `CHECKPOINTS.md`, `README.md`, `KICKOFF.md`, `CLAUDE.md` y
`specs/_template/` **ya existen**; lo que falta del arnés es únicamente
`feature_list.json`, `templates/` y el script `test` (además del fix del test de
integridad, que escanea todo el repo).

## 2. Gap vs. documentación (docs/architecture.md, docs/conventions.md)

| Principio (arquitectura) | Estado actual | Brecha |
|--------------------------|---------------|--------|
| Estilos separados de la UI | Layout.astro con `<style>`; hero-card con `style={...}` | **Incumplido** |
| Lógica separada de la UI | Frontmatters con acceso a datos | **Incumplido** (new-hero, latest-articles) |
| Tokens, no valores sueltos | `:root` en hero.css + hex/rgba/px dispersos | **Incumplido** |
| Datos vía repositorio | Componentes leen `hero.data.ts` y `astro:content` | **Incumplido** |
| `src/data/` = JSON | `hero.data.ts` es TypeScript | **Incumplido** |
| Dominio: entities + repositories | Solo `context.md` | **Incumplido** |
| ≤100 líneas/archivo | hero.css 782, hero.data.ts 284, Welcome 210 | **Incumplido** |
| Errores nombrados | No hay repositorios ni errores | **Incumplido** |
| Un solo layout | Solo Layout.astro (pero sin chrome) + navbar duplicada en hero | **Parcial** |
| Rutas explícitas | Solo `/`; navbar enlaza `/about` → 404 | **Parcial** |
| Estático por defecto | Sin JS de runtime | OK |
| Sin dependencias externas | Solo astro | OK |
| Harness (init.sh verde) | Sin feature_list.json, sin script test, test integridad rojo | **Incumplido** |

## 3. Decisiones clave

1. **Test de integridad (opción a):** se arregla el test para que escanee
   únicamente los archivos del kit (lista de obligatorios + plantillas), no
   `node_modules/`, `dist/`, `.astro/` ni `src/`. Justificación: el test fue
   diseñado como integridad del *kit genérico* y escanear todo el repo es un bug
   (además de inviable con `node_modules`); renombrar la app para evitar la
   palabra "hero" (opción b) cambiaría la semántica del dominio sin resolver el
   escaneo de carpetas generadas. La combinación (c) no aporta: con el test
   acotado no hay fugas. El renombrado no se hace.
2. **`latest-articles`:** `getCollection` es acceso a datos → pasa por un
   repositorio del dominio (`PostsRepository`) que entrega entidades `Post`.
3. **Navbar:** chrome compartido → se mueve de `new-hero.astro` al `Layout.astro`
   (layout único), con estilos en `layout.css`.
4. **Ruta `/about`:** se crea la página (el navbar la referencia; contenido solo
   de los datos reales del perfil, sin inventar biografía).
5. **Colores de tarjetas:** salen de los datos (hex) → tokens de marca en
   `tokens.css`; el JSON guarda `colorToken` y el CSS mapea vía
   `data-color-token`.
6. **`src/application/` y `src/services/`:** no existen en la arquitectura
   documentada → se eliminan (solo tenían archivos vacíos/notas).
7. **`hero.data.ts`:** se migra a JSON (5) y JSON de tarjetas (6); el borrado se
   hace en la feature 9 (último punto que lo importa), no antes, para no romper
   el build entre features.
8. **`README.md`:** el del starter se reescribe al final (feature 13).

## 4. Descomposición elegida (13 features)

Regla aplicada: una feature = un cambio coherente verificable; la base primero
(id bajo = se implementa primero); sin features gigantes (>1 archivo por carpeta
del dominio); cada feature cerrable con `./init.sh` en verde.

| id | name | Título | Toca UI | Depende de |
|----|------|--------|---------|------------|
| 1 | harness-kit-mount | Completar el arnés: templates, script test y fix del test de integridad | No | — |
| 2 | design-tokens | Sistema de tokens en src/styles/tokens.css | Sí | — |
| 3 | hero-section-styles | Extraer estilos de la sección hero a hero-section.css | Sí | 2 |
| 4 | hero-cards-styles | Extraer estilos de tarjetas/perfil con tokens y data-color-token | Sí | 2 |
| 5 | hero-profile-domain | JSON + entidad HeroProfile + HeroProfileRepository | No | — |
| 6 | hero-cards-domain | JSON con colorToken + entidad HeroCard + HeroCardsRepository | No | 5 |
| 7 | posts-domain | Entidad Post + PostsRepository sobre la colección | No | — |
| 8 | layout-refactor | Layout: idioma es, título real, estilos separados, navbar compartida | Sí | 2 |
| 9 | hero-ui-refactor | NewHero/HeroCard → repositorios, sin inline styles, borra hero.data.ts | Sí | 4, 5, 6, 8 |
| 10 | articles-ui-refactor | LatestArticles → PostsRepository con estilos propios | Sí | 2, 7 |
| 11 | about-page | Crear la página /about con el perfil del autor | Sí | 5, 8 |
| 12 | cleanup-dead-code | Borrar código muerto + guardián audit-design-tokens.mjs | No | 9, 10 |
| 13 | project-readme | Reescribir README.md real | No | 12 |

### Por qué este orden

- **1 primero:** sin el arnés `init.sh` no puede quedar en verde, y ninguna
  feature posterior se cierra sin él.
- **2 antes que 3, 4, 8, 10:** todas las hojas nuevas consumen tokens; los
  tokens deben existir antes de migrar estilos.
- **3 y 4 (estilos) antes que 9 (UI hero):** la UI conectada (9) debe encontrar
  ya el CSS con `data-color-token` y las hojas por componente.
- **5 y 6 (dominio hero) antes que 9:** la UI no puede consumir repositorios que
  no existen. 6 depende de 5 por coherencia del mismo dominio (misma fuente
  `hero.data.ts` a migrar).
- **7 (dominio posts) antes que 10 (UI articles).**
- **8 (layout con navbar) antes que 9:** 9 quita la navbar duplicada del hero;
  si fuera antes, el sitio quedaría sin navegación entre features.
- **12 y 13 al final:** la limpieza y la documentación cierran el refactor sin
  interferir con features que aún tocan los archivos afectados.

### Riesgos y mitigaciones

- **Build roto entre features:** cada feature debe terminar con `pnpm build`
  verde; `hero.data.ts` se borra solo en la feature 9 (cuando nada lo importa).
- **CSS >100 líneas al repartir hero.css:** las hojas nuevas se verifican con
  tests node:test (límite 100, sin hex/rgba), escritos en rojo primero (TDD).
- **Navbar duplicada entre 8 y 9:** aceptable (regresión visual menor, no
  funcional); 9 elimina la copia del hero.
- **Test de integridad:** si el fix de la feature 1 no acota el escaneo,
  cualquier app con la palabra "hero" rompe el kit; por eso el fix es parte de
  la feature base.

## 5. Plan de ejecución feature a feature

1. **harness-kit-mount** — crear `templates/{feature_list.json,current.md,history.md}`,
   añadir script `test` a package.json, acotar el escaneo del test de
   integridad al kit; verificar `./init.sh` verde.
2. **design-tokens** — crear `src/styles/tokens.css` + `tests/design-tokens.test.mjs`
   (rojo→verde).
3. **hero-section-styles** — extraer `src/styles/hero-section.css` (fondo,
   navbar, grid, responsive) con tokens; actualizar import en new-hero.
4. **hero-cards-styles** — extraer `hero-card.css` + `profile-card.css` con
   `data-color-token`; borrar `hero.css`.
5. **hero-profile-domain** — `src/data/hero.json`, `hero-profile.ts`,
   `hero-profile-repository.ts` (HeroProfileDataError) + tests.
6. **hero-cards-domain** — `src/data/hero-cards.json` (colorToken),
   `hero-card.ts`, `hero-cards-repository.ts` (HeroCardsDataError) + tests.
7. **posts-domain** — `post.ts`, `posts-repository.ts` (PostsDataError) + tests.
8. **layout-refactor** — Layout es/título/`layout.css`/navbar movida desde
   new-hero.
9. **hero-ui-refactor** — NewHero/HeroCard consumen repositorios, `data-color-token`,
   borrar `hero.data.ts`.
10. **articles-ui-refactor** — LatestArticles consume PostsRepository +
    `latest-articles.css`.
11. **about-page** — `src/pages/about.astro` + `about.css` con perfil del repo.
12. **cleanup-dead-code** — borrar `config.ts`, `src/application/`, context.md,
    Welcome.astro, `src/ui/`; crear `scripts/audit-design-tokens.mjs`.
13. **project-readme** — reescribir README.md real.

Cierre de cada feature: tests primero (rojo) contra la spec, implementación,
`./init.sh` verde, `progress/impl_<feature>.md` y review con veredicto APPROVED.
