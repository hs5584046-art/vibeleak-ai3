import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildDailyGrowthPlan } from "@/lib/growth";

describe("VibeLytix Growth OS", () => {
  it("creates one safe action for every growth channel", () => {
    const plan = buildDailyGrowthPlan({
      assessment_started: 12,
      assessment_completed: 5,
      checkout_started: 1
    }, new Date("2026-07-14T00:00:00Z"));

    expect(plan).toHaveLength(5);
    expect(new Set(plan.map((item) => item.channel))).toEqual(
      new Set(["seo", "content", "backlink", "social", "ads"])
    );
    expect(plan.every((item) => item.status === "draft")).toBe(true);
  });

  it("does not generate spam or moderation-evasion instructions", () => {
    const plan = buildDailyGrowthPlan({}, new Date("2026-07-14T00:00:00Z"));
    const text = JSON.stringify(plan).toLowerCase();

    expect(text).not.toContain("captcha bypass");
    expect(text).not.toContain("fake account");
    expect(text).not.toContain("avoid being blocked");
    expect(text).toContain("do not automate comments or forum spam");
  });

  it("protects growth routes with the server-side admin context", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/api/admin/growth/route.ts"),
      "utf8"
    );
    expect(source.match(/getAdminContext\(\)/g)?.length).toBe(3);
    expect(source).toContain("Admin access is required");
  });

  it("includes controlled ads and backlink approval language", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/admin/growth-console.tsx"),
      "utf8"
    );
    expect(source).toContain("External publishing");
    expect(source).toContain("remains controlled");
    expect(source).toContain("Ads require owner approval");
  });
});
