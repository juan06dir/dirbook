"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Props {
  coords: [number, number];
  label: string;
  name?: string;
}

function createCustomIcon(name: string) {
  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
    ">
      <!-- Pin circular -->
      <div style="
        width: 44px;
        height: 44px;
        background: #facc15;
        border: 3px solid #000;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 20px;
          line-height: 1;
        ">📍</span>
      </div>
      <!-- Etiqueta con el nombre -->
      <div style="
        margin-top: 6px;
        background: #000;
        color: #facc15;
        font-size: 11px;
        font-weight: 700;
        font-family: system-ui, sans-serif;
        padding: 3px 8px;
        border-radius: 20px;
        white-space: nowrap;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        letter-spacing: 0.2px;
      ">${name}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize:   [44, 80],
    iconAnchor: [22, 44],
    popupAnchor:[0, -50],
  });
}

export default function LeafletMap({ coords, label, name }: Props) {
  const icon = createCustomIcon(name || label);

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border">
      <MapContainer
        center={coords}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords} icon={icon}>
          <Popup>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{name || label}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{label}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
