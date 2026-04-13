"use client";

import { useEffect, useState, useCallback } from "react";
import { getProfessionals, ProfessionalOut } from "@/lib/api";
import ProfessionalCard from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserCircle2 } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const PROFESSIONS = [
  "Abogado", "Arquitecto", "Programador", "Médico", "Contador",
  "Diseñador", "Psicólogo", "Ingeniero", "Fotógrafo", "Otro",
];

function ProfessionalsContent() {
  const params = useSearchParams();
  const [professionals, setProfessionals] = useState<ProfessionalOut[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState(params.get("search") || "");
  const [profession, setProfession] = useState(params.get("profession") || "");

  const fetchProfessionals = useCallback(async (s: string, p: string) => {
    setLoading(true);
    try {
      const data = await getProfessionals({ search: s, profession: p, limit: 40 });
      setProfessionals(data);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals(search, profession);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfessionals(search, profession);
  };

  const selectProfession = (p: string) => {
    const next = profession === p ? "" : p;
    setProfession(next);
    fetchProfessionals(search, next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-indigo-600 py-12 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Profesionales</h1>
          <p className="mb-8 text-indigo-100">
            Encuentra abogados, arquitectos, programadores y más
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre o especialidad…"
                className="pl-9 bg-white text-foreground"
              />
            </div>
            <Button type="submit" variant="secondary">Buscar</Button>
          </form>
        </div>
      </section>

      {/* Filtro por profesión */}
      <section className="border-b bg-white py-3">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <div className="flex gap-2 pb-1">
            {PROFESSIONS.map((p) => (
              <button key={p} onClick={() => selectProfession(p)}>
                <Badge
                  variant={profession === p ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {p}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listado */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {loading ? "Buscando…" : `${professionals.length} profesional${professionals.length !== 1 ? "es" : ""} encontrado${professionals.length !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <UserCircle2 className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No se encontraron profesionales</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {professionals.map((p) => (
              <ProfessionalCard key={p.id} prof={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProfessionalsPage() {
  return <Suspense><ProfessionalsContent /></Suspense>;
}
