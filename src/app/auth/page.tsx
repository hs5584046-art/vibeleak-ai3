import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/account/auth-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save and manage your VibeLytix reports."
};

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/dashboard");

  return (
    <>
      <Header />
      <main className="account-page shell">
        <AuthForm />
      </main>
      <Footer />
    </>
  );
}
