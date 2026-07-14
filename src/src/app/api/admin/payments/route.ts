import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin";
import { decryptToken } from "@/lib/payments";
import { env } from "@/lib/env";
import { escapeHtml, sendEmail } from "@/lib/email";

const reviewSchema = z.object({
  id: z.uuid(),
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().min(4).max(300).optional()
}).superRefine((value, context) => {
  if (value.status === "rejected" && !value.rejectionReason) {
    context.addIssue({
      code: "custom",
      path: ["rejectionReason"],
      message: "A rejection reason is required."
    });
  }
});

function assessmentIdFromProduct(productId: string) {
  return productId.endsWith("-premium")
    ? productId.slice(0, -"-premium".length)
    : "personality-dna";
}

export async function GET(request: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const status = request.nextUrl.searchParams.get("status");
  const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 100) ?? "";

  let query = context.database
    .from("payment_requests")
    .select(`
      id,
      session_id,
      product_id,
      customer_name,
      customer_email,
      utr,
      amount_paise,
      discount_paise,
      final_amount_paise,
      currency,
      coupon_code,
      status,
      created_at,
      reviewed_at,
      rejection_reason
    `)
    .order("created_at", { ascending: false })
    .limit(250);

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query = query.eq("status", status);
  }

  if (search) {
    const safe = search.replace(/[,%()]/g, " ");
    query = query.or(
      `customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%,utr.ilike.%${safe}%,product_id.ilike.%${safe}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Admin payment list failed", error);
    return NextResponse.json(
      { error: "Payments could not be loaded. Verify the latest Supabase schema and production secret key." },
      { status: 500 }
    );
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: events }, { count: allCount }] = await Promise.all([
    context.database.from("analytics_events").select("event_name").gte("created_at", since),
    context.database.from("payment_requests").select("id", { count: "exact", head: true })
  ]);

  const eventCounts = (events ?? []).reduce<Record<string, number>>((counts, event) => {
    counts[event.event_name] = (counts[event.event_name] ?? 0) + 1;
    return counts;
  }, {});

  return NextResponse.json({
    payments: data ?? [],
    eventCounts,
    totalCount: allCount ?? data?.length ?? 0
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}

export async function PATCH(request: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review request." },
      { status: 400 }
    );
  }

  const { data: current, error: currentError } = await context.database
    .from("payment_requests")
    .select(`
      id,
      product_id,
      customer_name,
      customer_email,
      utr,
      final_amount_paise,
      status_token_ciphertext,
      status,
      coupon_code
    `)
    .eq("id", parsed.data.id)
    .single();

  if (currentError || !current) {
    return NextResponse.json({ error: "Payment request was not found." }, { status: 404 });
  }

  if (current.status !== "pending") {
    return NextResponse.json(
      { error: `This request is already ${current.status}. Refresh the dashboard.` },
      { status: 409 }
    );
  }

  const reviewedAt = new Date().toISOString();
  const rejectionReason = parsed.data.status === "rejected"
    ? parsed.data.rejectionReason
    : null;

  const { data: updated, error } = await context.database
    .from("payment_requests")
    .update({
      status: parsed.data.status,
      reviewed_at: reviewedAt,
      reviewed_by: context.user.id,
      rejection_reason: rejectionReason
    })
    .eq("id", parsed.data.id)
    .eq("status", "pending")
    .select("id,status,reviewed_at,rejection_reason")
    .single();

  if (error || !updated) {
    console.error("Payment review failed", error);
    return NextResponse.json({ error: "Payment review could not be saved." }, { status: 500 });
  }

  if (parsed.data.status === "approved" && current.coupon_code) {
    await context.database
      .rpc("increment_coupon_redemption", { coupon_to_increment: current.coupon_code })
      .then(() => null);
  }

  let emailSent = false;
  try {
    const token = decryptToken(current.status_token_ciphertext);
    const assessmentId = assessmentIdFromProduct(current.product_id);
    const statusUrl = `${env.NEXT_PUBLIC_APP_URL}/assessments/${assessmentId}?payment=${parsed.data.id}&token=${encodeURIComponent(token)}`;

    await sendEmail({
      to: current.customer_email,
      subject: parsed.data.status === "approved"
        ? "Your VibeLytix premium report is unlocked"
        : "Update about your VibeLytix payment",
      html: parsed.data.status === "approved"
        ? `<h2>Your report is ready</h2><p>Hello ${escapeHtml(current.customer_name)}, your payment reference ${escapeHtml(current.utr)} has been verified.</p><p><a href="${escapeHtml(statusUrl)}">Open your premium report</a></p>`
        : `<h2>Payment could not be verified</h2><p>Hello ${escapeHtml(current.customer_name)}, ${escapeHtml(rejectionReason ?? "the transaction could not be verified.")}</p><p>Please confirm the UTR and amount, then contact support if you believe this is an error.</p>`
    });
    emailSent = true;
  } catch (emailError) {
    console.error("Payment status email failed", emailError);
  }

  return NextResponse.json({
    ok: true,
    payment: updated,
    emailSent
  });
}
