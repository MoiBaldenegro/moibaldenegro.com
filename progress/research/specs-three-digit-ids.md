# Análisis — feature 100 specs-three-digit-ids (spec_author, 2026-10-16)

Origen: bloqueo de arnés al dar de alta el pulido del hero (renumerado a la 101, ver progress/research/hero-cards-polish.md). Decisión del líder 2026-10-16: mantenimiento del arnés, Node stdlib, sin dependencias, sin decisión humana.

## Qué es

El backlog llega al id 100 y el validador de specs asume ids de feature de 2 dígitos exactos en el prefijo de cada línea de requisitos. La feature amplía el primer grupo del prefijo a 2 o más dígitos conservando el formato de todas las specs existentes.

## Qué toca (inventario de la suposición de 2 dígitos)

- scripts/validate-specs.mjs:9 `REQ_PREFIX = /^REQ-(\d{2})-(\d{2})\s+(.+)$/`: ÚNICO punto que rompe. Cambio: primer grupo a `(\d{2,})`; el segundo (secuencial `<xx>`) se queda en `(\d{2})`.
- scripts/validate-specs.mjs:63 `String(feature.id).padStart(2, '0')`: ya correcto para 3 dígitos ("100"); comparación con `prefix[1]` exacta, así que REQ-10-01 sigue sin pasar por 100 y al revés.
- scripts/check-format.mjs, validate-feature-list.mjs, validate-progress.mjs, validate-dependencies.mjs, audit-design-tokens.mjs, init.sh: sin regex de ids de feature (revisado con grep de `\d{2}` y `padStart`).
- tests/: ningún test fija el regex; tests/cv-pdf-endpoint.test.mjs:53 ejecuta check-format y exige código 0 (se pone en rojo mientras dure el huevo y la gallina). tests/harness-kit-integrity.test.mjs solo lista el archivo.
- Textos: docs/conventions.md:38 y specs/_template/requirements.md:4 y :23 dicen «padding a 2 dígitos»; no es falso (padStart es mínimo) pero es ambiguo: se aclara «mínimo 2 dígitos; 3 o más desde el id 100». docs/verification.md solo usa `<NN>` sin definirlo: sin cambio. Hallazgo menor (fuera de alcance, no bloquea): .claude/agents/spec_author.md:70 y .opencode/agents/spec_author.md repiten «padding a 2 dígitos»; se puede alinear en otra feature si el líder lo pide.

## Huevo y gallina (decisión)

Las líneas REQ-100-xx de la propia spec de la 100 (y las REQ-101-xx de la 101) no validan con el regex actual. Alternativas valoradas:

1. Alta de 100 y 101 ahora con check-format en rojo SOLO por los prefijos de 3 dígitos hasta que el implementer aplique el fix test-first. ELEGIDA (indicación del líder; sin debilitar el validador; el rojo es acotado, diagnosticable y desaparece con el propio fix).
2. Dar de alta la 100 con status done o fuera del backlog para saltar la validación: descartada (falsea el estado, el validador omite las done).
3. Escribir la spec con prefijos de 2 dígitos o como comentarios: descartada (truco que rompe la trazabilidad REQ-<id>).
4. Alta solo de la 100 y la 101 tras el fix: reduciría el rojo de 33 a 12 líneas pero deja el pulido fuera del backlog; descartada por indicación del líder (la 101 ya declara depends_on [100]).

Consecuencias mientras dure: `node scripts/check-format.mjs` sale con código 1 (33 errores «falta el prefijo REQ-<NN>-<xx>»: 12 de specs/100_*, 21 de specs/101_*), ./init.sh suma el fallo de formato y el de tests/cv-pdf-endpoint.test.mjs, además de los 4 ajenos del post sin design00.webp. El implementer de la 100 no debe interpretar ese rojo como backlog roto: es el estado de partida esperado y su test nuevo lo cubre con fixtures propias.

## Riesgos

- Selección del arnés: la 93 está in_progress (APPROVED pendiente de cierre); la 100 es la siguiente pending sin dependencias y la 101 depende de ella.
- El test debe usar fixtures en os.tmpdir() para validateSpecs (no depender del backlog real) salvo la aserción de REQ-100-10.
