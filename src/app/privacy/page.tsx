import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How VibeLytix handles assessment, account and payment-related information."
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      introduction="This policy explains the information VibeLytix expects to process as assessment, account and payment features are introduced."
    >
      <h2>1. Information you provide</h2>
      <p>
        Depending on the feature, VibeLytix may process assessment answers, report preferences,
        account details, support messages and payment-verification information you intentionally submit.
      </p>

      <h2>2. How information is used</h2>
      <p>
        Information is used to generate requested reports, save account progress, verify purchases,
        prevent fraud, answer support requests and improve reliability.
      </p>

      <h2>3. Data minimisation</h2>
      <p>
        VibeLytix is designed to avoid collecting information that is not required for a feature.
        Banking passwords, UPI PINs and one-time passwords should never be requested or submitted.
      </p>

      <h2>4. Service providers</h2>
      <p>
        Hosting, database, authentication, analytics, email and payment providers may process limited
        information on behalf of VibeLytix. Production vendors and retention periods will be documented
        before those features launch.
      </p>

      <h2>5. Your choices</h2>
      <p>
        Users may request access, correction or deletion of identifiable information, subject to legitimate
        legal, security and transaction-record obligations.
      </p>

      <h2>6. Contact</h2>
      <p>Privacy requests may be sent to <a href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>{env.NEXT_PUBLIC_SUPPORT_EMAIL}</a>.</p>
    </LegalLayout>
  );
}
