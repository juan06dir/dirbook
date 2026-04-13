"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface Props {
  address: string;
  city: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function LocalMap({ address, city }: Props) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [Map, setMap] = useState<React.ComponentType<{ coords: [number, number]; label: string }> | null>(null);

  const query = [address, city].filter(Boolean).join(", ");

  useEffect(() => {
    if (!query) return;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    )
      .then((r) => r.json())
      .then((data: NominatimResult[]) => {
        if (data[0]) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      })
      .catch(() => {});
  }, [query]);

  useEffect(() => {
    if (!coords) return;
    import("./LeafletMap").then((mod) => setMap(() => mod.default));
  }, [coords]);

  if (!coords) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground gap-2">
        <MapPin className="h-4 w-4" />
        {query || "Sin ubicación registrada"}
      </div>
    );
  }

  if (!Map) {
    return <div className="h-48 rounded-xl bg-muted animate-pulse" />;
  }

  return <Map coords={coords} label={query} />;
}
