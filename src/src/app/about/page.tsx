import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { SectionHeading } from "@/components/ui/section-heading";
import { ShieldIcon, SparklesIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About",
  description: "Why VibeLytix exists and the principles guiding its assessments."
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="internal-hero shell">
          <p className="eyebrow"><SparklesIcon /> About VibeLytix</p>
          <h1>Self-discovery without fake certainty.</h1>
          <p>
            VibeLytix is a premium assessment platform that helps people name patterns,
            understand trade-offs and make more deliberate choices.
          </p>
        </section>

        <section className="section shell about-grid">
          <div>
            <SectionHeading
              eyebrow="Why this exists"
              title="Most online tests are either forgettable or overconfident."
            />
          </div>
          <div className="prose-card">
            <p>
              A playful experience can still be honest. VibeLytix aims to combine polished design with
              careful language, explainable scoring and practical reports.
            </p>
            <p>
              The platform does not diagnose users, read another person’s thoughts or guarantee
              a future outcome. Instead, it creates structured reflection from the answers a user provides.
            </p>
          </div>
        </section>

        <section className="section section-soft">
          <div className="shell values-grid">
            {[
              ["Clarity", "Explain what a score means and where it came from."],
              ["Restraint", "Avoid exaggerated claims, fear and emotional pressure."],
              ["Privacy", "Collect less data and protect what must be stored."],
              ["Usefulness", "End with practical decisions, language and next steps."]
            ].map(([title, description]) => (
              <article key={title}>
                <span><ShieldIcon /></span>
                <h2>{title}</h2>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
