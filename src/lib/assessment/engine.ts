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

function describeStressPattern(scores: Record<DimensionId, number>) {
  if (scores.depth >= 68 && scores.connection >= 62) {
    return "Under stress, you may absorb emotional detail, replay conversations and take more responsibility for other people’s reactions than is useful. Your fastest reset is to separate facts, interpretations and responsibilities before responding.";
  }
  if (scores.agency >= 68 && scores.adaptability >= 60) {
    return "Under stress, you may move into action quickly and become impatient with slower processing. Your best reset is to define the actual decision, invite one useful perspective and choose a reversible next step.";
  }
  if (scores.connection < 42 && scores.agency >= 58) {
    return "Under stress, you may become highly self-reliant and communicate less than others need. Your best reset is to state what you are handling, what support would help and when you will reconnect.";
  }
  return "Under stress, you may alternate between reflection, reassurance-seeking and delaying action. Your best reset is to name the emotion, define the smallest useful decision and create a clear time boundary for revisiting it.";
}

function describeCombination(scores: Record<DimensionId, number>) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [DimensionId, number][];
  const key = `${entries[0][0]}:${entries[1][0]}`;
  const combinations: Record<string, string> = {
    "depth:agency": "Your combination of reflection and ownership can turn complex feelings into deliberate action. The risk is waiting for perfect internal certainty before using the agency you already have.",
    "agency:depth": "You combine decisive ownership with meaningful reflection. You are strongest when action follows enough thought—but not endless thought.",
    "connection:depth": "You notice both emotional nuance and relational impact. This can create unusual empathy, but you need boundaries so understanding does not become over-responsibility.",
    "depth:connection": "You process experience deeply and care about relational meaning. Clear limits help you use this sensitivity as wisdom rather than emotional overload.",
    "agency:adaptability": "You are energised by movement, choice and adjustment. This combination supports entrepreneurship and change, but consistency may require deliberate routines.",
    "adaptability:agency": "You update quickly and prefer forward motion. Your advantage grows when flexibility is tied to a stable priority rather than constant reinvention.",
    "connection:adaptability": "You read people well and adjust naturally. Your growth edge is maintaining your own position while staying responsive to others.",
    "adaptability:connection": "You are socially responsive and flexible. The key is distinguishing healthy adaptation from changing yourself to prevent discomfort.",
    "depth:adaptability": "You combine reflection with openness to change. You often learn quickly from experience when you avoid turning every change into a complete identity review.",
    "adaptability:depth": "You can update your approach without losing access to deeper meaning. A simple decision rule helps you avoid analysing every available option.",
    "agency:connection": "You combine personal direction with investment in people. You lead best when directness and emotional context are both visible.",
    "connection:agency": "You care deeply about connection while retaining personal direction. Your strongest communication names both the relationship and the decision."
  };
  return combinations[key] ?? "Your highest two dimensions work together as a balancing system. The strongest results come from using the first dimension for momentum and the second for quality control.";
}

function relationshipInsight(scores: Record<DimensionId, number>) {
  if (scores.connection >= 65 && scores.depth >= 58) {
    return "In close relationships, you are likely to value emotional honesty, reciprocity and meaningful conversation. You may need to ask directly for reassurance or boundaries instead of hoping the other person notices subtle changes.";
  }
  if (scores.agency >= 65 && scores.connection < 50) {
    return "In relationships, autonomy and straightforward communication matter strongly. Others may misread self-sufficiency as distance, so explaining your need for space can protect connection.";
  }
  return "In relationships, you are likely to need a mix of clarity, respect and room to process. Your strongest conversations separate what happened, what you felt and what you are asking for next.";
}

function workInsight(scores: Record<DimensionId, number>) {
  if (scores.agency >= 65) {
    return "At work, ownership, visible outcomes and freedom in execution are likely to increase motivation. You may disengage when responsibility is high but decision authority is low.";
  }
  if (scores.depth >= 65) {
    return "At work, depth, meaning and uninterrupted thinking are likely to improve quality. Constant switching or superficial urgency may drain you faster than difficult work itself.";
  }
  if (scores.connection >= 65) {
    return "At work, trust, collaboration and emotionally mature communication are important performance conditions—not optional extras.";
  }
  return "At work, a flexible structure with clear priorities is likely to support your best performance. You benefit from knowing what matters without being micromanaged.";
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

  const stressPattern = describeStressPattern(byId);
  const relationshipPattern = relationshipInsight(byId);
  const workPattern = workInsight(byId);
  const combinationInsight = describeCombination(byId);

  const actionPlan = [
    `Use your ${strongestDimension.label.toLowerCase()} as a deliberate strength in one important decision this week.`,
    `Create one small practice that supports your lower ${balancingDimension.label.toLowerCase()} score instead of treating it as a flaw.`,
    "Ask one trusted person which part of this report feels most accurate—and which part they see differently."
  ];

  const sevenDayPlan = [
    "Day 1: Write one recent situation where your strongest dimension helped you.",
    "Day 2: Notice one trigger that activates your stress pattern.",
    "Day 3: Make one direct request instead of relying on hints or assumptions.",
    "Day 4: Protect 30 minutes for the environment in which you think best.",
    `Day 5: Practice one behaviour that supports ${balancingDimension.label.toLowerCase()}.`,
    "Day 6: Ask for one specific piece of feedback from someone you trust.",
    "Day 7: Review what changed in behaviour—not only how motivated you felt."
  ];

  const thirtyDayRoadmap = [
    "Week 1 — Awareness: track situations that energise, drain or trigger you.",
    "Week 2 — Communication: practise one clearer request, boundary or decision explanation each day.",
    "Week 3 — Behaviour design: change one routine or environment cue that repeatedly works against you.",
    "Week 4 — Integration: choose one relationship, work or growth decision and apply your report deliberately."
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
    stressPattern,
    relationshipInsight: relationshipPattern,
    workInsight: workPattern,
    combinationInsight,
    actionPlan,
    sevenDayPlan,
    thirtyDayRoadmap
  };
}
