import "server-only";
import type { PageSignal } from "@/lib/growth";
import { createAdminClient } from "@/lib/supabase/admin";

export type AgentName =
  | "orchestrator" | "analytics" | "seo" | "content_strategy" | "content_production"
  | "cro" | "experiments" | "prospect_discovery" | "outreach" | "backlink_verification"
  | "distribution" | "affiliate" | "competitor_intelligence" | "memory_learning"
  | "reliability" | "security" | "reporting" | "product";

export type AgentDecision = {
  agent: AgentName;
  status: "ready" | "blocked" | "watch";
  priority: number;
  confidence: number;
  objective: string;
  actions: string[];
  evidence: Record<string, unknown>;
};

type MetricsSnapshot = {
  counts?: Record<string, number>;
  signals?: PageSignal[];
  competitors?: Array<{ domain: string; appearances: number }>;
  externalErrors?: string[];
};

type IntegrationState = {
  searchConsole: boolean;
  ga4: boolean;
  email: boolean;
  indexNow: boolean;
  externalPublishing: number;
};

const pct = (a = 0, b = 0) => b > 0 ? Math.round((a / b) * 1000) / 10 : 0;

export function buildAgentCouncil(snapshot: MetricsSnapshot, integrations: IntegrationState, operational: { pending: number; dead: number; stale: boolean }) {
  const counts = snapshot.counts ?? {};
  const signals = snapshot.signals ?? [];
  const starts = counts.assessment_started ?? 0;
  const completions = counts.assessment_completed ?? 0;
  const checkouts = counts.checkout_started ?? 0;
  const purchases = counts.payment_submitted ?? 0;
  const completionRate = pct(completions, starts);
  const checkoutRate = pct(checkouts, completions);
  const purchaseRate = pct(purchases, checkouts);
  const bestPage = [...signals].sort((a, b) => (b.revenuePaise ?? 0) - (a.revenuePaise ?? 0) || (b.impressions ?? 0) - (a.impressions ?? 0))[0];
  const weakestPage = [...signals].sort((a, b) => pct(a.purchases, a.checkouts) - pct(b.purchases, b.checkouts))[0];
  const evidence = { starts, completions, checkouts, purchases, completionRate, checkoutRate, purchaseRate, bestPage: bestPage?.path, weakestPage: weakestPage?.path };
  const decisions: AgentDecision[] = [
    { agent: "orchestrator", status: operational.dead > 0 || operational.stale ? "blocked" : "ready", priority: 99, confidence: 90, objective: "Coordinate the daily agent plan using evidence and safety gates.", actions: ["Execute agents in priority order", "Stop unsafe or dependency-blocked actions without stopping healthy work"], evidence: { primarySignals: evidence, operational } },
    { agent: "analytics", status: integrations.searchConsole || integrations.ga4 ? "ready" : "blocked", priority: 100, confidence: integrations.searchConsole && integrations.ga4 ? 95 : 55, objective: "Maintain a trustworthy daily evidence snapshot.", actions: ["Merge first-party funnel events with configured Google signals", "Flag missing or stale evidence instead of inventing conclusions"], evidence },
    { agent: "seo", status: signals.length ? "ready" : "watch", priority: 92, confidence: signals.length ? 82 : 45, objective: "Improve the highest-opportunity owned page safely.", actions: [bestPage ? `Protect and expand ${bestPage.path}` : "Wait for page-level evidence", weakestPage ? `Review search intent and snippet for ${weakestPage.path}` : "Collect page signals"], evidence },
    { agent: "content_strategy", status: "ready", priority: starts < 20 ? 94 : 75, confidence: 78, objective: "Create topical depth around the page most likely to generate qualified sessions.", actions: [bestPage ? `Build one supporting cluster around ${bestPage.path}` : "Publish one conservative evergreen resource", "Avoid duplicate or diagnostic claims"], evidence },
    { agent: "content_production", status: "ready", priority: 82, confidence: 80, objective: "Publish only content that passes quality gates.", actions: ["Require limitations, exercise, internal link and minimum depth", "Block placeholders and thin output"], evidence },
    { agent: "cro", status: starts >= 20 ? "ready" : "watch", priority: completionRate < 45 || checkoutRate < 8 ? 90 : 65, confidence: starts >= 20 ? 76 : 40, objective: "Reduce the largest measured funnel loss without harming trust.", actions: [completionRate < 45 ? "Reduce assessment friction" : "Protect assessment completion", checkoutRate < 8 ? "Clarify premium value after the free preview" : "Protect preview-to-checkout flow"], evidence },
    { agent: "experiments", status: starts >= 20 ? "ready" : "watch", priority: 72, confidence: starts >= 20 ? 70 : 35, objective: "Run measured reversible experiments.", actions: ["Require baseline, minimum sample and rollback rule", "Do not declare a winner without enough data"], evidence },
    { agent: "prospect_discovery", status: "ready", priority: 78, confidence: 72, objective: "Build a relevant public business-contact prospect list.", actions: ["Search resource pages and newsletters", "Validate relevance, deduplicate domains and exclude risky niches"], evidence },
    { agent: "outreach", status: integrations.email ? "ready" : "blocked", priority: 77, confidence: integrations.email ? 80 : 0, objective: "Send low-volume personalised editorial outreach.", actions: ["Use only public business contact details", "Stop after the permitted follow-up sequence"], evidence },
    { agent: "backlink_verification", status: "ready", priority: 66, confidence: 75, objective: "Verify earned links and detect losses.", actions: ["Re-crawl contacted pages", "Record live, lost or unchanged status"], evidence },
    { agent: "distribution", status: integrations.indexNow || integrations.externalPublishing > 0 ? "ready" : "blocked", priority: 74, confidence: integrations.externalPublishing > 0 ? 85 : 65, objective: "Distribute owned content through permitted channels.", actions: ["Always refresh sitemap, RSS and IndexNow", integrations.externalPublishing ? "Publish through configured official APIs" : "Do not fake external publication"], evidence },
    { agent: "affiliate", status: "watch", priority: 55, confidence: 50, objective: "Protect affiliate relevance and link quality.", actions: ["Audit destinations and tracking parameters", "Prefer result-relevant recommendations over generic links"], evidence },
    { agent: "competitor_intelligence", status: (snapshot.competitors?.length ?? 0) > 0 ? "ready" : "watch", priority: 58, confidence: (snapshot.competitors?.length ?? 0) > 0 ? 68 : 30, objective: "Use public competitor visibility as context, not as private analytics.", actions: ["Track recurring domains and content themes", "Feed evidence into topic selection without copying"], evidence: { competitors: snapshot.competitors ?? [] } },
    { agent: "memory_learning", status: "ready", priority: 70, confidence: 65, objective: "Convert outcomes into durable strategy memory.", actions: ["Compare 1-day, 7-day and 30-day outcomes", "Increase priority only after repeated evidence"], evidence },
    { agent: "reliability", status: operational.dead > 0 || operational.stale ? "blocked" : "ready", priority: 100, confidence: 95, objective: "Keep the autonomous pipeline recoverable and observable.", actions: ["Recover stale locks", "Surface dead jobs and retry counts"], evidence: operational },
    { agent: "security", status: "ready", priority: 96, confidence: 88, objective: "Keep automation within authorised boundaries.", actions: ["Never bypass authentication or CAPTCHA", "Rate-limit public endpoints and minimise secrets exposure"], evidence: { externalErrors: snapshot.externalErrors ?? [] } },
    { agent: "reporting", status: "ready", priority: 60, confidence: 90, objective: "Publish an honest machine-readable daily operating report.", actions: ["Separate executed, blocked and not-configured work", "Never inflate automation percentages"], evidence },
    { agent: "product", status: starts >= 50 ? "ready" : "watch", priority: 50, confidence: starts >= 50 ? 62 : 30, objective: "Identify product opportunities from repeated user demand.", actions: ["Propose only after sufficient funnel evidence", "Do not auto-launch high-risk products"], evidence }
  ];
  const executionOrder = [...decisions].sort((a, b) => b.priority - a.priority).map((item) => item.agent);
  return {
    generatedAt: new Date().toISOString(),
    evidence,
    focusPage: weakestPage?.path ?? bestPage?.path ?? "/assessments/personality-dna",
    primaryBottleneck: starts < 20 ? "traffic" : completionRate < 45 ? "completion" : checkoutRate < 8 ? "preview-to-checkout" : purchaseRate < 20 ? "checkout" : "scale",
    executionOrder,
    decisions
  };
}

