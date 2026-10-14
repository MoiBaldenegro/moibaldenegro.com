# Implementación — feature 89 site-footer

## Rojo (REQ-89-11)

- `node --test tests/site-footer.test.mjs` antes de escribir dominio, componente, hoja y montaje: pass 0, fail 7.

## Cambios

- `src/domain/site-footer.ts`: `footerColumns(profile)` (Navegación: /, /about, /arquitectura, /search; Conecta: heroLinks de about.json + X) y `copyrightLine(name, now)` con fecha inyectable.
- `src/components/site-footer/site-footer.astro`: `<footer class="site-footer">` con marca (logo, headline, location, CTA «Descargar CV» a /cv.pdf), Navegación, Últimos artículos (PostsRepository + latestPosts, fecha y minutos de lectura), Conecta (iconos del sprite con aria-hidden y «sitio externo» visually-hidden) y barra inferior (© año + nombre, «Hecho con Astro y desplegado en Cloudflare», «Volver arriba» a #top sin JS). Títulos de columna como `<p>` para no alterar la jerarquía de encabezados.
- `src/styles/site-footer.css`: solo tokens; degradado background → hero-bottom con halo --color-glow; títulos en --font-display, metadatos en --font-mono; 1 columna (<600 px), 2 (600-899 px), marca + 3 (>=900 px); reduced-motion.
- `src/layouts/Layout.astro`: import y `<SiteFooter />` tras `</main>`.
- Tests legacy ajustados (precedente REQ-43-06): `tests/geist-pixel-extend.test.mjs` saca Layout.astro de la lista congelada frente a HEAD; `tests/about-hero-stats.test.mjs` acota el «un solo CTA Descargar CV» al hero de /about (el footer también enlaza /cv.pdf).

## Verificación

- `./init.sh` en verde (formato, tests al 100%, build).
- CDP sobre `pnpm preview` a 375×812, 768×1000 y 1280×900 en /, /about, /search, /rust (SSR) y un artículo: scrollWidth <= clientWidth, ningún elemento del footer fuera del viewport, rejilla de 1/2/4 columnas, títulos en Geist Pixel. La página SSR /rust renderiza los últimos artículos.
- Capturas en `progress/research/footer89/`.
