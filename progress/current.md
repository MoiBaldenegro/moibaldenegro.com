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
