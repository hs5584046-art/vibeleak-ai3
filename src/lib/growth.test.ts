import { describe, expect, it } from "vitest";
import { buildDailyGrowthPlan, dailyJobKey, diagnoseFunnel, evaluateResourceQuality, retryDelayMinutes, scorePage, shouldRetryTransientStatus } from "./growth";

describe("V8 growth decision engine",()=>{
  it("diagnoses each major funnel bottleneck",()=>{
    expect(diagnoseFunnel({assessment_started:5}).bottleneck).toBe("traffic");
    expect(diagnoseFunnel({assessment_started:100,assessment_completed:20}).bottleneck).toBe("completion");
    expect(diagnoseFunnel({assessment_started:100,assessment_completed:80,checkout_started:2}).bottleneck).toBe("preview-to-checkout");
    expect(diagnoseFunnel({assessment_started:100,assessment_completed:80,checkout_started:20,payment_submitted:1}).bottleneck).toBe("checkout");
    expect(diagnoseFunnel({assessment_started:100,assessment_completed:80,checkout_started:20,payment_submitted:8}).bottleneck).toBe("scale");
  });
  it("scores a high-impression low-CTR page above a low-opportunity page",()=>{
    const high=scorePage({path:"/a",title:"A",impressions:1000,clicks:5,avgPosition:8,starts:100,completions:20,checkouts:1,purchases:0});
    const low=scorePage({path:"/b",title:"B",impressions:5,clicks:2,avgPosition:2,starts:10,completions:8,checkouts:2,purchases:1});
    expect(high).toBeGreaterThan(low);
  });
  it("creates a five-channel measurable plan and selects evidence-led target",()=>{
    const plan=buildDailyGrowthPlan({assessment_started:50,assessment_completed:10},new Date("2026-07-15T00:00:00Z"),[
      {path:"/assessments/a",title:"A",impressions:10,clicks:5,avgPosition:2,starts:10,completions:8,checkouts:2,purchases:1},
      {path:"/assessments/b",title:"B",impressions:1000,clicks:2,avgPosition:9,starts:100,completions:10,checkouts:0,purchases:0}
    ]);
    expect(plan).toHaveLength(5);
    expect(new Set(plan.map(x=>x.channel)).size).toBe(5);
    expect(plan.every(x=>x.targetUrl==="/assessments/b")).toBe(true);
    expect(plan.every(x=>x.metadata.experiment)).toBe(true);
  });
  it("is deterministic for the same evidence and date",()=>{
    const counts={assessment_started:1}; const date=new Date("2026-07-15T00:00:00Z");
    expect(buildDailyGrowthPlan(counts,date,[])).toEqual(buildDailyGrowthPlan(counts,date,[]));
  });
});


describe("V9 resumable queue helpers", () => {
  it("creates deterministic daily idempotency keys", () => {
    expect(dailyJobKey("2026-07-15", "collect_signals")).toBe("2026-07-15:collect_signals");
    expect(dailyJobKey("2026-07-15", "collect_signals")).toBe(dailyJobKey("2026-07-15", "collect_signals"));
  });
  it("uses bounded exponential retry delays", () => {
    expect([1,2,3,4,5].map(retryDelayMinutes)).toEqual([5,10,20,40,80]);
    expect(retryDelayMinutes(20)).toBe(720);
  });
});

describe("V10 adaptive safeguards", () => {
  it("includes a measurable baseline and rollback threshold in every plan", () => {
    const plan = buildDailyGrowthPlan({ assessment_started: 100, assessment_completed: 70, checkout_started: 20, payment_submitted: 5 }, new Date("2026-07-16T00:00:00Z"), [
      { path: "/assessments/personality-dna", title: "Personality DNA", impressions: 1000, clicks: 20, starts: 100, completions: 70, checkouts: 20, purchases: 5, revenuePaise: 74500 }
    ]);
    expect(plan.every((item) => item.metadata.baseline)).toBe(true);
    expect((plan[0].metadata.experiment as { rollbackThreshold?: number }).rollbackThreshold).toBe(0.3);
  });
  it("creates deterministic keys for the experiment evaluator", () => {
    expect(dailyJobKey("2026-07-16", "evaluate_experiments")).toBe("2026-07-16:evaluate_experiments");
  });
});


describe("V11 publishing quality and transient recovery", () => {
  it("blocks thin or placeholder content", () => {
    const result = evaluateResourceQuality("Useful title", "Short", [{ heading: "TODO", paragraph: "placeholder" }]);
    expect(result.passed).toBe(false);
    expect(result.checks.hasPlaceholder).toBe(true);
  });

  it("passes complete educational resources with limitations, exercise and internal link", () => {
    const paragraph = "This section explains a practical, non-diagnostic reflection process using observable evidence, a small behaviour experiment and a review step. It avoids permanent labels and encourages readers to compare several situations before drawing conclusions. ";
    const sections = [
      { heading: "Why this matters", paragraph: paragraph.repeat(3) },
      { heading: "Start with evidence", paragraph: paragraph.repeat(3) },
      { heading: "A practical example", paragraph: paragraph.repeat(3) },
      { heading: "A four-step framework", paragraph: paragraph.repeat(3) },
      { heading: "Try this exercise", paragraph: paragraph.repeat(3) },
      { heading: "How to interpret change", paragraph: paragraph.repeat(3) },
      { heading: "Important limitations", paragraph: paragraph.repeat(3) },
      { heading: "Continue", paragraph: `${paragraph.repeat(3)} /assessments/personality-dna` }
    ];
    const result = evaluateResourceQuality("Personality DNA practical reflection guide", "A detailed educational guide for interpreting patterns safely and practically over time.", sections);
    expect(result.passed).toBe(true);
    expect(result.words).toBeGreaterThanOrEqual(450);
  });

  it("retries only transient HTTP statuses", () => {
    expect([408, 409, 425, 429, 500, 503].every(shouldRetryTransientStatus)).toBe(true);
    expect([200, 400, 401, 403, 404, 422].some(shouldRetryTransientStatus)).toBe(false);
  });
});

import { vi } from "vitest";
vi.mock("server-only", () => ({}));

describe("V12 logical agent council", () => {
  it("creates the complete 18-agent operating team", async () => {
    const { buildAgentCouncil } = await import("./agent-os");
    const council = buildAgentCouncil(
      { counts: { assessment_started: 100, assessment_completed: 40, checkout_started: 4, payment_submitted: 1 }, signals: [{ path: "/assessments/a", title: "A", impressions: 1000, clicks: 10, starts: 100, completions: 40, checkouts: 4, purchases: 1 }] },
      { searchConsole: true, ga4: true, email: true, indexNow: true, externalPublishing: 0 },
      { pending: 0, dead: 0, stale: false }
    );
    expect(council.decisions).toHaveLength(18);
    expect(new Set(council.decisions.map((item) => item.agent)).size).toBe(18);
    expect(council.primaryBottleneck).toBe("completion");
    expect(council.executionOrder[0]).toBe("analytics");
  });

  it("reports integrations as blocked instead of pretending they work", async () => {
    const { buildAgentCouncil } = await import("./agent-os");
    const council = buildAgentCouncil({ counts: {}, signals: [] }, { searchConsole: false, ga4: false, email: false, indexNow: false, externalPublishing: 0 }, { pending: 0, dead: 0, stale: false });
    expect(council.decisions.find((item) => item.agent === "analytics")?.status).toBe("blocked");
    expect(council.decisions.find((item) => item.agent === "outreach")?.status).toBe("blocked");
    expect(council.decisions.find((item) => item.agent === "distribution")?.status).toBe("blocked");
  });
});
