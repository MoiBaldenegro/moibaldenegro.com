// Políticas de caché (feature 49 static-cache-headers, REQ-49-02).
// - /assets/* (imágenes y sprite SVG, sin hash en el nombre): una semana;
//   public/_headers replica este valor (Cloudflare lo aplica a los assets).
// - Server island de HTB: una hora, para no llamar a la API de HTB en cada
//   visita (latencia, coste del Worker y riesgo de rate limit).
// El HTML conserva la revalidación por defecto (sin caché larga).
export const ASSETS_CACHE_CONTROL = 'public, max-age=604800';
export const HTB_ISLAND_CACHE_CONTROL = 'public, max-age=3600';
