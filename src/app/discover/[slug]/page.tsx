import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ArrowRightIcon, CheckIcon, ShieldIcon } from "@/components/ui/icons";
import { getSeoLandingPage, indexableSeoLandingSlugs, seoLandingPages } from "@/lib/content";

export function generateStaticParams() {
  return seoLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug:string }> }): Promise<Metadata> {
  const page = getSeoLandingPage((await params).slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    robots: indexableSeoLandingSlugs.has(page.slug) ? { index:true, follow:true } : { index:false, follow:true },
    alternates:{ canonical:`/discover/${page.slug}` },
    openGraph:{ title:page.title, description:page.description, type:"website" }
  };
}

export default async function SeoLandingPage({ params }: { params:Promise<{slug:string}> }) {
  const page = getSeoLandingPage((await params).slug);
  if (!page) notFound();

  const schema = {
    "@context":"https://schema.org",
    "@graph":[
      { "@type":"WebPage", name:page.title, description:page.description },
      { "@type":"FAQPage", mainEntity:page.faqs.map(([question,answer]) => ({
        "@type":"Question", name:question, acceptedAnswer:{ "@type":"Answer", text:answer }
      })) }
    ]
  };

  return <>
    <Header />
    <main className="seo-landing shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}} />
      <section className="seo-hero">
        <p className="eyebrow">Free assessment · Optional premium report</p>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <Link className="button button-primary" href={`/assessments/${page.assessmentId}`}>
          Start free assessment <ArrowRightIcon />
        </Link>
      </section>
      <section className="seo-benefits">
        {page.benefits.map((benefit) => <article key={benefit}><CheckIcon /><p>{benefit}</p></article>)}
      </section>
      <section className="seo-content-sections">
        {page.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
      <section className="seo-content-sections">
        <article>
          <h2>What you receive before paying</h2>
          <p>You can complete every question and see a personal result type, summary and leading dimensions without entering payment details. The optional report adds deeper interpretation, watchouts, scenarios and a practical action plan.</p>
        </article>
        <article>
          <h2>How VibeLytix calculates the result</h2>
          <p>Answers contribute to transparent behavioural dimensions connected to {page.focus}. The result describes relative patterns in your responses; it does not infer hidden facts, diagnose a condition or claim permanent certainty.</p>
        </article>
        <article>
          <h2>Who this assessment is designed for</h2>
          <p>{page.audience} can use the preview to name a current pattern, compare it with real examples and choose one practical experiment. The result is most useful when combined with context and observable behaviour.</p>
        </article>
      </section>
      <section className="seo-explainer">
        <div>
          <p className="eyebrow"><ShieldIcon /> Transparent by design</p>
          <h2>Useful reflection without fake certainty.</h2>
        </div>
        <p>VibeLytix reports explain patterns from your answers. They do not diagnose conditions, predict another person’s behaviour or guarantee a future outcome. Use the result as a structured prompt for better questions and decisions.</p>
      </section>
      <section className="faq-list">
        {page.faqs.map(([question,answer]) => <details key={question}><summary><span>{question}</span><b>+</b></summary><p>{answer}</p></details>)}
      </section>
    </main>
    <Footer />
  </>;
}
