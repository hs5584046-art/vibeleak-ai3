import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund eligibility for VibeLytix digital assessment reports."
};

export default function RefundsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Refund Policy"
      introduction="This policy applies to paid digital assessment reports purchased through VibeLytix."
    >
      <h2>1. Digital reports</h2>
      <p>
        Because a personalised digital report is generated and delivered immediately after successful
        verification, completed and accessible reports are generally non-refundable.
      </p>

      <h2>2. Eligible cases</h2>
      <p>
        A refund may be considered for a verified duplicate charge, an incorrect amount, or a technical
        failure where payment was received but the report could not be delivered or restored.
      </p>

      <h2>3. Ineligible cases</h2>
      <p>
        A dislike of the result, disagreement with an interpretation, accidental completion after clear
        pricing disclosure, or submission of a false or reused payment reference does not normally qualify.
      </p>

      <h2>4. Request window</h2>
      <p>
        Refund requests should be submitted within seven days of payment and include the account email,
        product name and transaction reference.
      </p>

      <h2>5. Contact</h2>
      <p>Billing questions may be sent to <a href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>{env.NEXT_PUBLIC_SUPPORT_EMAIL}</a>.</p>
    </LegalLayout>
  );
}
