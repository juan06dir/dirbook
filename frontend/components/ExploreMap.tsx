"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocalOut } from "@/lib/api";

export interface GeoLocal {
  local: LocalOut;
  coords: [number, number];
}

interface Props {
  geoLocals: GeoLocal[];
  userCoords: [number, number] | null;
  center: [number, number];
  zoom?: number;
}

/* Vuela al centro cuando cambia (para "cerca de mí") */
function FlyTo({ coords, zoom }: { coords: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, zoom, { duration: 1.5 });
  }, [coords, zoom, map]);
  return null;
}

function markerIcon(name: string) {
  const initials = name.slice(0, 2).toUpperCase();
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:38px;height:38px;
          background:#facc15;border:3px solid #000;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;font-weight:900;color:#000;font-family:system-ui,sans-serif;
          box-shadow:0 3px 10px rgba(0,0,0,0.35);cursor:pointer;
        ">${initials}</div>
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;border-right:7px solid transparent;
          border-top:9px solid #000;margin-top:-2px;
        "></div>
      </div>`,
    className: "",
    iconSize:   [38, 52],
    iconAnchor: [19, 52],
    popupAnchor:[0, -54],
  });
}

const youIcon = L.divIcon({
  html: `<div style="
    width:20px;height:20px;
    background:#2563eb;border:3px solid #fff;border-radius:50%;
    box-shadow:0 0 0 5px rgba(37,99,235,0.25);
  "></div>`,
  className: "",
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
});

export default function ExploreMap({ geoLocals, userCoords, center, zoom = 13 }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userCoords && <FlyTo coords={userCoords} zoom={15} />}

      {/* Marcador "Tú estás aquí" */}
      {userCoords && (
        <Marker position={userCoords} icon={youIcon}>
          <Popup>📍 Tu ubicación</Popup>
        </Marker>
      )}

      {/* Marcadores de locales */}
      {geoLocals.map(({ local, coords }) => (
        <Marker key={local.id} position={coords} icon={markerIcon(local.name)}>
          <Popup maxWidth={220}>
            <div style={{ fontFamily: "system-ui,sans-serif", minWidth: 180 }}>
              <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 6px" }}>{local.name}</p>
              <span style={{
                background: "#000", color: "#facc15",
                borderRadius: 20, padding: "2px 10px",
                fontSize: 11, fontWeight: 700,
              }}>{local.category}</span>

              <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, color: "#555" }}>
                {local.avg_rating
                  ? <span>⭐ {local.avg_rating.toFixed(1)} <span style={{color:"#999"}}>({local.ratings_count})</span></span>
                  : <span style={{color:"#bbb"}}>Sin calificación</span>
                }
                <span>👥 {local.followers_count}</span>
              </div>

              {(local.address || local.city) && (
                <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                  📍 {[local.address, local.city].filter(Boolean).join(", ")}
                </p>
              )}

              <a
                href={`/locals/${local.id}`}
                style={{
                  display: "inline-block", marginTop: 10,
                  background: "#facc15", color: "#000",
                  padding: "6px 16px", borderRadius: 8,
                  fontSize: 12, fontWeight: 800, textDecoration: "none",
                }}
              >
                Ver perfil →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
