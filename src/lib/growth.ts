export type GrowthChannel = "seo" | "content" | "backlink" | "social" | "ads";
export type GrowthStatus = "draft" | "approved" | "processing" | "published" | "blocked" | "failed" | "rejected";
export type FunnelCounts = Record<string, number>;
export type PageSignal = {
  path: string;
  title: string;
  impressions?: number;
  clicks?: number;
  sessions?: number;
  starts?: number;
  completions?: number;
  checkouts?: number;
  purchases?: number;
  revenuePaise?: number;
  avgPosition?: number;
};
export type GrowthItem = {
  id: string; channel: GrowthChannel; title: string; objective: string; targetUrl: string;
  content: string; metadata: Record<string, unknown>; status: GrowthStatus; priority: number;
  scheduledFor: string; createdAt: string; updatedAt: string;
};


export function retryDelayMinutes(attempt: number) {
  return Math.min(720, Math.max(5, 5 * 2 ** Math.max(0, attempt - 1)));
}

export function dailyJobKey(date: string, type: "collect_signals" | "evaluate_memory" | "evaluate_experiments" | "ensure_plan" | "execute_worker") {
  return `${date}:${type}`;
}

export type ResourceSection = { heading: string; paragraph: string };

export function evaluateResourceQuality(title: string, description: string, sections: ResourceSection[]) {
  const text = sections.map((section) => `${section.heading} ${section.paragraph}`).join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const headings = new Set(sections.map((section) => section.heading.toLowerCase()));
  const hasLimitations = [...headings].some((heading) => heading.includes("limitation"));
  const hasExercise = [...headings].some((heading) => heading.includes("exercise") || heading.includes("practice"));
  const hasInternalLink = /\/(assessments|products|resources)\//.test(text);
  const hasPlaceholder = /\b(todo|tbd|lorem ipsum|placeholder)\b/i.test(`${title} ${description} ${text}`);
  const score = [title.trim().length >= 12, description.trim().length >= 60, words >= 450, sections.length >= 7, hasLimitations, hasExercise, hasInternalLink, !hasPlaceholder].filter(Boolean).length;
  return { passed: score === 8, score, words, checks: { hasLimitations, hasExercise, hasInternalLink, hasPlaceholder } };
}

export function shouldRetryTransientStatus(status: number) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}
const fallbackPages: PageSignal[] = [
  { title: "Personality DNA", path: "/assessments/personality-dna" },
  { title: "Career Alignment", path: "/assessments/career-alignment" },
  { title: "Attachment Style", path: "/assessments/attachment-style" },
  { title: "Emotional Intelligence", path: "/assessments/emotional-intelligence" }
];
const backlinkTargets = ["career guidance newsletters", "student resource pages", "personal-development blogs", "HR and leadership newsletters", "relationship education resources", "remote-work and career communities"];
const ratio = (a = 0, b = 0) => b > 0 ? a / b : 0;
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

export function diagnoseFunnel(counts: FunnelCounts) {
  const starts = counts.assessment_started ?? 0, completions = counts.assessment_completed ?? 0;
  const checkouts = counts.checkout_started ?? 0, purchases = counts.payment_submitted ?? 0;
  if (starts < 20) return { bottleneck: "traffic", instruction: "Grow qualified discovery before changing checkout.", score: 95 };
  if (ratio(completions, starts) < .45) return { bottleneck: "completion", instruction: "Reduce assessment friction and clarify progress.", score: 90 };
  if (ratio(checkouts, completions) < .08) return { bottleneck: "preview-to-checkout", instruction: "Strengthen premium value proof without hiding the free result.", score: 85 };
  if (ratio(purchases, checkouts) < .2) return { bottleneck: "checkout", instruction: "Improve payment clarity, trust and report delivery.", score: 80 };
  return { bottleneck: "scale", instruction: "Scale the best converting page and protect quality.", score: 70 };
}

export function scorePage(page: PageSignal) {
  const ctr = ratio(page.clicks, page.impressions), completion = ratio(page.completions, page.starts);
  const checkout = ratio(page.checkouts, page.completions), purchase = ratio(page.purchases, page.checkouts);
  const trafficOpportunity = Math.min((page.impressions ?? 0) / 10, 30) * (ctr < .03 ? 1 : .35);
  const positionOpportunity = page.avgPosition && page.avgPosition >= 4 && page.avgPosition <= 25 ? 25 : 5;
  const funnelOpportunity = (completion < .45 ? 20 : 5) + (checkout < .08 ? 15 : 4) + (purchase < .2 ? 10 : 3);
  const revenueProtection = (page.revenuePaise ?? 0) > 0 ? 8 : 0;
  return clamp(trafficOpportunity + positionOpportunity + funnelOpportunity + revenueProtection);
}

