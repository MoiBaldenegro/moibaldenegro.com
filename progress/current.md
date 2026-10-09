# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- Feature 68 (deploy roto por _redirects inválido), in_progress desde 2026-10-09. El líder
  actúa como implementer con autorización humana. Bloquea las features 64-67 (depends_on [68]).

### Plan

- Escribir tests/legacy-redirects.test.mjs y verlo en rojo.
- Crear src/domain/http/legacy-redirects.ts y modificar middleware.ts y astro.config.mjs
  (sin redirects).
- Ajustar REQ-45-04/05. Verificar con astro preview + curl. Reviewer nivel 1.

### Bitácora

- ROJO 1/8: REQ-68-10 reproduce el error de deploy (línea de 4 tokens en _redirects).
- VERDE 8/8; suite 774/774; ./init.sh verde; preview + curl: 7 URLs antiguas → 301 → 200.
- Informe en progress/impl_68.md. Reviewer lanzado.
- Hallazgo: los builds de los tests dejan .wrangler/deploy/config.json apuntando a un temporal
  borrado (impl_68.md).

### Feature 64 csp-enforce (2026-10-09)

- ROJO 4/6 → VERDE 6/6 (CSP obligatoria en security-headers.ts y public/_headers; ajustado
  tests/security-headers.test.mjs). Suite 780/780. Local (preview + Chrome): 0 violaciones en
  7 páginas; HTB 200, Copiar OK, youtube-nocookie 200.
- DETENIDA por REQ-64-07: producción (ya desplegada con la CSP obligatoria) inyecta Cloudflare
  Web Analytics, origen https://static.cloudflareinsights.com, bloqueado por script-src. Status
  blocked; decisión humana pendiente (permitir el origen o desactivar Web Analytics).

### Feature 65 card-image-height-auto (2026-10-09)

- ROJO 2/4 → VERDE 4/4 (height: auto en las 4 reglas; endurecido REQ-48-05). Suite 784/784.
- Chrome 1280/375: todas las imágenes de card con su proporción exacta (antes 768 px de alto).
  Informe en progress/impl_65.md. Reviewer lanzado.
- Observación: hero .profile-image con 0 px de alto a 375 px (preexistente).

### spec_author: feature 69 hero-profile-image-mobile (2026-10-09)

- Análisis en curso: imagen de perfil del hero invisible en móvil (.profile-image 0 px a 375 px).
- Plan:
  - Medir con Chrome headless + CDP a 320/375/768/769/1024/1200/1201/1280 (build estático de dist/client).
  - Confirmar causa y si el fallo es preexistente (git diff c19d375).
  - Spec EARS + design.md (toca UI) y alta de la feature 69 (pending, depends_on [68]).
- Hecho: medición CDP (≤768: .profile-image 0-24 px; 769-1200: las hero-cards tapan la foto; ≥1201 bien).
  Preexistente (git diff c19d375 sin cambios de alto/fila/flex). Análisis en progress/research/hero_mobile_image.md.
- Alta: feature 69 hero-profile-image-mobile (pending, depends_on [68]). Spec:
  specs/69_hero-profile-image-mobile/requirements.md (REQ-69-01..14) y design.md. Sin token nuevo previsto.

### spec_author: enmienda feature 64 csp-enforce (2026-10-09)

- Análisis en curso: permitir Cloudflare Web Analytics en la CSP obligatoria (decisión humana, opción (a)).
- Plan:
  - Contrastar orígenes con la FAQ oficial de Cloudflare Web Analytics y el tag real de producción.
  - Enmendar specs/64_csp-enforce/requirements.md (REQ-64-11..15) y la entrada 64 del backlog.
  - Documentar en progress/research/csp_production_review.md (sección «Enmienda»).
- Hecho: política REQ-64-11 (script-src + https://static.cloudflareinsights.com; connect-src 'self'
  https://cloudflareinsights.com). Origen y no ruta: el beacon real usa /beacon.min.js/v... REQ-64-07 resuelto.
  Feature 64 blocked → pending (sin blocked_reason), 15 acceptance.
