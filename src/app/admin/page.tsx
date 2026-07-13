import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPayments } from "@/components/admin/admin-payments";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getAdminContext } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Revenue administration",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const context = await getAdminContext();
  if (!context) redirect("/auth");

  return (
    <>
      <Header />
      <main className="admin-page shell">
        <header className="admin-hero">
          <p className="eyebrow">Revenue operations</p>
          <h1>Payment verification.</h1>
          <p>Signed in as {context.user.email}</p>
        </header>
        <AdminPayments />
      </main>
      <Footer />
    </>
  );
}
