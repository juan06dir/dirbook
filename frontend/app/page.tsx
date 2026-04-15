"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLocals, LocalOut, getActiveDiscounts, PostOut, getProfessionals, ProfessionalOut } from "@/lib/api";
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
} from "lucide-react";

const CATEGORIES = [
  "Restaurante", "Cafetería", "Bar", "Tienda", "Servicio",
  "Salud", "Educación", "Tecnología", "Moda", "Otro",
];

/* ─── Landing para visitantes no registrados ─────────────────────────── */
function LandingPage() {
  const [locals, setLocals]         = useState<LocalOut[]>([]);
  const [discounts, setDiscounts]   = useState<PostOut[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOut[]>([]);

  useEffect(() => {
    getLocals({ limit: 6 }).then(setLocals).catch(() => {});
    getActiveDiscounts().then((d) => setDiscounts(d.slice(0, 4))).catch(() => {});
    getProfessionals({ limit: 4 }).then(setProfessionals).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-0 px-3 py-1">
            🎉 ¡Nuevo! Ya está en tu ciudad
          </Badge>
          <h1 className="mb-5 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Descubre los mejores<br />
            <span className="text-yellow-300">locales y profesionales</span><br />
            cerca de ti
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base sm:text-lg text-white/80">
            Sigue tus negocios favoritos, encuentra descuentos exclusivos y conecta
            con profesionales de confianza en tu ciudad.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/register">
              <Button size="lg" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300 font-bold shadow-lg px-8">
                Crear cuenta gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/locals">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Explorar locales
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
                <Icon className="h-6 w-6 text-yellow-300" />
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-sm text-white/70">{label}</span>
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

      {/* ── Descuentos activos ───────────────────────────────────── */}
      {discounts.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Tag className="h-6 w-6 text-red-500" /> Descuentos activos
              </h2>
              <Link href="/locals" className="flex items-center gap-1 text-sm text-primary hover:underline">
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

      {/* ── Locales destacados ───────────────────────────────────── */}
      {locals.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <MapPin className="h-6 w-6 text-primary" /> Locales destacados
              </h2>
              <Link href="/locals" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todos <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {locals.slice(0, 6).map((local) => (
                <LocalCard key={local.id} local={local} />
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
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20 text-center text-white">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="mb-3 text-3xl font-bold">¿Tienes un negocio?</h2>
          <p className="mb-8 text-white/80">
            Regístralo gratis en Dirbook y llega a más clientes en tu ciudad.
            Publica eventos, descuentos y mucho más.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold shadow-lg px-10">
              Empezar ahora — es gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t bg-gray-50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Dirbook · Conectando tu ciudad
      </footer>
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
      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Encuentra locales en tu ciudad
          </h1>
          <p className="mb-8 text-primary-foreground/80">
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
