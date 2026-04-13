"use client";

import { useEffect, useState, useCallback } from "react";
import { getLocals, LocalOut, getActiveDiscounts, PostOut } from "@/lib/api";
import LocalCard from "@/components/LocalCard";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Building2, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = [
  "Restaurante", "Cafetería", "Bar", "Tienda", "Servicio",
  "Salud", "Educación", "Tecnología", "Moda", "Otro",
];

function HomeContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [locals, setLocals]             = useState<LocalOut[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState(params.get("search") || "");
  const [category, setCategory]         = useState(params.get("category") || "");
  const [city, setCity]                 = useState(params.get("city") || "");
  const [showFilters, setShowFilters]   = useState(false);
  const [discounts, setDiscounts]       = useState<PostOut[]>([]);
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
    if (search) qs.set("search", search);
    if (category) qs.set("category", category);
    if (city) qs.set("city", city);
    router.push(`/?${qs.toString()}`);
    fetchLocals(search, category, city);
  };

  const selectCategory = (cat: string) => {
    const next = category === cat ? "" : cat;
    setCategory(next);
    fetchLocals(search, next, city);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCity("");
    fetchLocals("", "", "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
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
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setShowFilters((v) => !v)}
              title="Filtros"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>

          {/* Filtros extra */}
          {showFilters && (
            <div className="mt-3 flex gap-2">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad"
                className="bg-white text-foreground"
              />
              <Button type="button" variant="secondary" onClick={() => fetchLocals(search, category, city)}>
                Aplicar
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
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

      {/* Descuentos y eventos activos */}
      {(discountsLoading || discounts.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Tag className="h-5 w-5 text-red-500" />
            Descuentos y eventos activos
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
                <div key={p.id} className="w-64 shrink-0">
                  <PostCard post={p} />
                </div>
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
            <button onClick={clearFilters} className="text-sm text-primary hover:underline">
              Limpiar filtros
            </button>
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
            {locals.map((local) => (
              <LocalCard key={local.id} local={local} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
