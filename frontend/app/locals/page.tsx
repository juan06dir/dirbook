"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { getLocals, LocalOut } from "@/lib/api";
import LocalCard from "@/components/LocalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { LOCAL_CATEGORIES as CATEGORIES } from "@/lib/categories";

function LocalsContent() {
  const params = useSearchParams();
  const [locals, setLocals]       = useState<LocalOut[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState(params.get("search") || "");
  const [category, setCategory]   = useState(params.get("category") || "");
  const [city, setCity]           = useState(params.get("city") || "");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLocals = useCallback(async (s: string, cat: string, c: string) => {
    setLoading(true);
    try {
      const data = await getLocals({ search: s, category: cat, city: c, limit: 60 });
      setLocals(data);
    } catch {
      setLocals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocals(search, category, city);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-background">
      {/* Hero / buscador */}
      <section className="relative overflow-hidden bg-black py-14">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-yellow-400/15 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-3 flex items-center justify-center gap-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            <Building2 className="h-8 w-8 text-yellow-400" />
            <span><span className="text-gradient-gold">Locales</span> en Dirbook</span>
          </h1>
          <p className="mb-8 text-white/60">
            Todos los negocios registrados en tu ciudad
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Restaurantes, peluquerías, tiendas…"
                className="pl-9 border-0 shadow-none focus-visible:ring-yellow-400"
              />
            </div>
            <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold">Buscar</Button>
            <Button type="button" variant="secondary" size="icon" onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>

          {showFilters && (
            <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" />
              <Button type="button" variant="secondary" onClick={() => fetchLocals(search, category, city)}>Aplicar</Button>
              <Button type="button" variant="outline" className="text-white border-white/30 bg-transparent hover:bg-white/10 hover:text-white" onClick={clearFilters}>Limpiar</Button>
            </div>
          )}
        </div>
      </section>

      {/* Categorías */}
      <section className="border-b border-white/10 bg-card py-3">
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

      {/* Listado */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {loading ? "Buscando…" : `${locals.length} local${locals.length !== 1 ? "es" : ""} registrado${locals.length !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
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

export default function LocalsPage() {
  return <Suspense><LocalsContent /></Suspense>;
}
