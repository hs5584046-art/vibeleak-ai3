import {
  dimensionLabels,
  personalityDnaAssessment,
  personalityProfiles
} from "@/lib/assessment/personality-dna";
import type {
  AssessmentAnswers,
  DimensionId,
  DimensionScore,
  PersonalityProfile,
  PersonalityReport
} from "@/lib/assessment/types";

const dimensionIds: DimensionId[] = ["depth", "agency", "connection", "adaptability"];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function toBand(score: number): DimensionScore["band"] {
  if (score < 40) return "low";
  if (score > 68) return "high";
  return "balanced";
}

export function validateAnswers(answers: AssessmentAnswers) {
  const expected = new Set(personalityDnaAssessment.questions.map((question) => question.id));
  const supplied = Object.keys(answers);

  return (
    supplied.length === expected.size &&
    supplied.every((id) => expected.has(id)) &&
    supplied.every((id) => [1, 2, 3, 4, 5].includes(answers[id]))
  );
}

export function calculateDimensionScores(answers: AssessmentAnswers): DimensionScore[] {
  const totals: Record<DimensionId, { earned: number; possible: number }> = {
    depth: { earned: 0, possible: 0 },
    agency: { earned: 0, possible: 0 },
    connection: { earned: 0, possible: 0 },
    adaptability: { earned: 0, possible: 0 }
  };

  for (const question of personalityDnaAssessment.questions) {
    const answer = answers[question.id];
    if (!answer) continue;

    for (const weight of question.weights) {
      const normalized = weight.reverse ? 6 - answer : answer;
      totals[weight.dimension].earned += (normalized - 1) * weight.weight;
      totals[weight.dimension].possible += 4 * weight.weight;
    }
  }

  return dimensionIds.map((id) => {
    const value = totals[id].possible === 0
      ? 0
      : Math.round((totals[id].earned / totals[id].possible) * 100);

    const score = clamp(value);

    return {
      id,
      label: dimensionLabels[id],
      score,
      band: toBand(score)
    };
  });
}

function getProfile(scores: DimensionScore[]): PersonalityProfile {
  const byId = Object.fromEntries(scores.map((item) => [item.id, item.score])) as Record<DimensionId, number>;
  const spread = Math.max(...scores.map((item) => item.score)) - Math.min(...scores.map((item) => item.score));

  if (spread <= 12) {
    return personalityProfiles.find((profile) => profile.id === "balanced-integrator")!;
  }

  if (byId.depth >= 68 && byId.agency >= 62) {
    return personalityProfiles.find((profile) => profile.id === "reflective-builder")!;
  }

  if (byId.connection >= 68 && byId.adaptability >= 62) {
    return personalityProfiles.find((profile) => profile.id === "adaptive-connector")!;
  }

  if (byId.agency >= 68 && byId.adaptability >= 58) {
    return personalityProfiles.find((profile) => profile.id === "independent-explorer")!;
  }

  if (byId.connection >= 64 && byId.depth >= 58) {
    return personalityProfiles.find((profile) => profile.id === "grounded-empath")!;
  }

  return [...personalityProfiles].sort((a, b) => {
    const mapping: Record<string, number> = {
      "reflective-builder": byId.depth + byId.agency,
      "adaptive-connector": byId.connection + byId.adaptability,
      "independent-explorer": byId.agency + byId.adaptability,
      "grounded-empath": byId.connection + byId.depth,
      "balanced-integrator": 200 - spread
    };
    return mapping[b.id] - mapping[a.id];
  })[0];
}

function sentenceForDimension(id: DimensionId, score: number, kind: "strength" | "watchout") {
  const high = score >= 69;
  const low = score < 40;

  const copy = {
    depth: {
      strength: high
        ? "You notice emotional nuance and usually look beneath the obvious explanation."
        : "You can reflect without becoming completely absorbed by every feeling.",
      watchout: low
        ? "Important feelings may be processed late, after they have already shaped your choices."
        : "Deep reflection can become over-analysis when action is already clear."
    },
    agency: {
      strength: high
        ? "You are willing to choose a direction and take ownership of the outcome."
        : "You can balance your own preferences with useful outside input.",
      watchout: low
        ? "You may delay decisions while waiting for reassurance or complete certainty."
        : "Strong independence can make support feel less necessary than it really is."
    },
    connection: {
      strength: high
        ? "You invest seriously in trust, communication and emotional reciprocity."
        : "You can care about others without automatically organising yourself around them.",
      watchout: low
        ? "You may protect your independence so strongly that others struggle to read your needs."
        : "Harmony can sometimes be prioritised over direct honesty."
    },
    adaptability: {
      strength: high
        ? "You recover from change quickly and can update your approach without losing momentum."
        : "You can adjust when needed while still valuing structure.",
      watchout: low
        ? "Unexpected change may consume more energy than the situation itself requires."
        : "Flexibility can become constant adjustment without a stable personal direction."
    }
  } as const;

  return copy[id][kind];
}

export function buildPersonalityReport(
  answers: AssessmentAnswers,
  completedAt = new Date().toISOString()
): PersonalityReport {
  if (!validateAnswers(answers)) {
    throw new Error("A complete valid answer set is required.");
  }

  const dimensions = calculateDimensionScores(answers);
  const ordered = [...dimensions].sort((a, b) => b.score - a.score);
  const strongestDimension = ordered[0];
  const balancingDimension = ordered[ordered.length - 1];
  const profile = getProfile(dimensions);

  const strengths = ordered
    .slice(0, 3)
    .map((item) => sentenceForDimension(item.id, item.score, "strength"));

  const watchouts = [...ordered]
    .reverse()
    .slice(0, 2)
    .map((item) => sentenceForDimension(item.id, item.score, "watchout"));

  const byId = Object.fromEntries(dimensions.map((item) => [item.id, item.score])) as Record<DimensionId, number>;

  const communicationStyle =
    byId.connection >= 65 && byId.depth >= 60
      ? "You communicate best when the conversation is honest, emotionally specific and respectful. Surface-level reassurance is less useful to you than clear language."
      : byId.agency >= 65
        ? "You prefer direct communication with a clear purpose. You respond well when people state what they need without excessive signalling or pressure."
        : "You communicate best when there is enough context, time to process and permission to ask clarifying questions.";

  const decisionStyle =
    byId.agency >= 68 && byId.adaptability >= 58
      ? "You tend to decide by choosing a workable direction and adjusting in motion."
      : byId.depth >= 68
        ? "You tend to decide after reflection, internal alignment and careful consideration of consequences."
        : "You tend to combine practical evidence, outside perspective and personal fit before committing.";

  const idealEnvironment =
    byId.connection >= 68
      ? "A collaborative environment with trust, clear expectations and emotionally mature communication."
      : byId.agency >= 68
        ? "An autonomous environment with ownership, visible outcomes and freedom in how work gets done."
        : byId.depth >= 68
          ? "A thoughtful environment with meaningful work, fewer interruptions and space for depth."
          : "A flexible environment that offers structure without rigidity and variety without constant chaos.";

  const actionPlan = [
    `Use your ${strongestDimension.label.toLowerCase()} as a deliberate strength in one important decision this week.`,
    `Create one small practice that supports your lower ${balancingDimension.label.toLowerCase()} score instead of treating it as a flaw.`,
    "Ask one trusted person which part of this report feels most accurate—and which part they see differently."
  ];

  return {
    assessmentId: personalityDnaAssessment.id,
    completedAt,
    dimensions,
    profile,
    strongestDimension,
    balancingDimension,
    strengths,
    watchouts,
    communicationStyle,
    decisionStyle,
    idealEnvironment,
    actionPlan
  };
}
