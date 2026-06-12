"use client";

import { useState, useEffect, useCallback } from "react";
import { getEvents, EventOut } from "@/lib/api";
import {
  Calendar, MapPin, Tag, Briefcase, Search, Filter, Clock, ChevronRight, X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const LOCAL_CATEGORIES = [
  "Restaurante", "Tienda", "Servicio", "Salud", "Educación",
  "Tecnología", "Moda", "Entretenimiento", "Otro",
];

const PROFESSIONS = [
  "Abogado", "Médico", "Arquitecto", "Contador",
  "Programador", "Diseñador", "Psicólogo", "Ingeniero",
];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imgUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function eventStatus(start: string | null, end: string | null) {
  const now = Date.now();
  const s = start ? new Date(start).getTime() : null;
  const e = end ? new Date(end).getTime() : null;

  if (e && e < now) return { label: "Finalizado", className: "bg-muted text-muted-foreground" };
  if (s && s > now) return { label: "Próximamente", className: "bg-blue-500/15 text-blue-400 backdrop-blur" };
  return { label: "En curso", className: "bg-green-500/15 text-green-400 backdrop-blur" };
}

function EventCard({ event }: { event: EventOut }) {
  const status = eventStatus(event.event_start, event.event_end);
  const cover = imgUrl(event.image_url);
  const logo = imgUrl(event.local_logo);
  const isExpired = status.label === "Finalizado";

  return (
    <div className={`group rounded-2xl border border-white/10 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isExpired ? "opacity-60" : ""}`}>
      {/* Cover image */}
      <div className="relative h-44 bg-gradient-to-br from-yellow-400/10 to-amber-400/15 flex items-center justify-center overflow-hidden">
        {cover ? (
          <img src={cover} alt={event.title ?? ""} className="w-full h-full object-cover" />
        ) : (
          <Calendar className="h-12 w-12 text-yellow-400" />
        )}
        {/* Status badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="p-4">
        {/* Source (local or professional) */}
        <div className="flex items-center gap-2 mb-2">
          {logo ? (
            <img src={logo} alt="" className="h-6 w-6 rounded-full object-cover border" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-yellow-400/15 flex items-center justify-center">
              <span className="text-[10px] font-bold text-yellow-300">
                {(event.local_name || event.professional_name || "?")[0].toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs font-medium text-muted-foreground truncate">
            {event.local_name || event.professional_name || "Evento"}
          </span>
          {event.local_category && (
            <span className="ml-auto text-[10px] font-semibold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/30">
              {event.local_category}
            </span>
          )}
          {event.professional_profession && (
            <span className="ml-auto text-[10px] font-semibold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-400/30">
              {event.professional_profession}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base leading-snug mb-1 line-clamp-2">
          {event.title || event.content.slice(0, 60)}
        </h3>

        {/* Description */}
        {event.content && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.content}</p>
        )}

        {/* Dates */}
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-2">
          <Calendar className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-500" />
          <span>
            {formatDate(event.event_start)}
            {event.event_end && ` → ${formatDate(event.event_end)}`}
          </span>
        </div>

        {/* City */}
        {event.local_city && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span>{event.local_city}</span>
          </div>
        )}

        {/* Link */}
        {event.local_id && (
          <Link
            href={`/?local=${event.local_id}`}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-yellow-600 hover:underline"
          >
            Ver negocio <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [profession, setProfession] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvents({
        city: city || undefined,
        category: category || undefined,
        profession: profession || undefined,
        upcoming_only: upcomingOnly,
        limit: 50,
      });
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [city, category, profession, upcomingOnly]);

  useEffect(() => { load(); }, [load]);

  // Filtro local por búsqueda de texto
  const filtered = events.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.content?.toLowerCase().includes(q) ||
      e.local_name?.toLowerCase().includes(q) ||
      e.professional_name?.toLowerCase().includes(q)
    );
  });

  const hasFilters = city || category || profession || upcomingOnly;

  function clearFilters() {
    setCity("");
    setCategory("");
    setProfession("");
    setUpcomingOnly(false);
  }

  // Ciudades únicas de los eventos cargados (para sugerencias)
  const cities = [...new Set(events.map((e) => e.local_city).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-black via-zinc-900 to-yellow-950 text-white px-4 py-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-semibold mb-4">
            <Calendar className="h-4 w-4" /> Eventos
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Descubre eventos en tu ciudad
          </h1>
          <p className="text-white/60 text-lg">
            Exposiciones, talleres, conferencias, descuentos y más — todo en un solo lugar
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters card */}
        <div className="bg-card rounded-2xl border border-white/10 shadow-sm p-5 mb-8">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre del evento o negocio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* City */}
            <div className="min-w-[160px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Ciudad</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  list="cities-list"
                  placeholder="Ej: Bogotá"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                <datalist id="cities-list">
                  {cities.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            {/* Category */}
            <div className="min-w-[160px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Tipo de local</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                >
                  <option value="">Todos</option>
                  {LOCAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Profession */}
            <div className="min-w-[160px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Profesión</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                >
                  <option value="">Todas</option>
                  {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Upcoming toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setUpcomingOnly((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                  upcomingOnly
                    ? "bg-yellow-400 border-yellow-400 text-black"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <Clock className="h-4 w-4" />
                Próximos
              </button>
            </div>

            {/* Clear */}
            {hasFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" /> Limpiar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Cargando..." : `${filtered.length} evento${filtered.length !== 1 ? "s" : ""}`}
            {hasFilters && <span className="ml-1 text-yellow-600 font-medium">· filtrado</span>}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-card h-72 animate-pulse">
                <div className="h-44 bg-muted rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-14 w-14 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron eventos</h3>
            <p className="text-sm text-muted-foreground mt-1">Prueba con otros filtros o revisa más tarde</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-sm text-yellow-600 hover:underline font-medium">
                Quitar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
