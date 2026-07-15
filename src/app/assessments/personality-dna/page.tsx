import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PersonalityDnaExperience } from "@/components/assessment/personality-dna-experience";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata(): Promise<Metadata> {
  const path = "/assessments/personality-dna";
  const { data: override } = await createAdminClient()
    .from("seo_overrides")
    .select("title,description")
    .eq("path", path)
    .maybeSingle();
  const title = override?.title ?? "Personality DNA Assessment";
  const description = override?.description ?? "Explore emotional depth, independent agency, relational connection and adaptive flexibility through the VibeLytix Personality DNA assessment.";
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "website" }
  };
}

export default function PersonalityDnaPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="assessment-page">
        <PersonalityDnaExperience />
      </main>
      <Footer />
    </>
  );
}
