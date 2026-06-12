// Configuración central del sitio para SEO
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dirbook.com.co";

// URL de la API usada en el servidor (sitemap, metadata dinámica).
// En producción se toma de NEXT_PUBLIC_API_URL (Vercel).
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dirbook-backend.onrender.com";

export const SITE_NAME = "Dirbook";

export const SITE_DESCRIPTION =
  "Dirbook es el directorio donde encuentras locales comerciales y profesionales de tu ciudad: restaurantes, cafeterías, salud, tecnología y más. Descubre, sigue y contacta negocios cerca de ti.";

export function absoluteImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
