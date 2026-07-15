import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = createAdminClient();
  const staleCutoff = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const [{ data: latestRun }, { count: deadJobs }, { count: pendingJobs }, { data: latestMetrics }] = await Promise.all([
    database.from("autopilot_runs").select("status,started_at,completed_at,summary").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).eq("status", "dead"),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "running"]),
    database.from("growth_metrics_daily").select("metric_date,metrics").eq("source", "pipeline").order("metric_date", { ascending: false }).limit(1).maybeSingle()
  ]);
  const stale = !latestRun?.started_at || latestRun.started_at < staleCutoff;
  const integrations = {
    searchConsole: Boolean(env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN || (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN)),
    ga4: Boolean(env.GA4_PROPERTY_ID && (env.GOOGLE_ANALYTICS_ACCESS_TOKEN || (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN))),
    email: Boolean(env.RESEND_API_KEY),
    indexNow: Boolean(env.INDEXNOW_KEY),
    externalPublishing: [Boolean(env.MASTODON_ACCESS_TOKEN), Boolean(env.BLUESKY_APP_PASSWORD), Boolean(env.DEVTO_API_KEY), Boolean(env.WORDPRESS_APP_PASSWORD)].filter(Boolean).length
  };
  const healthy = !stale && latestRun?.status !== "failed" && (deadJobs ?? 0) === 0;
  return NextResponse.json({
    ok: healthy,
    service: "vibelytix-web",
    version: process.env.npm_package_version ?? "10.0.0",
    automation: { latestRun, pendingJobs: pendingJobs ?? 0, deadJobs: deadJobs ?? 0, stale, latestMetricsDate: latestMetrics?.metric_date ?? null },
    integrations,
    timestamp: new Date().toISOString()
  }, { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store, max-age=0" } });
}
