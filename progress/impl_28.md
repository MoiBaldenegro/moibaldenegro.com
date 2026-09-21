# Informe de implementación — feature 28 gsap-setup-recent-limit

> Base del ciclo GSAP: alta de la dependencia + límite de la portada a los 3
> artículos recientes. Spec: specs/28_gsap-setup-recent-limit/requirements.md
> (REQ-28-01..05, sin design.md — D7). Research:
> progress/research/gsap-horizontal-cards.md (decisiones D1/D3/D6, riesgos
> R1/R3). Cero JS de runtime en esta feature.

## Alcance (solo acceptance de la feature 28)

- `package.json`: gsap en `dependencies` (instalada vía `pnpm add gsap`).
- `docs/dependencies.md`: entrada `### gsap` aprobada (mismo cierre que la
  instalación — el validador falla si viajan separadas, R3).
- `src/components/latest-articles.astro`: selección de los 3 primeros del
  orden descendente de `PostsRepository.getPosts()` (byCreatedDesc), en la
  capa de presentación (D6).
- NO tocado: `src/domain/repositories/posts-repository.ts` (100/100 líneas,
  sin margen), esquema, estilos, layout, feature 10 (stale, orden del líder).

## Ciclo rojo/verde (test-first)

### Tests escritos primero

`tests/gsap-setup-recent-limit.test.mjs` (5 tests, contra la spec):

- REQ-28-01: package.json declara gsap en dependencies con versión semver.
- REQ-28-02: `### gsap` con version/scope iguales a package.json + approved
  y motivo (parseo línea a línea, igual que el validador).
- REQ-28-03: el componente usa `PostsRepository.getPosts()` + `.slice(0, 3)`,
  sin reordenar (no sort/reverse) ni leer la colección directamente.
- REQ-28-04: unitario — 5→primeros 3 en orden, 2→los 2, 1→1, 0→vacío.
- REQ-28-05: package.json, docs/dependencies.md y latest-articles.astro ≤100.

### Evidencia en rojo (antes de implementar)

```
$ node --test tests/gsap-setup-recent-limit.test.mjs
not ok 1 - REQ-28-01: package.json declara gsap en dependencies con la versión instalada
not ok 2 - REQ-28-02: docs/dependencies.md registra ### gsap con version y scope iguales a package.json
not ok 3 - REQ-28-03: la portada limita a 3 cards reutilizando el orden de PostsRepository
ok 4 - REQ-28-04: con menos de 3 artículos se muestran todos sin error
ok 5 - REQ-28-05: cada archivo modificado no supera las 100 líneas
# pass 2, # fail 3
```

(REQ-28-04/05 en verde pre-implementación: el 04 es lógica pura de la regla
de selección y el 05 mide archivos aún sin modificar — esperado y declarado.)

### Implementación

1. `pnpm add gsap` → `gsap: ^3.15.0` en dependencies (+ entrada en
   pnpm-lock.yaml).
2. `docs/dependencies.md`: entrada `### gsap` (version ^3.15.0, scope
   dependencies, approved 2026-09-21, motivo: autorización humana solo para
   `src/pages/index.astro`, ciclo GSAP features 28/29).
3. `src/components/latest-articles.astro` (1 línea):
   `const posts = (await new PostsRepository().getPosts()).slice(0, 3);`
   — `slice` con <3 elementos devuelve todos sin error (REQ-28-04 por
   construcción); sin sort/reverse (se reutiliza byCreatedDesc).
4. Corrección del propio test durante el verde: el helper de parseo del
   registro usaba `\Z` (ancla Perl, en JS es literal "Z") y fallaba aunque la
   entrada existía; se reemplazó por parseo línea a línea como
   `scripts/validate-dependencies.mjs`. Cambio solo de test, no de src/.

### Evidencia en verde (después de implementar)

```
$ node --test tests/gsap-setup-recent-limit.test.mjs
ok 1 - REQ-28-01 ... / ok 2 - REQ-28-02 ... / ok 3 - REQ-28-03 ... / ok 4 - REQ-28-04 ... / ok 5 - REQ-28-05 ...
# tests 5, # pass 5, # fail 0
```

```
$ ./init.sh
✔ node instalado / ✔ pnpm instalado / ✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe / ✔ feature_list.json existe / ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Trazabilidad acceptance ↔ REQ

- acceptance 1 ↔ REQ-28-01/02 (tests 1-2 + validador real en verde).
- acceptance 2 ↔ REQ-28-03 (test 3).
- acceptance 3 ↔ REQ-28-04 (test 4).
- acceptance 4 ↔ REQ-28-05 (test 5).
- acceptance 5 ↔ suite `./init.sh` en verde (tests 100% + build).

## Estado de cierre

- `feature_list.json`: feature 28 en `in_progress` (el `done` lo marca el
  implementer solo con `progress/review_28.md` en APPROVED; feature 10
  intacta en `in_progress` stale según orden del líder).
- Sin deuda: sin archivos temporales, sin debug, sin TODOs; gsap queda
  instalada y registrada para la feature 29 (depends_on [28]).
