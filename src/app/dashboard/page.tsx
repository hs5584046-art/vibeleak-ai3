import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountActions } from "@/components/account/account-actions";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type ReportRow = {
  id: string;
  assessment_id: string;
  profile_title: string;
  report: {
    profile?: { subtitle?: string; summary?: string };
    title?: string;
    summary?: string;
    dimensions?: { id: string; label: string; score: number }[];
  };
  completed_at: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/auth");

  const { data: userData } = await supabase.auth.getUser();
  const { data: reports, error } = await supabase
    .from("assessment_reports")
    .select("id,assessment_id,profile_title,report,completed_at,created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header />
      <main className="dashboard-page shell">
        <header className="dashboard-hero">
          <div>
            <p className="eyebrow">Private dashboard</p>
            <h1>Your saved self-discovery reports.</h1>
            <p>{userData.user?.email}</p>
          </div>
          <AccountActions mode="account" />
        </header>

        {error ? (
          <div className="dashboard-empty">
            <h2>Reports could not be loaded.</h2>
            <p>Confirm that you ran <code>supabase/schema.sql</code> and enabled the required environment variables.</p>
          </div>
        ) : reports?.length ? (
          <section className="report-history">
            {(reports as ReportRow[]).map((item) => (
              <article key={item.id}>
                <div className="history-card-head">
                  <div>
                    <p className="eyebrow">{item.assessment_id.replaceAll("-", " ")}</p>
                    <h2>{item.profile_title}</h2>
                    <span>{new Date(item.completed_at).toLocaleDateString()}</span>
                  </div>
                  <AccountActions mode="report" reportId={item.id} />
                </div>

                <p>{item.report.profile?.summary ?? item.report.summary ?? "Saved VibeLytix report."}</p>

                <div className="history-dimensions">
                  {(item.report.dimensions ?? []).map((dimension) => (
                    <div key={dimension.id}>
                      <span>{dimension.label}</span>
                      <strong>{dimension.score}%</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="dashboard-empty">
            <h2>No cloud reports yet.</h2>
            <p>Complete Personality DNA, then select “Save to my account” on the full report.</p>
            <Link className="button button-primary" href="/assessments/personality-dna">Take Personality DNA</Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