function choosePage(signals: PageSignal[]) {
  const candidates = signals.length ? signals : fallbackPages;
  return [...candidates].map(page => ({ page, score: scorePage(page) })).sort((a,b) => b.score-a.score)[0].page;
}

export function buildDailyGrowthPlan(counts: FunnelCounts, date = new Date(), signals: PageSignal[] = []): Omit<GrowthItem,"id"|"createdAt"|"updatedAt">[] {
  const page = choosePage(signals);
  const diagnosis = diagnoseFunnel(counts);
  const day = date.toISOString().slice(0,10);
  const target = backlinkTargets[date.getUTCDate() % backlinkTargets.length];
  const evidence = signals.find(s => s.path === page.path);
  const baseline = evidence ? { starts:evidence.starts??0, completions:evidence.completions??0, checkouts:evidence.checkouts??0, purchases:evidence.purchases??0, impressions:evidence.impressions??0, clicks:evidence.clicks??0, revenuePaise:evidence.revenuePaise??0 } : {};
  const context = evidence ? `Current evidence: ${evidence.impressions ?? 0} impressions, ${evidence.clicks ?? 0} clicks, ${evidence.purchases ?? 0} purchases.` : "Current evidence is limited; execute a conservative measurable change.";
  const common = { status: "draft" as const, scheduledFor: day };
  return [
    { ...common, channel:"seo", title:`Evidence-led SEO improvement for ${page.title}`, objective:`Address ${diagnosis.bottleneck}. ${diagnosis.instruction}`, targetUrl:page.path, priority:100,
      content:`Review search intent and improve title/meta only when the evidence supports it. ${context}`,
      metadata:{ decision:"highest-opportunity-page", pageScore:scorePage(page), context, baseline, experiment:{ metric:"organic_ctr", guardrail:"purchase_rate", minimumDays:14, rollbackThreshold:0.30 } } },
    { ...common, channel:"content", title:`Publish a supporting guide for ${page.title}`, objective:"Create useful topical depth and an internal-link destination.", targetUrl:page.path, priority:90,
      content:`Create an original practical guide linked to ${page.title}. Include a concrete example, exercise, limitations, disclosure and internal links. Do not claim diagnosis or guaranteed accuracy.`,
      metadata:{ baseline, minimumWords:1200, qualityGate:["original","helpful","non-diagnostic","internal-links","clear-source-boundaries"], experiment:{ metric:"qualified_sessions", minimumDays:21 } } },
    { ...common, channel:"backlink", title:`Earn an editorial mention from ${target}`, objective:"Acquire one relevant, voluntary editorial link.", targetUrl:page.path, priority:80,
      content:`Offer the ${page.title} resource only where it materially improves an existing page. No paid link, exchange, comment spam or deceptive automation.`,
      metadata:{ baseline, opportunityType:"editorial-outreach", target, experiment:{ metric:"verified_referrals", minimumDays:30 } } },
    { ...common, channel:"social", title:`Distribute a useful ${page.title} insight`, objective:"Generate measurable referral discovery using authorised channels.", targetUrl:page.path, priority:70,
      content:`Publish one native, educational insight and link to ${page.title}. Reuse only through configured official APIs; avoid identical mass-posting.`,
      metadata:{ baseline, variants:["mastodon","bluesky","devto","wordpress"], experiment:{ metric:"external_referrals", minimumDays:14 } } },
    { ...common, channel:"ads", title:`Run a zero-spend promotion experiment for ${page.title}`, objective:"Use only open discovery protocols and authorised distribution; never imply paid advertising was launched.", targetUrl:page.path, priority:60,
      content:`Submit the canonical URL through sitemap, RSS, WebSub and IndexNow, then measure discovery.`,
      metadata:{ baseline, spend:0, truthfulLabel:"organic-distribution", experiment:{ metric:"indexed_pages_and_referrals", minimumDays:14 } } }
  ];
}
