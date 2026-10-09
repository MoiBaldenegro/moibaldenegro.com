# Análisis — Subida de @cloudflare/workers-types (feature 60 workers-types-upgrade)

Fecha: 2026-10-08 (sesión 2). Autor: spec_author.

## Problema

En la feature 41 wrangler subió a 4.149.0, cuyo peer es
`@cloudflare/workers-types@^5.20261006.1`. El repo declara `^5.20260812.1`
(devDependencies) y el lockfile resuelve 5.20260812.1 (pnpm-lock.yaml: el
importer raíz y las claves `wrangler@4.149.0(@cloudflare/workers-types@5.20260812.1)`),
así que el peer queda sin satisfacer. No se subió en la 41 porque su
aprobación no cubría este paquete.

## Decisión humana

2026-10-08: «si resube la version de cloudflare» → sí, subir. Registrada como
nota PENDIENTE en docs/dependencies.md (sección «Aprobaciones de cambio de
versión»). La entrada `### @cloudflare/workers-types` NO se toca hasta aplicar
la feature (el validador compara registro con package.json). Se corrigió
además la intro de esa sección (decía «pendientes de aplicar» pese a haber una
nota APLICADA; observación del reviewer de la 41).

## Alcance (feature 60)

- package.json (devDependencies) y pnpm-lock.yaml: última 5.x (en
  `pnpm view` a 2026-10-08: 5.20261008.1, que satisface ^5.20261006.1).
- docs/dependencies.md: entrada con versión nueva y `approved: 2026-10-08`;
  nota marcada APLICADA en la 60.
- tests/workers-types-upgrade.test.mjs según el patrón de
  tests/astro-security-upgrade.test.mjs (rango mínimo, versión del lock,
  registro). No toca src/ ni UI: sin design.md. Sin dependencias nuevas.

## Riesgos

- worker-configuration.d.ts (generado por `wrangler types`) o el chequeo de
  tipos pueden cambiar con los tipos nuevos; si aparecen errores de tipos se
  documentan en progress/impl_60.md, sin tocar código fuera de alcance.
- Comprobar que `pnpm install` no emite avisos de peer de wrangler/
  @cloudflare/vite-plugin sobre workers-types.
- Independiente de 44-59; puede ejecutarse en cualquier orden (sin depends_on).
