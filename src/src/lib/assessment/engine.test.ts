import { describe, expect, it } from "vitest";
import {
  buildPersonalityReport,
  calculateDimensionScores,
  validateAnswers
} from "@/lib/assessment/engine";
import { personalityDnaAssessment } from "@/lib/assessment/personality-dna";
import type { AssessmentAnswers } from "@/lib/assessment/types";

function answers(value: 1 | 2 | 3 | 4 | 5): AssessmentAnswers {
  return Object.fromEntries(
    personalityDnaAssessment.questions.map((question) => [question.id, value])
  ) as AssessmentAnswers;
}

describe("Personality DNA scoring", () => {
  it("requires one valid answer per question", () => {
    expect(validateAnswers(answers(3))).toBe(true);
    expect(validateAnswers({ q1: 3 })).toBe(false);
  });

  it("keeps all dimension scores between zero and one hundred", () => {
    const scores = calculateDimensionScores(answers(5));
    expect(scores).toHaveLength(4);
    expect(scores.every((item) => item.score >= 0 && item.score <= 100)).toBe(true);
  });

  it("correctly applies reverse scoring", () => {
    const lowAgreement = answers(1);
    const highAgreement = answers(5);

    const lowAdaptability = calculateDimensionScores(lowAgreement)
      .find((item) => item.id === "adaptability")!;
    const highAdaptability = calculateDimensionScores(highAgreement)
      .find((item) => item.id === "adaptability")!;

    expect(lowAdaptability.score).not.toBe(highAdaptability.score);
  });

  it("produces a complete deterministic report", () => {
    const report = buildPersonalityReport(answers(4), "2026-07-12T18:00:00.000Z");
    expect(report.completedAt).toBe("2026-07-12T18:00:00.000Z");
    expect(report.dimensions).toHaveLength(4);
    expect(report.strengths).toHaveLength(3);
    expect(report.watchouts).toHaveLength(2);
    expect(report.actionPlan).toHaveLength(3);
  });

  it("throws for incomplete answers", () => {
    expect(() => buildPersonalityReport({ q1: 4 })).toThrow(
      "A complete valid answer set is required."
    );
  });
});
