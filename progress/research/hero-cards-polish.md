# Análisis — feature 101 hero-cards-polish (spec_author, 2026-10-16)

Origen: observaciones no bloqueantes 1-5 del reviewer de la 99 (progress/review_hero-os-panel-mosaic.md) y petición humana 2026-10-16 (literal): «Has todo lo que tengas pendiente de una ves». Concreción del orquestador en 5 puntos (logos grandes y NestJS; títulos tapados en tablet; HTB a 800 px; limpieza de --card-column/--card-row; opcional: menos alineación en las columnas 9-12).

## Qué es

Pulido visual del mosaico del hero sin tocar la geometría de la 99. Toca solo presentación: src/styles/hero-card.css (98 líneas), src/styles/htb-card.css (22), src/styles/tokens.css (--color-marca-nestjs) y los tests que fijan esos valores. No toca dominio (src/domain/hero-grid-*.ts), JSON, componentes .astro ni archivos de la 93 (layout.css, site-menu.css, search-bar.css, site-menu.ts).

## Línea base medida (CDP del reviewer de la 99, scratchpad rv99/m.json, mismo código que hoy)

- Solape título/logo visible: 0 px² en las 14 cards de icono a 375, 1280 y 1600. A 800 y 1024 solo CSS (456,3 px²) y HTML (605,6 px²) tapan su título: ambas siguen con --icon-scale 5 en el tramo <= 1200 px (no tienen override en el @media). NESTJS ya da 0 px² (la exención por contraste de la 97 deja de hacer falta).
- Cards grandes a 1280/1600: NODE JS 495x204 / 617x204, NESTJS y TYPESCRIPT 393x204 / 491x204, con --icon-width 165/160/150 px frente a 105-120 px de las 2x2; en la captura progress/research/hero99/hero-grid-1280.png el logo de las grandes mide a ojo lo mismo que el de una 2x2 y la card se ve vacía.
- NESTJS: fondo --color-marca-nestjs #A3132F e icono del sprite #E0234E (fill fijo en public/assets/svg/sprite.svg): contraste logo/fondo 1,68:1 (por debajo de 3:1 de WCAG 1.4.11); título blanco 7,80:1.
- HTB a 800 px (card 113x149): el título «HACK THE BOX» pasa a 2 líneas y el aviso «Estadísticas no disponibles» (padding superior fijo calc(var(--gap-card) * 4) y lateral * 1.5 más el padding de la píldora) se corta por la derecha («Estadistica», «disponible») y queda pegado al título (captura progress/research/hero99/hero-grid-800.png). A 1024 la card mide 149x149: mismo riesgo.
- hero-card.css líneas 13-14: grid-column: var(--card-column); grid-row: var(--card-row); sin definir desde la 98 (inocuo).

## Decisiones (valores por defecto revisables)

1. NestJS: oscurecer el token --color-marca-nestjs a #3A0D18 (granate muy oscuro, conserva el tono rojo): logo #E0234E 3,61:1 (>= 3:1), título blanco 16,79:1 (>= 4,5:1). Alternativas medidas: #2A0A12 (3,93 / 18,25), #330B16 (3,77 / 17,50), #4A0F1E (3,28 / 15,24). Descartado tratar el icono (filter o fill) porque el fill del sprite es fijo y un filtro altera el color de marca del logo.
2. Logos grandes: subir --icon-width en las reglas base de node/nestjs/typescript (partida 240/230/220 px, calibrable por el implementer con la medida) con criterio medible: área visible del logo de cada grande >= 1,5 x la mediana del área visible de las 2x2 de icono a 1280 y 1600, con centro dentro, >= 40 % visible y 0 px² sobre el título. En el @media (max-width: 1200px) se fijan los anchos actuales (165/160/150 px) para no cambiar tablet; a <= 768 rige el 110px !important existente.
3. CSS y HTML en <= 1200 px: --icon-scale 3 (partida, como REACT/NODE) hasta 0 px² con >= 40 % visible.
4. Criterio de la 97 extendido: 0 px² en las 14 cards de icono a 375, 769, 800, 1024, 1200, 1280 y 1600 sin exenciones (769 y 1200 son los bordes del tramo tablet). Si alguna no llega a 0 con >= 40 % visible, el implementer para y lo reporta (no se inventa exención).
5. HTB en <= 1200 px: padding del cuerpo menor y tipografía del aviso menor en htb-card.css/htb-stadistics.css, de modo que cada palabra del aviso quede dentro del article, sin partir, y sin solape con el título.
6. Limpieza: fuera las 2 líneas de --card-column/--card-row (hero-card.css queda en ~97 líneas con los overrides nuevos; si supera 100, partir en src/styles/hero-card-icons.css importada por el mismo componente).

## Punto 5 (opcional) — fuera de alcance, no es barato

Prueba: con 12 columnas y anchos {4,2,2,2,2}, todas las sumas parciales son pares, así que cada card empieza en columna impar y las 2-col caen en las 6 ranuras fijas 1-2, 3-4, ..., 11-12. Cada fila inferior ocupa 4 de esas 6 ranuras con 2-col; dos subconjuntos de 4 elementos de un conjunto de 6 comparten al menos 2. Por tanto entre las filas 7-8 y 9-10 siempre hay >= 2 cards con columnas idénticas (hoy HTML/YOUTUBE y CLAUDE CODE/GITHUB; con 2-2-2-2-4 serían CSS/YOUTUBE y REACT/GITHUB): cambiar el patrón solo mueve la coincidencia. Bajarla exige anchos impares (3) o más de una doble por fila, lo que rompe la invariante de la 98/99 (5 cards por fila con 1 doble). Se deja fuera y se anota para el humano.

## Riesgos

- Tests que fijan valores: tests/design-tokens.test.mjs (#A3132F), tests/hero-cards-unique-tech.test.mjs (TOKENS.nestjs), tests/hero-cards-icon-fit.test.mjs y tests/hero-mosaic-layout.test.mjs (anchos/escalas); se ajustan con la nota «Ajuste feature 101 (precedente REQ-43-06)».
- Hover (scale x1,12) puede invadir el título: el criterio se mide en reposo como en 97/99.
- ./init.sh en rojo por 4 tests ajenos (post systems-design sin design00.webp): no cuenta contra la 101; la build para el preview puede requerir el mismo entorno que usó el implementer de la 93.

## Bloqueo del alta (2026-10-16) y renumeración a la 101

Bloqueo original: scripts/validate-specs.mjs valida el prefijo con `/^REQ-(\d{2})-(\d{2})\s+(.+)$/`, así que con esta feature como id 100 check-format daba «falta el prefijo REQ-<NN>-<xx>» en las 21 líneas (la carpeta sí la resolvía bien con `padStart(2, '0')`). Se revirtió el alta.

Decisión del líder (2026-10-16, mantenimiento del arnés, sin decisión humana): el id 100 pasa a la feature de arnés 100 specs-three-digit-ids (el validador acepta ids de feature de 2 o más dígitos; análisis en progress/research/specs-three-digit-ids.md). Este pulido se renumera a la feature 101: carpeta specs/101_hero-cards-polish/, REQ-101-01..21, nota de test «Ajuste feature 101 (precedente REQ-43-06)» y capturas en progress/research/hero101/. La 101 declara depends_on [100]. Hasta que la 100 quede done, check-format sigue en rojo por los prefijos REQ-100-xx y REQ-101-xx (ver la sección «Huevo y gallina» del análisis de la 100). El alta se hizo con el script del scratchpad add101.cjs, derivado de add100.cjs.
