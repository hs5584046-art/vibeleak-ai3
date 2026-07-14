import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getLearningArticle, learningArticles } from "@/lib/content";

export function generateStaticParams() {
  return learningArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = getLearningArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/learn/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      modifiedTime: `${article.updatedAt}T00:00:00.000Z`
    }
  };
}

export default async function LearningPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = getLearningArticle((await params).slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: { "@type": "Organization", name: "VibeLytix" },
    publisher: { "@type": "Organization", name: "VibeLytix" },
    dateModified: article.updatedAt,
    mainEntityOfPage: `/learn/${article.slug}`
  };

  return (
    <>
      <Header />
      <main id="main-content" className="learning-page shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <header>
          <p className="eyebrow">{article.category} guide</p>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
          <div className="article-meta">
            <span>Updated {new Date(`${article.updatedAt}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</span>
            <span>Reviewed by {article.reviewedBy}</span>
            <span>Educational guide</span>
          </div>
        </header>
        <article>
          {article.sections.map(([title, body]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}
          <section className="article-exercise">
            <p className="eyebrow">Practical exercise</p>
            <h2>Use the idea today</h2>
            <p>{article.exercise}</p>
          </section>
          <section className="article-cta">
            <div>
              <p className="eyebrow">Related self-assessment</p>
              <h2>Turn the guide into a personal preview.</h2>
              <p>Complete the related assessment free. Premium detail is optional and shown before checkout.</p>
            </div>
            <Link className="button button-primary" href={`/assessments/${article.assessmentId}`}>
              Start related assessment
            </Link>
          </section>
          <aside>
            <strong>Important</strong>
            <p>VibeLytix content is educational and does not replace medical, psychological, legal or financial advice.</p>
          </aside>
        </article>
      </main>
      <Footer />
    </>
  );
}
