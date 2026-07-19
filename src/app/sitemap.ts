import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { expansionAssessments } from "@/lib/assessment/expansion";
import { indexableSeoLandingPages, learningArticles } from "@/lib/content";
import { revenueProducts } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

const staticRoutes = [
  "",
  "/assessments/personality-dna",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/refunds"
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const assessmentRoutes = expansionAssessments.map((item) => `/assessments/${item.id}`);
  const articleRoutes = learningArticles.map((item) => `/learn/${item.slug}`);
  const landingRoutes = indexableSeoLandingPages.map((item) => `/discover/${item.slug}`);
  const productRoutes = revenueProducts.map((item) => `/products/${item.slug}`);
  const { data: resources } = await createAdminClient()
    .from("autonomous_resources")
    .select("slug,updated_at")
    .eq("status", "published");
  const resourceRoutes = (resources ?? []).map((item) => `/resources/${item.slug}`);

  return [...staticRoutes, ...assessmentRoutes, ...productRoutes, ...landingRoutes, ...articleRoutes, ...resourceRoutes].map((route, index) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/learn/") ? "monthly" : "weekly",
    priority: index === 0 ? 1 : route.startsWith("/assessments/") ? 0.9 : route.startsWith("/products/") ? 0.88 : 0.65
  }));
}
