import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PersonalityDnaExperience } from "@/components/assessment/personality-dna-experience";
import Link from "next/link";
import { ScorePreview } from "@/components/site/score-preview";
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Personality DNA Assessment",
    description: "Explore emotional depth, independent agency, relational connection and adaptive flexibility through a transparent self-reflection assessment.",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: "149",
      description: "Optional detailed report. The assessment and personal preview are free."
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" className="assessment-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
        <div className="assessment-shell">
          <section className="seo-hero">
            <p className="eyebrow">Flagship assessment · Free personal preview</p>
            <h1>Personality DNA Assessment</h1>
            <p>Explore emotional depth, independent agency, relational connection and adaptive flexibility through a transparent assessment. Complete it free in about eight minutes and decide about the optional ₹149 report only after seeing your preview.</p>
          </section>
          <ScorePreview />
        </div>
        <PersonalityDnaExperience />
        <div className="assessment-shell">
          <section className="seo-content-sections">
            <article><h2>Four practical personality dimensions</h2><p>Personality DNA examines emotional depth, independent agency, relational connection and adaptive flexibility. The dimensions describe patterns in your answers; they are not fixed personality types or clinical measurements.</p></article>
            <article><h2>A useful result before checkout</h2><p>The free preview includes a personal profile, summary and leading scores. The optional report adds every dimension, communication and stress patterns, strengths, watchouts, scenarios, and practical seven-day and thirty-day plans.</p></article>
            <article><h2>Responsible interpretation</h2><p>Compare your result with recent behaviour and look for exceptions. Mood, context and experience can change how a pattern appears. Use the assessment to improve reflection and conversation—not to diagnose yourself or predict another person.</p></article>
          </section>
          <section className="seo-explainer">
            <div><p className="eyebrow">Beyond the assessment</p><h2>Build your complete Personal Life OS.</h2></div>
            <p>Turn the Personality DNA direction into a personalised decision, stress, communication and habit system. <Link href="/products/personal-life-os">Explore the ₹699 Personal Life OS</Link>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
