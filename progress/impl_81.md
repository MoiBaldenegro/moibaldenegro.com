# Implementación — feature 81 cv-pdf-endpoint

## Rojo (REQ-81-22)

Anotado ANTES de instalar pdf-lib y de crear `src/domain/cv/` y `src/pages/cv.pdf.ts`
(`ls src/domain/cv` → `No such file or directory`).

`node --test tests/cv-pdf-endpoint.test.mjs`:

```
✖ REQ-81-01/02/03: pdf-lib 1.17.1 exacta registrada y validador de dependencias verde
    AssertionError: + undefined - '1.17.1'
✖ REQ-81-04/05/06: toWinAnsi elimina lo que no es WinAnsi y conserva los textos del CV
    ERR_MODULE_NOT_FOUND: Cannot find module '...\src\domain\cv\win-ansi.ts'
✖ REQ-81-07/08: wrapText respeta maxWidth, conserva el texto y aísla palabras largas
    ERR_MODULE_NOT_FOUND: Cannot find module '...\src\domain\cv\text-wrap.ts'
✖ REQ-81-09/10: layoutCv devuelve páginas A4 con el orden del CV
    ERR_MODULE_NOT_FOUND: Cannot find module '...\src\domain\cv\cv-layout.ts'
✖ REQ-81-11: salto de página al margen inferior            (ERR_MODULE_NOT_FOUND cv-layout.ts)
✖ REQ-81-12: puestos, periodos, logros con viñeta y resultado (ERR_MODULE_NOT_FOUND cv-layout.ts)
✖ REQ-81-13/14/15: WinAnsi en cada operación, exclusiones y privacidad (ERR_MODULE_NOT_FOUND)
✖ REQ-81-16/17/18: adaptador pdf-lib único, StandardFonts, metadatos y bytes deterministas
    AssertionError: + [] - ['src/domain/cv/cv-pdf.ts']
✖ REQ-81-19/20: endpoint prerenderizado que responde application/pdf
    AssertionError: falta src/pages/cv.pdf.ts
✖ REQ-81-21 (build): dist/client/cv.pdf con 1-2 páginas A4, nombre y sin correo ni teléfono
    AssertionError: el build no emitió client/cv.pdf
✖ REQ-81-23: los archivos de src/ creados miden <= 100 líneas
    AssertionError: falta src/domain/cv/win-ansi.ts
ℹ tests 11
ℹ pass 0
ℹ fail 11
```

## Implementación

- **Dependencia** (REQ-81-01/02/03): `pnpm add pdf-lib@1.17.1 --save-exact` → `"pdf-lib": "1.17.1"` en
  `dependencies` (lockfile actualizado; trae @pdf-lib/standard-fonts, @pdf-lib/upng, pako y tslib).
  Entrada `### pdf-lib` en `docs/dependencies.md` (version 1.17.1, scope dependencies, approved
  2026-10-12, motivo, licencia MIT, alcance) y la nota del 2026-10-12 pasa de PENDIENTE a
  APLICADA en la 81. El archivo conserva sus CRLF. `node scripts/check-format.mjs` → exit 0.
- **Dominio puro** `src/domain/cv/` (ninguno importa pdf-lib salvo el adaptador):
  - `win-ansi.ts` (22 líneas): `toWinAnsi(text)`. Normaliza los espacios en blanco a ' ', filtra
    a WinAnsi (0x20-0x7E, 0xA0-0xFF y los 27 extra de CP1252: €, –, —, •, comillas tipográficas…)
    y colapsa/recorta espacios. El conjunto coincide con `Encodings.WinAnsi` de
    @pdf-lib/standard-fonts (191 códigos ≤ 0xFF + 27 extra, comprobado en node).
  - `text-wrap.ts` (25): `wrapText(text, maxWidth, measure)` con `measure: (text) => number`.
    En el test se inyecta `(t) => measure(t, 10)` sobre el `measure = (t, size) => t.length * size * 0.5`
    del acceptance (el tamaño lo fija la maqueta por bloque).
  - `cv-sections.ts` (61): `cvSections(hero, about)` → bloques {text, size, bold?, gapBefore?,
    bullet?, keepWithNext?} en el orden de REQ-81-10. El contacto es una línea con las tres URLs
    de `cvContact` separadas por ' | '. Experiencia: rol (negrita), «organización · lugar ·
    period», logros con '• ' y «Resultado: …» del primer puesto. Habilidades «Área: items».
    No usa foto, `description` de hero.json, proyectos, contenido ni filosofía.
  - `cv-layout.ts` (84): `layoutCv(hero, about, measure)` → `CvPage[]` A4 595.28 × 841.89 con ops
    {text, x, y, size, bold}. Márgenes de 48 pt, interlineado 1.35, sangría colgante para las
    viñetas, salto de página cuando la línea quedaría por debajo de 48 pt (la nueva página
    arranca en y = 841.89 − 48 − size) y `keepWithNext` para que ningún título o rol quede
    huérfano al pie. Cada texto pasa por `toWinAnsi` antes de partirse y otra vez al emitirse.
  - `cv-pdf.ts` (36): `renderCvPdf(hero, about)`, el único import de pdf-lib en src/.
    `PDFDocument.create({ updateMetadata: false })`, `embedFont(StandardFonts.Helvetica)` y
    `embedFont(StandardFonts.HelveticaBold)` sin bytes de fuente, título
    'CV — Moisés Baldenegro Melendez', autor `hero.name`, idioma es-MX y CreationDate/ModDate
    fijas a 2026-10-12T00:00:00Z. La métrica es `widthOfTextAtSize`.
