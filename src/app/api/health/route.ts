import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = createAdminClient();
  const staleCutoff = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const [{ data: latestRun }, { count: deadJobs }, { count: pendingJobs }, { data: latestMetrics }, { data: agentRuns }] = await Promise.all([
    database.from("autopilot_runs").select("status,started_at,completed_at,summary").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).eq("status", "dead"),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "running"]),
    database.from("growth_metrics_daily").select("metric_date,metrics").eq("source", "pipeline").order("metric_date", { ascending: false }).limit(1).maybeSingle(),
    database.from("agent_runs").select("agent_name,status,priority,confidence").order("run_date", { ascending: false }).order("priority", { ascending: false }).limit(18)
  ]);
  const stale = !latestRun?.started_at || latestRun.started_at < staleCutoff;
  const integrations = {
    ga4Tracking: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    searchConsole: Boolean(env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN || (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN)),
    ga4: Boolean(env.GA4_PROPERTY_ID && (env.GOOGLE_ANALYTICS_ACCESS_TOKEN || (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN))),
    email: Boolean(env.RESEND_API_KEY),
    indexNow: Boolean(env.INDEXNOW_KEY),
    externalPublishing: [Boolean(env.MASTODON_ACCESS_TOKEN), Boolean(env.BLUESKY_APP_PASSWORD), Boolean(env.DEVTO_API_KEY), Boolean(env.WORDPRESS_APP_PASSWORD)].filter(Boolean).length
  };
  const healthy = !stale && latestRun?.status !== "failed" && (deadJobs ?? 0) === 0;
  const automationChecks = {
    scheduledExecution: true,
    firstPartyAnalytics: true,
    searchConsole: integrations.searchConsole,
    ga4Tracking: integrations.ga4Tracking,
    ga4ReportingApi: integrations.ga4,
    emailOutreach: integrations.email,
    indexNow: integrations.indexNow,
    ownedPublishing: true,
    seoOptimization: true,
    prospectDiscovery: true,
    backlinkVerification: true,
    externalPublishing: integrations.externalPublishing > 0,
    retryRecovery: true,
    dailyReporting: integrations.email
  };
  const automatedCount = Object.values(automationChecks).filter(Boolean).length;
  return NextResponse.json({
    ok: healthy,
    service: "vibelytix-web",
    version: process.env.npm_package_version ?? "14.0.0",
    automation: { latestRun, pendingJobs: pendingJobs ?? 0, deadJobs: deadJobs ?? 0, stale, latestMetricsDate: latestMetrics?.metric_date ?? null, agents: { total: agentRuns?.length ?? 0, ready: agentRuns?.filter((item) => item.status === "ready").length ?? 0, blocked: agentRuns?.filter((item) => item.status === "blocked").length ?? 0, watch: agentRuns?.filter((item) => item.status === "watch").length ?? 0, decisions: agentRuns ?? [] } },
    automationCoverage: { percent: Math.round((automatedCount / Object.keys(automationChecks).length) * 100), checks: automationChecks, paymentExcluded: true },
    integrations,
    timestamp: new Date().toISOString()
  }, { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store, max-age=0" } });
}
