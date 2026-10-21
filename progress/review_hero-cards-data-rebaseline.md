# Review — feature 111

**Veredicto:** APPROVED

Reviewer, 2026-10-20. Alcance: solo la 111 (lista de progress/impl_hero-cards-data-rebaseline.md). No se evalúa la 109
(blocked, hero-card-accents.css y sus tests). Ajenos del humano verificados por sha256 al inicio y al final de la revisión
(sin cambios): src/data/hero-cards.json, public/assets/svg/sprite.svg, src/content/posts/systems-design/*.md,
tests/hack-the-box-sprite.test.mjs; `git diff HEAD` vacío en sprite.svg y hack-the-box-sprite.test.mjs.

## Checkpoints
- C1 Estilos en src/styles, sin `<style>` en .astro: [x] (solo cambia src/styles/hero-card.css:67)
- C2 Sin lógica en UI / datos vía repositorio: [x] (no toca .astro ni el dominio; el test nuevo usa HeroCardsRepository)
- C3 Tokens, sin valores sueltos: [x] (270px / 0deg / 1.25 son variables de icono por token, mismo patrón que el resto de reglas; --card-bg sigue en var(--color-marca-cloudflare))
- C4 Máx. 100 líneas: [x] hero-card.css 99, hero-backdrop-size 97, extra-logos 99, links-xlink 41, polish 100, unique-tech 100, data-rebaseline 61; hero-cards-repository.test.mjs no se toca (146, preexistente)
- C5 Sin dependencias externas: [x] (test nuevo solo node: + repositorio)
- C6 Datos válidos y errores nombrados: [x] (REQ-111-02: 15 tarjetas sin HeroCardsDataError)
- C7 ./init.sh verde: [x] código 0, tests 100 %, build OK (log en el scratchpad, rev111/../init111.log)
- C8 Página correcta en desktop y móvil sin errores: [x] CDP propia (ver abajo), 0 errores de consola/red
- C9 Test-first (rojo antes del código, verde al final): [x] documentado en el informe (8 fail de línea base; 6 fail tras re-basar y antes del CSS, incluidos REQ-111-09 y REQ-97-20; verde 1146/1146)
- C10 Dependencias en done: [x] la 111 no tiene depends_on
- C11 feature_list / progress al día: [x] 111 in_progress con bitácora en progress/current.md (el cierre lo hace el líder)

## Verificación independiente (Chrome headless + CDP, astro preview en :4396, ya parado; :4321 sin tocar)

Medida: getBoundingClientRect del `<use>` de `.card-icon` (href #cloudflare-cloud) frente al article y a los rects del
Range del título. A 375 px se fuerza data-show-on-mobile="true" solo para medir (showOnMobile false, 106).

| Ancho | Card | --icon-width / scale | Nube (x, y, w x h) | Dentro | Título | Hueco |
|---|---|---|---|---|---|---|
| 375 | 346.8x190 | 100px / 1.25 | 248.1, 125.5, 77.2x34.9 | 100 % | 0 | 89.5 |
| 800 | 113.4x140 | 100px / 1.25 | 19.8, 75.5, 77.2x34.9 | 100 % | 0 | 39.5 |
| 1024 | 148.9x140 | 100px / 1.25 | 55.3, 75.5, 77.2x34.9 | 100 % | 0 | 39.5 |
| 1280 | 189.4x204 | 270px / 1.25 | 10.8, 139.5, 77.2x34.9 | 100 % | 0 | 101.5 |
| 1600 | 238.3x204 | 270px / 1.25 | 59.7, 139.5, 77.2x34.9 | 100 % | 0 | 101.5 |
| 1201 (extra) | 176.9x204 | 270px / 1.25 | -1.7, 139.5, 77.2x34.9 | 97.8 % | 0 | 101.5 |

Coincide al décimo con la tabla del implementer. REQ-111-11 cumple a los 5 anchos. Mosaico: rects de las cards a
800/1024/1280/1600 idénticos (Δ 0) a los de mi revisión de la 108 (rev108/res.json); scrollWidth 365/790/1014/1270/1590
(sin desbordamiento). 0 errores de consola, excepciones ni red. Capturas propias:
progress/research/hero111/review-cloudflare-{375,800,1024,1201,1280,1600}.png: nube reconocible, completa y lejos del
título. A 800 px el cornerIcon toca el final de «CLOUDFLARE» (intersección 146.5 px²): fuera de alcance según el
encargo y ya reportado por el implementer.

Nota de método: el override inyectado con `<style>` para reproducir el árbol previo no tuvo efecto en mi script (mismos
rects), así que no reproduzco el rojo por mi cuenta; me apoyo en la captura red-json-scale8-cloudflare-1280.png y en el
rojo de tests del informe.

## Valoración de las 4 notas del implementer

1. Rojo de REQ-111-12: aceptado. El árbol previo (170px / scale 1) ya cumplía la geometría; su rojo real era REQ-97-20
   (CSS 170px frente al JSON 270px). El rojo CDP se obtiene llevando los datos del JSON tal cual al CSS (scale 8: 27.2 %
   dentro, a 7 px del título), que es justo el ajuste que la Decisión 1 rechaza. Es una lectura honesta de un requisito
   cuya premisa (que el árbol previo fallaba la medida) no se cumplía; queda documentado.
2. REQ-98-01/02/05 en tests/hero-cards-unique-tech.test.mjs y no en hero-cards-repository: correcto (el test vive en
   unique-tech:43). No tocar el de repositorio (146 líneas) evita agravar un archivo ya >100.
3. Guarda REQ-107-26/27/36 sin hero-card.css: aceptada. Es una guarda frente a HEAD y REQ-111-09 obliga a editar ese
   archivo, así que mantenerlo la haría imposible. El contenido de hero-card.css sigue vigilado por REQ-97-20/98-35
   (icon-fit), REQ-97-07/08 (unique-tech), REQ-101-15/16 (polish) y REQ-111-09.
4. Test nuevo: correcto y dentro de límites. Es débil en REQ-111-11/12 (solo busca palabras en el informe) y en REQ-111-13
   (existencia de PNG), algo aceptable porque la medida es CDP y no se puede automatizar sin dependencias.

## Los re-basados no se han debilitado

- REQ-101-17 (polish:84-86) y REQ-98-01/02/05 (unique-tech:17, 46-50) mantienen la instantánea congelada con la entrada
  cloudflare literal (#cloudflare-cloud, 270px, scale 8): un cambio no anunciado del JSON sigue haciéndolos fallar (REQ-111-08).
- REQ-107-30/31/35 (links-xlink:21-22) es más estricto que antes: compara el multiconjunto exacto de hrefs, no solo el recuento.
- REQ-108-06/07/17 (backdrop-size:56-66) exige el valor por card, la ausencia del atributo sin tamaño y el recuento total.
- REQ-103-05..08 (extra-logos:41-49) ya no fija qué tarjetas llevan extras: lo pide la spec (REQ-111-05), y a cambio añade
  que solo los lleven tarjetas de icono con refs al sprite. REQ-103-09..11 conserva la cadena exacta de capas.
- REQ-97-20 / REQ-98-35 (icon-fit) sin tocar y sin excluir tarjetas (REQ-111-10).

## Observaciones (no bloquean)

1. src/styles/hero-card.css:56: el comentario del bloque que se editó dice todavía «svg de 32px de alto»; el svg de
   .card-icon mide 28px. Conviene corregirlo la próxima vez que se toque el archivo.
2. tests/hero-cards-data-rebaseline.test.mjs:57-61 (REQ-111-14) compara contra HEAD: si el humano edita sprite.svg o
   hack-the-box-sprite.test.mjs fuera de una feature, la suite se pone en rojo. Es la misma fragilidad que ha motivado
   esta feature (misma pauta que REQ-107-26). Tras el commit de este ciclo conviene retirarla o convertirla en una guarda
   de sesión.
3. La spec no tiene test para REQ-111-01 (el JSON byte a byte igual): lo verifiqué por sha256.
4. A 1201-1280 px la nube queda a la izquierda, sobre el wordmark de fondo (109), y a 1201 px asoma 1.7 px por la
   izquierda (97.8 % dentro, ≥ 90 %). Viene del iconWidth 270px del humano y ya figura en los hallazgos del informe.

## Cambios requeridos (si aplica)

Ninguno.
