import "server-only";
import { env } from "@/lib/env";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: EmailInput) {
  if (!env.RESEND_API_KEY) return { delivered: false, reason: "not_configured" as const };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html
    })
  });

  if (!response.ok) {
    console.error("Email delivery failed", await response.text());
    return { delivered: false, reason: "provider_error" as const };
  }

  return { delivered: true as const };
}

export function escapeHtml(value: unknown) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character] ?? character);
}