export async function runAgentCouncil() {
  const database = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: metrics, error: metricError }, { count: pending }, { count: dead }, { data: latestRun }] = await Promise.all([
    database.from("growth_metrics_daily").select("metrics").eq("metric_date", today).eq("source", "pipeline").maybeSingle(),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "running"]),
    database.from("growth_jobs").select("id", { count: "exact", head: true }).eq("status", "dead"),
    database.from("autopilot_runs").select("started_at,status").order("started_at", { ascending: false }).limit(1).maybeSingle()
  ]);
  if (metricError) throw metricError;
  const stale = Boolean(latestRun?.started_at && Date.now() - new Date(latestRun.started_at).getTime() > 36 * 60 * 60 * 1000);
  const snapshot = (metrics?.metrics ?? {}) as MetricsSnapshot;
  const integrations: IntegrationState = {
    searchConsole: Boolean(process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_REFRESH_TOKEN),
    ga4: Boolean(process.env.GA4_PROPERTY_ID && (process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_REFRESH_TOKEN)),
    email: Boolean(process.env.RESEND_API_KEY),
    indexNow: Boolean(process.env.INDEXNOW_KEY),
    externalPublishing: [process.env.MASTODON_ACCESS_TOKEN, process.env.BLUESKY_APP_PASSWORD, process.env.DEVTO_API_KEY, process.env.WORDPRESS_APP_PASSWORD].filter(Boolean).length
  };
  const council = buildAgentCouncil(snapshot, integrations, { pending: pending ?? 0, dead: dead ?? 0, stale });
  const now = new Date().toISOString();
  const rows = council.decisions.map((decision) => ({
    run_date: today,
    agent_name: decision.agent,
    status: decision.status,
    priority: decision.priority,
    confidence: decision.confidence,
    objective: decision.objective,
    actions: decision.actions,
    evidence: decision.evidence,
    updated_at: now
  }));
  const { error: agentError } = await database.from("agent_runs").upsert(rows, { onConflict: "run_date,agent_name" });
  if (agentError) throw agentError;
  const { error: memoryError } = await database.from("growth_memory").upsert({
    memory_key: "agent-council-latest",
    memory_value: council,
    updated_at: now
  }, { onConflict: "memory_key" });
  if (memoryError) throw memoryError;
  return { agents: rows.length, focusPage: council.focusPage, bottleneck: council.primaryBottleneck, ready: rows.filter((r) => r.status === "ready").length, blocked: rows.filter((r) => r.status === "blocked").length };
}
