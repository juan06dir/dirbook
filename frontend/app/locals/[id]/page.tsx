"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLocal, LocalOut,
  getFollowStatus, followLocal, unfollowLocal, FollowStatus,
  getRatingSummary, rateLocal, RatingSummary,
  getLocalPosts, PostOut,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Phone, Globe, ArrowLeft, Mail, Building2, Users, Heart, Lock,
} from "lucide-react";
import LocalMap from "@/components/LocalMap";
import ContactModal from "@/components/ContactModal";
import StarRating from "@/components/StarRating";
import PostCard from "@/components/PostCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default function LocalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [local, setLocal]           = useState<LocalOut | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Follow
  const [followStatus, setFollowStatus] = useState<FollowStatus>({ following: false, followers_count: 0 });
  const [followLoading, setFollowLoading] = useState(false);

  // Rating
  const [rating, setRating]       = useState<RatingSummary>({ avg: null, count: 0, my_score: null });
  const [ratingLoading, setRatingLoading] = useState(false);

  // Posts
  const [posts, setPosts]         = useState<PostOut[]>([]);
  const [postTab, setPostTab]     = useState<"all" | "event" | "discount">("all");

  useEffect(() => {
    Promise.all([
      getLocal(id),
      getFollowStatus(id),
      getRatingSummary(id),
      getLocalPosts(id),
    ])
      .then(([loc, fs, rt, ps]) => {
        setLocal(loc);
        setFollowStatus(fs);
        setRating(rt);
        setPosts(ps);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Cargar posts al cambiar tab
  useEffect(() => {
    if (!local) return;
    getLocalPosts(id, postTab === "all" ? undefined : postTab)
      .then(setPosts)
      .catch(() => {});
  }, [postTab, id, local]);

  const handleFollow = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setFollowLoading(true);
    try {
      const result = followStatus.following
        ? await unfollowLocal(id)
        : await followLocal(id);
      setFollowStatus(result);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRate = async (score: number) => {
    if (!user) { router.push("/auth/login"); return; }
    setRatingLoading(true);
    try {
      const result = await rateLocal(id, score);
      setRating(result);
    } finally {
      setRatingLoading(false);
    }
  };

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
            Regístrate gratis para ver la información completa, seguir locales y calificarlos.
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
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (notFound || !local) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Building2 className="mb-4 h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Local no encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/")}>Volver al inicio</Button>
      </div>
    );
  }

  const cover = imageUrl(local.cover_image);
  const logo  = imageUrl(local.logo);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Cover */}
      <div className="relative h-64 w-full bg-muted md:h-80">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={local.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Building2 className="h-20 w-20 opacity-20" />
          </div>
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
        <div className="relative -mt-8 mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{local.name}</h1>
              <Badge variant="secondary" className="mt-1">{local.category}</Badge>
            </div>
          </div>

          {/* Botón Follow */}
          <Button
            variant={followStatus.following ? "outline" : "default"}
            onClick={handleFollow}
            disabled={followLoading}
            className="w-full sm:w-auto"
          >
            <Heart className={`mr-2 h-4 w-4 ${followStatus.following ? "fill-red-500 text-red-500" : ""}`} />
            {followStatus.following ? "Siguiendo" : "Seguir"}
          </Button>
        </div>

        {/* Estrellas + seguidores */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              {user ? "Tu calificación:" : "Calificación del local:"}
            </p>
            <StarRating
              value={user ? (rating.my_score ?? null) : rating.avg}
              onChange={user ? handleRate : undefined}
              size="lg"
              showValue={!user}
            />
            {ratingLoading && <span className="text-xs text-muted-foreground">Guardando…</span>}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{rating.avg?.toFixed(1) ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{rating.count} calificaciones</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold flex items-center gap-1">
              <Users className="h-5 w-5 text-muted-foreground" />
              {followStatus.followers_count}
            </p>
            <p className="text-xs text-muted-foreground">seguidores</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 md:col-span-2">
            {/* Descripción */}
            {local.description && (
              <section className="rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="mb-2 font-semibold">Sobre este local</h2>
                <p className="text-muted-foreground leading-relaxed">{local.description}</p>
              </section>
            )}

            {/* Posts / Eventos / Descuentos */}
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
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No hay publicaciones aún
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {posts.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              )}
            </section>

            {/* Mapa */}
            {(local.address || local.city) && (
              <section className="rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold">Ubicación</h2>
                <LocalMap address={local.address || ""} city={local.city || ""} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <h2 className="font-semibold">Información de contacto</h2>

              {(local.address || local.city) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{[local.address, local.city].filter(Boolean).join(", ")}</span>
                </div>
              )}

              {local.phone && (
                <a href={`tel:${local.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {local.phone}
                </a>
              )}

              {local.website && (
                <a
                  href={local.website.startsWith("http") ? local.website : `https://${local.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{local.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}

              <Button className="w-full" onClick={() => setContactOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Contactar
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Registrado el {new Date(local.created_at).toLocaleDateString("es", { dateStyle: "long" })}
            </p>
          </div>
        </div>
      </div>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        localName={local.name}
        phone={local.phone}
        website={local.website}
      />
    </div>
  );
}
