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
      introduction="This policy explains how VibeLytix processes assessment, account, support and payment-verification information."
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
        information on behalf of VibeLytix. Access is restricted to the services required to operate,
        secure and support the platform. Retention depends on account, transaction, fraud-prevention
        and legal requirements.
      </p>

      <h2>5. Typical retention periods</h2>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr><th>Information</th><th>Typical retention</th><th>Reason</th></tr>
          </thead>
          <tbody>
            <tr><td>Unfinished answers</td><td>Stored in your browser until cleared</td><td>Restore progress</td></tr>
            <tr><td>Assessment sessions</td><td>Up to 90 days unless needed for an active purchase</td><td>Preview and secure report delivery</td></tr>
            <tr><td>Saved account reports</td><td>Until you delete them or close the account</td><td>Report history</td></tr>
            <tr><td>Payment-verification records</td><td>Up to 7 years where required</td><td>Accounting, disputes and fraud prevention</td></tr>
            <tr><td>Analytics events</td><td>Up to 13 months</td><td>Reliability and product improvement</td></tr>
            <tr><td>Support messages</td><td>Up to 24 months after resolution</td><td>Follow-up and dispute history</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Records may be retained longer when required by law, an active dispute, fraud prevention,
        security investigation or a valid legal request.
      </p>

      <h2>6. Your choices</h2>
      <p>
        Users may request access, correction or deletion of identifiable information, subject to legitimate
        legal, security and transaction-record obligations.
      </p>

      <h2>7. Contact</h2>
      <p>Privacy requests may be sent to <a href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>{env.NEXT_PUBLIC_SUPPORT_EMAIL}</a>.</p>
    </LegalLayout>
  );
}
