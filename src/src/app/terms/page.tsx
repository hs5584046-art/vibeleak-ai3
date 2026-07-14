import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing access to VibeLytix assessments and reports."
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of Service"
      introduction="These terms establish the intended use and limitations of VibeLytix assessments, reports and digital services."
    >
      <h2>1. Intended use</h2>
      <p>
        VibeLytix provides educational, entertainment and self-reflection experiences. Reports are not
        medical, psychological, legal, financial or other professional advice.
      </p>

      <h2>2. No guaranteed outcomes</h2>
      <p>
        Results do not guarantee future events, relationship outcomes, career success or another person’s
        behaviour. Users remain responsible for their own decisions.
      </p>

      <h2>3. Acceptable use</h2>
      <p>
        You may not misuse the service, attempt unauthorised access, interfere with its operation, submit
        fraudulent payment references or use reports to harass, discriminate against or manipulate another person.
      </p>

      <h2>4. Digital content</h2>
      <p>
        Purchased reports are licensed for personal, non-commercial use. VibeLytix branding, software,
        assessment wording and report design remain protected by applicable intellectual-property laws.
      </p>

      <h2>5. Availability and changes</h2>
      <p>
        Features may be improved, replaced or withdrawn. Reasonable efforts will be made to preserve access
        to valid purchases and communicate material changes.
      </p>

      <h2>6. Affiliate disclosure</h2>
      <p>
        Some recommendations may use affiliate links. VibeLytix may receive a commission when a user
        purchases through one of these links, without increasing the user’s price. Recommendations are
        presented as optional resources and do not guarantee a result.
      </p>

      <h2>7. Age</h2>
      <p>
        Users must be legally able to enter these terms in their jurisdiction. Features involving payments
        may require adulthood or permission from a parent or legal guardian.
      </p>
    </LegalLayout>
  );
}
