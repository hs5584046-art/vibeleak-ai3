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
      </main>
      <Footer />
    </>
  );
}
