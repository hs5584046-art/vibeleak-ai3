import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  eventName: z.enum(["assessment_started", "assessment_completed", "result_shared", "checkout_started", "payment_submitted"]),
  path: z.string().max(300),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional()
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  await createAdminClient().from("analytics_events").insert({
    event_name: parsed.data.eventName,
    path: parsed.data.path,
    metadata: parsed.data.metadata ?? {}
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
