import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Noxyera — Gestion Anti-Nuisibles",
    short_name: "Noxyera",
    description: "Plateforme B2B de gestion anti-nuisibles avec rapports HACCP numériques.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0D1F17",
    theme_color: "#1B3A2D",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    lang: "fr",
    icons: [
      {
        src: "/api/pwa-icon/192",
        sizes: "192x192",
        type: "image/png",
        // @ts-expect-error purpose is valid per PWA spec but not in MetadataRoute.Manifest type
        purpose: "any maskable",
      },
      {
        src: "/api/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
        // @ts-expect-error purpose is valid per PWA spec but not in MetadataRoute.Manifest type
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name: "Mon dashboard",
        url: "/dashboard",
        description: "Accéder à votre espace client",
      },
      {
        name: "Mes interventions",
        url: "/dashboard/interventions",
        description: "Voir toutes les interventions",
      },
    ],
  };
}
