# Review — feature 89

**Veredicto:** APPROVED

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x] `src/styles/site-footer.css`; `site-footer.astro` no tiene `<style>` (lo comprueba la aserción REQ-89-05 del test).
- C2 (frontmatter solo imports y paso de datos): [x] `site-footer.astro` L1-14 solo instancia repositorios y llama a `latestPosts`/`footerColumns`; la lógica vive en `src/domain/site-footer.ts`.
- C3 (datos vía repositorios): [x] AboutRepository, HeroProfileRepository y PostsRepository; ningún import de JSON en el componente.
- C4 (tokens, sin valores sueltos): [x] Todos los colores van por `var()` (sin hex/rgb/hsl, test L74); espaciados en `calc(var(--gap-card) * n)`; radios con `--radius-pill`; la sombra se compone con `--gap-card` y `--color-glow`. Los literales que quedan (`1px`/`2px` de borde, `font-size` en rem, `width: 96px` del logo) siguen el precedente del repo (21 hojas con `1px solid var(...)`, 17 con `font-size` en rem) y no son colores, espaciados, radios ni sombras.
- C5 (<=100 líneas): [x] dominio 41, componente 66, hoja 92, test 80, Layout.astro dentro del límite (el test lo comprueba).
- C6 (sin dependencias nuevas): [x] el commit no toca package.json.
- C7 (datos válidos y errores nombrados): [x] las redes salen de `heroLinks`, que lanza AboutDataError si falta alguna.
- C8 (`./init.sh` verde): [x] ejecutado en esta revisión: formato, tests al 100% y build OK.
- C9 (visual desktop/móvil): [x] el informe documenta CDP a 375, 768 y 1280 sin scroll horizontal; revisé `progress/research/footer89/footer-home-375.png` y la pila de una columna se ve correcta.
- C10 (feature en done, ninguna otra a medias): [x] 89 `done`; la única que no está en done es la 10, `blocked` por decisión humana.
- C11 (progress al día): [x] `progress/current.md` en plantilla y `progress/history.md` con la entrada de la sesión.
- C12 (sin temporales ni debug): [x]

## Trazabilidad y proceso
- Dependencias: `depends_on: [80]` y la 80 está en `done`.
- Acceptance <-> REQ: el índice de `requirements.md` (REQ-89-01..12 -> acceptance 1..5) cuadra con los 5 criterios de `feature_list.json`; cada REQ tiene aserción en `tests/site-footer.test.mjs`, salvo REQ-89-10 «sin scroll horizontal» y REQ-89-11/12, que se cubren con la verificación CDP y con lo anotado en el informe.
- Rojo/verde (REQ-89-11/12): `progress/impl_89.md` anota el rojo (pass 0, fail 7) antes de escribir dominio, componente, hoja y montaje, y `./init.sh` termina en verde. Como la feature se hizo sin implementer, el rojo es lo que declara el informe: no puedo reproducirlo a posteriori.
- Ajustes en tests ajenos (son legítimos y siguen el precedente REQ-43-06 con nota en línea):
  - `tests/geist-pixel-extend.test.mjs` L27: saca `Layout.astro` de la lista de archivos congelados. Tiene que salir porque REQ-89-04 obliga a modificar el layout; el resto de la lista sigue congelada.
  - `tests/about-hero-stats.test.mjs` L56-57: limita «un solo CTA Descargar CV» al `<section class="about-hero">`. Se mantiene la intención original (un CTA en el hero de /about) y el test admite el segundo enlace a /cv.pdf que pide REQ-89-05. Si el selector dejara de existir, el array quedaría vacío y el test fallaría, así que el ajuste no lo debilita.
- Diseño: estructura, tokens, decisiones 1-3 (títulos `<p>`, `#top` sin JS, año inyectable) y reduced-motion se cumplen tal como dice `design.md`.

## Observaciones (no bloqueantes)
1. No existe ningún elemento con `id="top"` (`site-footer.astro` L64). Según HTML, un fragmento `#top` sin destino hace scroll al inicio del documento, así que funciona igual. Si se quiere un destino explícito, puede apuntar a un id existente en una feature futura.
2. El leader dijo que no había nada commiteado, pero los cambios ya están en el commit `815a90d` («feat: implement site footer (feature 89)»). Esto no afecta al veredicto.
3. Lo que queda fuera de alcance según el leader (hueco bajo el footer en páginas cortas como /search) no lo exige la spec y no se cuenta como defecto.

## Cambios requeridos (si aplica)
- Ninguno.
