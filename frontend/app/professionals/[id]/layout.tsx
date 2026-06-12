import type { Metadata } from "next";
import { API_URL, SITE_URL, absoluteImageUrl } from "@/lib/site";

type Professional = {
  id: string;
  name: string;
  profession: string;
  bio: string | null;
  phone: string | null;
  website: string | null;
  avatar: string | null;
  cover_image: string | null;
  avg_rating: number | null;
  ratings_count: number;
};

async function getProfessional(id: string): Promise<Professional | null> {
  try {
    const res = await fetch(`${API_URL}/professionals/${id}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Professional;
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
  const pro = await getProfessional(id);
  if (!pro) return { title: "Profesional no encontrado" };

  const title = `${pro.name} — ${pro.profession}`;
  const description =
    pro.bio?.slice(0, 160) ||
    `${pro.name}, ${pro.profession.toLowerCase()}. Conoce su perfil, reseñas y contacto en Dirbook.`;
  const image = absoluteImageUrl(pro.cover_image) || absoluteImageUrl(pro.avatar);

  return {
    title,
    description,
    alternates: { canonical: `/professionals/${pro.id}` },
    openGraph: {
      type: "profile",
      url: `${SITE_URL}/professionals/${pro.id}`,
      title,
      description,
      siteName: "Dirbook",
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: pro.name }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProfessionalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pro = await getProfessional(id);

  const jsonLd = pro
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${SITE_URL}/professionals/${pro.id}`,
        name: pro.name,
        jobTitle: pro.profession,
        description: pro.bio || undefined,
        url: `${SITE_URL}/professionals/${pro.id}`,
        image: absoluteImageUrl(pro.avatar) || absoluteImageUrl(pro.cover_image) || undefined,
        telephone: pro.phone || undefined,
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
