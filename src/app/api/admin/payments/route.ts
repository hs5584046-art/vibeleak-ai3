import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin";
import { decryptToken } from "@/lib/payments";
import { env } from "@/lib/env";
import { escapeHtml, sendEmail } from "@/lib/email";

export async function GET() {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { data, error } = await context.database
    .from("payment_requests")
    .select("id,customer_name,customer_email,utr,final_amount_paise,coupon_code,status,created_at,rejection_reason")
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) return NextResponse.json({ error: "Payments could not be loaded." }, { status: 500 });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await context.database
    .from("analytics_events")
    .select("event_name")
    .gte("created_at", since);

  const eventCounts = (events ?? []).reduce<Record<string, number>>((counts, event) => {
    counts[event.event_name] = (counts[event.event_name] ?? 0) + 1;
    return counts;
  }, {});

  return NextResponse.json({ payments: data, eventCounts });
}

export async function PATCH(request: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = z.object({
    id: z.uuid(),
    status: z.enum(["approved", "rejected"]),
    rejectionReason: z.string().trim().max(300).optional()
  }).safeParse(await request.json());

  if (!parsed.success) return NextResponse.json({ error: "Invalid review request." }, { status: 400 });

  const { data: current } = await context.database
    .from("payment_requests")
    .select("customer_name,customer_email,status_token_ciphertext,status,coupon_code")
    .eq("id", parsed.data.id)
    .single();

  if (!current) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  const { error } = await context.database
    .from("payment_requests")
    .update({
      status: parsed.data.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: context.user.id,
      rejection_reason: parsed.data.status === "rejected"
        ? parsed.data.rejectionReason || "The transaction could not be verified."
        : null
    })
    .eq("id", parsed.data.id);

  if (error) return NextResponse.json({ error: "Payment review failed." }, { status: 500 });

  if (parsed.data.status === "approved" && current.status !== "approved" && current.coupon_code) {
    await context.database
      .rpc("increment_coupon_redemption", { coupon_to_increment: current.coupon_code })
      .then(() => null);
  }

  const token = decryptToken(current.status_token_ciphertext);
  const statusUrl = `${env.NEXT_PUBLIC_APP_URL}/assessments/personality-dna?payment=${parsed.data.id}&token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: current.customer_email,
    subject: parsed.data.status === "approved"
      ? "Your VibeLytix report is unlocked"
      : "Update about your VibeLytix payment",
    html: parsed.data.status === "approved"
      ? `<h2>Your report is ready</h2><p>Hello ${escapeHtml(current.customer_name)}, your payment has been approved.</p><p><a href="${escapeHtml(statusUrl)}">Open your premium report</a></p>`
      : `<h2>Payment could not be verified</h2><p>${escapeHtml(parsed.data.rejectionReason || "Please check the transaction reference and contact support.")}</p>`
  });

  return NextResponse.json({ ok: true });
}
