import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export function LegalLayout({
  eyebrow,
  title,
  introduction,
  children,
  updated = "July 12, 2026"
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  children: ReactNode;
  updated?: string;
}) {
  return (
    <>
      <Header />
      <main className="legal-main shell">
        <header className="legal-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{introduction}</p>
          <small>Last updated: {updated}</small>
        </header>
        <article className="legal-document">{children}</article>
      </main>
      <Footer />
    </>
  );
}
