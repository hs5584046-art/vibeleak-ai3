import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expansionAssessments } from "@/lib/assessment/expansion";
import { learningArticles } from "@/lib/content";

describe("final live-readiness hardening", () => {
  it("renders assessment content while progress restoration runs", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/assessment/expansion-experience.tsx"),
      "utf8"
    );
    expect(source).not.toContain(
      'if (!ready) return <div className="assessment-loading"><span /><p>Restoring your progress…</p></div>'
    );
    expect(source).toContain("assessment.dimensions.map");
    expect(source).toContain("Checking saved progress");
  });

  it("publishes structured metadata for every expanded assessment", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/assessments/[slug]/page.tsx"),
      "utf8"
    );
    expect(source).toContain('"@type": "WebApplication"');
    expect(source).toContain("assessment.pricePaise");
    expect(expansionAssessments).toHaveLength(7);
  });

  it("keeps each priority guide substantial and actionable", () => {
    expect(learningArticles).toHaveLength(10);
    for (const article of learningArticles) {
      expect(article.sections.length).toBeGreaterThanOrEqual(8);
      expect(article.exercise.length).toBeGreaterThan(80);
      expect(article.assessmentId.length).toBeGreaterThan(3);
      const words = article.sections
        .map(([, body]) => body)
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      expect(words).toBeGreaterThan(250);
    }
  });

  it("documents concrete privacy retention periods", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/privacy/page.tsx"),
      "utf8"
    );
    expect(source).toContain("Typical retention periods");
    expect(source).toContain("Up to 90 days");
    expect(source).toContain("Up to 7 years");
    expect(source).toContain("Up to 13 months");
  });

  it("adds transport and browser hardening headers", () => {
    const source = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
    expect(source).toContain("Strict-Transport-Security");
    expect(source).toContain("X-Permitted-Cross-Domain-Policies");
    expect(source).toContain("X-DNS-Prefetch-Control");
  });
});
