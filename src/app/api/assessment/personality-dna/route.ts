import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { buildPersonalityReport } from "@/lib/assessment/engine";
import { createOpaqueToken, hashToken } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const answerValue = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const payloadSchema = z.object({
  answers: z.record(z.string(), answerValue)
});

export async function POST(request: NextRequest) {
  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid answers." }, { status: 400 });

  try {
    const report = buildPersonalityReport(parsed.data.answers);
    const token = createOpaqueToken();
    const auth = await createClient();
    const { data } = await auth.auth.getClaims();
    const database = createAdminClient();

    const preview = {
      profile: report.profile,
      dimensions: report.dimensions.slice(0, 2)
    };

    const { data: session, error } = await database
      .from("assessment_sessions")
      .insert({
        user_id: data?.claims?.sub ?? null,
        assessment_id: report.assessmentId,
        preview,
        report,
        access_token_hash: hashToken(token),
        completed_at: report.completedAt
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      sessionId: session.id,
      sessionToken: token,
      preview
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A complete valid assessment is required." }, { status: 400 });
  }
}
