import "server-only";
import { buildDailyGrowthPlan, dailyJobKey, retryDelayMinutes, type PageSignal } from "@/lib/growth";
import { runGrowthWorker } from "@/lib/bot-worker";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

type Db = ReturnType<typeof createAdminClient>;
type JobType = "collect_signals" | "evaluate_memory" | "evaluate_experiments" | "ensure_plan" | "execute_worker";
type ClaimedJob = { id: number; job_type: JobType; payload: Record<string, unknown>; attempt_count: number };
const day = () => new Date().toISOString().slice(0, 10);
async function getGoogleAccessToken(preferred?: string) {
  if (preferred) return preferred;
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET || !env.GOOGLE_OAUTH_REFRESH_TOKEN) return undefined;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: "refresh_token"
    }),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Google OAuth refresh ${response.status}`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Google OAuth refresh returned no access token");
  return payload.access_token;
}


async function fetchSearchConsole(): Promise<PageSignal[]> {
  const token = await getGoogleAccessToken(env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
  if (!token) return [];
  const endDate = day();
  const startDate = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(env.NEXT_PUBLIC_APP_URL)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate, dimensions: ["page"], rowLimit: 250 }),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Search Console ${response.status}`);
  const json = await response.json() as { rows?: Array<{ keys: string[]; clicks: number; impressions: number; position: number }> };
  return (json.rows ?? []).map((row) => {
    const url = new URL(row.keys[0]);
    return {
      path: url.pathname,
      title: url.pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ?? "Page",
      clicks: row.clicks,
      impressions: row.impressions,
      avgPosition: row.position
    };
  });
}

async function fetchGa4(): Promise<PageSignal[]> {
  const token = await getGoogleAccessToken(env.GOOGLE_ANALYTICS_ACCESS_TOKEN);
  if (!token || !env.GA4_PROPERTY_ID) return [];
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(env.GA4_PROPERTY_ID)}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }],
      limit: "250"
    }),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`GA4 ${response.status}`);
  const json = await response.json() as { rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }> };
  return (json.rows ?? []).map((row) => {
    const path = row.dimensionValues?.[0]?.value || "/";
    return { path, title: path.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") || "Home", sessions: Number(row.metricValues?.[0]?.value || 0) };
  });
}

