import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { runGrowthWorker } from "@/lib/bot-worker";

const settingsSchema = z.object({
  enabled: z.boolean(),
  killSwitch: z.boolean(),
  discoveryDailyLimit: z.number().int().min(0).max(50),
  outreachDailyLimit: z.number().int().min(0).max(20),
  followUpDailyLimit: z.number().int().min(0).max(20),
  verificationDailyLimit: z.number().int().min(0).max(200)
});

function isCron(request: NextRequest) {
  return Boolean(
    env.CRON_SECRET &&
    request.headers.get("authorization") === `Bearer ${env.CRON_SECRET}`
  );
}

export async function GET(request: NextRequest) {
  if (isCron(request)) {
    try {
      return NextResponse.json(await runGrowthWorker());
    } catch (error) {
      console.error("Bot worker cron failed", error);
      return NextResponse.json({ error: "Bot worker failed." }, { status: 500 });
    }
  }

  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const [{ data: settings }, { data: runs }, { data: prospects }, { data: resources }, { data: distribution }] = await Promise.all([
    context.database.from("bot_settings").select("*").eq("id", 1).single(),
    context.database.from("autopilot_runs").select("id,status,summary,started_at,completed_at").eq("run_type", "growth-worker").order("started_at", { ascending: false }).limit(10),
    context.database.from("backlink_prospects").select("id,url,domain,contact_email,relevance_score,status,last_contacted_at,backlink_verified_at").order("created_at", { ascending: false }).limit(50),
    context.database.from("autonomous_resources").select("id,slug,title,status,published_at").order("created_at", { ascending: false }).limit(20),
    context.database.from("external_distribution_posts").select("platform,source_url,external_url,status,error_message,published_at").order("created_at", { ascending: false }).limit(50)
  ]);

  return NextResponse.json({ settings, runs: runs ?? [], prospects: prospects ?? [], resources: resources ?? [], distribution: distribution ?? [] }, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}

export async function POST(request: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const action = request.nextUrl.searchParams.get("action");
  if (action === "run") {
    try {
      return NextResponse.json(await runGrowthWorker());
    } catch (error) {
      console.error("Manual bot run failed", error);
      return NextResponse.json({ error: "Bot run failed. Check the latest run log." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid bot settings." }, { status: 400 });

  const { data, error } = await createAdminClient().from("bot_settings").update({
    enabled: parsed.data.enabled,
    kill_switch: parsed.data.killSwitch,
    discovery_daily_limit: parsed.data.discoveryDailyLimit,
    outreach_daily_limit: parsed.data.outreachDailyLimit,
    follow_up_daily_limit: parsed.data.followUpDailyLimit,
    verification_daily_limit: parsed.data.verificationDailyLimit,
    updated_at: new Date().toISOString()
  }).eq("id", 1).select("*").single();

  if (error || !data) return NextResponse.json({ error: "Bot settings could not be saved." }, { status: 500 });
  return NextResponse.json({ settings: data });
}
