import type { Metadata } from "next";
import { API_URL, SITE_URL, absoluteImageUrl } from "@/lib/site";

type Local = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  logo: string | null;
  cover_image: string | null;
  avg_rating: number | null;
  ratings_count: number;
};

async function getLocal(id: string): Promise<Local | null> {
  try {
    const res = await fetch(`${API_URL}/locals/${id}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Local;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const local = await getLocal(id);
  if (!local) return { title: "Local no encontrado" };

  const title = `${local.name} — ${local.category}${local.city ? ` en ${local.city}` : ""}`;
  const description =
    local.description?.slice(0, 160) ||
    `Conoce ${local.name}, ${local.category.toLowerCase()}${local.city ? ` en ${local.city}` : ""}. Horarios, contacto, reseñas y más en Dirbook.`;
  const image = absoluteImageUrl(local.cover_image) || absoluteImageUrl(local.logo);

  return {
    title,
    description,
    alternates: { canonical: `/locals/${local.id}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/locals/${local.id}`,
      title,
      description,
      siteName: "Dirbook",
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: local.name }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function LocalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const local = await getLocal(id);

  const jsonLd = local
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/locals/${local.id}`,
        name: local.name,
        description: local.description || undefined,
        url: `${SITE_URL}/locals/${local.id}`,
        image: absoluteImageUrl(local.cover_image) || absoluteImageUrl(local.logo) || undefined,
        telephone: local.phone || undefined,
        address: local.address
          ? {
              "@type": "PostalAddress",
              streetAddress: local.address,
              addressLocality: local.city || undefined,
              addressCountry: "CO",
            }
          : undefined,
        ...(local.avg_rating && local.ratings_count > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(local.avg_rating.toFixed(1)),
                reviewCount: local.ratings_count,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
