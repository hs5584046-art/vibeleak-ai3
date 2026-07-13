import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button-link";
import { MailIcon } from "@/components/ui/icons";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact VibeLytix for support, privacy requests and product feedback."
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="internal-hero shell contact-page">
        <p className="eyebrow"><MailIcon /> Contact</p>
        <h1>Support should feel as clear as the product.</h1>
        <p>
          Use the email below for product feedback, privacy requests, billing questions or technical support.
          Payment support workflows will be connected in a later module.
        </p>
        <div className="contact-card">
          <span>Support email</span>
          <strong>{env.NEXT_PUBLIC_SUPPORT_EMAIL}</strong>
          <ButtonLink href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`} variant="secondary">
            Email support <MailIcon />
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