async function fetchCompetitorSignals() {
  const queries = ["personality assessment online", "career assessment online", "attachment style quiz"];
  const domains = new Map<string, number>();
  for (const query of queries) {
    try {
      const response = await fetch(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`, {
        headers: { "User-Agent": "VibeLytixResearchBot/1.0 (+https://vibelytix.lol)" },
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) continue;
      const text = await response.text();
      for (const match of text.matchAll(/<link>(https?:\/\/[^<]+)<\/link>/g)) {
        try {
          const domain = new URL(match[1]).hostname.replace(/^www\./, "");
          if (!domain.includes("bing.com") && domain !== new URL(env.NEXT_PUBLIC_APP_URL).hostname) domains.set(domain, (domains.get(domain) ?? 0) + 1);
        } catch {}
      }
    } catch {}
  }
  return [...domains.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([domain, appearances])=>({domain, appearances}));
}

async function collectSignals(database: Db) {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: events, error } = await database.from("analytics_events").select("event_name,path,metadata").gte("created_at", since);
  if (error) throw error;
  const counts: Record<string, number> = {};
  const byPath = new Map<string, PageSignal>();
  for (const event of events ?? []) {
    counts[event.event_name] = (counts[event.event_name] ?? 0) + 1;
    const path = event.path || "/";
    const signal: PageSignal = byPath.get(path) ?? { path, title: path.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") || "Home" };
    if (event.event_name === "assessment_started") signal.starts = (signal.starts ?? 0) + 1;
    if (event.event_name === "assessment_completed") signal.completions = (signal.completions ?? 0) + 1;
    if (event.event_name === "checkout_started") signal.checkouts = (signal.checkouts ?? 0) + 1;
    if (event.event_name === "payment_submitted") {
      signal.purchases = (signal.purchases ?? 0) + 1;
      signal.revenuePaise = (signal.revenuePaise ?? 0) + Number(event.metadata?.amount_paise ?? 0);
    }
    byPath.set(path, signal);
  }
  let searchConsole: PageSignal[] = [], ga4: PageSignal[] = [];
  const externalErrors: string[] = [];
  try { searchConsole = await fetchSearchConsole(); } catch (error) { externalErrors.push(error instanceof Error ? error.message : "Search Console failed"); }
  try { ga4 = await fetchGa4(); } catch (error) { externalErrors.push(error instanceof Error ? error.message : "GA4 failed"); }
  for (const signal of [...searchConsole, ...ga4]) {
    const current = byPath.get(signal.path) ?? signal;
    byPath.set(signal.path, { ...current, ...signal, title: current.title || signal.title });
  }
  const signals = [...byPath.values()].filter((s) => s.path.startsWith("/assessments/") || s.path.startsWith("/products/"));
  const competitors = await fetchCompetitorSignals();
  const snapshot = { counts, signals, competitors, externalErrors, collectedAt: new Date().toISOString() };
  const { error: upsertError } = await database.from("growth_metrics_daily").upsert({
    metric_date: day(), source: "pipeline", metrics: snapshot, updated_at: new Date().toISOString()
  }, { onConflict: "metric_date,source" });
  if (upsertError) throw upsertError;
  return snapshot;
}

async function evaluatePreviousRuns(database: Db) {
  const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await database.from("growth_items").select("channel,status").lte("scheduled_for", cutoff).in("status", ["published", "failed", "blocked"]);
  if (error) throw error;
  const summary = (data ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = `${row.channel}:${row.status}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const { error: memoryError } = await database.from("growth_memory").upsert({
    memory_key: "14-day-execution-summary",
    memory_value: { summary, evaluatedAt: new Date().toISOString() },
    updated_at: new Date().toISOString()
  }, { onConflict: "memory_key" });
  if (memoryError) throw memoryError;
  return summary;
}

async function evaluateExperiments(database: Db) {
  const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const { data: snapshot, error: metricError } = await database.from("growth_metrics_daily").select("metrics").eq("metric_date", day()).eq("source", "pipeline").maybeSingle();
  if (metricError) throw metricError;
  const currentSignals = ((snapshot?.metrics as { signals?: PageSignal[] } | null)?.signals ?? []);
  const { data: items, error } = await database.from("growth_items").select("id,channel,target_url,metadata,status,scheduled_for").eq("channel", "seo").eq("status", "published").lte("scheduled_for", cutoff);
  if (error) throw error;
  let rolledBack = 0, retained = 0;
  for (const item of items ?? []) {
    const metadata = (item.metadata ?? {}) as { baseline?: PageSignal; experimentEvaluation?: unknown };
    if (metadata.experimentEvaluation) continue;
    const baseline: PageSignal = metadata.baseline ?? { path: item.target_url, title: item.target_url };
    const current = currentSignals.find((signal) => signal.path === item.target_url);
    const baselinePurchaseRate = (baseline.checkouts ?? 0) > 0 ? (baseline.purchases ?? 0) / (baseline.checkouts ?? 1) : 0;
    const currentPurchaseRate = current && (current.checkouts ?? 0) > 0 ? (current.purchases ?? 0) / (current.checkouts ?? 1) : 0;
    const enoughData = (current?.checkouts ?? 0) >= 10 && (baseline.checkouts ?? 0) >= 10;
    const shouldRollback = enoughData && baselinePurchaseRate > 0 && currentPurchaseRate < baselinePurchaseRate * 0.7;
    if (shouldRollback) {
      const { error: deleteError } = await database.from("seo_overrides").delete().eq("path", item.target_url);
      if (deleteError) throw deleteError;
      rolledBack += 1;
    } else retained += 1;
    await database.from("growth_items").update({ metadata: { ...metadata, experimentEvaluation: { evaluatedAt: new Date().toISOString(), enoughData, baselinePurchaseRate, currentPurchaseRate, decision: shouldRollback ? "rolled-back" : "retained" } }, updated_at: new Date().toISOString() }).eq("id", item.id);
  }
  return { evaluated: rolledBack + retained, rolledBack, retained };
}

async function ensureDailyGrowthPlan(database: Db) {
  const { data: existing, error: existingError } = await database.from("growth_items").select("id").eq("scheduled_for", day()).limit(1);
  if (existingError) throw existingError;
  const { data: snapshot, error: metricError } = await database.from("growth_metrics_daily").select("metrics").eq("metric_date", day()).eq("source", "pipeline").maybeSingle();
  if (metricError) throw metricError;
  const metrics = (snapshot?.metrics ?? { counts: {}, signals: [] }) as { counts: Record<string, number>; signals: PageSignal[]; externalError?: string };
  if (existing?.length) return { generated: false, items: 0, signals: metrics.signals.length };
  const rows = buildDailyGrowthPlan(metrics.counts, new Date(), metrics.signals).map((item) => ({
    channel: item.channel, title: item.title, objective: item.objective, target_url: item.targetUrl,
    content: item.content, metadata: { ...item.metadata, automation: "v9-resumable-growth-os", decisionAt: new Date().toISOString() },
    status: "draft", priority: item.priority, scheduled_for: item.scheduledFor, created_by: null, updated_by: null
  }));
  const { error } = await database.from("growth_items").insert(rows);
  if (error) throw error;
  return { generated: true, items: rows.length, signals: metrics.signals.length };
}

async function enqueueDailyJobs(database: Db) {
  const jobs: JobType[] = ["collect_signals", "evaluate_memory", "evaluate_experiments", "ensure_plan", "execute_worker"];
  const rows = jobs.map((jobType, index) => ({
    job_key: dailyJobKey(day(), jobType), job_type: jobType, status: "queued", priority: 100 - index,
    payload: { date: day() }, available_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }));
  const { error } = await database.from("growth_jobs").upsert(rows, { onConflict: "job_key", ignoreDuplicates: true });
  if (error) throw error;
  return rows.length;
}

async function claimJobs(database: Db, limit = 4): Promise<ClaimedJob[]> {
  const { data, error } = await database.rpc("claim_growth_jobs", { jobs_to_claim: limit });
  if (error) throw error;
  return (data ?? []) as ClaimedJob[];
}

async function completeJob(database: Db, job: ClaimedJob, result: unknown) {
  const { error } = await database.from("growth_jobs").update({
    status: "completed", result, completed_at: new Date().toISOString(), locked_at: null,
    locked_by: null, last_error: null, updated_at: new Date().toISOString()
  }).eq("id", job.id);
  if (error) throw error;
}

async function failJob(database: Db, job: ClaimedJob, error: unknown) {
  const attempt = job.attempt_count + 1;
  const terminal = attempt >= 5;
  const next = new Date(Date.now() + retryDelayMinutes(attempt) * 60000).toISOString();
  const { error: updateError } = await database.from("growth_jobs").update({
    status: terminal ? "dead" : "queued", attempt_count: attempt,
    available_at: terminal ? new Date().toISOString() : next,
    last_error: error instanceof Error ? error.message.slice(0, 1000) : String(error).slice(0, 1000),
    locked_at: null, locked_by: null, updated_at: new Date().toISOString()
  }).eq("id", job.id);
  if (updateError) throw updateError;
}

async function executeJob(database: Db, job: ClaimedJob) {
  if (job.job_type === "collect_signals") return collectSignals(database);
  if (job.job_type === "evaluate_memory") return evaluatePreviousRuns(database);
  if (job.job_type === "evaluate_experiments") return evaluateExperiments(database);
  if (job.job_type === "ensure_plan") return ensureDailyGrowthPlan(database);
  return runGrowthWorker();
}

export async function runAutonomousPipeline() {
  const database = createAdminClient();
  const { data: run, error } = await database.from("autopilot_runs").insert({
    run_type: "v10-adaptive-growth-os", status: "started", summary: { stage: "enqueue" }
  }).select("id").single();
  if (error) throw error;
  try {
    await database.from("growth_jobs").update({ status: "queued", locked_at: null, locked_by: null, updated_at: new Date().toISOString() })
      .eq("status", "running").lt("locked_at", new Date(Date.now() - 15 * 60000).toISOString());
    const enqueued = await enqueueDailyJobs(database);
    const claimed = await claimJobs(database, 5);
    const results: Array<{ id: number; type: JobType; ok: boolean; result?: unknown; error?: string }> = [];
    for (let index = 0; index < claimed.length; index += 1) {
      const job = claimed[index];
      try {
        const result = await executeJob(database, job);
        await completeJob(database, job, result);
        results.push({ id: job.id, type: job.job_type, ok: true, result });
      } catch (jobError) {
        await failJob(database, job, jobError);
        results.push({ id: job.id, type: job.job_type, ok: false, error: jobError instanceof Error ? jobError.message : String(jobError) });
        const blocked = claimed.slice(index + 1).map((item) => item.id);
        if (blocked.length) {
          await database.from("growth_jobs").update({
            status: "queued", locked_at: null, locked_by: null, updated_at: new Date().toISOString()
          }).in("id", blocked);
        }
        break;
      }
    }
    const { count: queued } = await database.from("growth_jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "running"]);
    const summary = { ok: results.every((item) => item.ok), enqueued, processed: results.length, pending: queued ?? 0, results };
    await database.from("autopilot_runs").update({ status: summary.ok ? "completed" : "failed", summary, completed_at: new Date().toISOString() }).eq("id", run.id);
    return summary;
  } catch (pipelineError) {
    const message = pipelineError instanceof Error ? pipelineError.message : "Unknown pipeline failure";
    await database.from("autopilot_runs").update({ status: "failed", summary: { error: message }, completed_at: new Date().toISOString() }).eq("id", run.id);
    throw pipelineError;
  }
}
