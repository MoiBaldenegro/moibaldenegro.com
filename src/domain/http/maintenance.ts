// Modo mantenimiento (issue #4). Cuando IN_MAINTENANCE está activo, el middleware
// responde 503 con esta página para toda ruta de navegación, pero deja pasar los
// assets estáticos que la propia página necesita (CSS, fuentes, imágenes, favicon).
// Funciones puras: el flag se interpreta aquí y src/middleware.ts solo lo conecta.

export const MAINTENANCE_STATUS = 503;

export const MAINTENANCE_HTML = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>En mantenimiento — moisesbaldenegro.com</title>
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="stylesheet" href="/maintenance.css" />
</head>
<body>
<main class="maintenance">
<p class="maintenance__code">503</p>
<h1 class="maintenance__title">Sitio en mantenimiento</h1>
<p class="maintenance__text">Estamos realizando tareas de mantenimiento. Volveremos muy pronto.</p>
<p class="maintenance__hint">Gracias por tu paciencia.</p>
</main>
</body>
</html>`;

// Assets que la página de mantenimiento (y el navegador) necesitan para pintarse.
// Todo lo demás se considera navegación y se bloquea mientras dure el mantenimiento.
const ASSET_PATH = /\.(?:css|js|mjs|woff2?|ttf|otf|eot|png|jpe?g|webp|avif|gif|svg|ico|webmanifest)$/i;
const ASSET_PREFIXES: readonly string[] = ['/_astro/', '/assets/', '/cdn-cgi/'];

/** Interpreta el flag tal como llega del entorno (boolean de build o string de runtime). */
export function parseMaintenanceFlag(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  return ['true', '1', 'on', 'yes'].includes(value.trim().toLowerCase());
}

/** true si el pathname es un asset estático que debe seguir sirviéndose. */
export function isStaticAssetPath(pathname: string): boolean {
  return ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || ASSET_PATH.test(pathname);
}

/** true si hay que responder mantenimiento para esta petición. */
export function shouldServeMaintenance(enabled: unknown, pathname: string): boolean {
  return parseMaintenanceFlag(enabled) && !isStaticAssetPath(pathname);
}

/** Respuesta 503 con la página de mantenimiento (sin caché). */
export function maintenanceResponse(): Response {
  return new Response(MAINTENANCE_HTML, {
    status: MAINTENANCE_STATUS,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '3600',
    },
  });
}
