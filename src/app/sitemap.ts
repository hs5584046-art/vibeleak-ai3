import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { expansionAssessments } from "@/lib/assessment/expansion";
import { learningArticles, seoLandingPages } from "@/lib/content";

const staticRoutes = [
  "",
  "/assessments/personality-dna",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/refunds"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const assessmentRoutes = expansionAssessments.map((item) => `/assessments/${item.id}`);
  const articleRoutes = learningArticles.map((item) => `/learn/${item.slug}`);
  const landingRoutes = seoLandingPages.map((item) => `/discover/${item.slug}`);

  return [...staticRoutes, ...assessmentRoutes, ...landingRoutes, ...articleRoutes].map((route, index) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/learn/") ? "monthly" : "weekly",
    priority: index === 0 ? 1 : route.startsWith("/assessments/") ? 0.9 : 0.65
  }));
}
