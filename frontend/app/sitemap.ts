import type { MetadataRoute } from "next";
import { SITE_URL, API_URL } from "@/lib/site";

export const revalidate = 3600; // regenerar cada hora

type Entity = { id: string; created_at: string };

async function fetchList(path: string): Promise<Entity[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()) as Entity[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locals, professionals] = await Promise.all([
    fetchList("/locals"),
    fetchList("/professionals"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/events`, changeFrequency: "daily", priority: 0.8 },
  ];

  const localRoutes: MetadataRoute.Sitemap = locals.map((l) => ({
    url: `${SITE_URL}/locals/${l.id}`,
    lastModified: l.created_at ? new Date(l.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const professionalRoutes: MetadataRoute.Sitemap = professionals.map((p) => ({
    url: `${SITE_URL}/professionals/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...localRoutes, ...professionalRoutes];
}
