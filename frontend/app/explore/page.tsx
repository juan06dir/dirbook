"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getLocals, LocalOut } from "@/lib/api";
import { GeoLocal } from "@/components/ExploreMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Navigation, Star, Users, Loader2, Building2,
} from "lucide-react";

/* ExploreMap solo en cliente (Leaflet no soporta SSR) */
const ExploreMap = dynamic(() => import("@/components/ExploreMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-xl" />,
});

const CATEGORIES = [
  "Todos", "Restaurante", "Cafetería", "Bar", "Tienda", "Servicio",
  "Salud", "Educación", "Tecnología", "Moda", "Otro",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_CENTER: [number, number] = [4.711, -74.0721]; // Bogotá por defecto

/* ── Cache de coordenadas en sessionStorage ──────────────────────────────── */
const CACHE_KEY = "dirbook_geo_v1";
function getCache(): Record<string, [number, number]> {
  try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) || "{}"); }
  catch { return {}; }
}
function saveCache(key: string, coords: [number, number]) {
  try {
    const c = getCache(); c[key] = coords;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {}
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function geocode(query: string): Promise<[number, number] | null> {
  const cache = getCache();
  if (cache[query]) return cache[query];
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (data[0]) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      saveCache(query, coords);
      return coords;
    }
  } catch {}
  return null;
}

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

function StarRow({ rating, count }: { rating: number | null; count: number }) {
  if (!rating) return <span className="text-xs text-muted-foreground">Sin calificaciones</span>;
  return (
    <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
      <Star className="h-3 w-3 fill-amber-400" />
      {rating.toFixed(1)}
      <span className="text-muted-foreground font-normal">({count})</span>
    </span>
  );
}

export default function ExplorePage() {
  const [locals,    setLocals]    = useState<LocalOut[]>([]);
  const [geoLocals, setGeoLocals] = useState<GeoLocal[]>([]);
  const [category,  setCategory]  = useState("Todos");
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [center,    setCenter]    = useState<[number, number]>(DEFAULT_CENTER);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geocoding,  setGeocoding]  = useState(false);
  const cancelRef = useRef(false);

  /* Cargar todos los locales */
  useEffect(() => {
    getLocals({ limit: 100 }).then(setLocals).catch(() => {});
  }, []);

  /* Geocodificar secuencialmente (respeta rate-limit de Nominatim) */
  useEffect(() => {
    if (locals.length === 0) return;
    cancelRef.current = false;
    setGeocoding(true);

    (async () => {
      const withAddr = locals.filter((l) => l.address || l.city);
      for (const local of withAddr) {
        if (cancelRef.current) break;
        const query = [local.address, local.city].filter(Boolean).join(", ");
        const coords = await geocode(query);
        if (coords && !cancelRef.current) {
          setGeoLocals((prev) =>
            prev.find((g) => g.local.id === local.id)
              ? prev
              : [...prev, { local, coords }]
          );
        }
        await sleep(380); // ~2.5 req/s para no exceder el límite de Nominatim
      }
      setGeocoding(false);
    })();

    return () => { cancelRef.current = true; };
  }, [locals]);

  /* Botón "Cerca de mí" */
  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude];
        setUserCoords(pos);
        setCenter(pos);
        setLoadingGeo(false);
      },
      () => setLoadingGeo(false),
      { timeout: 8000 }
    );
  };

  /* Filtros */
  const filtered = category === "Todos"
    ? geoLocals
    : geoLocals.filter((g) => g.local.category === category);

  const topLocals = (category === "Todos" ? locals : locals.filter((l) => l.category === category))
    .filter((l) => l.avg_rating !== null)
    .sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    .slice(0, 30);

  const noRating = (category === "Todos" ? locals : locals.filter((l) => l.category === category))
    .filter((l) => !l.avg_rating)
    .sort((a, b) => b.followers_count - a.followers_count);

  const sideList = [...topLocals, ...noRating];

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">

      {/* ── Filtros de categoría ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto border-b bg-white px-4 py-2.5 shrink-0">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">Filtrar:</span>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className="shrink-0">
            <Badge
              variant={category === cat ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cat}
            </Badge>
          </button>
        ))}
      </div>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">

        {/* Mapa */}
        <div className="relative flex-1 min-h-[45vh] md:min-h-0">
          <ExploreMap
            geoLocals={filtered}
            userCoords={userCoords}
            center={center}
          />

          {/* Botón "Cerca de mí" flotante */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
            <Button
              onClick={handleNearMe}
              disabled={loadingGeo}
              className="bg-black text-yellow-400 hover:bg-black/80 shadow-lg font-bold px-5"
            >
              {loadingGeo
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Navigation className="mr-2 h-4 w-4" />
              }
              Cerca de mí
            </Button>
          </div>

          {/* Indicador de geocodificación */}
          {geocoding && (
            <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-full bg-black/80 px-3 py-1.5 text-xs text-yellow-400 font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando locales… ({geoLocals.length})
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l bg-white flex flex-col overflow-hidden shrink-0">

          {/* Header del panel */}
          <div className="px-4 py-3 border-b shrink-0">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {category === "Todos" ? "Mejor calificados" : `${category} — Mejor calificados`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} en el mapa · {sideList.length} en total
            </p>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto divide-y">
            {sideList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Building2 className="h-10 w-10 opacity-20 mb-2" />
                <p className="text-sm">Sin locales en esta categoría</p>
              </div>
            ) : (
              sideList.map((local, idx) => {
                const logo = imageUrl(local.logo);
                return (
                  <Link
                    key={local.id}
                    href={`/locals/${local.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors"
                  >
                    {/* Posición */}
                    {local.avg_rating && (
                      <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                    )}

                    {/* Logo */}
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted border">
                      {logo
                        ? <img src={logo} alt="" className="h-full w-full object-cover" /> // eslint-disable-line
                        : <div className="flex h-full items-center justify-center bg-yellow-400 text-black font-bold text-sm">
                            {local.name.slice(0, 2).toUpperCase()}
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{local.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">{local.category}</Badge>
                        <StarRow rating={local.avg_rating} count={local.ratings_count} />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Users className="h-3 w-3" /> {local.followers_count} seguidores
                        {local.city && <> · <MapPin className="h-3 w-3" />{local.city}</>}
                      </span>
                    </div>

                    {/* Indicador de en mapa */}
                    {geoLocals.find((g) => g.local.id === local.id) && (
                      <span title="Visible en el mapa" className="text-yellow-500">
                        <MapPin className="h-4 w-4 fill-yellow-400" />
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
