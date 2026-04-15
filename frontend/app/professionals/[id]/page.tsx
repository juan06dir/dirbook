"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProfessional, ProfessionalOut, getProfessionalPosts, PostOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Globe, ArrowLeft, Mail, UserCircle2, Briefcase, Lock } from "lucide-react";
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

  useEffect(() => {
    Promise.all([getProfessional(id), getProfessionalPosts(id)])
      .then(([p, ps]) => { setProf(p); setPosts(ps); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

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