- **Endpoint** `src/pages/cv.pdf.ts` (14): `export const prerender = true`; datos solo de
  `HeroProfileRepository` y `AboutRepository`; responde 200 con `Content-Type: application/pdf`.
- **Prerender en workerd: funciona sin cambios** (`prerenderEnvironment` intacto). El build
  muestra `├─ /cv.pdf (+35ms)` y emite `dist/client/cv.pdf` (4283 B, 2 páginas). Página 1:
  desde el nombre hasta Certificaciones. Página 2: Idiomas. /cv.pdf no está en
  `dist/client/sitemap.xml` (0 coincidencias).
- **Ajustes de tests legacy** (precedente REQ-43-06, igual que en la feature 70): fijaban el
  conjunto exacto de dependencias y se les suma `pdf-lib`. Son
  `tests/dependencies-registry-crlf.test.mjs` (APPROVED pasa a 6 entradas y el título dice
  «sus entradas aprobadas»), `tests/sitemap-robots-endpoints.test.mjs` (REQ-42-08) y
  `tests/gsap-dependency-approval.test.mjs` (REQ-70-08/09).
- Ajuste del propio test nuevo durante el verde: la comprobación «cv-layout.ts no importa
  pdf-lib» buscaba la palabra en cualquier parte, incluido el comentario de cabecera «No importa
  pdf-lib». Ahora busca un `import`/`from 'pdf-lib'` real.

## Verde

`node --test tests/cv-pdf-endpoint.test.mjs`:

```
✔ REQ-81-01/02/03: pdf-lib 1.17.1 exacta registrada y validador de dependencias verde
✔ REQ-81-04/05/06: toWinAnsi elimina lo que no es WinAnsi y conserva los textos del CV
✔ REQ-81-07/08: wrapText respeta maxWidth, conserva el texto y aísla palabras largas
✔ REQ-81-09/10: layoutCv devuelve páginas A4 con el orden del CV
✔ REQ-81-11: salto de página al margen inferior
✔ REQ-81-12: puestos, periodos, logros con viñeta y resultado
✔ REQ-81-13/14/15: WinAnsi en cada operación, exclusiones y privacidad
✔ REQ-81-16/17/18: adaptador pdf-lib único, StandardFonts, metadatos y bytes deterministas
✔ REQ-81-19/20: endpoint prerenderizado que responde application/pdf
✔ REQ-81-21 (build): dist/client/cv.pdf con 1-2 páginas A4, nombre y sin correo ni teléfono
✔ REQ-81-23: los archivos de src/ creados miden <= 100 líneas
ℹ tests 11
ℹ pass 11
ℹ fail 0
```

`pnpm test` → `ℹ tests 867 · ℹ pass 867 · ℹ fail 0` (antes 856).

`./init.sh` → exit 0:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## REQ-81-23/24 (verificación manual)

- Líneas: win-ansi.ts 22 · text-wrap.ts 25 · cv-sections.ts 61 · cv-layout.ts 84 · cv-pdf.ts 36 ·
  cv.pdf.ts 14 (todas ≤ 100).
- `git diff --name-only HEAD -- src/pages/about.astro src/styles src/domain/seo/sitemap.ts public`
  → vacío, y `git status --porcelain` sobre esas rutas también. No hay un test permanente de git
  diff: las features 82-84 reescriben about.astro y ese test quedaría roto.

## Privacidad

No hay teléfono ni correo en el repo ni en el PDF. El test de build descomprime los streams
FlateDecode del `client/cv.pdf` generado y decodifica las cadenas hex WinAnsi: el texto contiene
'Moisés Baldenegro Melendez' y no coincide con los regex de correo ni de teléfono. La maqueta
pura se comprueba con los mismos regex, op a op.

## Archivos

- Nuevos: `src/domain/cv/{win-ansi,text-wrap,cv-sections,cv-layout,cv-pdf}.ts`,
  `src/pages/cv.pdf.ts`, `tests/cv-pdf-endpoint.test.mjs`.
- Modificados: `package.json`, `pnpm-lock.yaml`, `docs/dependencies.md`, los 3 tests legacy de
  arriba, `feature_list.json` (81 → in_progress) y `progress/current.md`.

## Notas para el reviewer

- El «Resultado: …» del primer puesto va en negrita para destacarlo; es una decisión
  tipográfica, no la pide la spec.
- La página 2 solo contiene Idiomas. Cumple «máximo 2 páginas»; si se quisiera una sola página,
  bastaría con ajustar el interlineado o los tamaños, que no se ha hecho para no salirse del scope.
