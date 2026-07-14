import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Section = { heading: string; paragraph: string };

async function getResource(slug: string) {
  const { data } = await createAdminClient()
    .from("autonomous_resources")
    .select("slug,title,description,body,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as null | { slug: string; title: string; description: string; body: Section[]; published_at: string | null };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resource = await getResource((await params).slug);
  if (!resource) return {};
  return { title: resource.title, description: resource.description };
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const resource = await getResource((await params).slug);
  if (!resource) notFound();

  return (
    <>
      <Header />
      <main id="main-content" className="learning-page shell">
        <header className="learning-hero">
          <p className="eyebrow">Free practical resource</p>
          <h1>{resource.title}</h1>
          <p>{resource.description}</p>
          {resource.published_at ? <small>Published {new Date(resource.published_at).toLocaleDateString("en-IN")}</small> : null}
        </header>
        <article>
          {resource.body.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.paragraph}</p>
            </section>
          ))}
          <aside>
            <strong>Educational use</strong>
            <p>This resource supports reflection and planning. It does not provide medical, legal, financial or psychological diagnosis.</p>
          </aside>
        </article>
      </main>
      <Footer />
    </>
  );
}
