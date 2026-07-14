import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin";
import { buildDailyGrowthPlan } from "@/lib/growth";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

async function createPlan(
  database: ReturnType<typeof createAdminClient>,
  userId: string | null
) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await database
    .from("growth_items")
    .select("id")
    .eq("scheduled_for", today)
    .limit(1);

  if (existing?.length) return { existing: true, items: [] };

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await database
    .from("analytics_events")
    .select("event_name")
    .gte("created_at", since);

  const counts = (events ?? []).reduce<Record<string, number>>((result, event) => {
    result[event.event_name] = (result[event.event_name] ?? 0) + 1;
    return result;
  }, {});

  const rows = buildDailyGrowthPlan(counts).map((item) => ({
    channel: item.channel,
    title: item.title,
    objective: item.objective,
    target_url: item.targetUrl,
    content: item.content,
    metadata: item.metadata,
    status: item.status,
    priority: item.priority,
    scheduled_for: item.scheduledFor,
    created_by: userId,
    updated_by: userId
  }));

  const { data, error } = await database
    .from("growth_items")
    .insert(rows)
    .select("id,channel,title,objective,target_url,content,metadata,status,priority,scheduled_for,created_at,updated_at");

  if (error) throw error;
  return { existing: false, items: data ?? [] };
}

const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum(["draft", "approved", "published", "rejected"])
});

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const isCron = Boolean(
    env.CRON_SECRET && authorization === `Bearer ${env.CRON_SECRET}`
  );

  if (isCron) {
    try {
      const result = await createPlan(createAdminClient(), null);
      return NextResponse.json({
        ok: true,
        generated: !result.existing,
        items: result.items.length
      });
    } catch (error) {
      console.error("Growth autopilot cron failed", error);
      return NextResponse.json({ error: "Autopilot generation failed." }, { status: 500 });
    }
  }

  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const { data, error } = await context.database
    .from("growth_items")
    .select("id,channel,title,objective,target_url,content,metadata,status,priority,scheduled_for,created_at,updated_at")
    .eq("scheduled_for", date)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Growth items could not be loaded", error);
    return NextResponse.json(
      { error: "Growth plan could not be loaded. Run the latest Supabase schema." },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data ?? [], date }, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}
export async function POST() {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  try {
    const result = await createPlan(context.database, context.user.id);
    if (result.existing) {
      return NextResponse.json(
        { error: "Today’s growth plan already exists. Refresh the dashboard." },
        { status: 409 }
      );
    }
    return NextResponse.json({ items: result.items }, { status: 201 });
  } catch (error) {
    console.error("Daily growth plan generation failed", error);
    return NextResponse.json({ error: "Daily growth plan could not be created." }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid growth-item update." }, { status: 400 });
  }

  const { data, error } = await context.database
    .from("growth_items")
    .update({
      status: parsed.data.status,
      updated_by: context.user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.id)
    .select("id,status,updated_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Growth-item status could not be updated." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
