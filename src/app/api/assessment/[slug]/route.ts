import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { buildExpansionReport, getExpansionAssessment } from "@/lib/assessment/expansion";
import { createOpaqueToken, hashToken } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildProductReport, getRevenueProduct } from "@/lib/products";

const answerValue = z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4),z.literal(5)]);
const schema = z.union([
  z.object({ answers: z.record(z.string(), answerValue) }),
  z.object({ productAnswers: z.record(z.string(), z.string().trim().min(1).max(120)) })
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;
  const assessment = getExpansionAssessment(slug);
  const product = getRevenueProduct(slug);
  if (!assessment && !product) return NextResponse.json({ error: "Assessment or product not found." }, { status: 404 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid answers." }, { status: 400 });

  try {
    const report = product && "productAnswers" in parsed.data
      ? buildProductReport(product, parsed.data.productAnswers)
      : assessment && "answers" in parsed.data
        ? buildExpansionReport(assessment, parsed.data.answers)
        : null;
    if (!report) throw new Error("Answer type does not match the requested experience.");
    const token = createOpaqueToken();
    const auth = await createClient();
    const { data } = await auth.auth.getClaims();
    const preview = { title: report.title, subtitle: report.subtitle, summary: report.summary, dimensions: report.dimensions.slice(0, 2) };

    const { data: session, error } = await createAdminClient()
      .from("assessment_sessions")
      .insert({
        user_id: data?.claims?.sub ?? null,
        assessment_id: report.assessmentId,
        preview,
        report,
        access_token_hash: hashToken(token),
        completed_at: report.completedAt
      })
      .select("id").single();

    if (error) throw error;
    return NextResponse.json({ sessionId: session.id, sessionToken: token, preview }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A complete valid assessment is required." }, { status: 400 });
  }
}
