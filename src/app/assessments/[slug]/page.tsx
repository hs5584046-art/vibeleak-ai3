import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpansionExperience } from "@/components/assessment/expansion-experience";
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { expansionAssessments, getExpansionAssessment } from "@/lib/assessment/expansion";
import { createAdminClient } from "@/lib/supabase/admin";

export function generateStaticParams() {
  return expansionAssessments.map((assessment) => ({ slug: assessment.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assessment = getExpansionAssessment(slug);
  if (!assessment) return {};
  const path = `/assessments/${assessment.id}`;
  const { data: override } = await createAdminClient()
    .from("seo_overrides")
    .select("title,description")
    .eq("path", path)
    .maybeSingle();
  const title = override?.title ?? `${assessment.title} Assessment`;
  const description = override?.description ?? assessment.description;
  return {
    title,
    description,
    alternates: { canonical: `/assessments/${assessment.id}` },
    openGraph: {
      title,
      description,
      type: "website"
    }
  };
}

export default async function ExpansionAssessmentPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "personality-dna") notFound();
  const assessment = getExpansionAssessment(slug);
  if (!assessment) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${assessment.title} Assessment`,
    description: assessment.description,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (assessment.pricePaise / 100).toFixed(0),
      description: "Optional detailed report. The assessment and personal preview are free."
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" className="assessment-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
        <div className="assessment-shell">
          <section className="seo-hero">
            <p className="eyebrow">{assessment.eyebrow} · Free personal preview</p>
            <h1>{assessment.title} Assessment</h1>
            <p>{assessment.description} Complete the assessment free in about {assessment.estimatedMinutes} minutes; unlock the detailed report only if the preview is useful.</p>
          </section>
          <ExpansionExperience assessment={assessment} />
          <section className="seo-content-sections" aria-label={`${assessment.title} methodology`}>
            <article><h2>What this assessment measures</h2><p>The questions measure {assessment.dimensions.map((item) => item.label.toLowerCase()).join(", ")}. Scores describe patterns across your answers rather than assigning a permanent identity.</p></article>
            <article><h2>How to use your result</h2><p>Compare the result with two or three recent situations, notice exceptions and choose one behaviour to test. VibeLytix is educational self-reflection, not diagnosis, professional advice or a guaranteed prediction.</p></article>
            <article><h2>Free preview and optional report</h2><p>The complete assessment and meaningful personal preview are free. The optional ₹{assessment.pricePaise / 100} report adds every dimension, strengths, watchouts, practical scenarios, a seven-day plan and a thirty-day roadmap.</p></article>
          </section>
          <section className="seo-benefits">
            {assessment.dimensions.map((dimension) => <article key={dimension.id}><div><h3>{dimension.label}</h3><p>{dimension.description}</p></div></article>)}
          </section>
          <section className="seo-explainer">
            <div><p className="eyebrow">Move from insight to action</p><h2>Need a complete personalised system?</h2></div>
            <p>After the free preview, explore the related premium outcome product for a deeper practical roadmap. <Link href={`/products/${assessment.id === "career-alignment" ? "career-accelerator" : assessment.id === "relationship-intelligence" ? "couple-compatibility" : assessment.id === "leadership-style" ? "founder-os" : "personal-life-os"}`}>View the related action system</Link>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
