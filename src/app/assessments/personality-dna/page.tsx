import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PersonalityDnaExperience } from "@/components/assessment/personality-dna-experience";

export const metadata: Metadata = {
  title: "Personality DNA Assessment",
  description:
    "Explore emotional depth, independent agency, relational connection and adaptive flexibility through the VibeLytix Personality DNA assessment.",
  alternates: {
    canonical: "/assessments/personality-dna"
  },
  robots: {
    index: true,
    follow: true
  }
};

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
