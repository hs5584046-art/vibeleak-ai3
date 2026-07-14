import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/payments";

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("payment");
  const token = request.nextUrl.searchParams.get("token");

  if (!paymentId || !token || !z.uuid().safeParse(paymentId).success) {
    return NextResponse.json({ error: "Invalid unlock request." }, { status: 400 });
  }

  const database = createAdminClient();
  const { data: payment } = await database
    .from("payment_requests")
    .select("session_id,status")
    .eq("id", paymentId)
    .eq("status_token_hash", hashToken(token))
    .eq("status", "approved")
    .maybeSingle();

  if (!payment) return NextResponse.json({ error: "Report is not unlocked." }, { status: 403 });

  const { data: session } = await database
    .from("assessment_sessions")
    .select("report")
    .eq("id", payment.session_id)
    .single();

  if (!session) return NextResponse.json({ error: "Report could not be found." }, { status: 404 });
  return NextResponse.json({ report: session.report }, { headers: { "Cache-Control": "private, no-store" } });
}
