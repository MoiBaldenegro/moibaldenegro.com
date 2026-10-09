# Review — feature 66

**Veredicto:** APPROVED

Feature 66 site-domain-moisesbaldenegro. Se revisó contra specs/66_site-domain-moisesbaldenegro/
(requirements.md y design.md), los criterios 1-10 de feature_list.json (id 66), docs/architecture.md,
docs/conventions.md y CHECKPOINTS.md. El estado final se comprobó con `git diff ac94be2 --`, que
incluye el commit humano c387cd8 y el working tree.

## Requisitos
- REQ-66-01: [x] astro.config.mjs:6 tiene `site: 'https://moisesbaldenegro.com'`.
- REQ-66-02: [x] src/domain/seo/head.ts:3 tiene `BRAND = 'moisesbaldenegro.com'`. Los 2 comentarios (l.16-17) también están actualizados.
- REQ-66-03: [x] src/pages/about.astro:13 lleva el título `About — moisesbaldenegro.com`. src/layouts/Layout.astro:54 lleva `alt="Inicio — moisesbaldenegro.com"`.
- REQ-66-04: [x] public/site.webmanifest:2-3 tiene name y short_name actualizados.
- REQ-66-05: [x] src/domain/repositories/htb-profile-repository.ts:48 envía el User-Agent `moisesbaldenegro.com`.
- REQ-66-06: [x] tests/site-domain-moisesbaldenegro.test.mjs:56-78 hace el build en un outDir temporal y comprueba canonical, og:url, og:image y url/@id del JSON-LD en index, about y un post. También comprueba cada `<loc>` (exige al menos uno) y la línea Sitemap de robots.txt. La versión de ac94be2 tenía el sitemap como opcional y no miraba robots.txt. El working tree lo corrige.
- REQ-66-07: [x] `grep -rn "moibaldenegro\.com" src public astro.config.mjs README.md` no devuelve nada. El test de las l.38-44 lo cubre.
- REQ-66-08: [x] Se conservan @moibaldenegro (hero.json, TWITTER_SITE, texto del enlace), `https://x.com/moibaldenegro` (Layout.astro:57) y el Worker `moibaldenegro-web`. El test de las l.47-52 lo verifica.
- REQ-66-09: [x] progress/impl_66.md documenta el rojo (pass 1 / fail 5; solo pasaba REQ-66-08, como es lógico) antes del código, y luego el verde con 6/6 y la suite a 792/792.
- REQ-66-10: [x] `./init.sh` termina en verde (formato, tests al 100% y build) con exit 0. Los 11 tests que fijaban el dominio viejo llevan la nota «Ajuste feature 66 (precedente REQ-43-06)». Para las 100 líneas, ver la observación 1.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>`): [x] no aplica. Solo cambian literales.
- C2 (sin lógica en la UI): [x] solo cambian literales en el frontmatter y el marcado.
- C3 (datos vía repositorio): [x] no aplica.
- C4 (tokens): [x] no aplica. Sin CSS, como dice design.md.
- C5 (100 líneas máx.): [x] El código de producción queda dentro del límite: head.ts 28, Layout.astro 66, about.astro 24, htb-profile-repository.ts 97 y astro.config.mjs 46 líneas. El test nuevo tiene 78. Los tests ajustados son seo-head-base 99→100, sitemap-robots-endpoints 95→96, security-headers 87→88, link-image-accessible-names 78→79, social-meta-tags 79→80, article-json-ld 73→74 y manifest-generator-cleanup 42→43. Ninguno cruza el umbral. Los que ya superaban 100 son deuda previa (ver la observación 1).
- C6 (sin dependencias externas): [x] el test nuevo solo usa node:* y el helper existente.
- C7 (`./init.sh` verde): [x] lo ejecuté en esta revisión: exit 0, tests al 100% y build OK.
- C8 (dependencias en done): [x] depends_on [68], y la 68 está en `done`.
- C9 (harness/progress): [x] impl_66.md documenta el ciclo. La feature sigue `in_progress` hasta que el líder la cierre.
- C10 (TDD rojo/verde documentado): [x] impl_66.md, sección «Ciclo rojo/verde».

## Observaciones (no bloqueantes)
1. REQ-66-10 y las 100 líneas. about-page (264→265), layout-refactor (202→203), project-readme
   (131→132) y search-keyboard-escape (359→360) ya superaban 100 líneas en ac94be2. La feature
   solo les añade la línea de nota que exige el propio REQ-66-10 («actualizados con nota de
   ajuste»). Cumple el espíritu del requisito: la feature no lleva ningún archivo de ≤100 a >100,
   el exceso es previo y se trata igual que en las reviews 46, 60 y 61. Leído al pie de la letra,
   «cada archivo modificado no supera las 100 líneas» no se cumple para esos 4 archivos. Pero
   cumplirlo exigiría partir tests heredados dentro de una feature de cambio de dominio, y eso
   va contra «una sola feature a la vez». Recomiendo que el humano dé de alta, vía spec_author,
   una feature de partición de los tests de más de 100 líneas, o que en futuras specs se acote
   la redacción («ningún archivo pasa de ≤100 a >100»). Detalle menor: impl_66.md da 361 líneas
   para search-keyboard-escape, pero el valor real es 360.
2. Cuando la feature se cierre, conviene verificar en producción que https://moisesbaldenegro.com
   sirve el canonical nuevo. Las redirecciones www y Cloudflare quedan fuera de alcance, como dice
   la spec.

## Cambios requeridos
Ninguno.
