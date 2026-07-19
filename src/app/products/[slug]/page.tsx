import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ProductExperience } from "@/components/product-experience";
import { CheckIcon } from "@/components/ui/icons";
import { getRevenueProduct, revenueProducts } from "@/lib/products";

export function generateStaticParams() {
  return revenueProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getRevenueProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    robots: { index: true, follow: true },
    openGraph: { title: product.title, description: product.description, type: "website" }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getRevenueProduct((await params).slug);
  if (!product) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    offers: { "@type": "Offer", priceCurrency: "INR", price: product.pricePaise / 100, availability: "https://schema.org/InStock" }
  };

  return (
    <>
      <Header />
      <main id="main-content" className="product-page shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
        <header className="product-hero">
          <div>
            <p className="eyebrow">{product.eyebrow}</p>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <div className="hero-trust">
              <span><CheckIcon /> Personalised</span>
              <span><CheckIcon /> One-time ₹{product.pricePaise / 100}</span>
              <span><CheckIcon /> Save as PDF</span>
            </div>
          </div>
          <aside>
            <strong>Designed for</strong>
            <p>{product.audience}</p>
            <strong>Outcome</strong>
            <p>{product.outcome}</p>
          </aside>
        </header>

        <section className="product-feature-section">
          <h2>What your system includes</h2>
          <div className="life-stage-grid">
            {product.features.map((feature) => <article key={feature}><CheckIcon /><h3>{feature}</h3><p>Personalised around your four planning answers and related assessment direction.</p></article>)}
          </div>
        </section>

        <ProductExperience product={product} />

        <section className="seo-content-sections" aria-label={`${product.title} buying guide`}>
          <article><h2>Who this is for</h2><p>{product.audience}. It is designed for someone who wants a practical system tied to a current outcome, rather than another generic personality label.</p></article>
          <article><h2>What you receive</h2><p>{product.outcome} Your answers personalise the priorities, likely blockers, scenarios, seven-day plan and thirty-day roadmap that appear in the final report.</p></article>
          <article><h2>Before you purchase</h2><p>Start with the related free assessment to confirm the direction is useful. This product is educational guidance, not professional advice or a guaranteed career, business, personal or relationship outcome.</p></article>
        </section>
      </main>
      <Footer />
    </>
  );
}
