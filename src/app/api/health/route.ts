import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

async function checkResendAccess() {
  if (!env.RESEND_API_KEY) return { configured: false, reachable: false, status: null };

  try {
    const response = await fetch("https://api.resend.com/domains?limit=1", {
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    return { configured: true, reachable: response.ok, status: response.status };
  } catch {
    return { configured: true, reachable: false, status: null };
  }
}

export async function GET() {
  const database = createAdminClient();
  const now = new Date();
  const todayUtc = now.toISOString().slice(0, 10);
  const staleCutoff = new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString();
  const [{ data: latestRun }, { count: deadJobs }, { count: pendingJobs }, { data: latestMetrics }, { data: agentRuns }, resend] = await Promise.all([
    database.from("autopilot_runs").select("status,started_at,completed_at,summary").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).eq("status", "dead"),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "running"]),
    database.from("growth_metrics_daily").select("metric_date,metrics").eq("source", "pipeline").order("metric_date", { ascending: false }).limit(1).maybeSingle(),
    database.from("agent_runs").select("agent_name,status,priority,confidence").order("run_date", { ascending: false }).order("priority", { ascending: false }).limit(18),
    checkResendAccess()
  ]);

  // The daily autopilot is scheduled for 05:15 UTC. Allow a 105-minute grace
  // period, then report a missed execution on the same day instead of waiting 36h.
  const expectedToday = now.getUTCHours() >= 7;
  const latestRunDate = latestRun?.started_at?.slice(0, 10) ?? null;
  const missedScheduledRun = expectedToday && latestRunDate !== todayUtc;
  const staleByAge = !latestRun?.started_at || latestRun.started_at < staleCutoff;
  const stale = staleByAge || missedScheduledRun;

  const integrations = {
    ga4Tracking: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    searchConsole: Boolean(env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN || (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN)),
    ga4: Boolean(env.GA4_PROPERTY_ID && (env.GOOGLE_ANALYTICS_ACCESS_TOKEN || (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN))),
    email: resend.reachable,
    emailConfigured: resend.configured,
    emailProviderStatus: resend.status,
    indexNow: Boolean(env.INDEXNOW_KEY),
    externalPublishing: [Boolean(env.MASTODON_ACCESS_TOKEN), Boolean(env.BLUESKY_APP_PASSWORD), Boolean(env.DEVTO_API_KEY), Boolean(env.WORDPRESS_APP_PASSWORD)].filter(Boolean).length
  };

  const healthy = !stale && latestRun?.status !== "failed" && (deadJobs ?? 0) === 0 && resend.reachable;
  const automationChecks = {
    scheduledExecution: !missedScheduledRun,
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
    version: process.env.npm_package_version ?? "14.1.0",
    automation: {
      latestRun,
      pendingJobs: pendingJobs ?? 0,
      deadJobs: deadJobs ?? 0,
      stale,
      staleByAge,
      missedScheduledRun,
      expectedRunDate: expectedToday ? todayUtc : null,
      latestMetricsDate: latestMetrics?.metric_date ?? null,
      agents: {
        total: agentRuns?.length ?? 0,
        ready: agentRuns?.filter((item) => item.status === "ready").length ?? 0,
        blocked: agentRuns?.filter((item) => item.status === "blocked").length ?? 0,
        watch: agentRuns?.filter((item) => item.status === "watch").length ?? 0,
        decisions: agentRuns ?? []
      }
    },
    automationCoverage: {
      percent: Math.round((automatedCount / Object.keys(automationChecks).length) * 100),
      checks: automationChecks,
      paymentExcluded: true
    },
    integrations,
    timestamp: now.toISOString()
  }, { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store, max-age=0" } });
}
