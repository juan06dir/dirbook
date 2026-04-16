import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dirbook — Directorio de locales",
    short_name: "Dirbook",
    description: "Encuentra y conecta con locales y profesionales en tu ciudad",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#facc15",
    categories: ["business", "lifestyle", "shopping"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x720",
        // @ts-expect-error – form_factor es válido en el estándar pero aún no tipado en Next.js
        form_factor: "wide",
      },
    ],
  };
}
