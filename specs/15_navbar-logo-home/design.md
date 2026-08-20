# Diseño — El logo es el enlace Home del navbar (feature 15)

## Contexto visual

- **Componente afectado:** `src/layouts/Layout.astro`, navbar `.site-navbar`
  (chrome compartido de todas las páginas).
- **Estado actual (efecto de las features 12/13):** enlace de texto Home con
  `aria-current` de la portada + About + Arquitectura + @moibaldenegro +
  SearchBar; sin logo.
- **Estado deseado (corrección del humano; estado 686a7cc):** el ancla del
  logo es el único enlace de la portada, con `aria-current` de `/`; el enlace
  de texto Home desaparece.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| — | — | Sin tokens nuevos: el ancla del logo hereda `--color-accent` / `--color-accent-hover` vía `.site-navbar a[aria-current="page"]` y `.site-navbar a:hover` de layout.css (mismo contrato que 686a7cc) |

## Decisiones y constraints

- Decisión 1: el ancla del logo vuelve a ser el único enlace de la portada con
  `aria-current={Astro.url.pathname === '/' ? 'page' : undefined}` —
  exactamente el marcado del commit 686a7cc. El enlace de texto Home se retira:
  no debe existir ningún `<a ... href="/">Home</a>` en el navbar.
- Decisión 2: el logo se renderiza como
  `<img src="/assets/mxvi_logo.webp" alt="Logo de moibaldenegro.com" width="72"/>`
  (alt descriptivo y ancho fijo, igual que 686a7cc; el ancla conserva el texto
  alternativo de la imagen para accesibilidad).
- Decisión 3: sin CSS nuevo: el estado activo del logo hereda
  `.site-navbar a[aria-current="page"]` (acento + subrayado) de layout.css,
  igual que en 686a7cc.
- Decisión 4: los tests de las features 12/13 y los REQ-08-04/08-05 se ajustan
  al contrato real (logo como portada, sin Home de texto) con la justificación
  documentada en el encabezado de cada archivo (precedente REQ-43-06); los
  artefactos históricos de la feature 13 quedan como bitácora (no se reescribe
  historia). REQ-37-03 (visual-polish-refactor) y la feature 14 (fix-navbar-jump)
  quedan en verde sin cambios (verificado).
- Restricciones del proyecto: estilos separados de la UI (sin `<style>` en
  Layout.astro; nada de CSS nuevo), ≤100 líneas por archivo, sin JS de runtime,
  sin dependencias.

## Alternativa descartada

- Alternativa considerada: mantener el enlace de texto Home y quitar el logo
  (dirección de la feature 13).
- Motivo del descarte: el humano corrigió explícitamente — «claro, el Logo te
  dije claramente que reemplazaba al Home, el home se va» — la intención real
  SIEMPRE fue el logo como Home (estado 686a7cc, el «como estaba» correcto); la
  feature 13 fue en la dirección equivocada y su efecto se revierte.