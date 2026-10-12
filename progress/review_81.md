# Review — feature 81

**Veredicto:** APPROVED

## Checkpoints
- C1 (arquitectura: estilos/UI/datos vía repositorio/tokens): [x] — sin `.astro` ni CSS tocados; `src/pages/cv.pdf.ts` solo usa `HeroProfileRepository` y `AboutRepository` (no importa `src/data`); lógica pura en `src/domain/cv/`.
- C2 (<= 100 líneas en src/): [x] — win-ansi.ts 22, text-wrap.ts 25, cv-sections.ts 61, cv-layout.ts 84, cv-pdf.ts 36, cv.pdf.ts 14. El test `tests/cv-pdf-endpoint.test.mjs` mide 240, en línea con el precedente de tests de integración del repo (varios de 300-394); REQ-81-23 acota el límite a src/.
- C3 (dependencias con discusión previa): [x] — pdf-lib 1.17.1 exacta aprobada por el humano el 2026-10-12; `package.json` `"pdf-lib": "1.17.1"` coincide con `### pdf-lib` de `docs/dependencies.md` (version 1.17.1, scope dependencies, approved 2026-10-12, motivo cita el CV en PDF); nota del 2026-10-12 marcada APLICADA en la 81; `node_modules/pdf-lib` es 1.17.1; `node scripts/check-format.mjs` exit 0.
- C4 (test-first): [x] — `progress/impl_81.md` documenta el rojo 11/11 (ERR_MODULE_NOT_FOUND / falta cv.pdf.ts / sin pdf-lib) antes de crear src/domain/cv/ y el verde 11/11, suite 867/867.
- C5 (`./init.sh` verde): [x] — ejecutado por el reviewer: formato, tests al 100% y build en verde.
- C6 (depends_on): [x] — feature 80 en `done`.
- C7 (acceptance <-> REQ): [x] — los 7 criterios de `feature_list.json` cubren REQ-81-01..24 según el índice de trazabilidad de la spec.

## Verificación independiente del reviewer
- `dist/client/cv.pdf` (4283 B) empieza por `%PDF-1.7`; `PDFDocument.load` da 2 páginas 595.28 x 841.89, título `CV — Moisés Baldenegro Melendez`, autor `Moisés Baldenegro Melendez`, `/Lang (es-MX)`, CreationDate y ModDate 2026-10-12T00:00:00Z (cargado con `updateMetadata: false`).
- Determinismo: dos `renderCvPdf` separadas 1,5 s producen bytes idénticos.
- Privacidad: el texto decodificado del PDF (3141 caracteres) no coincide con el regex de correo ni el de teléfono; "mc.moisesm16" no aparece. "647" solo aparece dentro de la codificación hex de `Educación` (`<45647563616369F36E>`), no como texto.
- Repo: `git grep --untracked` de "mc.moisesm16" solo encuentra la nota de `progress/review_80.md`; "647" solo da coincidencias benignas (recuentos 647/647 en history/impl_43/review_43, `L64755` en research, coordenadas de `public/assets/svg/sprite.svg`, preexistente). Ningún teléfono ni correo personal.
- Solo `src/domain/cv/cv-pdf.ts` importa pdf-lib (las otras menciones son comentarios). `/cv.pdf` no figura en el sitemap.
- REQ-81-24: `git status --porcelain` sobre `src/pages/about.astro`, `src/styles/`, `src/domain/seo/sitemap.ts` y `public/` vacío.
- Ajustes legacy (`tests/dependencies-registry-crlf.test.mjs:26-27`, `tests/gsap-dependency-approval.test.mjs:59-61`, `tests/sitemap-robots-endpoints.test.mjs:73`) se limitan a sumar pdf-lib al conjunto, con comentario de precedente REQ-43-06.

## Observaciones (no bloqueantes)
1. `cv-sections.ts:35` pone en negrita el «Resultado: …»; decisión tipográfica fuera de spec, inocua.
2. La página 2 solo contiene Idiomas; cumple REQ-81-21 (máx. 2 páginas).

## Cambios requeridos (si aplica)
Ninguno.
