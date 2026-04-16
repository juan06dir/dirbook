"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getLocals, LocalOut, getActiveDiscounts, PostOut,
  getProfessionals, ProfessionalOut,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LocalCard from "@/components/LocalCard";
import PostCard from "@/components/PostCard";
import ProfessionalCard from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, SlidersHorizontal, Building2, Tag,
  Star, Users, MapPin, Zap, ChevronRight, ArrowRight,
  Lock, Sparkles, X,
} from "lucide-react";

const CATEGORIES = [
  "Restaurante", "Cafetería", "Bar", "Tienda", "Servicio",
  "Salud", "Educación", "Tecnología", "Moda", "Otro",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

/* ─── Modal de registro para visitantes ─────────────────────────────────── */
function RegisterModal({
  local,
  onClose,
}: {
  local: LocalOut;
  onClose: () => void;
}) {
  const cover = imageUrl(local.cover_image);
  const logo  = imageUrl(local.logo);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Preview del local (top) */}
        <div className="relative h-44 bg-gray-800">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={local.name} className="h-full w-full object-cover opacity-60" />
          ) : (
            <div className="flex h-full items-center justify-center opacity-20">
              <Building2 className="h-16 w-16 text-white" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

          {/* Logo + nombre */}
          <div className="absolute bottom-4 left-4 flex items-end gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-white/40 bg-white/20 backdrop-blur">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="text-white drop-shadow">
              <p className="font-bold text-lg leading-tight">{local.name}</p>
              <p className="text-xs text-white/80">{local.category}</p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Candado central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur border border-white/20 shadow-lg">
              <Lock className="h-8 w-8 text-white drop-shadow" />
            </div>
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div className="bg-white px-6 pt-5 pb-7">
          <div className="mb-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                <Sparkles className="h-3 w-3" />
                Contenido exclusivo para miembros
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              ¡Crea tu cuenta gratis!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Únete para ver el perfil completo de{" "}
              <span className="font-semibold text-foreground">{local.name}</span>,
              seguir locales, calificar y acceder a descuentos exclusivos.
            </p>
          </div>

          {/* Beneficios */}
          <ul className="mb-5 space-y-2">
            {[
              "Ver información de contacto completa",
              "Seguir tus negocios favoritos",
              "Acceder a descuentos y eventos exclusivos",
              "Calificar y dejar reseñas",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="space-y-2">
            <Link href="/auth/register" className="block">
              <Button
                size="lg"
                className="w-full bg-black text-yellow-400 hover:bg-black/80 font-bold shadow-md"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login" className="block">
              <Button size="lg" variant="outline" className="w-full">
                Ya tengo cuenta — Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Landing para visitantes no registrados ─────────────────────────── */
function LandingPage() {
  const [locals, setLocals]               = useState<LocalOut[]>([]);
  const [localsLoading, setLocalsLoading] = useState(true);
  const [discounts, setDiscounts]         = useState<PostOut[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOut[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<LocalOut | null>(null);

  useEffect(() => {
    getLocals({ limit: 12 })
      .then(setLocals)
      .catch(() => {})
      .finally(() => setLocalsLoading(false));
    getActiveDiscounts().then((d) => setDiscounts(d.slice(0, 4))).catch(() => {});
    getProfessionals({ limit: 4 }).then(setProfessionals).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="mb-5 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Descubre los mejores<br />
            <span className="text-yellow-400">locales y profesionales</span><br />
            cerca de ti
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base sm:text-lg text-white/70">
            Sigue tus negocios favoritos, encuentra descuentos exclusivos y conecta
            con profesionales de confianza en tu ciudad.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/register">
              <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-lg px-8">
                Crear cuenta gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/15 hover:text-white px-8">
                Iniciar sesión
              </Button>
            </Link>
          </div>

          {/* mini stats */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-center">
            {[
              { icon: Building2, label: "Negocios registrados", value: "100+" },
              { icon: Users,     label: "Usuarios activos",     value: "500+" },
              { icon: Tag,       label: "Descuentos activos",   value: "50+"  },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="h-6 w-6 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-sm text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-2 text-3xl font-bold">¿Cómo funciona?</h2>
          <p className="mb-12 text-muted-foreground">Simple, rápido y gratuito</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: "1. Regístrate",
                desc: "Crea tu cuenta en segundos. Es completamente gratis.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Search,
                title: "2. Explora",
                desc: "Busca locales por categoría, ciudad o nombre. Lee reseñas reales.",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Star,
                title: "3. Conecta",
                desc: "Sigue negocios, califica tu experiencia y no te pierdas ningún descuento.",
                color: "bg-yellow-100 text-yellow-600",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl bg-white p-8 shadow-sm text-center">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locales registrados ──────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <MapPin className="h-6 w-6 text-primary" /> Locales en Dirbook
            </h2>
          </div>
          <p className="mb-8 text-muted-foreground text-sm">
            Haz clic en cualquier tarjeta para ver más información.{" "}
            <Link href="/auth/register" className="text-primary font-medium hover:underline">
              Regístrate gratis
            </Link>{" "}
            para acceder al perfil completo.
          </p>

          {localsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : locals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Building2 className="mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">Aún no hay locales registrados</p>
              <p className="text-sm">¡Sé el primero en registrar tu negocio!</p>
              <Link href="/auth/register" className="mt-4">
                <Button>Registrar mi negocio</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {locals.map((local) => (
                  <LocalCard
                    key={local.id}
                    local={local}
                    onCardClick={() => setSelectedLocal(local)}
                  />
                ))}
              </div>
              <div className="mt-10 text-center">
                <p className="mb-3 text-muted-foreground text-sm">
                  ¿Quieres ver todos los perfiles completos?
                </p>
                <Link href="/auth/register">
                  <Button size="lg" className="px-8 font-bold shadow">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Crear cuenta gratis — es rápido
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Descuentos activos ───────────────────────────────────── */}
      {discounts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Tag className="h-6 w-6 text-red-500" /> Descuentos activos
              </h2>
              <Link href="/auth/register" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todos <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {discounts.map((p) => (
                <div key={p.id} className="w-64 shrink-0">
                  <PostCard post={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Profesionales ────────────────────────────────────────── */}
      {professionals.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Zap className="h-6 w-6 text-yellow-500" /> Profesionales
              </h2>
              <Link href="/professionals" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todos <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {professionals.map((p) => (
                <ProfessionalCard key={p.id} prof={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA final ────────────────────────────────────────────── */}
      <section className="bg-black py-20 text-center text-yellow-400">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="mb-3 text-3xl font-bold text-yellow-400">¿Tienes un negocio?</h2>
          <p className="mb-8 text-yellow-100/70">
            Regístralo gratis en Dirbook y llega a más clientes en tu ciudad.
            Publica eventos, descuentos y mucho más.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-lg px-10">
              Empezar ahora — es gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t bg-gray-50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Dirbook · Conectando tu ciudad
      </footer>

      {/* ── Modal de registro ────────────────────────────────────── */}
      {selectedLocal && (
        <RegisterModal
          local={selectedLocal}
          onClose={() => setSelectedLocal(null)}
        />
      )}
    </div>
  );
}

/* ─── Vista para usuarios autenticados (buscador + listado) ──────────── */
function HomeContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [locals, setLocals]           = useState<LocalOut[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState(params.get("search") || "");
  const [category, setCategory]       = useState(params.get("category") || "");
  const [city, setCity]               = useState(params.get("city") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [discounts, setDiscounts]     = useState<PostOut[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(true);

  const fetchLocals = useCallback(async (s: string, cat: string, c: string) => {
    setLoading(true);
    try {
      const data = await getLocals({ search: s, category: cat, city: c, limit: 40 });
      setLocals(data);
    } catch {
      setLocals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocals(search, category, city);
    getActiveDiscounts()
      .then(setDiscounts)
      .catch(() => setDiscounts([]))
      .finally(() => setDiscountsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (search)   qs.set("search", search);
    if (category) qs.set("category", category);
    if (city)     qs.set("city", city);
    router.push(`/?${qs.toString()}`);
    fetchLocals(search, category, city);
  };

  const selectCategory = (cat: string) => {
    const next = category === cat ? "" : cat;
    setCategory(next);
    fetchLocals(search, next, city);
  };

  const clearFilters = () => {
    setSearch(""); setCategory(""); setCity("");
    fetchLocals("", "", "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / buscador */}
      <section className="bg-black py-14 text-yellow-400">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-yellow-400">
            Encuentra locales en tu ciudad
          </h1>
          <p className="mb-8 text-yellow-100/70">
            El directorio de negocios locales más completo
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Restaurantes, peluquerías, tiendas…"
                className="pl-9 bg-white text-foreground"
              />
            </div>
            <Button type="submit" variant="secondary">Buscar</Button>
            <Button type="button" variant="secondary" size="icon" onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>

          {showFilters && (
            <div className="mt-3 flex gap-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" className="bg-white text-foreground" />
              <Button type="button" variant="secondary" onClick={() => fetchLocals(search, category, city)}>Aplicar</Button>
              <Button type="button" variant="outline" onClick={clearFilters}>Limpiar</Button>
            </div>
          )}
        </div>
      </section>

      {/* Categorías */}
      <section className="border-b bg-white py-3">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <div className="flex gap-2 pb-1">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => selectCategory(cat)}>
                <Badge
                  variant={category === cat ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {cat}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Descuentos */}
      {(discountsLoading || discounts.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Tag className="h-5 w-5 text-red-500" /> Descuentos y eventos activos
          </h2>
          {discountsLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 w-64 shrink-0 rounded-xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {discounts.map((p) => (
                <div key={p.id} className="w-64 shrink-0"><PostCard post={p} /></div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Listado */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Buscando…" : `${locals.length} local${locals.length !== 1 ? "es" : ""} encontrado${locals.length !== 1 ? "s" : ""}`}
          </p>
          {(search || category || city) && (
            <button onClick={clearFilters} className="text-sm text-primary hover:underline">Limpiar filtros</button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : locals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Building2 className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No se encontraron locales</p>
            <p className="text-sm">Intenta con otros términos o limpia los filtros</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locals.map((local) => <LocalCard key={local.id} local={local} />)}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Router principal: guest → landing, auth → buscador ────────────── */
function RootContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <LandingPage />;
  return <HomeContent />;
}

export default function HomePage() {
  return (
    <Suspense>
      <RootContent />
    </Suspense>
  );
}
