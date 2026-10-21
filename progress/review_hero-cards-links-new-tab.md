# Review — feature 110

**Veredicto:** APPROVED

Feature 110 hero-cards-links-new-tab (REQ-110-01..14). Petición humana (2026-10-20): «las cards cuando hacen la
navegacion debe ser un BLANK, que le habra en una nueva pestaña.» Revisión de nivel 1, 2026-10-21.

## Checkpoints
- C1 Arquitectura: [x] La lógica está en el dominio: `src/domain/hero-card-link.ts:12-14` (`cardLinkLabel`, 14 líneas). El frontmatter de `hero-card.astro:18` y de `htb-card.astro:16` solo importa y pasa `label`. No hay `<style>`, `style=` inline, JS de runtime ni CSS nuevo. `hero-card-link.css` no cambia.
- C2 Tamaño: [x] hero-card.astro 52, htb-card.astro 34, hero-card-link.ts 14, hero-cards-links-new-tab.test.mjs 73, hero-cards-links.test.mjs 100, hero-cards-extra-logos.test.mjs 99, hero-cards-polish.test.mjs 100 líneas. Todos dentro de 100.
- C3 Test-first: [x] El informe documenta el rojo original (`scratchpad/red110.txt`: import de `cardLinkLabel` inexistente y marcado `rel="noopener"` antiguo) y un rojo reproducido (`red110b.txt`, pass 5 / fail 2), además del verde (1154/1154). El test usa solo `node:` + `../src/` + `./helpers/`. Los tres tests heredados llevan «Ajuste feature 110 (precedente REQ-43-06)» (hero-cards-links.test.mjs:49 y :64, hero-cards-extra-logos.test.mjs:57, hero-cards-polish.test.mjs:66).
- C4 `./init.sh`: [x] Código 0, tests al 100 %, build OK. Peso de `dist/client/index.html` = **39 903 B**, por debajo de 40 000 B (umbral de REQ-47-06 sin cambiar, así que REQ-110-14 no aplica). El informe anota 39 781 B antes y 39 895 B después. Los 8 B de diferencia no afectan al resultado.
- C5 Alcance y dependencias: [x] `depends_on` está satisfecho (no depende de la 109). sprite.svg, tests/hack-the-box-sprite.test.mjs, about-hero, about-projects y site-footer no tienen diff. `src/content/posts/systems-design/00-systems-design-template.md` aparece modificado, pero es ajeno y anterior a la feature (declarado AJENO por el líder), no de la 110.

## Verificación independiente (Chrome headless + CDP)

Scripts: `scratchpad/rev110/r110.mjs` y `r110b.mjs` (variante con foco por Tab real y cobertura en px). Corrieron contra un `astro preview` propio
en :4620 con el build del `./init.sh` de esta revisión. A 375 px se borró por CDP 1 regla `:not([data-show-on-mobile])` de la 106. Resultados en `rev110/result.json` y `rev110/b/result.json`.

| Ancho | articles / sin `<a>` | `[target]` | Clic GITHUB → targetCreated | Clic YOUTUBE → targetCreated | Enter (foco por Tab) | URL original | Errores |
|---|---|---|---|---|---|---|---|
| 375 | 15 / 13 | 2 | https://github.com/MoiBaldenegro | https://www.youtube.com/@moibaldenegro | mismo href, ambas | http://localhost:4620/ | 0 |
| 800 | 15 / 13 | 2 | idem | idem | idem | idem | 0 |
| 1024 | 15 / 13 | 2 | idem | idem | idem | idem | 0 |
| 1280 | 15 / 13 | 2 | idem | idem | idem | idem | 0 |
| 1600 | 15 / 13 | 2 | idem | idem | idem | idem | 0 |

En los cinco anchos y en las dos cards:
- `target="_blank"` y `rel="noopener noreferrer"`.
- El `a.card-link` es el último hijo y no tiene enlaces anidados.
- Flecha `↗` con `aria-hidden="true"`, a 17.6px (≤1200) y 20px (≥1280) según `hero-card-link.css`.
- Nombre accesible leído del **árbol AX** (`Accessibility.getFullAXTree`): «GITHUB (sitio externo) (se abre en una pestaña nueva)» y «YOUTUBE (sitio externo) (se abre en una pestaña nueva)».
- El hit-test del centro cae en el enlace de su card.
- El enlace cubre la card dentro del borde de 1px: deltas 1,1,2,2 px. El «1,1,1,1» del informe es otra métrica de cobertura, sin conflicto.
- Foco por teclado: `:focus-visible` true, `outline: solid 2px rgb(125, 104, 255)`, offset −4px, igual que en la 107.

Errores: 0 en todos los anchos (exceptions, console.error, Log error, loadingFailed, HTTP ≥400). Con `.focus()` programático tras un clic, Chrome no aplica `:focus-visible`. Es lo esperado y por eso medí con Tab.

Las cards sin href son idénticas a antes: 13 article sin `<a>` ni `target=`, y el test de marcado completo REQ-103 (`hero-cards-extra-logos.test.mjs:57`) pasa en verde.

Capturas: `progress/research/hero110/` tiene las 20 PNG (10 de reposo y 10 de foco). Revisé `github-1280-focus.png` (anillo de foco y flecha visibles) y `youtube-375.png` (card en reposo, sin flecha). Coinciden con mis capturas en `rev110/b/`.

Servidores: paré mi `astro preview` de :4620 (PID 43648 y sus hijos) y Chrome terminó con el script. No toqué el `pnpm dev` de :4321 (PID 34400).

## Cambios requeridos (si aplica)
Ninguno.

Observación menor, que no bloquea: el informe dice «flecha a 13/13 px», que es el tamaño de caja del glifo, no el `font-size` (17.6/20 px). Conviene nombrar la métrica en informes futuros.
