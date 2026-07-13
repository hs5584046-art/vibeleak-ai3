import type { Metadata } from "next";
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
      type: "article"
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
    publisher: { "@type": "Organization", name: "VibeLytix" }
  };

  return (
    <>
      <Header />
      <main className="learning-page shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <header>
          <p className="eyebrow">{article.category} guide</p>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
        </header>
        <article>
          {article.sections.map(([title, body]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}
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
