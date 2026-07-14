import type { Metadata } from "next";
import Link from "next/link";
import { AdminPayments } from "@/components/admin/admin-payments";
import { GrowthConsole } from "@/components/admin/growth-console";
import { BotConsole } from "@/components/admin/bot-console";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getAdminAccessState } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Payment administration",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const access = await getAdminAccessState();

  return (
    <>
      <Header />
      <main className="admin-page shell">
        <header className="admin-hero">
          <p className="eyebrow">Revenue operations</p>
          <h1>Payment verification.</h1>
          <p>Review UPI transaction references before releasing premium reports.</p>
        </header>

        {access.status === "signed_out" ? (
          <section className="admin-access-card">
            <h2>Admin sign-in required</h2>
            <p>
              Sign in with the same email configured in the Vercel environment variable
              <code> ADMIN_EMAILS</code>.
            </p>
            <Link className="button button-primary" href="/auth?next=/admin">
              Sign in to administration
            </Link>
          </section>
        ) : null}

        {access.status === "not_allowed" ? (
          <section className="admin-access-card admin-access-warning">
            <h2>This account is not an administrator</h2>
            <p>
              You are signed in as <strong>{access.email}</strong>, but this address is not included
              in the production <code>ADMIN_EMAILS</code> allowlist.
            </p>
            <p>
              Add this exact email to Vercel → Settings → Environment Variables →
              <code> ADMIN_EMAILS</code>, then redeploy.
            </p>
            <Link className="button button-secondary" href="/auth?next=/admin">
              Sign in with another email
            </Link>
          </section>
        ) : null}

        {access.status === "allowed" ? (
          <>
            <p className="admin-signed-in">Signed in as {access.user.email}</p>
            <AdminPayments />
            <GrowthConsole />
            <BotConsole />
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
