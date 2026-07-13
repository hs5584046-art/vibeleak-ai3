import { describe, expect, it } from "vitest";
import {
  buildExpansionReport,
  expansionAssessments,
  getExpansionAssessment,
  type ExpansionAnswers
} from "@/lib/assessment/expansion";

function completeAnswers(id: string, value: 1 | 2 | 3 | 4 | 5): ExpansionAnswers {
  const assessment = getExpansionAssessment(id)!;
  return Object.fromEntries(assessment.questions.map((question) => [question.id, value]));
}

describe("expanded assessment platform", () => {
  it("ships seven unique assessment definitions", () => {
    expect(expansionAssessments).toHaveLength(7);
    expect(new Set(expansionAssessments.map((item) => item.id)).size).toBe(7);
  });

  it("keeps every assessment at four dimensions and twelve questions", () => {
    expect(expansionAssessments.every((item) => item.dimensions.length === 4)).toBe(true);
    expect(expansionAssessments.every((item) => item.questions.length === 12)).toBe(true);
  });

  it("generates bounded complete reports", () => {
    for (const assessment of expansionAssessments) {
      const report = buildExpansionReport(assessment, completeAnswers(assessment.id, 4));
      expect(report.dimensions).toHaveLength(4);
      expect(report.dimensions.every((item) => item.score >= 0 && item.score <= 100)).toBe(true);
      expect(report.actionPlan).toHaveLength(3);
    }
  });

  it("rejects incomplete answers", () => {
    const assessment = expansionAssessments[0];
    expect(() => buildExpansionReport(assessment, { r1: 4 })).toThrow(
      "A complete valid answer set is required."
    );
  });
});
