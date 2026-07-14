import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VibeLytix",
    short_name: "VibeLytix",
    description: "Premium assessments for personality, relationships, career and personal growth.",
    start_url: "/",
    display: "standalone",
    background_color: "#09070f",
    theme_color: "#09070f",
    icons: []
  };
}
