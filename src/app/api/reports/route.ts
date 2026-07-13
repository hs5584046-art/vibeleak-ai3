import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reportSchema = z.object({
  assessmentId: z.string().min(2).max(80),
  report: z.object({
    assessmentId: z.string().min(2).max(80),
    completedAt: z.iso.datetime()
  }).passthrough()
});

async function authenticatedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub };
}

export async function POST(request: NextRequest) {
  const { supabase, userId } = await authenticatedClient();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const parsed = reportSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.assessmentId !== parsed.data.report.assessmentId) {
    return NextResponse.json({ error: "Invalid report payload." }, { status: 400 });
  }

  const report = parsed.data.report as Record<string, unknown>;
  const profile = report.profile as Record<string, unknown> | undefined;
  const profileTitle = typeof profile?.title === "string"
    ? profile.title
    : typeof report.title === "string" ? report.title : "VibeLytix Report";
  const profileId = typeof profile?.id === "string"
    ? profile.id
    : parsed.data.assessmentId;

  const { data, error } = await supabase.from("assessment_reports").upsert({
    user_id: userId,
    assessment_id: parsed.data.assessmentId,
    profile_id: profileId,
    profile_title: profileTitle,
    report,
    completed_at: parsed.data.report.completedAt
  }, { onConflict: "user_id,assessment_id,completed_at" }).select("id").single();

  if (error) return NextResponse.json({ error: "Report could not be saved." }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { supabase, userId } = await authenticatedClient();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (request.nextUrl.searchParams.get("format") !== "export") {
    return NextResponse.json({ error: "Unsupported request." }, { status: 400 });
  }
  const { data, error } = await supabase.from("assessment_reports")
    .select("id,assessment_id,profile_title,report,completed_at,created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Export failed." }, { status: 500 });
  return NextResponse.json({ exportedAt: new Date().toISOString(), product: "VibeLytix", reports: data });
}

export async function DELETE(request: NextRequest) {
  const { supabase, userId } = await authenticatedClient();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !z.uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid report ID." }, { status: 400 });
  const { error } = await supabase.from("assessment_reports").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Report could not be deleted." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
