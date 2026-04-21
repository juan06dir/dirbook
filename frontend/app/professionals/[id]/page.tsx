"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProfessional, ProfessionalOut, getProfessionalPosts, PostOut, rateProfessional, getProfessionalRating, RatingSummary } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Globe, ArrowLeft, Mail, UserCircle2, Briefcase, Lock, Star } from "lucide-react";
import StarRating from "@/components/StarRating";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
import PostCard from "@/components/PostCard";
import ContactModal from "@/components/ContactModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default function ProfessionalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [prof, setProf]       = useState<ProfessionalOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [posts, setPosts]     = useState<PostOut[]>([]);
  const [postTab, setPostTab] = useState<"all" | "event" | "discount">("all");
  const [rating, setRating]   = useState<RatingSummary | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    Promise.all([getProfessional(id), getProfessionalPosts(id)])
      .then(([p, ps]) => { setProf(p); setPosts(ps); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    getProfessionalRating(id).then(setRating).catch(() => {});
  }, [id]);

  const handleRate = async (score: number) => {
    if (!user) return;
    setRatingLoading(true);
    try {
      const r = await rateProfessional(id, score);
      setRating(r);
    } finally {
      setRatingLoading(false);
    }
  };

  useEffect(() => {
    if (!prof) return;
    getProfessionalPosts(id, postTab === "all" ? undefined : postTab)
      .then(setPosts).catch(() => {});
  }, [postTab, id, prof]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-bold">Crea una cuenta para ver este perfil</h2>
          <p className="text-muted-foreground">
            Regístrate gratis para ver la información completa de profesionales y contactarlos.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/register">
            <Button size="lg">Registrarme gratis</Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">Iniciar sesión</Button>
          </Link>
        </div>
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:underline">
          ← Volver atrás
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (notFound || !prof) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <UserCircle2 className="mb-4 h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Perfil no encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/professionals")}>Volver</Button>
      </div>
    );
  }

  const cover  = imageUrl(prof.cover_image);
  const avatar = imageUrl(prof.avatar);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Cover */}
      <div className="relative h-56 w-full bg-gradient-to-br from-blue-100 to-indigo-200 md:h-72">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={prof.name} className="h-full w-full object-cover" />
        )}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium shadow hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="relative -mt-10 mb-6 flex items-end gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={prof.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <UserCircle2 className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">{prof.name}</h1>
            <Badge variant="secondary" className="mt-1">
              <Briefcase className="mr-1 h-3 w-3" />
              {prof.profession}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 md:col-span-2">
            {prof.bio && (
              <section className="rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="mb-2 font-semibold">Sobre mí</h2>
                <p className="text-muted-foreground leading-relaxed">{prof.bio}</p>
              </section>
            )}

            {/* Posts */}
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Publicaciones</h2>
                <div className="flex gap-1">
                  {(["all", "event", "discount"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPostTab(t)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        postTab === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t === "all" ? "Todas" : t === "event" ? "Eventos" : "Descuentos"}
                    </button>
                  ))}
                </div>
              </div>
              {posts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No hay publicaciones aún</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {posts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <h2 className="font-semibold">Contacto</h2>

              {prof.phone && (
                <a href={`tel:${prof.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {prof.phone}
                </a>
              )}

              {prof.website && (
                <a
                  href={prof.website.startsWith("http") ? prof.website : `https://${prof.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{prof.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}

              <Button className="w-full" onClick={() => setContactOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Contactar
              </Button>

              {/* Redes sociales */}
              {(prof.whatsapp || prof.facebook || prof.instagram) && (
                <div className="flex flex-col gap-2 pt-1">
                  {prof.whatsapp && (
                    <a
                      href={prof.whatsapp.startsWith("http") ? prof.whatsapp : `https://wa.me/${prof.whatsapp.replace(/\D/g, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                    >
                      <WhatsAppIcon className="h-4 w-4 shrink-0" />
                      WhatsApp
                    </a>
                  )}
                  {prof.facebook && (
                    <a
                      href={prof.facebook.startsWith("http") ? prof.facebook : `https://facebook.com/${prof.facebook}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      <FacebookIcon className="h-4 w-4 shrink-0" />
                      Facebook
                    </a>
                  )}
                  {prof.instagram && (
                    <a
                      href={prof.instagram.startsWith("http") ? prof.instagram : `https://instagram.com/${prof.instagram}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                      <InstagramIcon className="h-4 w-4 shrink-0" />
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Calificación */}
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <h2 className="font-semibold">Calificación</h2>
              {rating && (rating.avg !== null) && (
                <div className="flex items-center gap-2">
                  <StarRating value={rating.avg} size="md" showValue count={rating.count} />
                </div>
              )}
              {user && prof.owner_id !== user.id && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {rating?.my_score ? "Tu calificación:" : "Califica este perfil:"}
                  </p>
                  <StarRating
                    value={rating?.my_score ?? null}
                    onChange={ratingLoading ? undefined : handleRate}
                    size="lg"
                  />
                </div>
              )}
              {(!rating || rating.count === 0) && (
                <p className="text-xs text-muted-foreground">Sin calificaciones aún</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Miembro desde {new Date(prof.created_at).toLocaleDateString("es", { dateStyle: "long" })}
            </p>
          </div>
        </div>
      </div>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        localName={prof.name}
        phone={prof.phone}
        website={prof.website}
      />
    </div>
  );
}
