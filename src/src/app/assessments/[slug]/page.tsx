import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpansionExperience } from "@/components/assessment/expansion-experience";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { expansionAssessments, getExpansionAssessment } from "@/lib/assessment/expansion";

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
  return {
    title: `${assessment.title} Assessment`,
    description: assessment.description,
    alternates: { canonical: `/assessments/${assessment.id}` },
    openGraph: {
      title: `${assessment.title} | VibeLytix`,
      description: assessment.description,
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

  return (
    <>
      <Header />
      <main className="assessment-page">
        <div className="assessment-shell">
          <ExpansionExperience assessment={assessment} />
        </div>
      </main>
      <Footer />
    </>
  );
}
