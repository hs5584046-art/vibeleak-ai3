import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpansionExperience } from "@/components/assessment/expansion-experience";
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
          <ExpansionExperience assessment={assessment} />
        </div>
      </main>
      <Footer />
    </>
  );
}
