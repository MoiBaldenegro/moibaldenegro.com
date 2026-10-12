# Diseño — Geist Sans y Geist Mono como fuentes base (feature 85 geist-font-base)

## Contexto visual

- Afecta a todo el sitio (Layout.astro): cuerpo, navegación, buscador, tarjetas, artículos y
  bloques de código. Análisis completo: progress/research/geist-font.md.
- Estado actual: `--font-sans: Inter, ui-sans-serif, system-ui, sans-serif`, pero Inter
  nunca se carga → se ve la fuente del sistema (Segoe UI / San Francisco). El código usa el
  monospace por defecto del navegador.
- Estado deseado: todo el texto que hoy usa `var(--font-sans)` se ve en Geist (variable,
  100-900, con cursiva real) y `code`, `pre`, `kbd`, `samp` en Geist Mono. Los títulos
  siguen en Geist hasta la feature 86 (Pixel).

```
<head>
  <Font cssVariable="--font-geist-sans" preload={[{ style: 'normal' }]} />  → @font-face + :root{--font-geist-sans: "Geist", "Geist fallback: Arial", sans-serif} + 1 preload
  <Font cssVariable="--font-geist-mono" />                                   → @font-face + :root{--font-geist-mono: …}, sin preload
tokens.css:   --font-sans → var(--font-geist-sans, …)   --font-mono → var(--font-geist-mono, …)
typography.css:  code, pre, kbd, samp { font-family: var(--font-mono); }
```

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-sans` | `var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)` | Texto base (todas las hojas que ya lo consumen; sin cambios en ellas) |
| `--font-mono` | `var(--font-geist-mono, ui-monospace, monospace)` | code, pre, kbd, samp (typography.css) |
| `--font-geist-sans` / `--font-geist-mono` | definidos por `<Font>` de Astro | Solo referenciados desde tokens.css, nunca desde otras hojas |

## Decisiones y constraints

- Decisión 1 — Paquete `geist@1.7.2` exacto (oficial de Vercel, SIL OFL 1.1, publicado
  2026-06-01): contiene las tres familias (Sans, Mono y Pixel en 5 variantes) en woff2 en
  una sola dependencia. Sus módulos JS (`geist/font/*`) importan `next/font/local` y nunca
  se importan: solo se consumen los woff2 por ruta.
- Decisión 2 — `pnpm.overrides: { "geist>next": "-" }`: con `autoInstallPeers: true`
  (pnpm 10), `pnpm add geist` arrastra next + react + react-dom (comprobado). El override
  elimina el peer solo para geist; `peerDependencyRules.ignoreMissing` no lo evita y
  `auto-install-peers=false` afectaría a todo el proyecto.
- Decisión 3 — Fonts API de Astro 7 con `fontProviders.local()` (estable desde 6.0): los
  woff2 se emiten con hash en `/_astro/fonts/` (mismo origen → CSP intacta, `default-src
  'self'`), preload filtrable y fallbacks con métricas ajustadas (`optimizedFallbacks`, por
  defecto) cuando el último fallback es genérico → evita CLS sin valores sueltos.
- Decisión 4 — Variables de Astro con nombre propio (`--font-geist-*`) y tokens.css las
  envuelve con fallback del sistema: si `<Font>` no se renderiza, el sitio sigue con
  la pila del sistema. `--font-sans` conserva el nombre (tests/design-tokens.test.mjs y las
  listas cerradas de tokens de search-bar, search-live, search-results, post.css).
- Decisión 5 — Preload solo de Geist normal (cuerpo, crítico). Cursiva y Mono sin preload.
  `display: swap`.
- Decisión 6 — `src` del proveedor local: `./node_modules/geist/dist/fonts/...` (el
  `exports` del paquete no expone `dist/fonts`); el implementer confirma en rojo con
  `astro build` qué forma resuelve con el enlace simbólico de pnpm en Windows.
- Restricciones: sin `<style>` en .astro (el `<style>` lo emite el componente `<Font>` de
  Astro y lo permite `style-src 'unsafe-inline'`), ≤100 líneas por archivo (tokens.css
  queda en 98), CSS solo con tokens, estático (cero JS de runtime), un solo layout.

## Alternativa descartada

- @font-face manual en src/styles con los woff2 copiados a public/: duplica archivos con
  licencia, rutas sin hash (caché débil), preload manual y métricas de fallback
  (size-adjust, ascent-override) como valores sueltos. Descartado.
- `@fontsource/geist-pixel` + `@fontsource-variable/geist` + `@fontsource-variable/geist-mono`
  (5.3.0, OFL): tres dependencias de un reempaquetador y Pixel en una sola variante.
  Descartado frente al paquete oficial.
